#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extractMotionOverlay } from "../packages/map-pieces/src/index.js";

const repository = resolve(import.meta.dirname, "..");
const directory = resolve(repository, "public/maps/japanese-ink-scroll");
const collectionPath = resolve(directory, "collection.json");
const collection = JSON.parse(await readFile(collectionPath, "utf8"));
const activeCount = 160;

function spatialSample(pieces, count) {
  if (pieces.length <= count) return pieces;
  const center = pieces.reduce((sum, piece) => [sum[0] + piece.centroid[0], sum[1] + piece.centroid[1]], [0, 0]).map((value) => value / pieces.length);
  const selected = [pieces.reduce((best, piece) => Math.hypot(piece.centroid[0] - center[0], piece.centroid[1] - center[1]) < Math.hypot(best.centroid[0] - center[0], best.centroid[1] - center[1]) ? piece : best, pieces[0])];
  const used = new Set(selected.map((piece) => piece.id));
  const nearest = new Map(pieces.map((piece) => [piece.id, Infinity]));
  while (selected.length < count) {
    const latest = selected.at(-1);
    let candidate = null, candidateDistance = -1;
    for (const piece of pieces) {
      if (used.has(piece.id)) continue;
      const distance = Math.hypot(piece.centroid[0] - latest.centroid[0], piece.centroid[1] - latest.centroid[1]);
      const minimum = Math.min(nearest.get(piece.id), distance);
      nearest.set(piece.id, minimum);
      if (minimum > candidateDistance || (minimum === candidateDistance && piece.id < candidate.id)) { candidate = piece; candidateDistance = minimum; }
    }
    selected.push(candidate); used.add(candidate.id);
  }
  return selected;
}

function activeDocument(document) {
  const pieces = spatialSample(document.pieces, activeCount).map((piece) => ({ ...piece, neighbors: [] }));
  for (const piece of pieces) {
    piece.neighbors = pieces.filter((candidate) => candidate.id !== piece.id)
      .map((candidate) => ({ id: candidate.id, distance: Math.hypot(candidate.centroid[0] - piece.centroid[0], candidate.centroid[1] - piece.centroid[1]) }))
      .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id)).slice(0, 6).map(({ id }) => id);
  }
  return { metadata: { ...document.metadata, pieceCount: pieces.length, sourcePieceCount: document.pieces.length, selection: "farthest-point-spatial" }, pieces };
}

for (const study of collection.studies) {
  const [svg, document] = await Promise.all([
    readFile(resolve(directory, `${study.id}.motion.svg`), "utf8"),
    readFile(resolve(directory, `${study.id}.pieces.json`), "utf8").then(JSON.parse),
  ]);
  const active = activeDocument(document);
  const overlayName = `${study.id}.active-overlay.svg`;
  const metadataName = `${study.id}.active.json`;
  await Promise.all([
    writeFile(resolve(directory, overlayName), extractMotionOverlay(svg, { pieceIds: active.pieces.map((piece) => piece.id) })),
    writeFile(resolve(directory, metadataName), JSON.stringify(active)),
  ]);
  study.activeCount = active.pieces.length;
  study.activeOverlayUrl = `/maps/japanese-ink-scroll/${overlayName}`;
  study.activeMetadataUrl = `/maps/japanese-ink-scroll/${metadataName}`;
  await writeFile(resolve(directory, `${study.id}.manifest.json`), JSON.stringify(study, null, 2));
  console.log(`[${study.id}] ${active.pieces.length} live pieces`);
}

await writeFile(collectionPath, JSON.stringify(collection, null, 2));
console.log("Built the ChatGPT Sites asset pack");
