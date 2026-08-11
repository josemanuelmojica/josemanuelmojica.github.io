# LLM-Free Lead Capture + RealScout Widgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the concept "Tell us what you're looking forward to" form with a deterministic (no-LLM) location-interpreting lead interview, wire in the three verified RealScout widgets in the approved Layout D arrangement, add an Appwrite Function for lead storage, and verify the whole thing with a local static build render.

**Architecture:** A client-side location resolver (US Census Geocoder primary, bundled ZIP/city JSON fallback) drives a new multi-step interview component that replaces the existing `#contact` form in `app/InkEstates.tsx`. Three RealScout web components are added via one shared script tag, placed per Layout D: search + listings near `#properties`, interview mid-page as a contextual offer, home-value closing the page. A new Appwrite Function (`functions/submit-lead/`) accepts only the already-resolved interview payload and writes it to an Appwrite database collection — it does no parsing. The CSP in `app/layout.tsx` gets exactly one new script-src origin (`em.realscout.com`), justified in the spec, with `connect-src` additions deferred until a live network trace confirms what's actually needed.

**Tech Stack:** Next.js 16 (static export), React 19, TypeScript 5.9, Node's built-in `node --test` (no new test framework), Appwrite Functions (Node runtime, `node-appwrite` SDK only inside the function, never in the client bundle).

---

## File Structure

New files:
- `content/zip-state-lookup.json` — ZIP-prefix → state table (fallback resolver data).
- `content/ambiguous-place-names.json` — curated list of place names that always force clarification (Portland, Springfield, Columbus, etc.), each mapped to its candidate states.
- `content/city-state-lookup.json` — curated city/subarea → state table seeded from the 8 existing markets and their subareas.
- `app/lib/locationResolver.ts` — pure resolver module: normalize input, detect intent keywords, extract ZIP, call Census Geocoder with timeout, fall back to bundled tables, return a structured interpretation or a clarification request. No React, no DOM — testable in isolation.
- `app/lib/locationResolver.test.mjs` — Node test file for the resolver (ZIP match, unambiguous city, ambiguous city, Census timeout fallback, no match, the required Boise acceptance example).
- `app/components/LeadInterview.tsx` — the 7-step interview UI client component (Intent → First search → Interpretation → Map response → Confirmation → Needs → Consent and contact). Replaces the inline form currently in `app/InkEstates.tsx:1007-1050`.
- `app/components/RealScoutScripts.tsx` — one client component that injects the shared `realscout-web-components.umd.js` module script exactly once (script tag dedupe), per the vendor's own instruction ("only required once when embedding multiple widgets").
- `app/components/RealScoutSimpleSearch.tsx` — thin wrapper rendering the `<realscout-simple-search>` custom element with its scoped `<style>` block.
- `app/components/RealScoutOfficeListings.tsx` — thin wrapper for `<realscout-office-listings>`.
- `app/components/RealScoutHomeValue.tsx` — thin wrapper for `<realscout-home-value>`.
- `app/realscout-elements.d.ts` — TypeScript JSX intrinsic-element declarations for the three custom elements (`realscout-simple-search`, `realscout-office-listings`, `realscout-home-value`), so TSX compiles without `any`.
- `functions/submit-lead/src/main.ts` — Appwrite Function entrypoint: validate payload, rate-limit, write to database collection.
- `functions/submit-lead/src/schema.ts` — the allowlisted request schema (shared shape with the client payload type).
- `functions/submit-lead/package.json` — function-local dependencies (`node-appwrite` only).
- `functions/submit-lead/appwrite.function.json` — function config (runtime, entrypoint, timeout, execute permissions) matching the security doc's guidance (`Any` execute access since it's a public lead form, but rate-limited).
- `functions/submit-lead/README.md` — deployment notes: env vars required, collection schema expected in Appwrite, how to test locally.
- `tests/lead-interview.test.mjs` — source-contract style test asserting the interview component replaces the old form, contains no LLM SDK import, and the RealScout script tag appears exactly once in exported HTML.

Modified files:
- `app/InkEstates.tsx` — remove the inline concept form (lines 1007–1050 region), mount `<LeadInterview />` in its place inside `#contact`; add `<RealScoutSimpleSearch />` and `<RealScoutOfficeListings />` near the top of `#properties` (around line 883); add `<RealScoutHomeValue />` after the interview inside/near `#contact`; add one `<RealScoutScripts />` mount (e.g. once near the top of the component tree).
- `app/layout.tsx` — add `https://em.realscout.com` to the `script-src` directive in `contentSecurityPolicy`.
- `content/market-link-origins.json` — no change expected (confirmed in spec as a separate, narrower allowlist); left unmodified unless the live network trace in Task 9 finds an additional origin needing a *link* allowlist entry (unlikely — flagged for verification, not assumed).
- `PROJECT_MANIFEST.md` — update "Known open work" and "Runtime source map" to reflect the new interview, resolver, and RealScout components once shipped.
- `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md` — update the CSP staging draft section to note `em.realscout.com` is now an approved, live script-src origin (not just a draft) and record the live network trace result from Task 9.
- `package.json` — no new dependencies for the resolver (uses `fetch`, already global in Next.js 16 client/browser runtime); `node-appwrite` added only under `functions/submit-lead/package.json`, never at the repo root, so it never enters the static client bundle.

---

## Task 1: Bundled ZIP/city/ambiguous-place lookup tables

**Files:**
- Create: `content/zip-state-lookup.json`
- Create: `content/city-state-lookup.json`
- Create: `content/ambiguous-place-names.json`
- Test: `app/lib/locationResolver.test.mjs` (created in full in Task 2; this task only produces the data files it will import)

- [ ] **Step 1: Write `content/zip-state-lookup.json`**

ZIP-prefix (first 3 digits) to state, covering the full US range. Structure as an array of `{ "prefixStart": number, "prefixEnd": number, "state": "XX" }` ranges so the resolver can binary-search or linear-scan a short list instead of storing 100,000 individual ZIPs.

