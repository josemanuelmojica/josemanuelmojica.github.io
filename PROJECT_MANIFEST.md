# Arχ & Teχt project manifest

Updated: 2026-08-10

## Purpose

This repository is the complete local handoff for Arχ & Teχt: the working static real-estate site, four architectural navigation studies, deployment/security contracts, the prior site iteration, user feedback screenshots, the original Japanese Ink Scroll handoff, the full map-generation toolchain, all available puzzle/ant-motion source assets, and the generated 50-state Quiet Watersheds corpus.

The repository is prepared for GitHub, but no remote repository, Appwrite project, domain, or production deployment has been created from this local copy.

## Current product state

- Framework: Next.js 16.2.6, React 19.2.6, TypeScript 5.9.3.
- Rendering: static export (`output: "export"`) to `out/`.
- Runtime: Node.js 22.13 or newer for install/build; no Node server is required after export.
- Hosts: Appwrite Sites at the domain root; optional GitHub Pages with `NEXT_PUBLIC_BASE_PATH`.
- Main experience: an endlessly scrolling editorial site with property filtering, favorites, property dialog, contact section, and eight sticky map chapters.
- State-art readiness: the 50-state Quiet Watersheds asset corpus is generated and public-safe; no atlas UI or conversational lead form uses it yet.
- Wordmark: the supplied artwork at `public/brand/ark-and-text-source.png`; never re-typeset.
- Main line: “Be drawn to where you live.”

## Commands

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run generate:state-art
npm run check:state-art
```

`npm test` runs source contracts, a production static export, and output contracts. Build output is intentionally ignored by Git.

State-art generation also requires `python3 -m pip install -r scripts/state-ink/requirements.txt`. Once dependencies are installed, it is deterministic and offline against the pinned local Natural Earth sources.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Working Arχ & Teχt site. |
| `/previews/` | Index of architectural navigation studies. |
| `/previews/datum-rail/` | Survey-coordinate rail navigation. |
| `/previews/plan-legend/` | Fixed plan-title/legend navigation. |
| `/previews/compass/` | Compass-based navigation. |
| `/previews/sheet-tabs/` | Drawing-sheet tab navigation. |

## Current market-story contract

The market story is a sticky, endless vertical narrative. The active chapter comes from measured DOM geometry rather than assumed heights, and the current/next map layers gather/crossfade as the reader scrolls.

| City | State | Right-side subarea target |
| --- | --- | --- |
| San Francisco | CA | Pacific Heights |
| San Diego | CA | La Jolla |
| Portland | OR | West Hills |
| New York City | NY | Tribeca |
| Austin | TX | West Lake Hills |
| Chicago | IL | Gold Coast |
| Minneapolis | MN | Lake of the Isles |
| Charlotte | NC | Myers Park |

The 100vw “Explore this market” rule is a normal link with a 48px minimum target. Until exact RealScout searches are verified, each destination filters the same-site collection with `?market=City#properties`. External URLs are accepted only when their manifest entry is verified, marked public-safe, uses HTTPS without credentials or a port, and matches an exact approved origin.

The right-side target deliberately renders **no property photograph**. It names the subarea and contains a CSS-only `.market-portal__art-slot`. The slot appears only on pointer hover or keyboard focus. Clicking navigates immediately; there is no iframe and no timer-based reveal. The user will supply final neighborhood artwork later.

## Runtime source map

| Path | Responsibility |
| --- | --- |
| `app/InkEstates.tsx` | Current home experience, market animation, property interactions, and content data. |
| `app/globals.css` | Home design system and responsive/reduced-motion behavior. |
| `app/components/RealScoutWidgetSlot.tsx` | Reviewed placeholder for the real widget snippet. No widget is installed. |
| `app/components/PreviewShared.tsx` | Shared preview wordmark/canvas/navigation. |
| `app/previews/` | Four independent navigation studies. |
| `app/lib/publicPath.ts` | GitHub Pages/Appwrite-safe public asset paths. |
| `content/market-links.json` | Deny-by-default city-search link manifest. |
| `content/market-link-origins.json` | Exact external-origin allowlist. |
| `content/resources.json` | Empty verified RealScout learning/support manifest awaiting work-account research. |
| `public/maps/japanese-ink-scroll/` | Production-safe base images plus 160-piece active overlays/metadata. |
| `public/maps/us-state-studies/v1/` | Quiet Watersheds runtime corpus: 50 SVG + 50 WebP state plates, manifest, and unresolved fallback. |
| `scripts/state-ink/` | Deterministic state-art generator, requirements, and verification instructions. |
| `reference/geodata/natural-earth/` | Pinned public-domain Natural Earth source GeoJSON and provenance notes. |
| `reference/state-art-corpus/v1/` | Contact sheet, provenance, corpus notes, and algorithmic-art review record. |
| `tests/` | Source and exported-output security/portability contracts. |
| `.github/workflows/pages.yml` | GitHub Pages validation/deployment workflow. |
| `appwrite.config.example.json` | Empty-ID Appwrite static-site configuration example. |
| `docs/security/` | Appwrite access audit, security boundary, and operational verification gate. |

## Quiet Watersheds state-art corpus

`public/maps/us-state-studies/v1/manifest.json` is the runtime index for corpus version `2026-08-10.1`. The corresponding plates are `states/US-XX.svg` and `states/US-XX.webp`; `fallback/unresolved.svg` is the non-state fallback. The set is complete for all 50 states: 50 SVG + 50 WebP files. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB), and the full runtime directory is ~3.3 MB.

