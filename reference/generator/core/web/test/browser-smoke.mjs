import assert from "node:assert/strict";

const pages = await (await fetch("http://127.0.0.1:9223/json/list")).json();
const page = pages.find((entry) => entry.type === "page" && entry.url.includes("127.0.0.1:5055"));
assert.ok(page, "local product page is available to DevTools");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let identifier = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const handler = pending.get(message.id);
  if (handler) { pending.delete(message.id); handler(message); }
});

function command(method, params = {}) {
  const id = ++identifier;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

async function evaluate(expression) {
  const reply = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (reply.error || reply.result?.exceptionDetails) throw new Error(JSON.stringify(reply.error ?? reply.result.exceptionDetails));
  return reply.result.result.value;
}

async function until(expression, timeout = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await evaluate(expression);
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

await command("Runtime.enable");
await command("Page.reload", { ignoreCache: true });
await until("document.querySelectorAll('[data-map-piece]').length === 3000");
const initial = await evaluate("({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, pieces: document.querySelectorAll('[data-map-piece]').length, state: [...document.querySelectorAll('dd')].at(-1)?.textContent })");
assert.equal(initial.width, initial.scrollWidth, "page has no horizontal overflow");
assert.equal(initial.pieces, 3000);
assert.equal(initial.state, "home");

await evaluate("[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'March').click()");
await until("[...document.querySelectorAll('[data-map-piece]')].some((node) => node.getAttribute('transform'))");
const moving = await evaluate("[...document.querySelectorAll('[data-map-piece]')].filter((node) => node.getAttribute('transform')).length");
assert.ok(moving > 0 && moving <= 120, `expected 1–120 moving pieces, got ${moving}`);

await evaluate("[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Reset').click()");
await until("[...document.querySelectorAll('[data-map-piece]')].every((node) => !node.getAttribute('transform'))");
const reset = await evaluate("({ moved: [...document.querySelectorAll('[data-map-piece]')].filter((node) => node.getAttribute('transform')).length, state: [...document.querySelectorAll('dd')].at(-1)?.textContent })");
assert.deepEqual(reset, { moved: 0, state: "home" });

await evaluate("[...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'March').click()");
await until("[...document.querySelectorAll('dd')].at(-1)?.textContent !== 'home'");
await until("[...document.querySelectorAll('dd')].at(-1)?.textContent === 'home'", 12000);
const automaticReturn = await evaluate("[...document.querySelectorAll('[data-map-piece]')].filter((node) => node.getAttribute('transform')).length");
assert.equal(automaticReturn, 0, "automatic return reconstructs the exact home state");

console.log(JSON.stringify({ initial, moving, reset, automaticReturn }));
socket.close();