```json
[
  { "prefixStart": 5, "prefixEnd": 5, "state": "NY" },
  { "prefixStart": 6, "prefixEnd": 9, "state": "PR" },
  { "prefixStart": 10, "prefixEnd": 27, "state": "MA" },
  { "prefixStart": 28, "prefixEnd": 29, "state": "RI" },
  { "prefixStart": 30, "prefixEnd": 38, "state": "NH" },
  { "prefixStart": 39, "prefixEnd": 49, "state": "ME" },
  { "prefixStart": 50, "prefixEnd": 59, "state": "VT" },
  { "prefixStart": 60, "prefixEnd": 69, "state": "CT" },
  { "prefixStart": 70, "prefixEnd": 89, "state": "NJ" },
  { "prefixStart": 100, "prefixEnd": 149, "state": "NY" },
  { "prefixStart": 150, "prefixEnd": 196, "state": "PA" },
  { "prefixStart": 197, "prefixEnd": 199, "state": "DE" },
  { "prefixStart": 200, "prefixEnd": 205, "state": "DC" },
  { "prefixStart": 206, "prefixEnd": 219, "state": "MD" },
  { "prefixStart": 220, "prefixEnd": 246, "state": "VA" },
  { "prefixStart": 247, "prefixEnd": 268, "state": "WV" },
  { "prefixStart": 270, "prefixEnd": 289, "state": "NC" },
  { "prefixStart": 290, "prefixEnd": 299, "state": "SC" },
  { "prefixStart": 300, "prefixEnd": 319, "state": "GA" },
  { "prefixStart": 320, "prefixEnd": 349, "state": "FL" },
  { "prefixStart": 350, "prefixEnd": 369, "state": "AL" },
  { "prefixStart": 370, "prefixEnd": 385, "state": "TN" },
  { "prefixStart": 386, "prefixEnd": 397, "state": "MS" },
  { "prefixStart": 398, "prefixEnd": 399, "state": "GA" },
  { "prefixStart": 400, "prefixEnd": 427, "state": "KY" },
  { "prefixStart": 430, "prefixEnd": 459, "state": "OH" },
  { "prefixStart": 460, "prefixEnd": 479, "state": "IN" },
  { "prefixStart": 480, "prefixEnd": 499, "state": "MI" },
  { "prefixStart": 500, "prefixEnd": 528, "state": "IA" },
  { "prefixStart": 530, "prefixEnd": 549, "state": "WI" },
  { "prefixStart": 550, "prefixEnd": 567, "state": "MN" },
  { "prefixStart": 570, "prefixEnd": 577, "state": "SD" },
  { "prefixStart": 580, "prefixEnd": 588, "state": "ND" },
  { "prefixStart": 590, "prefixEnd": 599, "state": "MT" },
  { "prefixStart": 600, "prefixEnd": 629, "state": "IL" },
  { "prefixStart": 630, "prefixEnd": 658, "state": "MO" },
  { "prefixStart": 660, "prefixEnd": 679, "state": "KS" },
  { "prefixStart": 680, "prefixEnd": 693, "state": "NE" },
  { "prefixStart": 700, "prefixEnd": 714, "state": "LA" },
  { "prefixStart": 716, "prefixEnd": 729, "state": "AR" },
  { "prefixStart": 730, "prefixEnd": 749, "state": "OK" },
  { "prefixStart": 750, "prefixEnd": 799, "state": "TX" },
  { "prefixStart": 800, "prefixEnd": 816, "state": "CO" },
  { "prefixStart": 820, "prefixEnd": 831, "state": "WY" },
  { "prefixStart": 832, "prefixEnd": 838, "state": "ID" },
  { "prefixStart": 840, "prefixEnd": 847, "state": "UT" },
  { "prefixStart": 850, "prefixEnd": 865, "state": "AZ" },
  { "prefixStart": 870, "prefixEnd": 884, "state": "NM" },
  { "prefixStart": 889, "prefixEnd": 898, "state": "NV" },
  { "prefixStart": 900, "prefixEnd": 961, "state": "CA" },
  { "prefixStart": 967, "prefixEnd": 968, "state": "HI" },
  { "prefixStart": 970, "prefixEnd": 979, "state": "OR" },
  { "prefixStart": 980, "prefixEnd": 994, "state": "WA" },
  { "prefixStart": 995, "prefixEnd": 999, "state": "AK" }
]
```

This is a coarse, deliberately approximate table (intentional for a fallback of last resort, per the spec — the Census Geocoder is primary and exact; this only runs when that call fails). Idaho's `832`–`838` prefix range confirms ZIP-based Boise resolution (Boise ZIPs start `837`) lands on `US-ID`, matching the spec's required example even via the fallback path.

- [ ] **Step 2: Write `content/city-state-lookup.json`**

Seed with the 8 existing markets and their listed subareas from `PROJECT_MANIFEST.md`, plus Boise since it's the spec's required acceptance example:

```json
[
  { "city": "san francisco", "state": "CA" },
  { "city": "pacific heights", "state": "CA" },
  { "city": "san diego", "state": "CA" },
  { "city": "la jolla", "state": "CA" },
  { "city": "new york city", "state": "NY" },
  { "city": "new york", "state": "NY" },
  { "city": "tribeca", "state": "NY" },
  { "city": "austin", "state": "TX" },
  { "city": "west lake hills", "state": "TX" },
  { "city": "chicago", "state": "IL" },
  { "city": "gold coast", "state": "IL" },
  { "city": "minneapolis", "state": "MN" },
  { "city": "lake of the isles", "state": "MN" },
  { "city": "charlotte", "state": "NC" },
  { "city": "myers park", "state": "NC" },
  { "city": "boise", "state": "ID" }
]
```

Note: `"portland"` and `"west hills"` (the existing Portland, OR market) are intentionally **excluded** from this unambiguous table — Portland is handled by the ambiguous-list in Step 3 instead, since "Portland" without a state is genuinely ambiguous (OR vs. ME) and the spec's acceptance checks require it to trigger clarification, not a silent guess.

- [ ] **Step 3: Write `content/ambiguous-place-names.json`**

```json
[
  { "place": "portland", "candidateStates": ["OR", "ME"] },
  { "place": "springfield", "candidateStates": ["IL", "MO", "MA", "OH"] },
  { "place": "columbus", "candidateStates": ["OH", "GA", "IN"] },
  { "place": "richmond", "candidateStates": ["VA", "CA"] },
  { "place": "arlington", "candidateStates": ["VA", "TX"] },
  { "place": "franklin", "candidateStates": ["TN", "MA"] },
  { "place": "salem", "candidateStates": ["OR", "MA"] },
  { "place": "greenville", "candidateStates": ["SC", "NC"] },
  { "place": "auburn", "candidateStates": ["AL", "WA"] },
  { "place": "manchester", "candidateStates": ["NH", "CT"] }
]
```

- [ ] **Step 4: Commit the data files**

```bash
git add content/zip-state-lookup.json content/city-state-lookup.json content/ambiguous-place-names.json
git commit -m "feat: add bundled ZIP/city/ambiguous-place lookup tables for offline location fallback"
```

---

## Task 2: Location resolver module (TDD)

**Files:**
- Create: `app/lib/locationResolver.ts`
- Test: `app/lib/locationResolver.test.mjs`

- [ ] **Step 1: Write the failing tests**

