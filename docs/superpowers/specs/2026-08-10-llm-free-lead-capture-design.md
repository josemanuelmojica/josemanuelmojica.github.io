# LLM-free lead-capture map interview — design

Status: approved design, not yet implemented.

## Goal

Implement the conversational lead-capture interview described in
`docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` with a **standing constraint**:
no feature on this site — now or in the future — may call an LLM API. All
location interpretation is deterministic. The site must stay a fast static
export, and lead storage must go through a secured Appwrite Function rather
than a third-party form service.

This design supersedes the LLM-fallback step in the original concept doc's
"Interpretation pipeline" section 7 ("Optionally use an LLM..."). That step is
dropped entirely.

## Non-negotiables carried forward

- No LLM API call anywhere on this site, ever (new standing rule).
- Static export (`output: "export"`) stays the deployment model.
- No secrets in `NEXT_PUBLIC_*` or client bundles.
- Keyboard/touch access, reduced motion, 44px targets, plain-text status
  alongside visuals (from the concept doc).
- Never fabricate a map/state if location can't be resolved — show graph
  paper plus a correction prompt instead.
- Preserve wordmark artwork and "Be drawn to where you live."

## Architecture

### 1. Location resolution (100% client-side, runs in the static bundle)

Order of operations for a raw utterance (e.g. "looking/selling in Boise"):

1. **Normalize** whitespace, punctuation, casing.
2. **Detect intent** via plain keyword/string matching against a small fixed
   word list (`buy`, `sell`, `selling`, `looking`, `relocate`, and close
   variants). No NLP library, no LLM — literal matching is sufficient per the
   concept doc's own pipeline design.
3. **Extract a US ZIP code** if the utterance contains a 5-digit (or ZIP+4)
   pattern.
4. **Primary resolver — US Census Geocoder**: call
   `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress`
   (free, no API key, no published rate limit, US Census Bureau service)
   with a short client-side timeout (2–3s). Use the returned state for
   ZIP or place-text queries.
5. **Fallback resolver — bundled static table**: if the Census call fails,
   times out, or returns no usable match, fall back to a JSON table shipped
   in the bundle:
   - ZIP-prefix → state ranges (covers the whole US at low cost/size).
   - Curated city/region → state entries, seeded with the 8 existing markets
     (SF, San Diego, Portland OR, NYC, Austin, Chicago, Minneapolis,
     Charlotte) plus their listed subareas.
   - A curated **ambiguous-name list** (e.g. "Portland", "Springfield",
     "Columbus") that always forces a clarification instead of guessing,
     satisfying the concept doc's acceptance check.
6. **Confidence and clarification**: an exact ZIP match or a single
   unambiguous place match is high-confidence and proceeds automatically. A
   match against the ambiguous-name list, or no match at all, produces one
   short clarification question ("Which state?") rather than a silent guess
   or a fabricated result.
7. **Map to visual**: resolved US state → existing `US-XX` plate in
   `public/maps/us-state-studies/v1/`. Boise → `US-ID`, matching the concept
   doc's required example exactly.

This entire step requires no server call beyond the free, keyless Census
API, and degrades gracefully to fully offline behavior if that call is
unavailable.

### 2. Interview UI flow

Follows the 7-step flow already specified in
`docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` (Intent → First search →
Interpretation → Map response → Confirmation → Needs → Consent and contact),
unchanged except that step 3 (Interpretation) now always resolves via the
pipeline above — never an LLM.

Visual treatment continues to use the site's existing paper/blueprint/datum
language, stationary or short-reversible reveal, reduced-motion-safe.

### 3. Lead submission — Appwrite Function

One function, `submit-lead`:

- **Input**: the confirmed interpretation (intent, resolved place/state,
  visual_id), interview answers, contact fields, consent timestamp/version,
  and a server-generated request ID. No raw freeform utterance parsing
  happens here — that already happened client-side.
- **Behavior**: validates every field, rate-limits by request origin,
  writes to an Appwrite database collection. Does not log raw contact
  details in normal diagnostic logs.
- **Secrets**: none required for geocoding (Census API needs no key). Only
  standard Appwrite project/database configuration.
- Client calls this function only on the explicit final "Submit" action —
  never on hover, map interaction, or focus.

### 4. Appwrite Sites hosting

- Deploy `out/` to Appwrite Sites (already the documented target).
- Add the still-open security item from `docs/security/`: a
  `frame-ancestors 'none'` (or `X-Frame-Options: DENY`) response header via
  Appwrite's site configuration or an edge layer, closing the gap the meta
  CSP alone can't cover.

## Data flow summary

