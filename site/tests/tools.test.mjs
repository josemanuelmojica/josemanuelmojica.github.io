import assert from "node:assert/strict";
import { test } from "node:test";
import { lintArticle, SAMPLE_ARTICLE, slugify } from "../lib/tools/knowledge-linter.ts";
import { runPrivacyGate, SAMPLE_TRANSCRIPT } from "../lib/tools/privacy-gate.ts";
import { runPreflight, SAMPLE_CSV, normalizePhone, mapHeader } from "../lib/tools/import-preflight.ts";

test("linter finds broken anchors and suggests the nearest heading", () => {
  const report = lintArticle(SAMPLE_ARTICLE);
  const broken = report.orders.filter((o) => o.rule === "broken-anchor");
  assert.equal(broken.length, 3);
  assert.match(broken.find((o) => o.found === "#admin-permisions").fix, /#admin-permissions/);
  assert.ok(report.orders.some((o) => o.rule === "duplicate-anchor"));
  assert.ok(report.orders.some((o) => o.rule === "vague-link-text"));
  assert.ok(report.orders.some((o) => o.rule === "hedged-language"));
  assert.ok(report.orders.some((o) => o.rule === "screenshot-dependency"));
  assert.ok(report.orders.some((o) => o.rule === "hard-coded-date"));
  assert.equal(report.orders[0].severity, "critical");
});

test("linter passes a clean article and reads HTML headings", () => {
  const html = '<h2 id="setup">Setup</h2>\n<p>Open <a href="#setup">the setup steps</a>.</p>';
  assert.deepEqual(lintArticle(html).orders, []);
  assert.equal(slugify("Admin permissions!"), "admin-permissions");
});

test("privacy gate redacts every identifier and leaks nothing", () => {
  const result = runPrivacyGate(SAMPLE_TRANSCRIPT);
  assert.equal(result.ok, true);
  assert.deepEqual(result.leaks, []);
  for (const secret of ["marco.ruiz@example.com", "201-4477", "Orchard", "example-crm", "Dana", "Marco", "Whitfield"]) {
    assert.ok(!result.output.includes(secret), `${secret} leaked`);
  }
  assert.equal(result.counts.EMAIL, 1);
  assert.equal(result.counts.PHONE, 1);
  assert.equal(result.counts.ADDRESS, 1);
  assert.equal(result.speakers.length, 2);
  assert.match(result.output, /^\[SPEAKER_A\]: Thanks/);
});

test("privacy gate refuses input it cannot attribute", () => {
  assert.equal(runPrivacyGate("").ok, false);
  assert.equal(runPrivacyGate("just a note with no speakers").ok, false);
});

test("preflight buckets rows as clean, repaired, or critical", () => {
  const result = runPreflight(SAMPLE_CSV);
  assert.equal(result.ok, true);
  assert.deepEqual(result.totals, { clean: 1, repaired: 2, critical: 3 });
  const avery = result.rows[0];
  assert.equal(avery.values.email, "avery.lopez@example.com");
  assert.equal(avery.values.first_name, "Avery");
  assert.equal(avery.values.phone, "+15553018890");
  assert.equal(avery.values.zip, "02134");
  assert.match(result.rows[4].notes.join(), /Duplicate of row 2/);
  assert.equal(mapHeader("E-mail"), "email");
  assert.equal(mapHeader("Lead Source"), null);
  assert.deepEqual(normalizePhone("555.880.1234"), { value: "+15558801234", valid: true });
});

test("preflight refuses a file without an email column", () => {
  assert.equal(runPreflight("Name,Phone\nA,1").ok, false);
});
