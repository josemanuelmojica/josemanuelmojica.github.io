import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "out");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const stateArtRelativeDirectory = path.join("maps", "us-state-studies", "v1");
const release = JSON.parse(
  await readFile(path.join(root, "content", "release.json"), "utf8"),
);

const pages = [
  ["home", "index.html"],
  ["preview index", "previews/index.html"],
  ["datum rail", "previews/datum-rail/index.html"],
  ["plan legend", "previews/plan-legend/index.html"],
  ["compass", "previews/compass/index.html"],
  ["sheet tabs", "previews/sheet-tabs/index.html"],
];

const previewRoutes = pages.slice(2);

const requiredAssets = [
  "brand/ark-and-text-source.png",
  "og.png",
  "icons/freehand-key.png",
  "properties/residence-01.jpg",
  "maps/japanese-ink-scroll/collection.json",
];

async function readOutput(relativePath) {
  return readFile(path.join(output, relativePath), "utf8");
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function walk(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(directory, entry.name), relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

test("exports the home page, preview index, and four navigation studies", async () => {
  for (const [label, relativePath] of pages) {
    const page = await stat(path.join(output, relativePath));
    assert.ok(page.isFile(), `${label} was not exported to ${relativePath}`);
    assert.ok(page.size > 0, `${label} exported an empty HTML file`);
  }
});

test("preserves the selected release homepage and RealScout learning copy", async () => {
  const homeText = visibleText(await readOutput("index.html"));
  assert.match(homeText, /Arχ\s*&\s*Teχt/i);

  if (release.id === "current-scroll" || release.id === "previous-scroll") {
    assert.match(homeText, /Be drawn to where you live\./i);
  } else {
    assert.match(homeText, /Find the answer\./i);
    assert.match(homeText, /Get back to the client\./i);
  }

  const previewIndexText = visibleText(await readOutput("previews/index.html"));
  assert.match(previewIndexText, /Four ways into the same field guide\./i);

  for (const [, relativePath] of previewRoutes) {
    const previewText = visibleText(await readOutput(relativePath));
    assert.match(previewText, /Find the answer\./i, `${relativePath} lost the learning-hub headline`);
    assert.match(previewText, /Get back to the client\./i, `${relativePath} lost the learning-hub headline`);
    assert.match(previewText, /RealScout help, courses, and academy training\./i);
  }
});

test("emits the static security boundary without framed content", async () => {
  for (const [, relativePath] of pages) {
    const html = await readOutput(relativePath);
    assert.match(html, /http-equiv="Content-Security-Policy"/i);
    assert.match(html, /frame-src\s+(?:&#x27;|')none(?:&#x27;|')/i);
    assert.match(html, /name="referrer"\s+content="strict-origin-when-cross-origin"/i);
    assert.doesNotMatch(html, /<iframe\b/i);
  }
});

test("renders the selected release's defining homepage behavior", async () => {
  const home = await readOutput("index.html");

  if (release.id === "previous-scroll") {
    assert.match(home, /properties\/residence-0[1-3]\.jpg/);
    assert.match(home, /Eight markets/);
    return;
  }

  const previewSignatures = {
    "datum-rail": /Datum rail/i,
    "plan-legend": /Customer learning plan/i,
    compass: /Set a bearing/i,
    "sheet-tabs": /Drawing index/i,
  };
  const previewSignature = previewSignatures[release.id];
  if (previewSignature) {
    assert.match(visibleText(home), previewSignature);
    assert.doesNotMatch(home, /<iframe\b/i);
    return;
  }

  assert.equal(release.id, "current-scroll", `unhandled release id: ${release.id}`);
  const markets = [
    "San Francisco",
    "San Diego",
    "Portland",
    "New York City",
    "Austin",
    "Chicago",
    "Minneapolis",
    "Charlotte",
  ];

  for (const market of markets) {
    assert.ok(
      home.includes(`?market=${encodeURIComponent(market)}#properties`),
      `${market} is missing its filtered collection link`,
    );
  }

  assert.match(home, /market-portal__art-slot/);
  assert.match(home, /Myers Park/);
  assert.doesNotMatch(home, /portalImageUrl/);
  assert.doesNotMatch(home, /market-portal__aperture[^>]*>\s*<img/i);
});

test("copies required public assets and references the real wordmark", async () => {
  for (const relativePath of requiredAssets) {
    const asset = await stat(path.join(output, relativePath));
    assert.ok(asset.isFile(), `${relativePath} is missing from the static export`);
    assert.ok(asset.size > 0, `${relativePath} is empty`);
  }

  for (const [, relativePath] of pages) {
    const html = await readOutput(relativePath);
    assert.ok(
      html.includes(`${basePath}/brand/ark-and-text-source.png`),
      `${relativePath} does not reference the supplied wordmark artwork at the configured base path`,
    );
    assert.ok(
      html.includes(`${basePath}/_next/static/`),
      `${relativePath} does not reference Next.js assets at the configured base path`,
    );
  }

  const previewIndex = await readOutput("previews/index.html");
  for (const [, relativePath] of previewRoutes) {
    const route = `/${relativePath.replace(/index\.html$/, "")}`;
    assert.ok(
      previewIndex.includes(`href="${basePath}${route}"`),
      `preview index does not link to ${basePath}${route}`,
    );
  }
});

test("copies the complete state-art corpus byte for byte", async () => {
  const sourceDirectory = path.join(root, "public", stateArtRelativeDirectory);
  const outputDirectory = path.join(output, stateArtRelativeDirectory);
  const sourceManifest = await readFile(path.join(sourceDirectory, "manifest.json"));
  const outputManifest = await readFile(path.join(outputDirectory, "manifest.json"));
  assert.deepEqual(outputManifest, sourceManifest, "the exported state-art manifest changed");

  const manifest = JSON.parse(sourceManifest.toString("utf8"));
  const relativeAssets = [
    manifest.fallbackAsset,
    ...manifest.states.flatMap((state) => state.assets.map((asset) => asset.path)),
  ];

  for (const relativePath of relativeAssets) {
    const [sourceAsset, outputAsset] = await Promise.all([
      readFile(path.join(sourceDirectory, relativePath)),
      readFile(path.join(outputDirectory, relativePath)),
    ]);
    assert.deepEqual(outputAsset, sourceAsset, `${relativePath} was not copied byte for byte`);
  }
});

test("contains no legacy Vinext or Cloudflare-worker output", async () => {
  const files = await walk(output);
  const forbiddenPath = /(?:^|\/)(?:_worker\.js|wrangler(?:\.toml|\.jsonc?)?|\.open-next|_sites-preview)(?:\/|$)/i;
  const forbiddenText = /@cloudflare\/vinext|\bvinext\b|\.open-next|_sites-preview/i;
  const searchable = new Set([".html", ".js", ".css", ".json", ".txt", ".xml"]);

  for (const relativePath of files) {
    const normalizedPath = relativePath.split(path.sep).join("/");
    assert.doesNotMatch(normalizedPath, forbiddenPath, `legacy output found: ${normalizedPath}`);

    if (searchable.has(path.extname(relativePath))) {
      const contents = await readOutput(relativePath);
      assert.doesNotMatch(contents, forbiddenText, `legacy marker found in ${normalizedPath}`);
      assert.doesNotMatch(contents, /<iframe\b/i, `iframe found in ${normalizedPath}`);
    }
  }
});
