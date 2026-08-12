#!/usr/bin/env node
/**
 * Luxury atlas / tapestry generator for Arχ & Teχt.
 *
 * Precomposes the eight metro ink-map studies into ONE tall vertical image —
 * an architectural editorial tapestry — at responsive widths, with soft
 * paper-toned cross-fade seams between cities so they weave into one another
 * rather than reading as card → gap → card.
 *
 * The composed atlas is designed to loop seamlessly: the ambient rail renders
 * exactly two stacked copies and translates upward by one atlas height, so the
 * top of copy B meets the bottom of copy A with no visible seam. To make that
 * wrap invisible, the atlas's own top and bottom edges share the same city
 * (study-01) so the loop point falls mid-city, not at a hard boundary.
 *
 * Output: public/derived/atlas/atlas-<width>w-<sha8>.webp (+ .avif) and an
 * entry in public/derived/atlas/atlas-manifest.json. Masters are never touched.
 *
 * Determinism: fixed encoder settings, fixed width ladder, content-hashed
 * names. Re-running with unchanged inputs reproduces identical files.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const BASE_DIR = path.join(PUBLIC, "maps/japanese-ink-scroll/base");
const OUT_DIR = path.join(PUBLIC, "derived/atlas");
const MANIFEST_PATH = path.join(OUT_DIR, "atlas-manifest.json");

// City order for the tapestry, bookended by study-01 so the seamless loop
// point lands inside a single city rather than at a city boundary.
const SEQUENCE = [
  "study-01.webp",
  "study-03.webp",
  "study-05.webp",
  "study-07.webp",
  "study-02.webp",
  "study-04.webp",
  "study-06.webp",
  "study-08.webp",
  "study-01.webp", // repeat first at the tail for a mid-city wrap
];

// Responsive atlas widths. Mobile gets a genuinely smaller payload (not just
// CSS scaling), per the performance bar.
const WIDTHS = [420, 720, 1100];

// Vertical overlap (as a fraction of one tile's height) blended between
// adjacent cities to dissolve the seam.
const SEAM_OVERLAP = 0.14;
const PAPER = { r: 221, g: 219, b: 215 }; // measured mean tone of the studies

const WEBP = { quality: 68, effort: 6 };
const AVIF = { quality: 45, effort: 4 };

function sha8(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 8);
}

/**
 * Build a vertical-gradient alpha mask (opaque center, transparent top+bottom
 * fade band) sized tileW x tileH, used to feather each tile's seams.
 */
async function featherMask(tileW, tileH, fadePx) {
  const svg = `<svg width="${tileW}" height="${tileH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="${(fadePx / tileH).toFixed(4)}" stop-color="#000" stop-opacity="1"/>
        <stop offset="${(1 - fadePx / tileH).toFixed(4)}" stop-color="#000" stop-opacity="1"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${tileW}" height="${tileH}" fill="url(#g)"/>
  </svg>`;
  return Buffer.from(svg);
}

async function buildAtlasAtWidth(width) {
  // Load + resize each tile to the target width, preserving aspect ratio.
  const tiles = [];
  for (const name of SEQUENCE) {
    const buf = await readFile(path.join(BASE_DIR, name));
    const resized = await sharp(buf).resize({ width, withoutEnlargement: true }).toBuffer();
    const meta = await sharp(resized).metadata();
    tiles.push({ buf: resized, h: meta.height ?? 0 });
  }

  const tileH = tiles[0].h;
  const fadePx = Math.round(tileH * SEAM_OVERLAP);
  const step = tileH - fadePx; // each subsequent tile overlaps the previous by fadePx
  const canvasH = step * (tiles.length - 1) + tileH;

  // Feather every tile except leave the very top of the first and very bottom
  // of the last fully opaque so the composed atlas has clean outer edges that
  // tile against its own copy.
  const mask = await featherMask(width, tileH, fadePx);

  const composites = [];
  for (let i = 0; i < tiles.length; i += 1) {
    const feathered = await sharp(tiles[i].buf)
      .ensureAlpha()
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    composites.push({ input: feathered, top: i * step, left: 0 });
  }

  // Return an open sharp pipeline (not a raw buffer) so callers can branch to
  // multiple output formats via .clone(); a raw-pixel buffer can't be re-parsed.
  const atlas = sharp({
    create: {
      width,
      height: canvasH,
      channels: 4,
      background: { ...PAPER, alpha: 1 },
    },
  })
    .composite(composites)
    .flatten({ background: PAPER });

  return { atlas, width, height: canvasH };
}

async function generate() {
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = {
    schemaVersion: 1,
    generatedFrom: "scripts/media/generate-atlas.mjs",
    sequence: SEQUENCE,
    seamOverlap: SEAM_OVERLAP,
    breakpoints: {},
  };

  for (const width of WIDTHS) {
    const { atlas, height } = await buildAtlasAtWidth(width);
    const variants = {};
    for (const [format, opts] of [["avif", AVIF], ["webp", WEBP]]) {
      const bytes = await atlas.clone()[format](opts).toBuffer();
      const name = `atlas-${width}w-${sha8(bytes)}.${format}`;
      await writeFile(path.join(OUT_DIR, name), bytes);
      variants[format] = { path: `/derived/atlas/${name}`, bytes: bytes.length };
    }
    manifest.breakpoints[width] = { width, height, ...variants };
    console.log(
      `atlas ${width}w (${height}px tall): ` +
        `avif ${(variants.avif.bytes / 1024).toFixed(0)} KiB, webp ${(variants.webp.bytes / 1024).toFixed(0)} KiB`
    );
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

async function check() {
  if (!existsSync(MANIFEST_PATH)) throw new Error("atlas-manifest.json missing — run without --check first");
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const present = new Set((await readdir(OUT_DIR)).map((f) => `/derived/atlas/${f}`));
  let missing = 0;
  for (const bp of Object.values(manifest.breakpoints)) {
    for (const format of ["avif", "webp"]) {
      if (!present.has(bp[format].path)) {
        console.error(`missing atlas variant: ${bp[format].path}`);
        missing += 1;
      }
    }
  }
  if (missing > 0) throw new Error(`${missing} atlas variants missing`);
  console.log("Atlas manifest verified");
}

const mode = process.argv.includes("--check") ? check : generate;
mode().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