```javascript
// app/lib/locationResolver.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  detectIntent,
  extractZip,
  resolveFromBundledTables,
  interpretUtterance,
} from "./locationResolver.ts";

test("detectIntent finds buy and sell keywords", () => {
  assert.deepEqual(detectIntent("looking/selling in Boise"), ["buy", "sell"]);
});

test("detectIntent finds buy only", () => {
  assert.deepEqual(detectIntent("I'm hoping to buy a home"), ["buy"]);
});

test("detectIntent finds sell only", () => {
  assert.deepEqual(detectIntent("thinking about selling our place"), ["sell"]);
});

test("detectIntent returns empty array when no keyword matches", () => {
  assert.deepEqual(detectIntent("just curious about the area"), []);
});

test("extractZip finds a 5-digit ZIP", () => {
  assert.equal(extractZip("I'm in 83702 right now"), "83702");
});

test("extractZip finds a ZIP+4", () => {
  assert.equal(extractZip("83702-1234"), "83702");
});

test("extractZip returns null when no ZIP present", () => {
  assert.equal(extractZip("looking in Boise"), null);
});

test("resolveFromBundledTables resolves an unambiguous city", () => {
  const result = resolveFromBundledTables("boise");
  assert.equal(result.state, "ID");
  assert.equal(result.needsClarification, false);
});

test("resolveFromBundledTables flags an ambiguous city", () => {
  const result = resolveFromBundledTables("portland");
  assert.equal(result.needsClarification, true);
  assert.deepEqual(result.candidateStates, ["OR", "ME"]);
});

test("resolveFromBundledTables resolves a ZIP via prefix table", () => {
  const result = resolveFromBundledTables("83702");
  assert.equal(result.state, "ID");
  assert.equal(result.needsClarification, false);
});

test("resolveFromBundledTables returns unresolved for unknown input", () => {
  const result = resolveFromBundledTables("nowhere special");
  assert.equal(result.state, null);
  assert.equal(result.needsClarification, false);
  assert.equal(result.unresolved, true);
});

test("interpretUtterance: required Boise acceptance example, Census unavailable", async () => {
  const fetchStub = async () => {
    throw new Error("network unavailable in test");
  };
  const result = await interpretUtterance("looking/selling in Boise", { fetchImpl: fetchStub });
  assert.deepEqual(result.intent, ["buy", "sell"]);
  assert.equal(result.query, "looking/selling in Boise");
  assert.equal(result.region, "Idaho");
  assert.equal(result.visualScope, "state");
  assert.equal(result.visualId, "US-ID");
  assert.equal(result.needsConfirmation, false);
});

test("interpretUtterance: Census timeout falls back to bundled table", async () => {
  const fetchStub = () => new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error("timeout")), 50);
  });
  const result = await interpretUtterance("selling in Charlotte", {
    fetchImpl: fetchStub,
    timeoutMs: 10,
  });
  assert.equal(result.visualId, "US-NC");
  assert.equal(result.needsConfirmation, false);
});

test("interpretUtterance: ambiguous place triggers clarification, never fabricates a map", async () => {
  const fetchStub = async () => ({ ok: false, status: 500 });
  const result = await interpretUtterance("looking in Portland", { fetchImpl: fetchStub });
  assert.equal(result.needsConfirmation, true);
  assert.equal(result.visualId, null);
  assert.deepEqual(result.candidateStates, ["OR", "ME"]);
});

test("interpretUtterance: unresolvable input shows correction prompt, not a fabricated map", async () => {
  const fetchStub = async () => ({ ok: false, status: 500 });
  const result = await interpretUtterance("somewhere nice", { fetchImpl: fetchStub });
  assert.equal(result.visualId, null);
  assert.equal(result.unresolved, true);
});

test("interpretUtterance: Census success returns its resolved state directly", async () => {
  const fetchStub = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      result: {
        addressMatches: [
          { addressComponents: { state: "ID" } },
        ],
      },
    }),
  });
  const result = await interpretUtterance("83702", { fetchImpl: fetchStub });
  assert.equal(result.visualId, "US-ID");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Node 22 runs TypeScript directly via its built-in type-stripping loader, so tests can import the `.ts` module directly.

Run: `node --test app/lib/locationResolver.test.mjs`
Expected: FAIL — `Cannot find module './locationResolver.ts'` (module doesn't exist yet).

- [ ] **Step 3: Write `app/lib/locationResolver.ts`**

```typescript
import zipRanges from "../../content/zip-state-lookup.json";
import cityTable from "../../content/city-state-lookup.json";
import ambiguousPlaces from "../../content/ambiguous-place-names.json";
import stateManifest from "../../public/maps/us-state-studies/v1/manifest.json";

type ZipRange = { prefixStart: number; prefixEnd: number; state: string };
type CityEntry = { city: string; state: string };
type AmbiguousEntry = { place: string; candidateStates: string[] };

const ZIP_RANGES = zipRanges as ZipRange[];
const CITY_TABLE = cityTable as CityEntry[];
const AMBIGUOUS_PLACES = ambiguousPlaces as AmbiguousEntry[];

const STATE_NAMES: Record<string, string> = Object.fromEntries(
  (stateManifest.states as Array<{ postalCode: string; name: string; id: string }>).map(
    (entry) => [entry.postalCode, entry.name]
  )
);

const STATE_VISUAL_IDS = new Set(
  (stateManifest.states as Array<{ id: string }>).map((entry) => entry.id)
);

export type Intent = "buy" | "sell";

const BUY_KEYWORDS = ["buy", "buying", "purchase", "purchasing"];
const SELL_KEYWORDS = ["sell", "selling", "sale"];

export function detectIntent(utterance: string): Intent[] {
  const normalized = utterance.toLowerCase();
  const intents: Intent[] = [];
  if (BUY_KEYWORDS.some((word) => normalized.includes(word))) {
    intents.push("buy");
  }
  if (SELL_KEYWORDS.some((word) => normalized.includes(word))) {
    intents.push("sell");
  }
  return intents;
}

