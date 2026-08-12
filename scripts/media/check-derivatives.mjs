#!/usr/bin/env node
/**
 * Budget + integrity verifier for generated media.
 *
 * Asserts, against the committed manifests, that:
 *   - every manifest-referenced derivative and atlas file exists on disk;
 *   - no critical-path initial-view asset exceeds its byte budget;
 *   - the atlas per-breakpoint payloads stay within their ceilings.
 *
 * Run in CI via `npm test`. Exits non-zero on any violation.
 */

import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const PUBLIC = path.join(ROOT, "public");

// Budgets in bytes for the smallest (initial mobile) and desktop variants of
// the critical-path images. These are the numbers the performance bar cares
// about, checked against the actual generated smallest/target variants.
const CRITICAL_BUDGETS = {
  // wordmark: tiny 2-color mark; smallest variant must be well under budget.
  "brand/ark-and-text-source.png": { maxSmallest: 32 * 1024 },
  // hero LCP ink map: mobile <=250 KB, desktop <=450 KB.
  "maps/japanese-ink-scroll/base/study-01.webp": {
    maxSmallest: 250 * 1024,
    maxLargest: 450 * 1024,
  },
};

// Atlas is decorative/off-critical-path, but the mobile breakpoint must still
// stay reasonable so a phone doesn't pull a multi-MB ambient background.
const ATLAS_BUDGETS = {
  420: 400 * 1024, // mobile avif/webp per-variant ceiling
  720: 900 * 1024,
  1100: 1500 * 1024,
};

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function verifyDerivatives() {
  const manifestPath = path.join(PUBLIC, "derived/manifest.json");
  check(existsSync(manifestPath), "derived/manifest.json missing");
  if (!existsSync(manifestPath)) return;

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const [src, entry] of Object.entries(manifest.sources)) {
    const smallest = [...entry.variants].sort((a, b) => a.width - b.width || a.bytes - b.bytes)[0];
    const largest = [...entry.variants].sort((a, b) => b.width - a.width || b.bytes - a.bytes)[0];

    for (const v of entry.variants) {
      const abs = path.join(PUBLIC, v.path.replace(/^\//, ""));
      check(existsSync(abs), `missing derivative on disk: ${v.path}`);
    }

    const budget = CRITICAL_BUDGETS[src];
    if (budget?.maxSmallest != null) {
      check(
        smallest.bytes <= budget.maxSmallest,
        `${src}: smallest variant ${(smallest.bytes / 1024).toFixed(0)} KB exceeds budget ${(budget.maxSmallest / 1024).toFixed(0)} KB`
      );
    }
    if (budget?.maxLargest != null) {
      check(
        largest.bytes <= budget.maxLargest,
        `${src}: largest variant ${(largest.bytes / 1024).toFixed(0)} KB exceeds budget ${(budget.maxLargest / 1024).toFixed(0)} KB`
      );
    }
  }
}

async function verifyAtlas() {
  const manifestPath = path.join(PUBLIC, "derived/atlas/atlas-manifest.json");
  check(existsSync(manifestPath), "derived/atlas/atlas-manifest.json missing");
  if (!existsSync(manifestPath)) return;

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const [widthKey, bp] of Object.entries(manifest.breakpoints)) {
    const budget = ATLAS_BUDGETS[Number(widthKey)];
    for (const format of ["avif", "webp"]) {
      const abs = path.join(PUBLIC, bp[format].path.replace(/^\//, ""));
      check(existsSync(abs), `missing atlas variant on disk: ${bp[format].path}`);
      if (budget != null) {
        check(
          bp[format].bytes <= budget,
          `atlas ${widthKey}w ${format} ${(bp[format].bytes / 1024).toFixed(0)} KB exceeds ceiling ${(budget / 1024).toFixed(0)} KB`
        );
      }
    }
  }
}

await verifyDerivatives();
await verifyAtlas();

if (failures.length > 0) {
  console.error("Media budget check FAILED:");
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log("Media budgets and manifests verified");
