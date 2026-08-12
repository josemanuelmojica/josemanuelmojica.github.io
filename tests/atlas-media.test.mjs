import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("derived media manifest exists and references only existing files", async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, "public/derived/manifest.json"), "utf8"));
  for (const entry of Object.values(manifest.sources)) {
    for (const v of entry.variants) {
      assert.ok(existsSync(path.join(ROOT, "public", v.path.replace(/^\//, ""))), `missing ${v.path}`);
    }
  }
});

test("atlas manifest exists and references only existing files", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, "public/derived/atlas/atlas-manifest.json"), "utf8")
  );
  for (const bp of Object.values(manifest.breakpoints)) {
    for (const format of ["avif", "webp"]) {
      assert.ok(existsSync(path.join(ROOT, "public", bp[format].path.replace(/^\//, ""))), bp[format].path);
    }
  }
});

test("runtime source never imports from the reference/ archive", async () => {
  const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        const contents = await readFile(full, "utf8");
        // Any import or path string reaching into reference/ from app code is a leak.
        if (/["'`][^"'`]*reference\//.test(contents)) offenders.push(full);
      }
    }
  }
  await walk(path.join(ROOT, "app"));
  assert.deepEqual(offenders, [], `runtime code references the reference/ archive: ${offenders.join(", ")}`);
});

test("AtlasRail implements a reduced-motion path", async () => {
  const src = await readFile(path.join(ROOT, "app/components/AtlasRail.tsx"), "utf8");
  assert.match(src, /prefers-reduced-motion/, "AtlasRail must check prefers-reduced-motion");
  assert.match(src, /reducedMotion/, "AtlasRail must gate animation on reducedMotion");
});

test("atlas rail CSS disables animation under reduced motion", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)[^}]*\{[^]*?\}\s*\}/g) ?? [];
  const mentionsAtlas = reducedBlocks.some((b) => /atlas-rail/.test(b));
  assert.ok(mentionsAtlas, "a reduced-motion media block must neutralize .atlas-rail animation");
});

test("atlas motion uses transform, not layout properties", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  const keyframes = css.match(/@keyframes atlas-rail-scroll\s*\{[^]*?\}\s*\}/)?.[0] ?? "";
  assert.match(keyframes, /translate3d/, "atlas keyframes should animate translate3d");
  assert.doesNotMatch(keyframes, /\b(top|left|margin|height)\s*:/, "atlas keyframes must not animate layout props");
});