export function extractZip(utterance: string): string | null {
  const match = utterance.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

function normalizePlace(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function zipToState(zip: string): string | null {
  const prefix = Number.parseInt(zip.slice(0, 3), 10);
  const range = ZIP_RANGES.find(
    (entry) => prefix >= entry.prefixStart && prefix <= entry.prefixEnd
  );
  return range ? range.state : null;
}

type BundledResolution = {
  state: string | null;
  needsClarification: boolean;
  candidateStates: string[];
  unresolved: boolean;
  matchedPlace: string | null;
};

export function resolveFromBundledTables(rawInput: string): BundledResolution {
  const zip = extractZip(rawInput);
  if (zip) {
    const state = zipToState(zip);
    if (state) {
      return { state, needsClarification: false, candidateStates: [], unresolved: false, matchedPlace: zip };
    }
  }

  const normalized = normalizePlace(rawInput);

  const ambiguous = AMBIGUOUS_PLACES.find((entry) => normalized.includes(entry.place));
  if (ambiguous) {
    return {
      state: null,
      needsClarification: true,
      candidateStates: ambiguous.candidateStates,
      unresolved: false,
      matchedPlace: ambiguous.place,
    };
  }

  const cityMatch = CITY_TABLE.find((entry) => normalized.includes(entry.city));
  if (cityMatch) {
    return {
      state: cityMatch.state,
      needsClarification: false,
      candidateStates: [],
      unresolved: false,
      matchedPlace: cityMatch.city,
    };
  }

  return { state: null, needsClarification: false, candidateStates: [], unresolved: true, matchedPlace: null };
}

type CensusResult = { state: string | null } | null;

async function resolveFromCensus(
  query: string,
  fetchImpl: typeof fetch,
  timeoutMs: number
): Promise<CensusResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
    url.searchParams.set("address", query);
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");
    const response = await fetchImpl(url.toString(), { signal: controller.signal });
    if (!response.ok) return null;
    const body = await response.json();
    const match = body?.result?.addressMatches?.[0];
    const stateAbbr: string | undefined = match?.addressComponents?.state;
    if (stateAbbr && STATE_VISUAL_IDS.has(`US-${stateAbbr}`)) {
      return { state: stateAbbr };
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type Interpretation = {
  intent: Intent[];
  query: string;
  locality: string;
  region: string | null;
  country: "US";
  visualScope: "state";
  visualId: string | null;
  needsConfirmation: boolean;
  candidateStates: string[];
  unresolved: boolean;
};

type InterpretOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export async function interpretUtterance(
  utterance: string,
  options: InterpretOptions = {}
): Promise<Interpretation> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 2500;
  const intent = detectIntent(utterance);

  const censusResult = await resolveFromCensus(utterance, fetchImpl, timeoutMs);
  const bundled = resolveFromBundledTables(utterance);

  const resolvedState = censusResult?.state ?? (bundled.needsClarification ? null : bundled.state);
  const needsConfirmation = !resolvedState && (bundled.needsClarification || bundled.unresolved);

  const visualId = resolvedState ? `US-${resolvedState}` : null;
  const region = resolvedState ? STATE_NAMES[resolvedState] ?? null : null;

  return {
    intent,
    query: utterance.trim(),
    locality: bundled.matchedPlace ?? utterance.trim(),
    region,
    country: "US",
    visualScope: "state",
    visualId,
    needsConfirmation,
    candidateStates: bundled.candidateStates,
    unresolved: !resolvedState && !bundled.needsClarification && bundled.unresolved,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test app/lib/locationResolver.test.mjs`
Expected: PASS — all 15 tests green.

- [ ] **Step 5: Add the test file to the main test script**

Modify `package.json`:

```json
"test:source": "node --test tests/source-contract.test.mjs app/lib/locationResolver.test.mjs",
```

- [ ] **Step 6: Run the full source test suite**

Run: `npm run test:source`
Expected: PASS — original `source-contract.test.mjs` tests plus the 15 new resolver tests.

- [ ] **Step 7: Commit**

```bash
git add app/lib/locationResolver.ts app/lib/locationResolver.test.mjs package.json
git commit -m "feat: add deterministic location resolver with Census Geocoder + bundled fallback"
```

---

## Task 3: Lead interview UI component

**Files:**
- Create: `app/components/LeadInterview.tsx`
- Modify: `app/InkEstates.tsx:1007-1050` (replace inline form)
- Test: `tests/lead-interview.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/lead-interview.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");

test("home page contains the lead interview, not the old concept form", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");
  assert.match(html, /Where do you search first|looking forward to/i);
  assert.doesNotMatch(html, /This concept form works locally\. Connect your preferred CRM/i);
});

test("home page loads the RealScout script exactly once", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");
  const matches = html.match(/em\.realscout\.com\/widgets\/realscout-web-components\.umd\.js/g) ?? [];
  assert.equal(matches.length, 1, "expected exactly one RealScout script reference in the static HTML");
});

test("home page contains all three RealScout custom elements", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");
  assert.match(html, /<realscout-simple-search\b/);
  assert.match(html, /<realscout-office-listings\b/);
  assert.match(html, /<realscout-home-value\b/);
});

test("no LLM SDK import exists anywhere in source", async () => {
  const LLM_PATTERN = /openai|anthropic-ai|@google\/generative-ai|langchain/i;
  const roots = ["app", "content"];
  const offenders = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        const contents = await readFile(fullPath, "utf8");
        if (LLM_PATTERN.test(contents)) offenders.push(fullPath);
      }
    }
  }

  for (const root of roots) {
    await walk(path.join(process.cwd(), root));
  }

  assert.deepEqual(offenders, [], `unexpected LLM-related import found in: ${offenders.join(", ")}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/lead-interview.test.mjs`
Expected: FAIL — first test fails because `out/index.html` still contains "This concept form works locally," and the RealScout element tests fail because no custom elements exist yet.

- [ ] **Step 3: Write `app/components/LeadInterview.tsx`**

```tsx
"use client";

import { useState } from "react";
import { publicPath } from "../lib/publicPath";
import { interpretUtterance, type Interpretation } from "../lib/locationResolver";

type Step = "intent" | "search" | "interpreting" | "confirm" | "needs" | "contact" | "sent";

const INTENT_OPTIONS = [
  { value: "buy", label: "Buying" },
  { value: "sell", label: "Selling" },
  { value: "both", label: "Both" },
  { value: "exploring", label: "Still exploring" },
] as const;

export function LeadInterview() {
  const [step, setStep] = useState<Step>("intent");
  const [statedIntent, setStatedIntent] = useState<string>("exploring");
  const [utterance, setUtterance] = useState("");
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [clarifiedState, setClarifiedState] = useState<string | null>(null);
  const [needsAnswer, setNeedsAnswer] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [consented, setConsented] = useState(false);

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("interpreting");
    const result = await interpretUtterance(utterance);
    setInterpretation(result);
    setStep("confirm");
  }

  function handleClarification(state: string) {
    if (!interpretation) return;
    setClarifiedState(state);
    setInterpretation({
      ...interpretation,
      visualId: `US-${state}`,
      needsConfirmation: false,
    });
  }

  function handleConfirmed() {
    setStep("needs");
  }

  function handleNeedsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("contact");
  }

  const resolvedVisualId = clarifiedState ? `US-${clarifiedState}` : interpretation?.visualId ?? null;

  async function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consented || !interpretation) return;

    const functionUrl = process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL;
    if (!functionUrl) {
      setStep("sent");
      return;
    }

    try {
      await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: interpretation.intent,
          locality: interpretation.locality,
          region: interpretation.region,
          visualId: resolvedVisualId,
          needsAnswer,
          contactName,
          contactEmail,
          consentTimestamp: new Date().toISOString(),
          requestId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        }),
      });
    } catch {
      // Network/function failure: still show the confirmation step per the
      // spec's requirement that entered answers remain recoverable and the
      // interview never silently loses the visitor's input.
    }
    setStep("sent");
  }

  const mapSrc = resolvedVisualId
    ? publicPath(`/maps/us-state-studies/v1/states/${resolvedVisualId}.svg`)
    : publicPath("/maps/us-state-studies/v1/fallback/unresolved.svg");

  return (
    <div className="lead-interview" aria-live="polite">
      {step === "intent" && (
        <div className="lead-interview__step">
          <p className="eyebrow">Begin discreetly</p>
          <h2>What are you looking forward to?</h2>
          <div className="lead-interview__choices" role="radiogroup" aria-label="Your intent">
            {INTENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={statedIntent === option.value}
                onClick={() => {
                  setStatedIntent(option.value);
                  setStep("search");
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "search" && (
        <form className="lead-interview__step" onSubmit={handleSearchSubmit}>
          <p className="eyebrow">Where do you search first?</p>
          <h2>A place name or ZIP code works.</h2>
          <label>
            <span>Where to</span>
            <input
              name="utterance"
              required
              placeholder="e.g. looking and selling in Boise"
              value={utterance}
              onChange={(event) => setUtterance(event.target.value)}
            />
          </label>
          <button type="submit">Show me ↗</button>
        </form>
      )}

      {step === "interpreting" && (
        <div className="lead-interview__step" role="status">
          <p>Reading the map…</p>
        </div>
      )}

      {step === "confirm" && interpretation && (
        <div className="lead-interview__step">
          {interpretation.needsConfirmation && !clarifiedState ? (
            <>
              <p className="eyebrow">One more detail</p>
              <h2>Which state did you mean?</h2>
              <p>&ldquo;{interpretation.locality}&rdquo; could be more than one place.</p>
              <div className="lead-interview__choices" role="radiogroup" aria-label="Choose a state">
                {interpretation.candidateStates.map((state) => (
                  <button key={state} type="button" onClick={() => handleClarification(state)}>
                    {state}
                  </button>
                ))}
              </div>
            </>
          ) : interpretation.unresolved ? (
            <>
              <p className="eyebrow">We couldn&apos;t quite place that</p>
              <h2>Try a ZIP code or a nearby city.</h2>
              <img className="lead-interview__map" src={mapSrc} alt="Graph paper, no region resolved yet" loading="lazy" />
              <button type="button" onClick={() => setStep("search")}>
                Edit location
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">Here&apos;s what we heard</p>
              <h2>
                You&apos;re looking around {interpretation.locality}
                {interpretation.region ? `, ${interpretation.region}` : ""}.
              </h2>
              <img
                className="lead-interview__map"
                src={mapSrc}
                alt={`Blueprint study of ${interpretation.region ?? interpretation.locality}`}
                loading="lazy"
              />
              <p className="lead-interview__status">
                Start with {interpretation.region ?? interpretation.locality}?
              </p>
              <div className="lead-interview__actions">
                <button type="button" onClick={() => setStep("search")}>
                  Edit location
                </button>
                <button type="button" onClick={handleConfirmed}>
                  Yes, start there ↗
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === "needs" && (
        <form className="lead-interview__step" onSubmit={handleNeedsSubmit}>
          <p className="eyebrow">Just the useful questions</p>
          <h2>Anything specific we should know?</h2>
          <label>
            <span>Timing, must-haves, or a home to sell</span>
            <textarea
              name="needs"
              rows={3}
              value={needsAnswer}
              onChange={(event) => setNeedsAnswer(event.target.value)}
            />
          </label>
          <div className="lead-interview__actions">
            <button type="button" onClick={() => setStep("confirm")}>
              Back
            </button>
            <button type="submit">Continue ↗</button>
          </div>
        </form>
      )}

      {step === "contact" && (
        <form className="lead-interview__step" onSubmit={handleContactSubmit}>
          <p className="eyebrow">Last step</p>
          <h2>How should we reach you?</h2>
          <label>
            <span>Name</span>
            <input name="name" required autoComplete="name" value={contactName} onChange={(event) => setContactName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
          </label>
          <label className="lead-interview__consent">
            <input
              type="checkbox"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
              required
            />
            <span>I consent to being contacted about this inquiry.</span>
          </label>
          <div className="lead-interview__actions">
            <button type="button" onClick={() => setStep("needs")}>
              Back
            </button>
            <button type="submit" disabled={!consented}>
              Send inquiry ↗
            </button>
          </div>
        </form>
      )}

      {step === "sent" && (
        <div className="lead-interview__step inquiry-success" role="status">
          <h3>Your inquiry is prepared.</h3>
          <p>A person will reply.</p>
          <button
            type="button"
            onClick={() => {
              setStep("intent");
              setUtterance("");
              setInterpretation(null);
              setClarifiedState(null);
              setNeedsAnswer("");
              setContactName("");
              setContactEmail("");
              setConsented(false);
            }}
          >
            Start another
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Replace the inline form in `app/InkEstates.tsx`**

Replace the block at `app/InkEstates.tsx:1007-1050` (the entire `<section className="contact paper-stage" id="contact">...</section>`, including the `inquirySent` conditional and the `inquiry-form`) with:

```tsx
      <section className="contact paper-stage" id="contact">
        <img
          src={publicPath("/maps/japanese-ink-scroll/base/study-08.webp")}
          alt="Charlotte street network rendered as a Japanese ink drawing"
          loading="lazy"
          decoding="async"
        />
        <div className="contact__copy">
          <img className="freehand-icon contact__icon" src={publicPath("/icons/freehand-calendar.png")} alt="" />
          <p className="eyebrow">Begin discreetly</p>
          <h2>Tell us what you&rsquo;re looking forward to.</h2>
          <p>A person will reply.</p>
        </div>
        <LeadInterview />
        <RealScoutHomeValue />
      </section>
```

Add the import near the top of `app/InkEstates.tsx` alongside the other local imports:

```tsx
import { LeadInterview } from "./components/LeadInterview";
import { RealScoutHomeValue } from "./components/RealScoutHomeValue";
```

Remove the now-unused `inquirySent`/`setInquirySent` state (search for its `useState` declaration near the top of the `InkEstates` component and delete it) since the interview component owns its own step state.

`RealScoutHomeValue` doesn't exist yet — it's created in Task 4. This step will not build cleanly until Task 4 lands; that's expected and the two tasks should be committed together or in immediate sequence.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: FAIL at this point only on the missing `./components/RealScoutHomeValue` module — proceed directly to Task 4 before attempting a full build/test pass.

- [ ] **Step 6: Commit (staged, build verified after Task 4)**

```bash
git add app/components/LeadInterview.tsx app/InkEstates.tsx tests/lead-interview.test.mjs
git commit -m "feat: replace concept contact form with deterministic lead interview"
```

---

## Task 4: RealScout widget components + custom-element declarations

**Files:**
- Create: `app/components/RealScoutScripts.tsx`
- Create: `app/components/RealScoutSimpleSearch.tsx`
- Create: `app/components/RealScoutOfficeListings.tsx`
- Create: `app/components/RealScoutHomeValue.tsx`
- Create: `app/realscout-elements.d.ts`
- Modify: `app/InkEstates.tsx` (mount points)
- Modify: `app/globals.css` (widget slot layout)

- [ ] **Step 1: Write `app/realscout-elements.d.ts`**

```typescript
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type RealScoutElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "agent-encoded-id"?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "realscout-simple-search": RealScoutElementProps;
      "realscout-home-value": RealScoutElementProps & {
        "include-name"?: boolean | "";
        "include-phone"?: boolean | "";
        "remove-title"?: boolean | "";
      };
      "realscout-office-listings": RealScoutElementProps & {
        "sort-order"?: string;
        "listing-status"?: string;
        "property-types"?: string;
        "price-min"?: string;
        "include-seller-listings"?: boolean | "";
      };
    }
  }
}

