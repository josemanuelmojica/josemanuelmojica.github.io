#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMotionOverlay, metadataJson, prepareMotionSvg, processMap } from "../packages/map-pieces/src/index.js";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const collection = JSON.parse(await readFile(resolve(repository, process.env.COLLECTION_CONFIG ?? "design/city-collection.json"), "utf8"));
const outputDirectory = resolve(repository, process.env.COLLECTION_OUTPUT ?? "public/maps/street-choreographies-v1");
const postersDirectory = resolve(repository, "posters");
const requested = process.argv.slice(2);
const mergeOnly = requested.includes("--merge-only");
const force = requested.includes("--force");
const requestedIds = requested.filter((value) => !value.startsWith("--"));
const studies = requestedIds.length ? collection.studies.filter((study) => requestedIds.includes(study.id)) : collection.studies;

if (!mergeOnly && !studies.length) throw new Error("No matching study IDs. Use study-01 through study-08.");

function run(command, arguments_) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, { cwd: repository, env: process.env, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

function posterPrefix(study) {
  return `${study.city.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${study.theme}_`;
}

async function newestCreatedSvg(before, study) {
  const prefix = posterPrefix(study);
  const candidates = (await readdir(postersDirectory)).filter((file) => file.startsWith(prefix) && file.endsWith(".svg") && !before.has(file));
  if (!candidates.length) throw new Error("Poster generator did not create an SVG");
  const entries = await Promise.all(candidates.map(async (file) => ({ file, modified: (await stat(resolve(postersDirectory, file))).mtimeMs })));
  return entries.sort((a, b) => b.modified - a.modified)[0].file;
}

await mkdir(outputDirectory, { recursive: true });
const results = [];

async function mergeCollection() {
  const files = (await readdir(outputDirectory)).filter((file) => /^[\w-]+\.manifest\.json$/.test(file));
  const assets = await Promise.all(files.map(async (file) => JSON.parse(await readFile(resolve(outputDirectory, file), "utf8"))));
  assets.sort((a, b) => a.id.localeCompare(b.id));
  await writeFile(resolve(outputDirectory, "collection.json"), JSON.stringify({ ...collection, studies: assets }, null, 2));
  return assets;
}

if (mergeOnly) {
  const assets = await mergeCollection();
  console.log(`Merged ${assets.length} study manifests into collection.json`);
  process.exit(0);
}

for (const study of studies) {
  const svgName = `${study.id}.motion.svg`;
  const overlayName = `${study.id}.overlay.svg`;
  const metadataName = `${study.id}.pieces.json`;
  const manifestPath = resolve(outputDirectory, `${study.id}.manifest.json`);
  if (!force) {
    try {
      const existing = JSON.parse(await readFile(manifestPath, "utf8"));
      results.push(existing);
      console.log(`[${study.id}] Reusing completed motion asset`);
      continue;
    } catch {}
  }
  console.log(`\n[${study.id}] Generating ${study.city}, ${study.state} / ${study.theme}`);
  const before = new Set(await readdir(postersDirectory));
  await run(process.env.UV_BIN ?? "uv", [
    "run", "python", "create_map_poster.py",
    "--city", study.city, "--country", "USA",
    "--latitude", String(study.latitude), "--longitude", String(study.longitude),
    "--theme", study.theme, "--distance", String(study.radius),
    "--width", "12", "--height", "16", "--format", "svg",
  ]);
  const posterFile = await newestCreatedSvg(before, study);
  const source = await readFile(resolve(postersDirectory, posterFile), "utf8");
  const prepared = prepareMotionSvg(source, { candidateLimit: collection.candidateLimit });
  const result = processMap(prepared.svg, { candidateAttribute: "data-motion-candidate", splitLongPaths: false, neighborCount: 6 });
  await Promise.all([
    writeFile(resolve(outputDirectory, svgName), result.processedSvg),
    writeFile(resolve(outputDirectory, overlayName), extractMotionOverlay(result.processedSvg)),
    writeFile(resolve(outputDirectory, metadataName), metadataJson(result)),
  ]);
  const asset = {
    ...study,
    label: `Street study ${study.id.slice(-2)}`,
    svgUrl: `${collection.publicBaseUrl ?? "/maps/street-choreographies-v1"}/${svgName}`,
    overlayUrl: `${collection.publicBaseUrl ?? "/maps/street-choreographies-v1"}/${overlayName}`,
    metadataUrl: `${collection.publicBaseUrl ?? "/maps/street-choreographies-v1"}/${metadataName}`,
    sourceGeometryCount: prepared.metadata.roadGeometryCount,
    candidateCount: result.pieces.length,
    textFree: true,
    sourcePoster: basename(posterFile),
  };
  results.push(asset);
  await writeFile(manifestPath, JSON.stringify(asset, null, 2));
  console.log(`[${study.id}] ${asset.sourceGeometryCount.toLocaleString()} source paths → ${asset.candidateCount.toLocaleString()} motion candidates`);
}

const merged = await mergeCollection();
console.log(`\nBuilt ${results.length} requested studies; ${merged.length} total manifests are available in ${outputDirectory}`);
