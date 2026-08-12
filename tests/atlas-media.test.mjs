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

test("InfiniteAtlasCanvas drives movement on the compositor, not per-frame React state", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  // Drift must use a compositor-friendly transform. background-position is a
  // paint-triggering property: measured at ~10x the paints and ~97x the raster
  // time of translate3d while scrolling, so it must not come back.
  assert.match(src, /translate3d/, "drift should write a translate3d transform");
  assert.doesNotMatch(
    src,
    /style\.backgroundPosition/,
    "drift must not animate background-position (paint-triggering)"
  );
  assert.match(src, /requestAnimationFrame/, "drift should run in a rAF loop");
  // Guard against setState inside the rAF tick (would cause per-frame renders).
  const tick = src.match(/const tick = \(\) => \{[^]*?\n {4}\};/)?.[0] ?? "";
  assert.ok(tick.length > 0, "expected to locate the rAF tick body");
  assert.doesNotMatch(tick, /setState|set[A-Z]\w*\(/, "rAF tick must not call React setState");
});

test("InfiniteAtlasCanvas stops decorative work when at rest or hidden", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  assert.match(src, /visibilitychange/, "atlas must suspend while the tab is hidden");
  assert.match(src, /document\.hidden/, "atlas must check document.hidden before running");
  // The loop must be able to park itself rather than spinning forever.
  assert.match(src, /cancelAnimationFrame/, "atlas must cancel its rAF loop");
  assert.match(src, /REST_EPSILON/, "atlas loop must park once the field is at rest");
});

test("InfiniteAtlasCanvas selects its tile via browser-native image-set", async () => {
  const src = await readFile(path.join(ROOT, "app/components/InfiniteAtlasCanvas.tsx"), "utf8");
  assert.match(src, /image-set\(/, "tile candidates should be offered via CSS image-set()");
  assert.match(src, /type\("image\/avif"\)/, "image-set must offer an AVIF candidate");
  assert.match(src, /type\("image\/webp"\)/, "image-set must offer a WebP fallback");
  // canvas.toDataURL('image/avif') tests ENCODE support, which Chrome lacks
  // while decoding AVIF fine — it produced a false negative for every Chrome
  // user. Browser-native negotiation replaces it.
  assert.doesNotMatch(src, /toDataURL/, "must not probe AVIF support via canvas encode");
});

test("infinite atlas CSS holds a static field under reduced motion", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  assert.match(css, /\.infinite-atlas\s*\{/, "expected .infinite-atlas layer styles");
  assert.match(css, /\.infinite-atlas__plane\s*\{/, "expected the moving plane's styles");
  assert.match(css, /position:\s*fixed/, "atlas layer should be fixed behind content");
  assert.match(css, /overflow:\s*hidden/, "atlas container must clip the oversized plane");
  const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)[^]*?\}\s*\}/g) ?? [];
  assert.ok(
    reducedBlocks.some((b) => /infinite-atlas/.test(b)),
    "a reduced-motion block must address .infinite-atlas"
  );
});
