import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("responsive derivatives manifest references only existing files", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "public/derived/manifest.json"), "utf8"));
  for (const entry of Object.values(manifest.sources)) {
    for (const v of entry.variants) {
      assert.ok(existsSync(path.join(ROOT, "public", v.path.replace(/^\//, ""))), `missing ${v.path}`);
    }
  }
});

test("atlas tile manifest exists and references only existing files", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "public/derived/atlas-tile/tile-manifest.json"), "utf8")
  );
  for (const entry of Object.values(manifest.sizes)) {
    for (const format of ["avif", "webp"]) {
      assert.ok(existsSync(path.join(ROOT, "public", entry[format].path.replace(/^\//, ""))), entry[format].path);
    }
  }
});

test("atlas tile is a small, square, multi-size responsive set", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "public/derived/atlas-tile/tile-manifest.json"), "utf8")
  );
  const sizes = Object.values(manifest.sizes);
  assert.ok(sizes.length >= 2, "expected at least two responsive tile sizes");
  for (const entry of sizes) {
    // A decorative background tile must stay lightweight; cap the AVIF variant.
    assert.ok(entry.avif.bytes < 300 * 1024, `tile ${entry.size} AVIF too large: ${(entry.avif.bytes / 1024).toFixed(0)} KB`);
  }
});

test("runtime source never imports from the reference/ archive", async () => {
  const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) {
        const contents = await readFile(full, "utf8");
        if (/["'`][^"'`]*reference\//.test(contents)) offenders.push(full);
      }
    }
  }
  await walk(path.join(ROOT, "app"));
  assert.deepEqual(offenders, [], `runtime code references the reference/ archive: ${offenders.join(", ")}`);
});

test("InfiniteAtlasCanvas implements a reduced-motion path", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  assert.match(src, /prefers-reduced-motion/, "InfiniteAtlasCanvas must check prefers-reduced-motion");
  assert.match(src, /reducedMotion/, "InfiniteAtlasCanvas must gate drift on reducedMotion");
});

test("InfiniteAtlasCanvas is decorative and deferred", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  assert.match(src, /aria-hidden/, "atlas canvas must be aria-hidden");
  assert.match(src, /requestIdleCallback|setTimeout/, "tile load must be deferred");
});

test("InfiniteAtlasCanvas drives movement via background-position, not per-frame React state", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  assert.match(src, /backgroundPosition/, "drift should write background-position");
  assert.match(src, /requestAnimationFrame/, "drift should run in a rAF loop");
  // Guard against setState inside the rAF tick (would cause per-frame renders).
  const tick = src.match(/const tick = \(\) => \{[^]*?\};/)?.[0] ?? "";
  assert.doesNotMatch(tick, /setState|set[A-Z]\w*\(/, "rAF tick must not call React setState");
});

test("infinite atlas CSS holds a static field under reduced motion", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  assert.match(css, /\.infinite-atlas\s*\{/, "expected .infinite-atlas layer styles");
  assert.match(css, /position:\s*fixed/, "atlas layer should be fixed behind content");
  const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)[^]*?\}\s*\}/g) ?? [];
  assert.ok(
    reducedBlocks.some((b) => /infinite-atlas/.test(b)),
    "a reduced-motion block must address .infinite-atlas"
  );
});
