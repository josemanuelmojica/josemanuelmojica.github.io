# Arχ & Teχt — Claude collaboration entry point

This repository is a complete local design/engineering handoff. Do not push, deploy, configure Appwrite, install a widget, or invent RealScout URLs unless the owner explicitly authorizes that external action.

For the current review/add/polish assignment, follow `CLAUDE_REVIEW_PROMPT.md` after reading this file. The source checkpoint is commit `45e9abf`; immutable Cloudflare preview version 19 is `https://64137e6e-ark-and-text.j-m-mojica-g.workers.dev`. It is not production traffic.

## Read first

1. `PROJECT_MANIFEST.md`
2. `handoff_checkpoint.md`
3. `docs/DESIGN_LINEAGE.md`
4. `docs/DECISION_LOG.md`
5. `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md`
6. `reference/README.md` and the six images in `reference/iteration-screenshots/`

The exact archive inventory and SHA-256 digests are in `reference/FILE_INDEX.json`. The earlier working site, original handoff, generated posters, complete map-piece corpus, generator/library code, storyboard, puzzle/explode assets, and ant-motion experiment are under `reference/`. The pinned Natural Earth sources and Quiet Watersheds review artifacts also live there; only the generated state assets under `public/` ship in the production export.

## Current non-negotiables

- Brand spelling is **Arχ & Teχt**; both `χ` characters are Greek chi.
- Use `public/brand/ark-and-text-source.png`. Never recreate or re-kern the wordmark in browser text.
- Preserve the line **“Be drawn to where you live.”**
- Preserve the endless vertical market narrative and white/blueprint visual field.
- The right-side market target represents a neighborhood/subarea (Charlotte → Myers Park), not a property photo.
- Its CSS art placeholder is dormant until pointer hover or keyboard focus. Click navigates immediately; no timer and no iframe.
- The user will supply final neighborhood art. Do not generate or substitute a property image.
- Keep static export, base-path portability, keyboard/touch access, reduced motion, and the deny-by-default external-link boundary.
- Do not load the archived 3,000-piece maps into production without a performance redesign.

## Design task

Compare the working homepage and all four `/previews/` routes, then propose how to recombine their strongest ideas. Study the earlier site and the original interaction spec before changing the long-scroll choreography. The archive deliberately preserves ring, spiral, wave, chain, streams, puzzle reassembly, and ant-like motion directions; none is automatically preferred.

Treat `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` as the product contract for the implemented conversational lead form. Its required behavior includes interpreting “looking/selling in Boise” as buy + sell intent and drawing an Idaho-level graph-paper response before requesting contact details.

## Quiet Watersheds readiness

- `public/maps/us-state-studies/v1/` contains the complete versioned corpus: 50 SVG + 50 WebP state plates, `manifest.json`, and `fallback/unresolved.svg`. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB); the directory is ~3.3 MB.
- Generate and verify it with `npm run generate:state-art` and `npm run check:state-art`. The generator uses the pinned Natural Earth files in `reference/geodata/natural-earth/` and requires no network once its Python dependencies are installed.
- The lead interview resolves Boise to `US-ID`. Delaware (`US-DE`), Hawaii (`US-HI`), and Rhode Island (`US-RI`) intentionally have no blue river line because the pinned Natural Earth centerlines have no state-scale intersections there.
- Treat `worker/lead.ts`, `migrations/0001_lead_capture.sql`, and `docs/security/CLOUDFLARE_LEAD_CAPTURE.md` as one security boundary. Never move D1 or Turnstile secrets into the static client.
- The conversational place interpreter, state-plate confirmation, and protected lead-submission flow are implemented. A separate all-state selector/gallery, complete metro-art corpus, optional network geocoder, staff dashboard, CRM notification, and production promotion are not implemented.

## Verification

Use Node.js 22.13 or newer:

```bash
npm ci
npm run typecheck
npm test
```

The working build is the repository root. `reference/previous-site/` is historical evidence, not a deployment target.
