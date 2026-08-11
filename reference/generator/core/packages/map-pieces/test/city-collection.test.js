import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const collectionUrl = new URL("../../../public/maps/street-choreographies-v1/collection.json", import.meta.url);

test("the city collection contains eight text-free motion assets", async () => {
  const collection = JSON.parse(await readFile(collectionUrl, "utf8"));
  assert.equal(collection.studies.length, 8);
  assert.equal(collection.visibleLabels, false);

  for (const study of collection.studies) {
    const svgUrl = new URL(`../../../public${study.svgUrl}`, import.meta.url);
    const piecesUrl = new URL(`../../../public${study.metadataUrl}`, import.meta.url);
    await Promise.all([access(svgUrl), access(piecesUrl)]);
    const [svg, document] = await Promise.all([readFile(svgUrl, "utf8"), readFile(piecesUrl, "utf8").then(JSON.parse)]);
    assert.equal(study.textFree, true, `${study.id} is marked text-free`);
    assert.equal(document.metadata.pieceCount, 3000, `${study.id} has the controlled candidate count`);
    assert.equal(document.metadata.neighborMethod, "spatial-grid");
    assert.ok(document.pieces.every((piece) => piece.neighbors.length === 6), `${study.id} has six neighbors per piece`);
    assert.doesNotMatch(svg, /<(?:text|image|script|foreignObject)\b/i, `${study.id} contains no text, raster, or executable nodes`);
    assert.doesNotMatch(svg, new RegExp(`${study.city}|OpenStreetMap|USA`, "i"), `${study.id} contains no visible place labels`);
  }
});
