import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

test("hero traces file exists, is small, and holds normalized paths", async () => {
  const traces = JSON.parse(await readFile(path.join(ROOT, "app/lib/heroTraces.json"), "utf8"));
  assert.ok(Array.isArray(traces.paths) && traces.paths.length > 0, "expected extracted paths");
  assert.equal(traces.viewBox, 1000, "paths should be normalized to a 1000-unit viewBox");
  const bytes = Buffer.byteLength(JSON.stringify(traces));
  assert.ok(bytes < 20 * 1024, `hero traces should stay tiny, got ${(bytes / 1024).toFixed(1)} KiB`);
});

test("HeroReveal implements a reduced-motion path via useReducedMotion", async () => {
  const src = await readFile(path.join(ROOT, "app/components/architectural/HeroReveal.tsx"), "utf8");
  assert.match(src, /useReducedMotion/, "HeroReveal must consult useReducedMotion");
  assert.match(src, /reduced\s*\?/, "HeroReveal must branch behavior on the reduced flag");
});

test("HeroReveal lazy-loads Motion features (LazyMotion), not the full bundle", async () => {
  const src = await readFile(path.join(ROOT, "app/components/architectural/HeroReveal.tsx"), "utf8");
  assert.match(src, /LazyMotion/, "HeroReveal should use LazyMotion for minimal import");
  assert.match(src, /domAnimation/, "HeroReveal should load only the domAnimation feature set");
});

test("hero reveal CSS disables the street draw-on under reduced motion", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  const reducedBlocks = css.match(/@media \(prefers-reduced-motion: reduce\)[^]*?\}\s*\}/g) ?? [];
  const neutralizesTrace = reducedBlocks.some((b) => /hero-reveal__road/.test(b) && /animation:\s*none/.test(b));
  assert.ok(neutralizesTrace, "a reduced-motion block must stop the hero trace animation");
});

test("hero reveal motion uses stroke draw-on, resolving to a static end state", async () => {
  const css = await readFile(path.join(ROOT, "app/globals.css"), "utf8");
  const kf = css.match(/@keyframes hero-trace-draw\s*\{[^]*?\}\s*\}/)?.[0] ?? "";
  assert.match(kf, /stroke-dashoffset:\s*0/, "trace keyframe should resolve to a drawn (offset 0) end state");
  assert.doesNotMatch(kf, /infinite/, "hero reveal must not loop");
});

test("no forbidden meta/system copy appears in user-facing homepage strings", async () => {
  const src = await readFile(path.join(ROOT, "app/InkEstates.tsx"), "utf8");
  // JSX text content only — strip attributes/props by matching >...< text nodes
  // and simple string children. Guard against the specific banned phrases.
  const banned = [
    /Eight markets\b/i,
    /one point of view/i,
    /Placeholder \/ pending/i,
    /eight American markets/i,
  ];
  for (const re of banned) {
    assert.doesNotMatch(src, re, `forbidden meta copy present: ${re}`);
  }
});
