import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Run after `npm run build`: checks the Cloudflare Pages output contract.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");

test("exports every route as static HTML", async () => {
  for (const route of ["index.html", "search/index.html", "home-value/index.html", "404.html"]) {
    assert.ok((await stat(path.join(out, route))).isFile(), `${route} missing`);
  }
});

test("ships Pages edge headers with framing and object protection", async () => {
  const headers = await readFile(path.join(out, "_headers"), "utf8");
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
});

test("keeps the brand line and skip link in the prerendered home page", async () => {
  const html = await readFile(path.join(out, "index.html"), "utf8");
  assert.match(html, /Be drawn/);
  assert.match(html, /to where you live\./);
  assert.match(html, /href="#main"/);
});

test("uses static export, not a deprecated adapter", async () => {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  assert.equal(deps["@cloudflare/next-on-pages"], undefined);
  const config = await readFile(path.join(root, "next.config.ts"), "utf8");
  assert.match(config, /output: "export"/);
  const wrangler = await readFile(path.join(root, "wrangler.toml"), "utf8");
  assert.match(wrangler, /pages_build_output_dir = "\.\/out"/);
});
