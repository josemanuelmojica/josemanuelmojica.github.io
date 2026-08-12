# Handoff — seamless atlas tile for InfiniteAtlasCanvas

Status: the **runtime is built, wired, tested, and deployed to a Cloudflare
branch preview**. The one outstanding item is the **art asset**: a truly
seamless, non-symmetric atlas tile. This document specifies exactly what that
asset must be so Claude Design (or a generative-fill tool) can produce it and
drop it in with no code change.

## What already works (do not rebuild)

- `app/components/InfiniteAtlasCanvas.tsx` — fixed, site-wide decorative map
  plane behind all content. One tile, `background-repeat`, scroll-coupled slow
  diagonal drift via rAF + modulo wrapping, deferred load, reduced-motion
  static, `pointer-events:none`, `aria-hidden`.
- `scripts/media/generate-atlas-tile.mjs` — build-time tile generator that
  currently produces a **functional placeholder** tile from the existing city
  studies.
- Responsive delivery, hashed filenames, budgets, tests — all in place.
- The runtime is **tile-agnostic**: it reads whatever tile the manifest points
  to. Replacing the placeholder is a pure asset swap.

## The problem the placeholder has

A tile that repeats infinitely in both X and Y must be **4-edge toroidal**:
its left edge must match its right edge exactly, and its top must match its
bottom. Two build-time techniques were tried:

1. **Offset-and-heal** (current placeholder): reduces the seam to a mean
   edge-difference of ~16/255 — faint but a sharp eye can catch it under the
   drift. Non-symmetric (good), not perfectly seamless (the compromise).
2. **Mirror/reflect tiling**: perfectly seamless by construction, but produces
   visible kaleidoscope symmetry — reads as "pattern", not "continuous city".
   Rejected for that reason.

A truly seamless **and** non-symmetric tile needs content-aware seam synthesis
(generative fill / inpainting), which this build environment does not have.

## What to produce

A single square tile, delivered at three sizes, that:

1. **Is 4-edge seamless (toroidal).** Left edge matches right, top matches
   bottom, pixel-for-pixel, so `background-repeat` shows no seam in any
   direction. Verify by tiling 3×3 and inspecting all internal boundaries.
2. **Is non-symmetric.** No mirror/kaleidoscope axes. City boundaries dissolve
   into one impossible continuous metropolitan fabric.
3. **Matches the mockup visual language:**
   - warm ivory drafting paper ground (`#F2EEE7` / palette `--paper`)
   - extremely fine graphite-gray streets and topography
   - pale water and geographic voids
   - selective, stronger rust/sienna arterial roads and interchanges
     (palette `--vermilion` family, e.g. `#8B2500`)
   - extensive quiet negative space — the tile should read mostly calm
4. **Reads well at low opacity behind text** (the runtime paints it at
   `opacity: 0.42` under ivory `.paper-mask` overlays). Avoid high-contrast
   busyness; the arterials are the only strong accents.

### Sizes and formats

Match the current manifest shape so no code changes:

- Square tiles at **512, 768, 1024 px**.
- Each size as **AVIF and WebP**.
- Budget (decorative, off critical path): AVIF **≤ 200/300/400 KB** for
  512/768/1024 respectively (`scripts/media/check-derivatives.mjs` enforces).
- Filenames are content-hashed: `tile-<size>-<sha8>.{avif,webp}`.

### How to drop it in

Two options:

- **Regenerate via the script:** replace the compose/heal logic in
  `scripts/media/generate-atlas-tile.mjs` with the new seamless source (or have
  it read a supplied seamless master), then run `npm run generate:media`. The
  script rewrites `public/derived/atlas-tile/tile-manifest.json` and the hashed
  files; nothing else changes.
- **Supply finished tiles directly:** drop the six files into
  `public/derived/atlas-tile/` and update `tile-manifest.json` to list their
  exact paths and byte sizes. Run `npm run check:media` to validate.

Then `npm test` and `npx wrangler deploy --dry-run` should stay green, and the
Cloudflare branch preview will show the final fabric.

## Tuning left for design (no code required beyond values)

- **Reveal strength per section:** foreground sections can add `.paper-mask`
  (78% ivory) or `.paper-mask--solid` (90% ivory) to control how strongly the
  atlas shows through. None are applied yet — the atlas currently reads only in
  the gaps between styled sections. Decide where it should surface.
- **Drift rates:** `DRIFT_X` / `DRIFT_Y` and the base `opacity: 0.42` in
  `InfiniteAtlasCanvas.tsx` / `globals.css` set the pace and presence.

## Constraints that must hold

No GSAP/Pixi/new animation framework. No master deletion. Reduced-motion static
presentation. `pointer-events:none` + `aria-hidden`. Responsive AVIF/WebP.
Deferred load. MarketStory behavior unchanged. Do not production-deploy — the
Cloudflare branch preview is the review surface.
