#!/usr/bin/env node
// Optional helper for a Chrome instance started with --remote-debugging-port=9223.
const port = process.argv[2] ?? "9223";
const counts = (process.argv[3] ?? "50,100,200,500,1000").split(",").map(Number);
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find((entry) => entry.type === "page" && entry.url.includes("/experiments/ant-motion/"));
if (!page) throw new Error("ant-motion page not found");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

const expression = `(async () => {
  const count = document.querySelector('#count');
  const wrappers = [...document.querySelectorAll('[data-map-piece]')];
  const sequence = window.antMotionExperiment.sequence;
  const results = [];
  for (const selectedPieces of ${JSON.stringify(counts)}) {
    const timestamps = [];
    let maxActive = 0;
    const originalOnFrame = sequence.engine.onFrame;
    sequence.engine.onFrame = data => {
      originalOnFrame?.(data);
      timestamps.push(data.timestamp);
      maxActive = Math.max(maxActive, data.activeCount);
    };
    count.value = String(selectedPieces);
    count.dispatchEvent(new Event('input'));
    await sequence.start({
      count: selectedPieces,
      strategy: 'chain',
      formation: new (await import('../../packages/map-motion/src/index.js')).RingFormation(),
      stagger: selectedPieces > 200 ? 2 : 8,
      staggerJitter: 6,
      duration: 620,
      durationJitter: 80,
      hold: 250
    });
    sequence.engine.onFrame = originalOnFrame;
    // Ignore the intentional formation hold when measuring rendering cadence.
    const intervals = timestamps.slice(1).map((time, index) => time - timestamps[index]).filter(value => value > 0 && value < 50);
    const averageFps = intervals.length ? 1000 / (intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : 0;
    results.push({
      mountedPieces: wrappers.length,
      selectedPieces,
      averageFps: Math.round(averageFps),
      maxActive,
      state: sequence.state.toUpperCase(),
      activeAtEnd: sequence.engine.active.size,
      transformedAtEnd: wrappers.filter(node => node.getAttribute('transform')).length
    });
  }
  return results;
})()`;

socket.send(JSON.stringify({
  id: 1,
  method: "Runtime.evaluate",
  params: { expression, awaitPromise: true, returnByValue: true },
}));
const response = await new Promise((resolve) => {
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id === 1) resolve(message);
  });
});
socket.close();
if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
console.log(JSON.stringify(response.result.result.value, null, 2));