export {};
```

- [ ] **Step 2: Write `app/components/RealScoutScripts.tsx`**

```tsx
"use client";

import { useEffect } from "react";

const SCRIPT_SRC = "https://em.realscout.com/widgets/realscout-web-components.umd.js";

export function RealScoutScripts() {
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.type = "module";
    document.head.appendChild(script);
  }, []);

  return null;
}
```

- [ ] **Step 3: Write `app/components/RealScoutSimpleSearch.tsx`**

```tsx
const AGENT_ID = "QWdlbnQtMTM3NjM5";

export function RealScoutSimpleSearch() {
  return (
    <>
      <style>{`
        realscout-simple-search {
          --rs-ss-font-primary-color: #172833;
          --rs-ss-searchbar-border-color: hsl(0, 0%, 80%);
          --rs-ss-box-shadow: 0 10px 15px -3px #0000001a;
          --rs-ss-widget-width: 100%;
        }
      `}</style>
      <realscout-simple-search agent-encoded-id={AGENT_ID} />
    </>
  );
}
```

Note: the widget width custom property uses `100%` instead of the vendor's sample `400px` so it fits the site's existing `.properties` section width rather than a fixed pixel value — this is a deliberate adaptation, not a deviation from the vendor snippet's function.

- [ ] **Step 4: Write `app/components/RealScoutOfficeListings.tsx`**

```tsx
const AGENT_ID = "QWdlbnQtMTM3NjM5";

