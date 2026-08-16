# Design lineage and non-negotiables

This file preserves the reasoning across iterations so a new designer can recombine the best work without mistaking a temporary implementation for the final intent.

## Brand contract

- Name: **Arχ & Teχt**. Both `χ` characters are Greek chi and hint at “architect.”
- Use the supplied wordmark artwork. Do not re-typeset it or change its kerning.
- Core line: **Be drawn to where you live.**
- Visual language: white paper, blueprint blue gradients, thin construction rules, graph paper, datum marks, editorial serif type, and restrained freehand accents.
- Tone: private, exact, observant, and plainspoken. Avoid generic luxury-real-estate copy.

## Iteration index

1. **Original Japanese Ink Scroll system** — The source package defines eight city studies, base WebPs, active SVG overlays, per-piece metadata, formation/propagation hints, deterministic gather/scatter motion, reduced-motion behavior, and the full asset-generation pipeline. See `reference/original-handoff/` and `reference/generator/`.
2. **Ant-motion experiment** — Small road groups move like streams toward a seal/datum. It established wrapper-based SVG motion, deterministic staggering, performance constraints, and the idea of a map “waking up.” See `reference/generator/core/experiments/ant-motion/`.
3. **Puzzle/explode/reorganize direction** — Roads exist as independently addressable SVG pieces. The supplied `motion.svg`, `overlay.svg`, `pieces.json`, and active subsets support maps that separate, gather, or reorganize without randomizing on every render. The live site currently uses the restrained gather/crossfade version; the full-resolution pieces remain available in the archive.
4. **Earlier site implementation** — The prior working real-estate site and its built static snapshot are preserved under `reference/previous-site/`. It contains the earlier endlessly scrolling composition and copy/layout decisions, plus now-retired Cloudflare/Vinext scaffolding. It is reference material, not the deployment source.
5. **Current portable site** — The repository root is the Next.js static-export implementation for Appwrite Sites or GitHub Pages. It contains the long-scroll eight-market story, collection/filter/dialog interactions, four navigation studies, verified-link boundary, and deployment/security tests.
6. **Four architectural navigation studies** — `/previews/datum-rail/`, `/previews/plan-legend/`, `/previews/compass/`, and `/previews/sheet-tabs/` are intentionally separate alternatives. Claude should compare and recombine them rather than treating one as preselected.
7. **Market-link experiment** — The “Explore this market” rule became a 100vw, 48px link with a far-edge arrow. A property photograph was briefly placed at the right, then centered/faded in response to clipping feedback. That idea was superseded.
8. **Current market target direction** — No property photograph appears in the long-scroll map. The right-side target names a subarea/neighborhood (Charlotte → Myers Park) and contains a CSS-only artwork placeholder. It stays dormant until pointer hover or keyboard focus; click follows the market-search link. The user will commission/create the final neighborhood art.
9. **Future lead interview** — “Tell us what you’re looking forward to” should become a conversational lead-capture map interview. See `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md`.
10. **Quiet Watersheds corpus** — A deterministic state-level visual system provides 50 SVG + 50 WebP plates at `public/maps/us-state-studies/v1/`, plus a manifest and unresolved fallback. It is generated from pinned Natural Earth sources by `scripts/state-ink/generate_state_ink_maps.py`; review the contact sheet and provenance in `reference/state-art-corpus/v1/`. The conversational interview now resolves Boise to Idaho (`US-ID`) and uses this corpus. A separate all-state atlas selector remains optional. Delaware, Hawaii, and Rhode Island intentionally show no river where the source records no state-scale centerline intersection.

## Preserved visual references

`reference/iteration-screenshots/` contains the user-provided checkpoints in order:

1. Original wordmark inspiration.
2. Approved wordmark kerning with blueprint map composition.
3. Blue-gradient/wordmark direction.
4. Minneapolis full-width market-line reference and temporary pink placement marker.
5. Evidence of the clipped property-image implementation.
6. Clarification that the right-side element is a neighborhood placeholder, not a property photo.

## Interaction ideas available to recombine

- Endless vertical market narrative with a sticky map field.
- Current/next map crossfade.
- Deterministic road-piece gathering toward a seal or datum.
- Reverse-scroll reproducibility.
- Ring, spiral, chain, streams, and wave formation/propagation hints.
- Ant-like small streams that make a map wake up.
- Full puzzle-piece explosion/reassembly using the archived 3,000-piece metadata.
- Survey datum rail, title-block legend, compass, and sheet-tab navigation.
- Stationary graph-paper map interpretation for a lead interview.
- Selective, manifest-driven use of a Quiet Watersheds state plate after a future place interpretation; do not load all 50 plates at startup.
- Neighborhood art revealed only through intentional hover/focus, with click as the navigation action.

## Do not regress

- Do not replace the approved wordmark with browser-rendered type.
- Do not reintroduce a property photograph into the market target before the user supplies neighborhood art.
- Do not auto-reveal the neighborhood art on a timer; the current direction requires hover/focus.
- Do not turn support or market destinations into iframes.
- Do not invent RealScout URLs. Render only verified public links from the manifests.
- Do not put secrets in a static export or `NEXT_PUBLIC_*` variables.
- Do not sacrifice semantic headings, reduced motion, keyboard access, or first-tap link behavior for the map animation.
- Do not fabricate missing waterways or present the editorial state plates as legal, parcel, navigation, or listing-availability maps.
- Do not describe the generated corpus as a finished atlas or lead-capture experience.
