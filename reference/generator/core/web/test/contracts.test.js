import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the product uses the workspace motion package directly", async () => {
  const adapter = await readFile(new URL("../src/lib/animation.ts", import.meta.url), "utf8");
  assert.match(adapter, /from '@maptoposter\/map-motion'/);
  assert.doesNotMatch(adapter, /window\.AntSequence/);
});

test("the map stage preserves SVG geometry as DOM nodes", async () => {
  const stage = await readFile(new URL("../src/components/MapStage.tsx", import.meta.url), "utf8");
  assert.match(stage, /DOMParser/);
  assert.match(stage, /replaceChildren/);
  assert.doesNotMatch(stage, /dangerouslySetInnerHTML/);
});
