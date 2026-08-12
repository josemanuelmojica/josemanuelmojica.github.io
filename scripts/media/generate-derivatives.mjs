#!/usr/bin/env node
/**
 * Deterministic responsive-image derivative generator for Arχ & Teχt.
 *
 * Reads master images from public/ (never modifies or deletes them),
 * produces content-hashed WebP + AVIF derivatives at responsive widths into
 * public/derived/, and writes public/derived/manifest.json mapping each
 * source to its generated variants.
 *
 * Determinism:
 *   - Fixed encoder settings, fixed width ladders per role.
 *   - Filenames are `<stem>-<width>w-<sha8>.<ext>` where sha8 is derived from
 *     the *output* bytes, so identical inputs+settings yield identical names.
 *   - Re-running is idempotent: unchanged outputs keep their names, so
 *     Cloudflare builds stay deterministic and cache keys stay stable.
 *
 * Budgets (bytes) are asserted by scripts/media/check-derivatives.mjs, not
 * here, so generation and verification stay separate concerns.
 *
 * Usage:
 *   node scripts/media/generate-derivatives.mjs          # generate
 *   node scripts/media/generate-derivatives.mjs --check  # verify manifest only
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, "derived");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

// Responsive width ladders per image role. Chosen so a phone never fetches a
// desktop-scale file. "large" (1920) is only used where a source justifies it.
const LADDERS = {
  hero: [480, 768, 1200],
  marketLayer: [480, 768, 1200],
  wordmark: [360, 720], // renders small; 720 covers 2x retina at ~360 CSS px
  property: [480, 768, 1080],
};

// Encoder settings held constant for deterministic output.
const WEBP = { quality: 72, effort: 6 };
const AVIF = { quality: 50, effort: 4 };

/** Sources to process: [publicRelativePath, role]. */
const SOURCES = [
  ["brand/ark-and-text-source.png", "wordmark"],
  ["maps/japanese-ink-scroll/base/study-01.webp", "hero"],
  ["maps/japanese-ink-scroll/base/study-02.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-03.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-04.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-05.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-06.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-07.webp", "marketLayer"],
  ["maps/japanese-ink-scroll/base/study-08.webp", "marketLayer"],
  ["properties/residence-01.jpg", "property"],
  ["properties/residence-02.jpg", "property"],
  ["properties/residence-03.jpg", "property"],
];

function sha8(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 8);
}

async function encodeVariant(image, width, format) {
  const pipeline = image.clone().resize({ width, withoutEnlargement: true });
  if (format === "webp") return pipeline.webp(WEBP).toBuffer();
  if (format === "avif") return pipeline.avif(AVIF).toBuffer();
  throw new Error(`unknown format ${format}`);
}

async function generate() {
  // Rebuild the derived directory from scratch so stale variants never linger.
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = { schemaVersion: 1, generatedFrom: "scripts/media/generate-derivatives.mjs", sources: {} };

  for (const [relPath, role] of SOURCES) {
    const abs = path.join(PUBLIC, relPath);
    if (!existsSync(abs)) throw new Error(`source missing: ${relPath}`);

    const input = await readFile(abs);
    const image = sharp(input, { failOn: "error" });
    const meta = await image.metadata();
    const widths = LADDERS[role].filter((w) => w <= (meta.width ?? Infinity));
    if (widths.length === 0) widths.push(Math.min(meta.width ?? LADDERS[role][0], LADDERS[role][0]));

    const stem = path.basename(relPath).replace(/\.[^.]+$/, "");
    const variants = [];

    for (const width of widths) {
      for (const format of ["avif", "webp"]) {
        const bytes = await encodeVariant(image, width, format);
        const name = `${stem}-${width}w-${sha8(bytes)}.${format}`;
        await writeFile(path.join(OUT_DIR, name), bytes);
        variants.push({
          format,
          width,
          bytes: bytes.length,
          path: `/derived/${name}`,
        });
      }
    }

    manifest.sources[relPath] = {
      role,
      masterWidth: meta.width ?? null,
      masterHeight: meta.height ?? null,
      variants,
    };
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  const total = Object.values(manifest.sources)
    .flatMap((s) => s.variants)
    .reduce((sum, v) => sum + v.bytes, 0);
  console.log(
    `Generated ${Object.values(manifest.sources).flatMap((s) => s.variants).length} variants ` +
      `from ${SOURCES.length} sources → ${(total / 1024).toFixed(0)} KiB total`
  );
}

async function check() {
  if (!existsSync(MANIFEST_PATH)) throw new Error("derived/manifest.json missing — run without --check first");
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  const present = new Set((await readdir(OUT_DIR)).map((f) => `/derived/${f}`));
  let missing = 0;
  for (const [rel, entry] of Object.entries(manifest.sources)) {
    for (const v of entry.variants) {
      if (!present.has(v.path)) {
        console.error(`missing derivative for ${rel}: ${v.path}`);
        missing += 1;
      }
    }
  }
  if (missing > 0) throw new Error(`${missing} manifest-referenced derivatives are missing`);
  console.log("Derived media manifest verified");
}

const mode = process.argv.includes("--check") ? check : generate;
mode().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
