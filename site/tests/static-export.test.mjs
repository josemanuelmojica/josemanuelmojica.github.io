import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Run after `npm run build`: checks the static export served by the Worker.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");

test("exports home, résumé, 404, and sitemap", async () => {
  for (const file of ["index.html", "resume/index.html", "404.html", "sitemap.xml", "robots.txt"]) {
    assert.ok((await stat(path.join(out, file))).isFile(), `${file} missing`);
  }
});

test("home page carries name, contact, and skip link", async () => {
  const html = await readFile(path.join(out, "index.html"), "utf8");
  assert.match(html, /José Manuel Mojica Garcia/);
  assert.match(html, /mailto:hello@mojicagarcia\.com/);
  assert.match(html, /href="#main"/);
  assert.doesNotMatch(html, /<iframe\b/i);
});

test("ships edge security headers", async () => {
  const headers = await readFile(path.join(out, "_headers"), "utf8");
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /X-Frame-Options: DENY/);
});

test("deploys as an assets-only Worker", async () => {
  const wrangler = await readFile(path.join(root, "wrangler.jsonc"), "utf8");
  assert.match(wrangler, /"name": "mojicagarcia"/);
  assert.match(wrangler, /"directory": "\.\/out"/);
});
