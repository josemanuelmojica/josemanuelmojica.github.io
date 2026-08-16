import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);
const stateArtDirectory = path.join(root, "public", "maps", "us-state-studies", "v1");

const releaseHomepages = new Map([
  ["current-scroll", "./InkEstates"],
  ["previous-scroll", "../reference/previous-site/app/InkEstates"],
  ["datum-rail", "./previews/datum-rail/page"],
  ["plan-legend", "./previews/plan-legend/page"],
  ["compass", "./previews/compass/page"],
  ["sheet-tabs", "./previews/sheet-tabs/page"],
]);

const stateFipsByPostalCode = new Map([
  ["AL", "01"], ["AK", "02"], ["AZ", "04"], ["AR", "05"], ["CA", "06"],
  ["CO", "08"], ["CT", "09"], ["DE", "10"], ["FL", "12"], ["GA", "13"],
  ["HI", "15"], ["ID", "16"], ["IL", "17"], ["IN", "18"], ["IA", "19"],
  ["KS", "20"], ["KY", "21"], ["LA", "22"], ["ME", "23"], ["MD", "24"],
  ["MA", "25"], ["MI", "26"], ["MN", "27"], ["MS", "28"], ["MO", "29"],
  ["MT", "30"], ["NE", "31"], ["NV", "32"], ["NH", "33"], ["NJ", "34"],
  ["NM", "35"], ["NY", "36"], ["NC", "37"], ["ND", "38"], ["OH", "39"],
  ["OK", "40"], ["OR", "41"], ["PA", "42"], ["RI", "44"], ["SC", "45"],
  ["SD", "46"], ["TN", "47"], ["TX", "48"], ["UT", "49"], ["VT", "50"],
  ["VA", "51"], ["WA", "53"], ["WV", "54"], ["WI", "55"], ["WY", "56"],
]);

const previewRoutes = [
  "datum-rail",
  "plan-legend",
  "compass",
  "sheet-tabs",
];

