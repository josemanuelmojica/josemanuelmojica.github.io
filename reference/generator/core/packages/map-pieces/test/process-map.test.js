import assert from "node:assert/strict";
import test from "node:test";
import { extractMotionOverlay, prepareMotionSvg, processMap } from "../src/index.js";

const sample = `<svg viewBox="0 0 100 100"><g stroke="black">
  <line id="kept" x1="0" y1="0" x2="10" y2="0" />
  <line x1="10" y1="0" x2="20" y2="0" />
  <path id="long" transform="rotate(2)" d="M 0 10 L 50 10 L 100 10 L 150 10 L 200 10" />
</g></svg>`;

test("assigns stable wrappers, spatial metadata, and preserves transforms", () => {
  const result = processMap(sample, { neighborCount: 2, longPathThreshold: 80 });
  assert.equal(result.pieces.length, 6);
  assert.equal(result.pieces[0].id, "kept");
  assert.equal(result.pieces[1].id, "piece-00002");
  assert.equal(result.pieces[2].originalTransform, "rotate(2)");
  assert.deepEqual(result.pieces[0].bbox, [0, 0, 10, 0]);
  assert.equal(result.pieces[0].neighbors.length, 2);
  assert.match(result.processedSvg, /<g id="kept" data-map-piece="true">/);
});

test("selectively splits long linear paths and leaves curves intact", () => {
  const curved = `<svg><path id="curve" d="M 0 0 C 40 0 60 90 100 100" /></svg>`;
  const split = processMap(sample, { longPathThreshold: 80 });
  const untouched = processMap(curved, { longPathThreshold: 10 });
  assert.equal(split.metadata.splitSourceCount, 1);
  assert.equal(untouched.metadata.splitSourceCount, 0);
  assert.equal(untouched.pieces.length, 1);
});

test("returns deterministic IDs and neighbor ordering", () => {
  const first = processMap(sample);
  const second = processMap(sample);
  assert.deepEqual(first.pieces, second.pieces);
});

test("prepares a text-free candidate pool while keeping unselected roads static", () => {
  const poster = `<svg><g id="LineCollection_1">
    <path d="M 0 0 L 10 0"/><path d="M 10 0 L 20 0"/><path d="M 20 0 L 30 0"/>
  </g><g id="text_1"><path d="M 0 0 L 1 1"/></g><image href="data:test" /></svg>`;
  const prepared = prepareMotionSvg(poster, { candidateLimit: 2 });
  assert.equal(prepared.metadata.roadGeometryCount, 3);
  assert.equal(prepared.metadata.candidateCount, 2);
  assert.doesNotMatch(prepared.svg, /id="text_1"|<image/);
  const processed = processMap(prepared.svg, { candidateAttribute: "data-motion-candidate", splitLongPaths: false });
  assert.equal(processed.pieces.length, 2);
  assert.equal((processed.processedSvg.match(/data-map-piece/g) ?? []).length, 2);
  assert.equal((processed.processedSvg.match(/<path\b/g) ?? []).length, 3);
});

test("selects candidates from dense posters without spreading the full path list onto the stack", () => {
  const paths = Array.from({ length: 130000 }, (_, index) => `<path d="M ${index % 500} ${Math.floor(index / 500)} l 1 1" />`).join("");
  const source = `<svg><g id="LineCollection_1">${paths}</g><g id="text_1"><text>City</text></g></svg>`;
  const prepared = prepareMotionSvg(source, { candidateLimit: 3000 });
  assert.equal(prepared.metadata.roadGeometryCount, 130000);
  assert.equal(prepared.metadata.candidateCount, 3000);
  assert.equal((prepared.svg.match(/data-motion-candidate=/g) ?? []).length, 3000);
});

test("extracts a transparent overlay containing only movable wrappers", () => {
  const source = `<svg viewBox="0 0 20 20"><defs><clipPath id="clip"><rect width="20" height="20" /></clipPath></defs><g id="LineCollection_1" clip-path="url(#clip)"><path d="M 0 0 L 1 1"/><path d="M 10 10 L 12 12"/></g></svg>`;
  const prepared = prepareMotionSvg(source, { candidateLimit: 1, removeGroupIds: [] });
  const result = processMap(prepared.svg, { candidateAttribute: "data-motion-candidate", splitLongPaths: false });
  const overlay = extractMotionOverlay(result.processedSvg);
  assert.equal((overlay.match(/data-map-piece=/g) ?? []).length, 1);
  assert.equal((overlay.match(/<path\b/g) ?? []).length, 1);
  assert.match(overlay, /<defs>/);
  assert.match(overlay, /clip-path="url\(#clip\)"/);
  const emptyOverlay = extractMotionOverlay(result.processedSvg, { pieceIds: [] });
  assert.equal((emptyOverlay.match(/data-map-piece=/g) ?? []).length, 0);
});
