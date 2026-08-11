#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const assetDirectory = resolve(repository, "public/maps/japanese-ink-scroll");
const baseDirectory = resolve(assetDirectory, "base");
const previewDirectory = resolve(assetDirectory, "previews");
const collectionPath = resolve(assetDirectory, "collection.json");
const collection = JSON.parse(await readFile(collectionPath, "utf8"));

function run(command, arguments_) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, { cwd: repository, env: process.env, stdio: "ignore" });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

function posterPrefix(study) {
  return `${study.city.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${study.theme}_`;
}

async function newestCreatedPng(before, study) {
  const prefix = posterPrefix(study);
  const files = (await readdir(resolve(repository, "posters"))).filter((file) => file.startsWith(prefix) && file.endsWith(".png") && !before.has(file));
  if (!files.length) throw new Error(`No PNG was generated for ${study.id}`);
  const entries = await Promise.all(files.map(async (file) => ({ file, modified: (await stat(resolve(repository, "posters", file))).mtimeMs })));
  return resolve(repository, "posters", entries.sort((a, b) => b.modified - a.modified)[0].file);
}

await Promise.all([mkdir(baseDirectory, { recursive: true }), mkdir(previewDirectory, { recursive: true })]);

for (const study of collection.studies) {
  const before = new Set(await readdir(resolve(repository, "posters")));
  await run(process.env.UV_BIN ?? "uv", [
    "run", "python", "create_map_poster.py",
    "--city", study.city, "--country", "USA",
    "--latitude", String(study.latitude), "--longitude", String(study.longitude),
    "--theme", study.theme, "--distance", String(study.radius),
    "--width", "4", "--height", "5.333333333333333", "--format", "png",
  ]);
  const sourcePng = await newestCreatedPng(before, study);
  await Promise.all([
    run("cwebp", ["-quiet", "-q", "86", "-resize", "1200", "1600", sourcePng, "-o", resolve(baseDirectory, `${study.id}.webp`)]),
    run("magick", [sourcePng, "-resize", "600x800!", resolve(previewDirectory, `${study.id}.png`)]),
  ]);
  study.baseUrl = `/maps/japanese-ink-scroll/base/${study.id}.webp`;
  study.previewUrl = `/maps/japanese-ink-scroll/previews/${study.id}.png`;
  await writeFile(resolve(assetDirectory, `${study.id}.manifest.json`), JSON.stringify(study, null, 2));
  console.log(`[${study.id}] base WebP + preview PNG`);
}

await writeFile(collectionPath, JSON.stringify(collection, null, 2));
console.log(`Rendered ${collection.studies.length} Japanese Ink base assets`);
