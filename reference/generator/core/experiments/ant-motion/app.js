import { processMap } from "../../packages/map-pieces/src/index.js";
import { AntSequence, RingFormation, SpiralFormation } from "../../packages/map-motion/src/index.js";

const stage = document.querySelector("#stage");
const stateOutput = document.querySelector("#state");
const activeOutput = document.querySelector("#active-count");
const fpsOutput = document.querySelector("#fps");
const count = document.querySelector("#count");
const countOutput = document.querySelector("#count-output");
const response = await fetch("../map-source/sf-vector-test.svg");
const source = await response.text();
const result = processMap(source, { neighborCount: 6, longPathThreshold: 240 });
stage.innerHTML = result.processedSvg;
const svg = stage.querySelector("svg");
document.querySelector("#piece-count").textContent = result.pieces.length;
count.max = Math.min(1000, result.pieces.length);

let lastFrame = 0;
let frameSamples = [];
const sequence = new AntSequence(result.pieces, {
  root: svg,
  onStateChange: (state) => { stateOutput.textContent = state.toUpperCase(); },
  onFrame: ({ timestamp, activeCount }) => {
    activeOutput.textContent = activeCount;
    if (lastFrame) {
      const instantaneous = 1000 / (timestamp - lastFrame);
      if (instantaneous < 150) frameSamples.push(instantaneous);
      if (frameSamples.length > 30) frameSamples.shift();
      fpsOutput.textContent = Math.round(frameSamples.reduce((sum, value) => sum + value, 0) / frameSamples.length);
    }
    lastFrame = timestamp;
  },
});

const selected = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
const formation = () => selected("formation") === "spiral"
  ? new SpiralFormation({ center: [480, 320], spacing: 7.2 })
  : new RingFormation({ center: [480, 320], radius: 155 });

document.querySelector("#start").addEventListener("click", () => sequence.start({
  count: Number(count.value),
  strategy: selected("strategy"),
  formation: formation(),
}));
document.querySelector("#pause").addEventListener("click", (event) => {
  if (sequence.state === "paused") { sequence.resume(); event.currentTarget.textContent = "Pause"; }
  else { sequence.pause(); event.currentTarget.textContent = "Resume"; }
});
document.querySelector("#home").addEventListener("click", () => sequence.returnHome());
document.querySelector("#reset").addEventListener("click", () => sequence.reset());
count.addEventListener("input", () => { countOutput.value = count.value; });
for (const swatch of document.querySelectorAll("[data-palette]")) {
  swatch.addEventListener("click", () => { document.body.dataset.theme = swatch.dataset.palette; });
}

window.antMotionExperiment = { result, sequence };
stateOutput.textContent = "READY";
if (new URLSearchParams(location.search).has("autoplay")) document.querySelector("#start").click();