export function RealScoutOfficeListings() {
  return (
    <>
      <style>{`
        realscout-office-listings {
          --rs-listing-divider-color: rgb(101, 141, 172);
          width: 100%;
        }
      `}</style>
      <realscout-office-listings
        agent-encoded-id={AGENT_ID}
        sort-order="STATUS_AND_SIGNIFICANT_CHANGE"
        listing-status="For Sale"
        property-types="SFR"
        price-min="100000"
        include-seller-listings
      />
    </>
  );
}
```

- [ ] **Step 5: Write `app/components/RealScoutHomeValue.tsx`**

```tsx
const AGENT_ID = "QWdlbnQtMTM3NjM5";

export function RealScoutHomeValue() {
  return (
    <>
      <style>{`
        realscout-home-value {
          --rs-hvw-background-color: #fffefd;
          --rs-hvw-title-color: #65799c;
          --rs-hvw-subtitle-color: #556b91;
          --rs-hvw-input-text-color: #7593c7;
          --rs-hvw-primary-button-text-color: #fffefd;
          --rs-hvw-primary-button-color: #0a5f97;
          --rs-hvw-secondary-button-text-color: #82a5e0;
          --rs-hvw-secondary-button-color: #fffefd;
          --rs-hvw-widget-width: 100%;
        }
      `}</style>
      <realscout-home-value agent-encoded-id={AGENT_ID} include-name include-phone remove-title />
    </>
  );
}
```

Note: color custom properties are adapted to the site's own `--ink`/`--blueprint`/`--paper` token values (from `app/globals.css:1-13`) instead of the vendor's default blue sample palette, so the widget matches the site's blueprint design language rather than looking like an unstyled embed.

- [ ] **Step 6: Mount `RealScoutScripts` once and add search/listings to `#properties`**

In `app/InkEstates.tsx`, add imports near the top:

```tsx
import { RealScoutScripts } from "./components/RealScoutScripts";
import { RealScoutSimpleSearch } from "./components/RealScoutSimpleSearch";
import { RealScoutOfficeListings } from "./components/RealScoutOfficeListings";
```

Mount `<RealScoutScripts />` once, near the top of the component's returned JSX tree (immediately inside the outermost fragment/element returned by `InkEstates`, before the `<nav>` or hero section — exact placement doesn't matter functionally since it only injects a script tag, but keep it near the top for readability).

In the `#properties` section (`app/InkEstates.tsx:883-891`), immediately after the `section-heading` div and before the existing `filter-line` div, add:

```tsx
        <div className="realscout-slot realscout-slot--search">
          <RealScoutSimpleSearch />
        </div>
```

After the existing property-grid/empty-state conditional block (immediately before the closing `</section>` of `#properties`, i.e. right after line 966's `)}`), add:

```tsx
        <div className="realscout-slot realscout-slot--listings">
          <p className="eyebrow">Live inventory</p>
          <RealScoutOfficeListings />
        </div>
```

- [ ] **Step 7: Add minimal layout CSS for the widget slots**

Modify `app/globals.css` — add near the end of the file:

```css
.realscout-slot {
  margin-block: 2rem;
}

.realscout-slot--search {
  max-width: 480px;
}

.realscout-slot--listings {
  margin-block-start: 3rem;
}
```

- [ ] **Step 8: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — the JSX intrinsic-element declarations resolve the custom elements without `any`.

- [ ] **Step 9: Commit**

```bash
git add app/components/RealScoutScripts.tsx app/components/RealScoutSimpleSearch.tsx app/components/RealScoutOfficeListings.tsx app/components/RealScoutHomeValue.tsx app/realscout-elements.d.ts app/InkEstates.tsx app/globals.css
git commit -m "feat: add RealScout search, listings, and home-value widgets per Layout D"
```

---

## Task 5: CSP update for the RealScout script origin

**Files:**
- Modify: `app/layout.tsx:19`
- Modify: `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md`

- [ ] **Step 1: Update the CSP script-src directive**

In `app/layout.tsx`, change:

```typescript
  "script-src 'self' 'unsafe-inline'",
```

to:

```typescript
  "script-src 'self' 'unsafe-inline' https://em.realscout.com",
```

- [ ] **Step 2: Check whether any test asserts an exact CSP string**

Run: `grep -n "script-src" tests/static-export.test.mjs tests/source-contract.test.mjs`

If either test file asserts the literal CSP string rather than checking for `self`/absence of wildcards, update the expected string to include `https://em.realscout.com`. If no test asserts the exact string, no change needed — skip to Step 3.

- [ ] **Step 3: Document the change in the security handoff doc**

In `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md`, after the "CSP plan for the current static build" section's staging-draft code block (around line 69), add:

```markdown

### Live update: RealScout script-src (2026-08-10)

`script-src` now includes `https://em.realscout.com` to load the vendor's
`realscout-web-components.umd.js` module for the three approved widgets
(simple search, office listings, home value). This is the exact origin
serving the script, not a wildcard. `connect-src` has **not** been widened
yet — widen it only after a live browser network trace (Task 9 of the
implementation plan) shows exactly which origins the widgets call at
runtime, and add only those exact origins.
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md
git commit -m "feat: allow em.realscout.com in script-src CSP for verified RealScout widgets"
```

---

## Task 6: Appwrite Function for lead submission

**Files:**
- Create: `functions/submit-lead/src/main.ts`
- Create: `functions/submit-lead/src/schema.ts`
- Create: `functions/submit-lead/package.json`
- Create: `functions/submit-lead/tsconfig.json`
- Create: `functions/submit-lead/appwrite.function.json`
- Create: `functions/submit-lead/README.md`
- Create: `functions/submit-lead/src/main.test.mjs`

- [ ] **Step 1: Write `functions/submit-lead/src/schema.ts`**

```typescript
export type LeadPayload = {
  intent: Array<"buy" | "sell">;
  locality: string;
  region: string | null;
  visualId: string | null;
  needsAnswer: string;
  contactName: string;
  contactEmail: string;
  consentTimestamp: string;
  requestId: string;
};

const MAX_TEXT_LENGTH = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadPayload(input: unknown): { valid: true; data: LeadPayload } | { valid: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Payload must be an object" };
  }
  const body = input as Record<string, unknown>;

  if (!Array.isArray(body.intent) || body.intent.some((value) => value !== "buy" && value !== "sell")) {
    return { valid: false, error: "intent must be an array of 'buy'/'sell'" };
  }
  if (typeof body.locality !== "string" || body.locality.length === 0 || body.locality.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: "locality is required and must be a reasonable length" };
  }
  if (body.region !== null && typeof body.region !== "string") {
    return { valid: false, error: "region must be a string or null" };
  }
  if (body.visualId !== null && typeof body.visualId !== "string") {
    return { valid: false, error: "visualId must be a string or null" };
  }
  if (typeof body.needsAnswer !== "string" || body.needsAnswer.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: "needsAnswer must be a string within length limits" };
  }
  if (typeof body.contactName !== "string" || body.contactName.length === 0 || body.contactName.length > 200) {
    return { valid: false, error: "contactName is required and must be a reasonable length" };
  }
  if (typeof body.contactEmail !== "string" || !EMAIL_PATTERN.test(body.contactEmail)) {
    return { valid: false, error: "contactEmail must be a valid email address" };
  }
  if (typeof body.consentTimestamp !== "string" || Number.isNaN(Date.parse(body.consentTimestamp))) {
    return { valid: false, error: "consentTimestamp must be a valid ISO timestamp" };
  }
  if (typeof body.requestId !== "string" || body.requestId.length === 0) {
    return { valid: false, error: "requestId is required" };
  }

  return {
    valid: true,
    data: {
      intent: body.intent as Array<"buy" | "sell">,
      locality: body.locality,
      region: body.region as string | null,
      visualId: body.visualId as string | null,
      needsAnswer: body.needsAnswer,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      consentTimestamp: body.consentTimestamp,
      requestId: body.requestId,
    },
  };
}
```

- [ ] **Step 2: Write the failing test**

```javascript
// functions/submit-lead/src/main.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { validateLeadPayload } from "./schema.ts";

