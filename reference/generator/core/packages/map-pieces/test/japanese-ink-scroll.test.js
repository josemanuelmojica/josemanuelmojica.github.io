import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const publicRoot = new URL("../../../public/", import.meta.url);
const collectionUrl = new URL("maps/japanese-ink-scroll/collection.json", publicRoot);

function publicAssetUrl(assetPath) {
  return new URL(assetPath.replace(/^\//, ""), publicRoot);
}

test("the Japanese Ink Sites collection has eight lightweight, text-free studies", async () => {
  const collection = JSON.parse(await readFile(collectionUrl, "utf8"));

  assert.equal(collection.studies.length, 8);
  assert.equal(collection.visibleLabels, false);
  assert.equal(collection.palette.paper, "#FAF8F5");
  assert.equal(collection.palette.ink, "#2C2C2C");
  assert.equal(collection.palette.vermilion, "#8B2500");

  for (const study of collection.studies) {
    assert.equal(study.theme, "japanese_ink", `${study.id} uses the shared visual language`);
    assert.equal(study.textFree, true, `${study.id} is marked text-free`);
    assert.equal(study.activeCount, 160, `${study.id} exposes a controlled live set`);

    const baseUrl = publicAssetUrl(study.baseUrl);
    const previewUrl = publicAssetUrl(study.previewUrl);
    const overlayUrl = publicAssetUrl(study.activeOverlayUrl);
    const metadataUrl = publicAssetUrl(study.activeMetadataUrl);
    await Promise.all([access(baseUrl), access(previewUrl), access(overlayUrl), access(metadataUrl)]);

    const [baseStats, overlay, document] = await Promise.all([
      stat(baseUrl),
      readFile(overlayUrl, "utf8"),
      readFile(metadataUrl, "utf8").then(JSON.parse),
    ]);

    assert.ok(baseStats.size < 500_000, `${study.id} base stays below 500 KB`);
    assert.equal(document.metadata.pieceCount, 160);
    assert.equal(document.pieces.length, 160);
    assert.equal(document.metadata.selection, "farthest-point-spatial");
    assert.ok(document.pieces.every((piece) => piece.neighbors.length === 6));
    assert.equal((overlay.match(/data-map-piece="true"/g) ?? []).length, 160);
    assert.doesNotMatch(overlay, /<(?:text|image|script|foreignObject)\b/i);
    assert.doesNotMatch(overlay, new RegExp(`${study.city}|OpenStreetMap|USA`, "i"));
  }
});