The generator is `scripts/state-ink/generate_state_ink_maps.py`. Run `npm run generate:state-art`, then `npm run check:state-art`. It uses the locally pinned Natural Earth 1:10m admin-1 and river/lake-centerline GeoJSON at commit `ca96624a56bd078437bca8184e78163e5039ad19`; source checksums are recorded in `reference/geodata/natural-earth/README.md` and `reference/state-art-corpus/v1/PROVENANCE.json`.

Idaho (`US-ID`) is ready for the future Boise → state-level response. Delaware (`US-DE`), Hawaii (`US-HI`), and Rhode Island (`US-RI`) contain no blue river line because the pinned Natural Earth data has no state-scale centerline intersections there; the generator does not fabricate waterways. This corpus does not implement an atlas route, selector/gallery, place interpreter, conversational lead form, geocoding, or lead submission.

## Complete reference archive

Nothing under `reference/` is imported by the production app.

- `reference/original-handoff/` — exact uploaded prompt/spec/copy/token/QA package and zip.
- `reference/generator/full-map-assets/` — all eight full motion SVGs, overlays, 3,000-piece metadata, active subsets, base images, previews, and manifests.
- `reference/generator/posters/` — all available Japanese-ink poster iterations, including earlier New York and Tokyo work.
- `reference/generator/core/` — Python map-poster generator, font/theme/design inputs, JS `map-pieces` library, tests, build/package scripts, storyboard, source web UI, samples, and ant-motion experiment.
- `reference/previous-site/` — source and static build snapshot of the earlier endlessly scrolling site; caches, dependencies, and nested Git metadata were intentionally excluded.
- `reference/iteration-screenshots/` — ordered user feedback/inspiration checkpoints.
- `reference/geodata/natural-earth/` — pinned source data for deterministic Quiet Watersheds regeneration.
- `reference/state-art-corpus/v1/` — state-art contact sheet, provenance, and review documentation.

See `reference/README.md`, `docs/DESIGN_LINEAGE.md`, and `docs/DECISION_LOG.md` before changing the design.

## Animation library and future options

The current live animation uses only the 160-piece active subset. The archive preserves the higher-resolution system needed to explore:

- deterministic puzzle-piece explosion and reassembly;
- road groups gathering around a seal/datum;
- ant-like stream motion;
- ring, spiral, wave, chain, and streams behavior;
- reversible scroll motion with stable hashed delays; and
- reduced-motion crossfade alternatives.

Do not load the archival 3,000-piece files in the public page without a new performance design. The original master prompt and performance notes explain the existing active-subset contract.

## Future lead-capture concept

`docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` specifies the requested replacement for “Tell us what you’re looking forward to”: a conversational lead interview that interprets a place or ZIP, renders a rough stationary graph-paper map, confirms the interpretation, and only then asks for consented contact information. The required acceptance example maps “looking/selling in Boise” to an Idaho-level visual rather than a Boise/Ada County boundary. The `US-ID` Quiet Watersheds plate now supplies that future visual asset.

This concept requires a server-side geocoding/NLP/lead endpoint, such as an Appwrite Function. Neither the conversational lead form nor an atlas interface is implemented in the current static site.

## Security and deployment boundary

- The repository contains no Appwrite project/site IDs, API keys, live variables, or authenticated connector state.
- Static `NEXT_PUBLIC_*` values are public at build time. Secrets belong in a server-side function.
- Source/output tests reject iframes and validate the exact market-link boundary.
- The meta CSP blocks framed content and objects, but production clickjacking protection still requires response headers (`frame-ancestors 'none'` or `X-Frame-Options: DENY`) from Appwrite or an approved edge layer.
- Appwrite should run `npm test`, publish `out/`, and leave `NEXT_PUBLIC_BASE_PATH` empty.
- GitHub Pages builds derive the repository base path in the workflow.
- The workflow validates pull requests and grants deployment/OIDC permissions only to the deploy job.

Read `docs/security/APPWRITE_SITES_SECURITY_HANDOFF.md` and `docs/security/VERIFICATION_CHECKLIST.md` before activation.

## Known open work

1. Replace the CSS neighborhood art slot with user-approved artwork while keeping the hover/focus/click contract.
2. Obtain and validate exact public RealScout market, support, Learn, and Academy URLs from the work account.
3. Add the real RealScout widget snippet and verify that it does not create an iframe.
4. Design and implement the lead-capture map interview plus its server-side geocoding/lead boundary.
5. Decide which elements from the four navigation previews should become production navigation.
6. Consider extracting the 1,000+ line client component into focused client islands and establishing one typed market manifest.
7. Optimize the wordmark crop and below-fold image variants without altering approved kerning or artwork.
8. Profile the SVG scroll loop under CPU throttling before increasing the animated piece count.
9. Create/authorize the actual GitHub remote and Appwrite Site; no external mutation has occurred.

## Claude starting sequence

1. Start with `CLAUDE.md`, then read this file and `handoff_checkpoint.md`.
2. Read `docs/DESIGN_LINEAGE.md` and inspect the six iteration screenshots.
3. Run `npm ci && npm test`.
4. Open `/`, then compare all four `/previews/` routes.
5. Read the original master prompt/interaction spec and the ant-motion experiment before proposing new map motion.
6. Keep new proposals source-compatible with static export, base paths, reduced motion, keyboard/touch use, and the verified-link boundary.
