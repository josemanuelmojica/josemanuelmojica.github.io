import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createDebugSvg, metadataJson, processMap } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const input = resolve(here, "../../../experiments/map-source/sf-vector-test.svg");
const outputDirectory = resolve(here, "../sample");
const source = await readFile(input, "utf8");
const started = performance.now();
const result = processMap(source);
const elapsed = performance.now() - started;
await writeFile(resolve(outputDirectory, "input.svg"), source);
await writeFile(resolve(outputDirectory, "processed.svg"), result.processedSvg);
await writeFile(resolve(outputDirectory, "debug.svg"), createDebugSvg(result));
await writeFile(resolve(outputDirectory, "metadata.json"), metadataJson(result));
console.log(`processed ${result.pieces.length} pieces (${result.metadata.splitSourceCount} split sources) in ${elapsed.toFixed(1)} ms`);