const publicAssets = [
  "brand/ark-and-text-source.png",
  "og.png",
  "icons/freehand-calendar.png",
  "icons/freehand-filter.png",
  "icons/freehand-home.png",
  "icons/freehand-key.png",
  "properties/residence-01.jpg",
  "properties/residence-02.jpg",
  "properties/residence-03.jpg",
  "maps/japanese-ink-scroll/collection.json",
];

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("declares a known, correctly wired release homepage", async () => {
  const release = JSON.parse(await source("content/release.json"));
  const page = await source("app/page.tsx");
  const layout = await source("app/layout.tsx");
  const expectedImport = releaseHomepages.get(release.id);

  assert.ok(expectedImport, `unknown release id: ${release.id}`);
  assert.equal(typeof release.label, "string");
  assert.ok(release.label.length > 0, "release label is empty");
  assert.equal(typeof release.homepage, "string");
  assert.match(page, new RegExp(expectedImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  if (release.id === "previous-scroll") {
    assert.match(layout, /reference\/previous-site\/app\/globals\.css/);
  } else {
    assert.match(layout, /\.\/globals\.css/);
  }
});

function assertSafeRelativePath(relativePath, label) {
  assert.equal(typeof relativePath, "string", `${label} must be a string`);
  assert.ok(relativePath.length > 0, `${label} is empty`);
  assert.equal(path.posix.normalize(relativePath), relativePath, `${label} is not normalized`);
  assert.ok(!path.posix.isAbsolute(relativePath), `${label} is absolute`);
  assert.doesNotMatch(relativePath, /[\\:?#\0]/, `${label} contains unsafe characters`);
  assert.ok(
    relativePath.split("/").every((segment) => segment && segment !== "." && segment !== ".."),
    `${label} contains an unsafe path segment`,
  );
}

function assertPassiveSvg(svg, label) {
  const rootElement = svg.match(/<svg\b[^>]*>/i)?.[0];
  assert.ok(rootElement, `${label} has no SVG root element`);
  assert.match(rootElement, /\bviewBox=(['"])0\s+0\s+1200\s+900\1/i, `${label} has the wrong viewBox`);
  assert.doesNotMatch(svg, /<!DOCTYPE|<!ENTITY/i, `${label} declares external-capable XML`);
  assert.doesNotMatch(
    svg,
    /<(?:script|foreignObject|iframe|object|embed|image|audio|video|animate(?:Motion|Transform)?|set)\b/i,
    `${label} contains active SVG content`,
  );
  assert.doesNotMatch(svg, /\bon[a-z][a-z0-9:_-]*\s*=/i, `${label} contains an event handler`);
  assert.doesNotMatch(svg, /(?:javascript\s*:|@import\b|expression\s*\(|-moz-binding)/i, `${label} contains active CSS or script`);

  for (const match of svg.matchAll(/\b(?:href|xlink:href|src)\s*=\s*(['"])(.*?)\1/gi)) {
    assert.match(match[2], /^#[A-Za-z_][\w:.-]*$/, `${label} contains an external reference`);
  }
  for (const match of svg.matchAll(/\burl\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    assert.match(match[2], /^#[A-Za-z_][\w:.-]*$/, `${label} contains an external CSS URL`);
  }
}

test("keeps all four preview route sources in the portable repository", async () => {
  for (const route of previewRoutes) {
    const page = await stat(path.join(root, "app", "previews", route, "page.tsx"));
    assert.ok(page.isFile(), `missing /previews/${route}/ source`);
  }

  const index = await source("app/previews/page.tsx");
  const switcher = await source("app/components/PreviewShared.tsx");

  for (const route of previewRoutes) {
    const href = `/previews/${route}/`;
    assert.match(index, new RegExp(href.replaceAll("/", "\\/")));
    assert.match(switcher, new RegExp(href.replaceAll("/", "\\/")));
  }
});

test("uses the supplied wordmark artwork and base-path helper", async () => {
  const shared = await source("app/components/PreviewShared.tsx");
  const home = await source("app/InkEstates.tsx");
  const helper = await source("app/lib/publicPath.ts");

  assert.match(shared, /publicPath\("\/brand\/ark-and-text-source\.png"\)/);
  assert.match(home, /publicPath\("\/brand\/ark-and-text-source\.png"\)/);
  assert.match(shared, />Arχ\s*&amp;\s*Teχt</);
  assert.match(helper, /NEXT_PUBLIC_BASE_PATH/);
});

test("includes every required source asset", async () => {
  for (const relativePath of publicAssets) {
    const asset = await stat(path.join(root, "public", relativePath));
    assert.ok(asset.isFile(), `${relativePath} is missing`);
    assert.ok(asset.size > 0, `${relativePath} is empty`);
  }
});

test("publishes a portable runtime map collection with no missing references", async () => {
  const collection = JSON.parse(await source("public/maps/japanese-ink-scroll/collection.json"));
  assert.equal(collection.studies.length, 8);

  for (const study of collection.studies) {
    for (const field of ["baseUrl", "activeOverlayUrl", "activeMetadataUrl"]) {
      const reference = study[field];
      assert.ok(!reference.startsWith("/"), `${study.id} ${field} is root-absolute`);
      const asset = await stat(
        path.join(root, "public", "maps", "japanese-ink-scroll", reference),
      );
      assert.ok(asset.isFile(), `${study.id} ${field} is missing`);
    }
  }
});

test("publishes an exact, integrity-checked, passive 50-state art corpus", async () => {
  const manifest = JSON.parse(await source("public/maps/us-state-studies/v1/manifest.json"));
  const schema = JSON.parse(await source("content/state-art-manifest.schema.json"));
  const expectedIdentities = [...stateFipsByPostalCode]
    .map(([postalCode, fips]) => `US-${postalCode}|${postalCode}|${fips}`)
    .sort();
  const actualIdentities = manifest.states
    .map(({ id, postalCode, fips }) => `${id}|${postalCode}|${fips}`)
    .sort();

  assert.equal(schema.type, "object");
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.states.minItems, 50);
  assert.equal(schema.properties.states.maxItems, 50);
  assert.equal(schema.$defs.state.additionalProperties, false);
  assert.equal(schema.$defs.asset.additionalProperties, false);
  assert.deepEqual(actualIdentities, expectedIdentities);
  assert.equal(manifest.assetBase, ".");

  assertSafeRelativePath(manifest.fallbackAsset, "fallbackAsset");
  const fallbackPath = path.resolve(stateArtDirectory, manifest.fallbackAsset);
  assert.ok(fallbackPath.startsWith(`${stateArtDirectory}${path.sep}`));
  const fallback = await readFile(fallbackPath, "utf8");
  assertPassiveSvg(fallback, manifest.fallbackAsset);

  const declaredAssets = [];
  for (const state of manifest.states) {
    assert.equal(state.id, `US-${state.postalCode}`, `${state.name} has a mismatched ID`);
    assert.equal(state.fips, stateFipsByPostalCode.get(state.postalCode));
    assert.equal(state.safeForPublicSite, true, `${state.id} is not approved for the public site`);
    assert.deepEqual(state.assets.map(({ format }) => format).sort(), ["svg", "webp"]);

    for (const asset of state.assets) {
      assertSafeRelativePath(asset.path, `${state.id} ${asset.format} path`);
      assert.equal(asset.path, `states/${state.id}.${asset.format}`);
      assert.equal(asset.width, 1200);
      assert.equal(asset.height, 900);
      assert.equal(asset.mediaType, asset.format === "svg" ? "image/svg+xml" : "image/webp");

      const absolutePath = path.resolve(stateArtDirectory, asset.path);
      assert.ok(absolutePath.startsWith(`${stateArtDirectory}${path.sep}`));
      const contents = await readFile(absolutePath);
      const file = await stat(absolutePath);
      assert.ok(file.isFile(), `${asset.path} is not a file`);
      assert.equal(file.size, asset.bytes, `${asset.path} byte count changed`);
      assert.equal(
        createHash("sha256").update(contents).digest("hex"),
        asset.sha256,
        `${asset.path} SHA-256 changed`,
      );

      if (asset.format === "webp") {
        assert.ok(contents.length >= 12, `${asset.path} is too short to be WebP`);
        assert.equal(contents.subarray(0, 4).toString("ascii"), "RIFF", `${asset.path} lacks RIFF signature`);
        assert.equal(contents.subarray(8, 12).toString("ascii"), "WEBP", `${asset.path} lacks WEBP signature`);
      } else {
        assertPassiveSvg(contents.toString("utf8"), asset.path);
      }

      declaredAssets.push(path.basename(asset.path));
    }
  }

  const onDiskAssets = (await readdir(path.join(stateArtDirectory, "states"))).sort();
  assert.deepEqual(onDiskAssets, declaredAssets.sort(), "state asset directory and manifest differ");
});

test("keeps static export configuration aligned for Appwrite and GitHub Pages", async () => {
  const nextConfig = await source("next.config.ts");
  const workflow = await source(".github/workflows/pages.yml");
  const appwrite = JSON.parse(await source("appwrite.config.example.json"));
  const layout = await source("app/layout.tsx");

  assert.match(nextConfig, /output:\s*"export"/);
  assert.match(nextConfig, /trailingSlash:\s*true/);
  assert.match(nextConfig, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(nextConfig, /turbopack:\s*\{/);
  assert.match(nextConfig, /root:\s*projectRoot/);

  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH:\s*\$\{\{ steps\.pages\.outputs\.base_path \}\}/);
  assert.match(workflow, /path:\s*\.\/out/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /pull_request:/);
  assert.match(
    workflow,
    /group:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.event_name\s*==\s*'pull_request'\s*&&\s*github\.ref\s*\|\|\s*'production'\s*\}\}/,
  );
  assert.match(workflow, /deploy:\s*[\s\S]*pages: write/);
  assert.doesNotMatch(workflow, /uses:\s*[^\s]+@v\d+/);

  assert.match(layout, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(layout, /script-src 'self' 'unsafe-inline' https:\/\/challenges\.cloudflare\.com/);
  assert.doesNotMatch(layout, /(?:frame|script|connect)-src[^\n]*\*/);
  assert.match(layout, /object-src 'none'/);
  assert.match(layout, /strict-origin-when-cross-origin/);
  assert.match(layout, /resolveSiteUrl\(process\.env\.NEXT_PUBLIC_SITE_URL\)/);

  const headers = await readFile(path.join(root, "public", "_headers"), "utf8");
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(layout, /metadataBase:\s*siteUrl/);

  assert.equal(appwrite.projectId, "");
  assert.equal(appwrite.sites[0].$id, "");
  assert.equal(appwrite.sites[0].framework, "nextjs");
  assert.equal(appwrite.sites[0].adapter, "static");
  assert.equal(appwrite.sites[0].buildCommand, "npm test");
  assert.equal(appwrite.sites[0].outputDirectory, "./out");
});

test("normalizes canonical site URL configuration", async () => {
  const moduleUrl = pathToFileURL(path.join(root, "app", "lib", "siteUrl.ts")).href;
  const evaluation = `
    import { resolveSiteUrl } from ${JSON.stringify(moduleUrl)};

    const results = [
      resolveSiteUrl(undefined).href,
      resolveSiteUrl("").href,
      resolveSiteUrl("   ").href,
      resolveSiteUrl("not a URL").href,
      resolveSiteUrl("ftp://files.example.com").href,
      resolveSiteUrl("https://user:password@example.com").href,
      resolveSiteUrl("  https://guide.example.com/resources  ").href,
    ];

    process.stdout.write(JSON.stringify(results));
  `;
  const { stdout } = await execFileAsync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "--eval", evaluation],
    { cwd: root },
  );

  assert.deepEqual(JSON.parse(stdout), [
    "https://ark-and-text.example/",
    "https://ark-and-text.example/",
    "https://ark-and-text.example/",
    "https://ark-and-text.example/",
    "https://ark-and-text.example/",
    "https://ark-and-text.example/",
    "https://guide.example.com/resources",
  ]);
});

test("starts with a valid, empty verified-resource manifest", async () => {
  const resources = JSON.parse(await source("content/resources.json"));
  const schema = JSON.parse(await source("content/resources.schema.json"));
  const workAccountPrompt = await source("WORK_ACCOUNT_RESEARCH_PROMPT.md");

  assert.deepEqual(resources, []);
  assert.equal(schema.type, "array");
  assert.equal(schema.items.additionalProperties, false);
  assert.ok(schema.items.required.includes("safe_for_public_site"));
  assert.equal(schema.items.properties.verified.const, true);
  assert.match(workAccountPrompt, /Needs URL provided\./);
  assert.match(workAccountPrompt, /Unresolved or restricted/);
  assert.match(workAccountPrompt, /Do not invent a URL/);
});

test("keeps market links deny-by-default until exact RealScout searches are verified", async () => {
  const links = JSON.parse(await source("content/market-links.json"));
  const origins = JSON.parse(await source("content/market-link-origins.json"));
  const marketSource = await source("app/InkEstates.tsx");

  assert.equal(links.length, 8);
  assert.equal(new Set(links.map((entry) => entry.id)).size, 8);
  assert.equal(new Set(links.map((entry) => entry.city)).size, 8);
  assert.deepEqual(origins, ["https://www.realscout.com"]);

  for (const entry of links) {
    if (!entry.verified || !entry.safe_for_public_site) {
      assert.equal(entry.url, null, `${entry.id} has an unapproved URL`);
      continue;
    }

    const url = new URL(entry.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    assert.equal(url.port, "");
    assert.ok(origins.includes(url.origin), `${entry.id} uses an unlisted origin`);
  }

  assert.match(marketSource, /allowedMarketLinkOrigins\.has\(url\.origin\)/);
  assert.match(marketSource, /getAll\("market"\)/);
  assert.match(marketSource, /id=\{marketAnchor\(study\.city\)\}/);
  assert.doesNotMatch(marketSource, /portalImageUrl/);
  assert.doesNotMatch(marketSource, /<iframe\b/i);
});

test("keeps map overlays aligned and favorites persistence lifecycle-safe", async () => {
  const home = await source("app/InkEstates.tsx");
  const toggleFavorite = home.match(
    /const toggleFavorite = \(id: string\) => \{[\s\S]*?\n  \};/,
  )?.[0];

  assert.match(
    home,
    /root\.setAttribute\("preserveAspectRatio", "xMidYMid slice"\)/,
  );
  assert.doesNotMatch(home, /key=\{portalStudy\.id\}/);
  assert.match(home, /const \[favoritesHydrated, setFavoritesHydrated\] = useState\(false\)/);
  assert.match(home, /if \(!favoritesHydrated\) return;/);
  assert.ok(toggleFavorite, "toggleFavorite implementation is missing");
  assert.doesNotMatch(
    toggleFavorite,
    /localStorage/,
    "the React state updater must stay free of persistence side effects",
  );
});