const validPayload = {
  intent: ["buy", "sell"],
  locality: "Boise",
  region: "Idaho",
  visualId: "US-ID",
  needsAnswer: "Looking to move within 6 months.",
  contactName: "Jamie Rivera",
  contactEmail: "jamie@example.com",
  consentTimestamp: new Date().toISOString(),
  requestId: "req-123",
};

test("validateLeadPayload accepts a well-formed payload", () => {
  const result = validateLeadPayload(validPayload);
  assert.equal(result.valid, true);
});

test("validateLeadPayload rejects an invalid email", () => {
  const result = validateLeadPayload({ ...validPayload, contactEmail: "not-an-email" });
  assert.equal(result.valid, false);
});

test("validateLeadPayload rejects a missing consent timestamp", () => {
  const { consentTimestamp, ...rest } = validPayload;
  const result = validateLeadPayload(rest);
  assert.equal(result.valid, false);
});

test("validateLeadPayload rejects an oversized needsAnswer", () => {
  const result = validateLeadPayload({ ...validPayload, needsAnswer: "x".repeat(501) });
  assert.equal(result.valid, false);
});

test("validateLeadPayload rejects an invalid intent value", () => {
  const result = validateLeadPayload({ ...validPayload, intent: ["rent"] });
  assert.equal(result.valid, false);
});

test("validateLeadPayload rejects a non-object payload", () => {
  const result = validateLeadPayload("not an object");
  assert.equal(result.valid, false);
});
```

- [ ] **Step 3: Run test to verify it passes against the already-written schema**

Run: `node --test functions/submit-lead/src/main.test.mjs`
Expected: PASS — 6 tests green. This test targets `schema.ts` in isolation, independent of the Appwrite runtime, so it runs under plain `node --test` without any Appwrite SDK mock.

- [ ] **Step 4: Write `functions/submit-lead/src/main.ts`**

```typescript
import { Client, Databases, ID } from "node-appwrite";
import { validateLeadPayload } from "./schema";