```
utterance ──▶ normalize + intent keywords
                     │
                     ▼
              extract ZIP? ──yes──▶ Census Geocoder ──ok──▶ state ─┐
                     │no                  │timeout/fail            │
                     ▼                    ▼                        │
              place text ──▶ Census Geocoder ──ok──▶ state ────────┤
                                    │timeout/fail/no-match          │
                                    ▼                               │
                          bundled ZIP/city table ──match──▶ state ──┤
                                    │no match / ambiguous-list hit  │
                                    ▼                               │
                          clarification prompt                     │
                                                                     ▼
                                                       US-XX plate + confirmation copy
                                                                     │
                                                    (needs Qs, consent, contact)
                                                                     │
                                                                     ▼
                                                    Appwrite Function: submit-lead
```

## What's already done vs. net-new

**Already done** (per current repo state): static site, 50-state Quiet
Watersheds corpus including `US-ID`, security/link boundary tests, four nav
previews.

**Net-new for this feature:**
- Bundled ZIP-prefix and city/region lookup table + ambiguous-name list.
- Client-side location resolver module (Census call + fallback + confidence
  logic).
- Interview UI (7-step flow) as a new client component/route.
- `submit-lead` Appwrite Function + database collection schema.
- `frame-ancestors` response header configuration on Appwrite Sites.

## Testing

- Unit tests for the resolver: ZIP match, unambiguous city match, ambiguous
  city triggers clarification, Census timeout falls back to bundled table,
  no match at all shows correction prompt (never fabricates a map).
- The required acceptance example from the concept doc must pass as a test:
  "looking/selling in Boise" → `intent: [buy, sell]`, `visual_id: US-ID`,
  `needs_confirmation: false`.
- Existing static-export/security/portability test suite (`tests/`) must
  keep passing unchanged — no LLM SDK, no new external secrets, no iframe.
- Manual keyboard/touch/reduced-motion/200%-zoom pass on the interview flow.

## Addendum: RealScout widget integration (approved)

The owner supplied three verified RealScout web-component snippets (not
placeholders — real, agent-scoped markup):

- `realscout-simple-search` (agent-encoded-id `QWdlbnQtMTM3NjM5`)
- `realscout-home-value` (same agent id)
- `realscout-office-listings` (same agent id)

All three load from one shared script:
`https://em.realscout.com/widgets/realscout-web-components.umd.js`
(`type="module"`). This is a real custom-element script tag, not an iframe,
so it satisfies the site's "no iframe" non-negotiable. The `agent-encoded-id`
is a public site identifier embedded directly in the vendor's own published
markup (matching `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md` §4's
guidance that public widget identifiers do not need a Function proxy).

**Layout decision — Option D ("search/listings lead, interview follows"):**
mocked up and approved by the owner. Order on the homepage:

1. `realscout-simple-search` near the top of the existing `#properties`
   section (`app/InkEstates.tsx:883-967`), replacing/augmenting the concept
   filter line as the primary entry point.
2. `realscout-office-listings` as the live listings source in the same
   section.
3. The new lead-capture interview (this spec's core feature) appears further
   down as a contextual, non-blocking offer — it replaces the existing
   "Tell us what you're looking forward to" concept form at
   `app/InkEstates.tsx:1007-1050` (`#contact` section), keeping that
   section's id, heading language, and paper-stage visual treatment.
4. `realscout-home-value` closes the page as a secondary CTA near/inside the
   `#contact` section, after the interview.

**CSP impact:** `app/layout.tsx`'s `contentSecurityPolicy` array must allow
loading and executing the vendor script. Minimum required directive change:
add `https://em.realscout.com` to `script-src`. `connect-src` may also need
`https://em.realscout.com` (and possibly other RealScout API origins) once
the widgets' live network calls are inspected in the browser — this must be
verified by loading the built site and inspecting the Network tab, not
guessed. Per the security doc, do **not** use a wildcard
(`*.realscout.com` or `script-src https:`); allow-list only the exact
origins observed. If the widgets call additional RealScout origins beyond
`em.realscout.com`, add each exact origin only after confirming it in a
live network trace.

**Existing origin allowlist** (`content/market-link-origins.json`) already
contains `https://www.realscout.com` for outbound links — that is a
separate, narrower allowlist (used for `<a href>` validation, not script
execution) and needs no change for the widget script itself.

**No Appwrite Function proxy needed for the widgets** — the agent id is
public, matching the security doc's explicit guidance to avoid adding proxy
complexity without a private credential to protect.

## Out of scope for this pass

- Which of the four `/previews/` nav studies becomes production navigation
  (separate decision, not addressed here).
- Non-US locations (Census Geocoder and the bundled table are US-only,
  matching the current 8 US markets).
- Verifying every RealScout network origin beyond `em.realscout.com` before
  first live browser render — the plan allow-lists the known script origin
  now and requires a live network check before widening `connect-src`
  further.
