#!/usr/bin/env node
/**
 * Toroidal (4-edge-seamless) atlas tile generator.
 *
 * Builds ONE square tile whose opposite edges match exactly in BOTH X and Y,
 * so the runtime can repeat it infinitely in both directions with no visible
 * seam — an "impossible continuous metropolitan fabric" composed from the
 * existing city map studies (no new artwork, masters untouched).
 *
 * Technique — compose, then offset-and-heal:
 *   1. Tile several source studies across a square canvas so city boundaries
 *      dissolve into one field (varied placement + rotation for continuity).
 *   2. Make it seamless with the wrap-and-blend method: take the composed
 *      square, shift it by 50% in x and y with wraparound (so the original
 *      hard outer edges move to the tile's center as a cross seam), then blend
 *      a feathered copy of the ORIGINAL (unshifted) square over that center
 *      cross. The result's outer edges are now former-interior pixels that
 *      already tile, and the only seam (the center cross) is blended away.
 *
 * Output: public/derived/atlas-tile/tile-<size>-<sha8>.{avif,webp} at a few
 * responsive sizes, plus tile-manifest.json. Deterministic: fixed inputs and
 * encoder settings reproduce identical files.
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
const OUT_DIR = path.join(PUBLIC, "derived/atlas-tile");
const MANIFEST_PATH = path.join(OUT_DIR, "tile-manifest.json");

// Square tile sizes (px). Mobile gets a genuinely smaller decode.
const SIZES = [512, 768, 1024];

// Studies chosen for a continuous dense-fabric read (grids + arterials).
const COMPOSE_SOURCES = ["study-04.webp", "study-06.webp", "study-01.webp", "study-05.webp"];

const PAPER = { r: 242, g: 238, b: 231 }; // warm ivory drafting paper
const WEBP = { quality: 70, effort: 6 };
const AVIF = { quality: 46, effort: 4 };

function sha8(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 8);
}

/**
 * Compose a dense square field at `size` by placing rotated/scaled crops of the
 * source studies across a 2x2-ish arrangement, flattened onto ivory paper.
 */
async function composeSquare(size) {
  const half = Math.round(size * 0.62); // overlapping placements for density
  const placements = [
    { src: COMPOSE_SOURCES[0], top: 0, left: 0, rotate: 0 },
    { src: COMPOSE_SOURCES[1], top: 0, left: size - half, rotate: 90 },
    { src: COMPOSE_SOURCES[2], top: size - half, left: 0, rotate: 270 },
    { src: COMPOSE_SOURCES[3], top: size - half, left: size - half, rotate: 180 },
  ];

  const composites = [];
  for (const p of placements) {
    const buf = await readFile(path.join(BASE_DIR, p.src));
    const prepared = await sharp(buf)
      .rotate(p.rotate)
      .resize({ width: half, height: half, fit: "cover" })
      .ensureAlpha(0.62) // let layers read through each other for a woven field
      .png()
      .toBuffer();
    composites.push({ input: prepared, top: p.top, left: p.left });
  }

  // Emit PNG (not raw pixels) so the buffer can be re-read by later stages.
  return sharp({
    create: { width: size, height: size, channels: 4, background: { ...PAPER, alpha: 1 } },
  })
    .composite(composites)
    .flatten({ background: PAPER })
    .png()
    .toBuffer();
}

/** Feathered cross mask: opaque along a central band both directions, so the
 * healing overlay only covers the center seam and fades out toward the edges. */
function crossMask(size) {
  const band = Math.round(size * 0.5);
  const fade = Math.round(size * 0.18);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="r" cx="50%" cy="50%" r="55%">
        <stop offset="0" stop-color="#fff" stop-opacity="1"/>
        <stop offset="${((band - fade) / size).toFixed(3)}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#r)"/>
  </svg>`;
  return Buffer.from(svg);
}

/**
 * Make a square 4-edge seamless: roll by 50% in both axes (extract with wrap),
 * then blend the original center over the roll's center seam.
 */
async function makeToroidal(squareBuf, size) {
  const src = sharp(squareBuf);
  const half = Math.round(size / 2);

  // Roll horizontally and vertically by half using a 2x2 tiling then crop the
  // center — this is an exact wraparound shift with no new pixels invented.
  const tiled = await sharp({
    create: { width: size * 2, height: size * 2, channels: 3, background: PAPER },
  })
    .composite([
      { input: squareBuf, top: 0, left: 0 },
      { input: squareBuf, top: 0, left: size },
      { input: squareBuf, top: size, left: 0 },
      { input: squareBuf, top: size, left: size },
    ])
    .png()
    .toBuffer();

  const rolled = await sharp(tiled)
    .extract({ left: half, top: half, width: size, height: size })
    .png()
    .toBuffer();

  // Heal the center cross of the rolled image with a feathered copy of the
  // original square (whose center is continuous), masked to the middle.
  const healed = await sharp(squareBuf)
    .ensureAlpha()
    .composite([{ input: crossMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp(rolled)
    .composite([{ input: healed, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

async function generate() {
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = {
    schemaVersion: 1,
    generatedFrom: "scripts/media/generate-atlas-tile.mjs",
    composedFrom: COMPOSE_SOURCES,
    seamless: "4-edge toroidal",
    sizes: {},
  };

  for (const size of SIZES) {
    const square = await composeSquare(size);
    const tile = await makeToroidal(square, size);
    const base = sharp(tile);
    const variants = {};
    for (const [format, opts] of [["avif", AVIF], ["webp", WEBP]]) {
      const bytes = await base.clone()[format](opts).toBuffer();
      const name = `tile-${size}-${sha8(bytes)}.${format}`;
      await writeFile(path.join(OUT_DIR, name), bytes);
      variants[format] = { path: `/derived/atlas-tile/${name}`, bytes: bytes.length };
    }
    manifest.sizes[size] = { size, ...variants };
    console.log(
      `tile ${size}px: avif ${(variants.avif.bytes / 1024).toFixed(0)} KiB, webp ${(variants.webp.bytes / 1024).toFixed(0)} KiB`
    );
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
}

async function check() {
  if (!existsSync(MANIFEST_PATH)) throw new Error("tile-manifest.json missing — run without --check first");
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const present = new Set((await readdir(OUT_DIR)).map((f) => `/derived/atlas-tile/${f}`));
  let missing = 0;
  for (const entry of Object.values(manifest.sizes)) {
    for (const format of ["avif", "webp"]) {
      if (!present.has(entry[format].path)) {
        console.error(`missing tile variant: ${entry[format].path}`);
        missing += 1;
      }
    }
  }
  if (missing > 0) throw new Error(`${missing} tile variants missing`);
  console.log("Atlas tile manifest verified");
}

const mode = process.argv.includes("--check") ? check : generate;
mode().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