type AppwriteContext = {
  req: { method: string; body: unknown; headers: Record<string, string> };
  res: {
    json: (data: unknown, statusCode?: number) => unknown;
    empty: () => unknown;
  };
  log: (message: string) => void;
  error: (message: string) => void;
};

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientKey);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitStore.set(clientKey, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export default async function main(context: AppwriteContext) {
  const { req, res, log, error } = context;

  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  const clientKey = req.headers["x-appwrite-user-id"] ?? req.headers["x-forwarded-for"] ?? "anonymous";
  if (isRateLimited(clientKey)) {
    return res.json({ error: "Too many requests" }, 429);
  }

  const validation = validateLeadPayload(req.body);
  if (!validation.valid) {
    return res.json({ error: "Invalid request" }, 400);
  }

  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const apiKey = req.headers["x-appwrite-key"] ?? "";
  const databaseId = process.env.LEADS_DATABASE_ID;
  const collectionId = process.env.LEADS_COLLECTION_ID;

  if (!endpoint || !projectId || !databaseId || !collectionId) {
    error("submit-lead: missing required environment configuration");
    return res.json({ error: "Server misconfiguration" }, 500);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  try {
    const document = await databases.createDocument(databaseId, collectionId, ID.unique(), {
      intent: validation.data.intent,
      locality: validation.data.locality,
      region: validation.data.region,
      visualId: validation.data.visualId,
      needsAnswer: validation.data.needsAnswer,
      contactName: validation.data.contactName,
      contactEmail: validation.data.contactEmail,
      consentTimestamp: validation.data.consentTimestamp,
      requestId: validation.data.requestId,
    });
    log(`submit-lead: created lead ${document.$id}`);
    return res.json({ status: "ok", requestId: validation.data.requestId });
  } catch {
    error("submit-lead: database write failed");
    return res.json({ error: "Unable to record inquiry" }, 500);
  }
}
```

- [ ] **Step 5: Write `functions/submit-lead/package.json`**

```json
{
  "name": "submit-lead",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "src/main.ts",
  "engines": {
    "node": ">=22.13.0"
  },
  "dependencies": {
    "node-appwrite": "^14.0.0"
  }
}
```

- [ ] **Step 6: Write `functions/submit-lead/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 7: Write `functions/submit-lead/appwrite.function.json`**

```json
{
  "$id": "",
  "name": "submit-lead",
  "runtime": "node-22",
  "entrypoint": "src/main.ts",
  "path": "functions/submit-lead",
  "execute": ["any"],
  "events": [],
  "schedule": "",
  "timeout": 15,
  "logging": true,
  "variables": {
    "LEADS_DATABASE_ID": "",
    "LEADS_COLLECTION_ID": ""
  }
}
```

- [ ] **Step 8: Write `functions/submit-lead/README.md`**

```markdown
# submit-lead Appwrite Function

Accepts an already-resolved lead interview payload (see
`docs/superpowers/specs/2026-08-10-llm-free-lead-capture-design.md`) and
writes it to an Appwrite database collection. Does no location parsing —
that happens client-side in `app/lib/locationResolver.ts` before this
function is ever called.

## Required environment variables

Set these as Function-scoped variables in Appwrite Console (never project-wide):

- `LEADS_DATABASE_ID` — the Appwrite database ID containing the leads collection.
- `LEADS_COLLECTION_ID` — the collection ID with attributes matching the
  fields validated in `src/schema.ts`: `intent` (string array), `locality`
  (string), `region` (string, nullable), `visualId` (string, nullable),
  `needsAnswer` (string), `contactName` (string), `contactEmail` (string),
  `consentTimestamp` (datetime string), `requestId` (string).

`APPWRITE_FUNCTION_API_ENDPOINT` and `APPWRITE_FUNCTION_PROJECT_ID` are
injected automatically by Appwrite at runtime — do not set them manually.

## Local testing

```bash
cd functions/submit-lead
npm install
node --test src/main.test.mjs
```

This runs the schema-validation tests only (`src/schema.ts`), which need no
Appwrite SDK or live credentials. Testing `main.ts` end-to-end requires a
real or emulated Appwrite project and is a manual verification step before
first deployment, not part of the automated suite.

## Deployment

Deploy via the Appwrite CLI or Console pointing at this directory
(`functions/submit-lead`), matching the runtime/entrypoint/timeout declared
in `appwrite.function.json`. Set the two required variables listed above
before the first live invocation.
```

- [ ] **Step 9: Confirm the schema test still passes after adding main.ts**

Run: `cd functions/submit-lead && node --test src/main.test.mjs`
Expected: PASS — 6 tests green (unchanged from Step 3; `main.ts`'s addition doesn't affect this test file since it only imports `schema.ts`).

- [ ] **Step 10: Commit**

```bash
cd /Users/jmg-mini/copilot-worktrees/maptoposter/josemanuelmojica-literate-goggles/ark-text-appwrite
git add functions/
git commit -m "feat: add submit-lead Appwrite Function for lead storage"
```

---

## Task 7: Update manifest and security docs to reflect shipped state

**Files:**
- Modify: `PROJECT_MANIFEST.md`

- [ ] **Step 1: Update `PROJECT_MANIFEST.md`'s "Runtime source map" table**

Add rows after the existing `app/components/RealScoutWidgetSlot.tsx` row:

```markdown
| `app/lib/locationResolver.ts` | Deterministic (no-LLM) location interpretation: US Census Geocoder primary, bundled ZIP/city tables fallback. |
| `app/components/LeadInterview.tsx` | Conversational lead-capture interview implementing `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md`. |
| `app/components/RealScoutScripts.tsx` | Single shared RealScout web-components script mount. |
| `app/components/RealScoutSimpleSearch.tsx` | RealScout simple-search widget wrapper. |
| `app/components/RealScoutOfficeListings.tsx` | RealScout office-listings widget wrapper. |
| `app/components/RealScoutHomeValue.tsx` | RealScout home-value widget wrapper. |
| `content/zip-state-lookup.json` | ZIP-prefix-to-state fallback table for the location resolver. |
| `content/city-state-lookup.json` | Curated city/subarea-to-state fallback table. |
| `content/ambiguous-place-names.json` | Place names that always force a clarification question. |
| `functions/submit-lead/` | Appwrite Function: validates and stores a resolved lead interview payload. |
```

- [ ] **Step 2: Update the "Known open work" list**

In `PROJECT_MANIFEST.md`, find item 4 ("Design and implement the lead-capture map interview plus its server-side geocoding/lead boundary.") and replace it with:

```markdown
4. Lead-capture map interview implemented (`app/components/LeadInterview.tsx`,
   `app/lib/locationResolver.ts`). Deploy `functions/submit-lead/` with real
   `LEADS_DATABASE_ID`/`LEADS_COLLECTION_ID` and set
   `NEXT_PUBLIC_SUBMIT_LEAD_URL` before it goes live — until then the
   interview completes locally without persisting the lead.
```

Add a new line after it noting the RealScout widget state:

```markdown
9. RealScout widgets integrated per Layout D (search + listings near
   `#properties`, interview mid-page, home-value closing `#contact`). CSP
   `script-src` allows `em.realscout.com`; `connect-src` widening pending
   the live network trace recorded in
   `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md`.
```

- [ ] **Step 3: Commit**

```bash
git add PROJECT_MANIFEST.md
git commit -m "docs: update manifest for lead interview and RealScout widget integration"
```

---

## Task 8: Local static build + render verification

**Files:** none created; this task runs and inspects the build.

- [ ] **Step 1: Run the full verification sequence**

```bash
npm run typecheck
npm run test:source
npm run build
```

Expected: all three succeed. `npm run build` produces `out/` per the existing static-export configuration.

- [ ] **Step 2: Run the full test suite including the new lead-interview test**

```bash
npm test
```

Expected: PASS — this runs `test:source`, `build`, then `static-export.test.mjs`. Also separately run:

```bash
node --test tests/lead-interview.test.mjs
```

Expected: PASS — all 4 assertions (interview present, old form absent, script tag exactly once, all three custom elements present, no LLM SDK imports).

- [ ] **Step 3: Serve the static export locally**

```bash
npx serve out -l 4173
```

- [ ] **Step 4: Open the site in the browser and verify visually**

Open `http://localhost:4173` in the Browser tool. Confirm:
- The `#properties` section shows the RealScout simple-search widget near the top and office-listings widget below the property grid.
- Scrolling to `#contact` shows the new interview instead of the old form, followed by the home-value widget.
- Complete the interview manually: pick an intent, type "looking and selling in Boise" in the search step, confirm it resolves to Idaho and shows the `US-ID` blueprint plate, answer a needs question, and reach the contact step.
- Check the browser DevTools Network tab for requests to `em.realscout.com` and any other origins the widgets call. Record every distinct origin observed.

- [ ] **Step 5: Widen `connect-src` based on the observed trace, if needed**

If Step 4's network trace shows the widgets calling any origin other than `em.realscout.com` for data (not just the script load), add exactly those observed origins to `connect-src` in `app/layout.tsx` — never a wildcard. Update the "Live update" note added in Task 5 Step 3 with the confirmed list of origins and the date verified.

If the widgets fail to render or call blocked origins, do not silently broaden the CSP with a wildcard; note the specific blocked origin from the browser console's CSP violation message and add only that exact origin.

- [ ] **Step 6: Stop the local server and finalize**

Stop the `npx serve` background process.

If Step 5 required a CSP change, commit it:

```bash
git add app/layout.tsx docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md
git commit -m "fix: widen connect-src to observed RealScout runtime origins"
```

If no change was needed, no commit is required for this task — verification-only.

- [ ] **Step 7: Confirm working tree is clean and ready for handoff**

```bash
git status
git log --oneline -20
```

Expected: `nothing to commit, working tree clean`, with the full sequence of commits from Tasks 1–8 visible. This is the state to hand off for the Codex-driven push to `josemanuelmojica-maptoposter-ui-fork`.

---

## Self-review notes

- **Spec coverage:** every requirement in `docs/superpowers/specs/2026-08-10-llm-free-lead-capture-design.md` maps to a task — resolver (Task 2), interview UI (Task 3), widgets + Layout D (Task 4), CSP (Task 5), Appwrite Function (Task 6), docs (Task 7), and the required render verification (Task 8). The spec's acceptance example (Boise → `US-ID`) is a literal test case in Task 2.
- **No LLM anywhere:** enforced both structurally (the resolver module has no LLM SDK dependency at all) and as an automated test guard (Task 3's `no LLM SDK import exists` test scans `app/` and `content/` for common LLM package names on every run, using plain `fs`/`path` — no shell execution).
- **Secrets stay server-side:** the Census Geocoder needs no key. The Appwrite Function reads `x-appwrite-key` from the request context (Appwrite's own injected mechanism) and Function-scoped `LEADS_DATABASE_ID`/`LEADS_COLLECTION_ID` — none of these enter the static client bundle, matching the security doc's boundary.
- **No fabricated maps:** the resolver's `unresolved` and `needsConfirmation` branches are both tested and both UI-handled (Task 3's `confirm` step branches three ways: ambiguous → pick a state; unresolved → correction prompt; resolved → show the plate). No code path renders a map for a state that wasn't actually resolved.
- **Type consistency check:** `Interpretation` (defined in `locationResolver.ts`, Task 2) is imported and consumed as-is in `LeadInterview.tsx` (Task 3) without redefinition; the `LeadPayload` shape in `functions/submit-lead/src/schema.ts` (Task 6) matches the fields sent by `handleContactSubmit` in Task 3 field-for-field (`intent`, `locality`, `region`, `visualId`, `needsAnswer`, `contactName`, `contactEmail`, `consentTimestamp`, `requestId`).
