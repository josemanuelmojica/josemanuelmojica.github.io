#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { metadataJson, prepareMotionSvg, processMap } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repository = resolve(here, "../../..");
const input = resolve(repository, process.argv[2] ?? "posters/san_francisco_sunset_20260809_214004.svg");
const outputDirectory = resolve(repository, process.argv[3] ?? "public/maps");
const slug = process.argv[4] ?? basename(input, ".svg").replace(/_\d{8}_\d{6}$/, "");
const candidateLimit = Number(process.argv[5] ?? 3000);
const started = performance.now();

const source = await readFile(input, "utf8");
const prepared = prepareMotionSvg(source, { candidateLimit });
const result = processMap(prepared.svg, {
  candidateAttribute: "data-motion-candidate",
  splitLongPaths: false,
  neighborCount: 6,
});
await mkdir(outputDirectory, { recursive: true });
const svgName = `${slug}.motion.svg`;
const metadataName = `${slug}.pieces.json`;
const manifest = {
  id: slug,
  label: "Untitled street study",
  svgUrl: `/maps/${svgName}`,
  metadataUrl: `/maps/${metadataName}`,
  sourceGeometryCount: prepared.metadata.roadGeometryCount,
  candidateCount: result.pieces.length,
  textFree: true,
  generatedAt: new Date().toISOString(),
};
await Promise.all([
  writeFile(resolve(outputDirectory, svgName), result.processedSvg),
  writeFile(resolve(outputDirectory, metadataName), metadataJson(result)),
  writeFile(resolve(outputDirectory, `${slug}.manifest.json`), JSON.stringify(manifest, null, 2)),
  writeFile(resolve(outputDirectory, "default.json"), JSON.stringify(manifest, null, 2)),
]);
console.log(JSON.stringify({
  ...manifest,
  input,
  outputDirectory,
  elapsedMs: Math.round(performance.now() - started),
  neighborMethod: result.metadata.neighborMethod,
}, null, 2));
