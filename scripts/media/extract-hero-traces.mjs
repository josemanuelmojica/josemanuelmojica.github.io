#!/usr/bin/env node
/**
 * Build-time extractor for the hero architectural reveal.
 *
 * Pulls a small, curated subset of real street geometry from the existing
 * San Francisco active overlay (study-01.active-overlay.svg) into a tiny JSON
 * the hero can path-draw with Motion. This REUSES the existing cartographic
 * system rather than regenerating maps — we only select and normalize a
 * lightweight subset for decorative tracing.
 *
 * Output: app/lib/heroTraces.json — a handful of the longest, most
 * characteristic paths, normalized to a 0..1000 x 0..1000 viewBox so the hero
 * SVG is resolution-independent.
 *
 * Deterministic: same input SVG yields the same selection and output.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OVERLAY = path.join(ROOT, "public/maps/japanese-ink-scroll/study-01.active-overlay.svg");
const OUT = path.join(ROOT, "app/lib/heroTraces.json");

const SOURCE_VIEWBOX = { w: 871.2, h: 1159.2 };
const TARGET = 1000; // normalized square-ish viewBox side for the hero SVG
const MAX_PATHS = 34; // enough to read as a street network, few enough to stay tiny

function coordinateWeight(d) {
  // Cheap proxy for path "importance": how many coordinate points it has.
  return (d.match(/[ML]\s*[-\d.]/g) ?? []).length;
}

function normalizePathData(d) {
  // Rescale absolute M/L coordinates from the source viewBox to 0..TARGET,
  // rounding to 2 decimals to keep the JSON small. Only M and L are present
  // in this overlay (confirmed by inspection).
  return d
    .replace(/([ML])\s*(-?[\d.]+)\s+(-?[\d.]+)/g, (_, cmd, x, y) => {
      const nx = ((Number(x) / SOURCE_VIEWBOX.w) * TARGET).toFixed(2);
      const ny = ((Number(y) / SOURCE_VIEWBOX.h) * TARGET).toFixed(2);
      return `${cmd}${nx} ${ny}`;
    })
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const svg = await readFile(OVERLAY, "utf8");
  const pathRe = /<path[^>]*\bd="([^"]+)"/g;
  const paths = [];
  let found;
  while ((found = pathRe.exec(svg)) !== null) {
    const d = found[1];
    paths.push({ d, weight: coordinateWeight(d) });
  }

  // Select the longest paths (major thoroughfares read best when traced),
  // then keep them for a draw order that sweeps the frame.
  const selected = paths
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_PATHS)
    .map((p) => normalizePathData(p.d));

  const output = {
    schemaVersion: 1,
    source: "public/maps/japanese-ink-scroll/study-01.active-overlay.svg",
    viewBox: TARGET,
    note: "Curated subset of real San Francisco street geometry for the hero reveal.",
    paths: selected,
  };

  await writeFile(OUT, JSON.stringify(output, null, 2) + "\n");
  const bytes = Buffer.byteLength(JSON.stringify(output));
  console.log(`Extracted ${selected.length} hero traces to app/lib/heroTraces.json (${(bytes / 1024).toFixed(1)} KiB)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
