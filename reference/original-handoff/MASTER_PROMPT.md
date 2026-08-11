# Master prompt for ChatGPT Sites

Build a complete one-route editorial website titled **Eight Impressions** using the uploaded `japanese-ink-sites-assets` folder. This is a single continuous vertical scroll experience, not a conventional portfolio, slideshow, tab interface, carousel, card grid, or multi-page site.

## Core experience

The site presents eight real street networks in sequence. Each chapter should feel like the same sheet of Japanese paper receiving a new ink impression. A map holds almost still while the visitor reads it. Near the end of the chapter, selected streets gather toward one fixed vermilion seal point. The outgoing map washes away while the next map develops outward from that same point and settles precisely home.

Do not attempt literal path-to-path morphing between cities. Use the supplied base WebP images, active overlay SVGs, and active metadata JSON. Blend outgoing and incoming layers during one continuous scroll interval.

## Required structure

- One URL and one page component.
- An opening chapter followed immediately by eight location chapters and a quiet attribution footer.
- No tabs, pagination, horizontal carousel, card UI, header navigation, progress dots, “next” buttons, or scroll-jacking.
- Do not add large city names inside the maps. Use the supplied poetic captions visibly; keep the real city names in accessible labels, metadata, and optional small editorial captions only.
- Use the copy exactly as supplied in `COPY_DECK.md` for the first build.
- Use `collection.json` as the source of truth for order, copy, URLs, formations, and propagation behavior.

## Visual direction

- Palette: paper `#FAF8F5`, wash `#E8E4E0`, ash `#B8B8B8`, graphite `#4A4A4A`, ink `#2C2C2C`, vermilion `#8B2500`.
- Use a Japanese editorial type stack without requiring external font downloads: `"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", Georgia, serif` for display copy; `Inter, "Hiragino Kaku Gothic ProN", system-ui, sans-serif` for body; `ui-monospace, "SFMono-Regular", monospace` for utility captions.
- Maps occupy the viewport and are the dominant content. Typography should be sparse, offset, and small enough that it never competes with the network.
- The fixed vermilion seal point sits around 82% x / 72% y on desktop and 78% x / 68% y on mobile. It is an 8–12 px imperfect circle with a subtle stamped halo, not a glowing gradient orb.
- Add only a nearly invisible paper-fiber texture using CSS. Do not generate or fetch replacement map imagery.
- Avoid rounded cards, generic gradient backgrounds, glass effects, dashboard chrome, oversized marketing copy, and decorative icons.

## Scroll behavior

- Use a single sticky visual stage with eight normal-flow chapter sentinels, approximately `150vh` per desktop chapter and `135vh` on mobile.
- Do not use mandatory scroll snapping. Native wheel, trackpad, touch, keyboard, and scrollbar behavior must remain intact.
- During each transition, keep at most the current and next map layers mounted.
- Use scroll progress rather than time-based autoplay. Scrolling backward must reverse the animation deterministically.
- Chapter local progress:
  - `0.00–0.12`: incoming map finishes settling.
  - `0.12–0.62`: map rests; copy becomes readable.
  - `0.62–0.88`: selected outgoing roads gather toward the seal while the next network begins developing outward.
  - `0.88–1.00`: outgoing base dissolves; next base reaches full opacity.
- Stagger the 160 active pieces deterministically from their IDs. Do not randomize on every render.
- Apply translation transforms to wrapper groups only. Never rewrite SVG path geometry.
- See `INTERACTION_SPEC.md` for formulas and lifecycle requirements.

## Asset and performance rules

- Copy the uploaded assets under `public/maps/japanese-ink-scroll/` without renaming them.
- Live page assets per study:
  - `base/study-XX.webp`
  - `study-XX.active-overlay.svg`
  - `study-XX.active.json`
- Load `collection.json` once.
- Do not load `.motion.svg`, `.overlay.svg`, or `.pieces.json` in the live page. They are archival/high-resolution assets.
- Preload only Study 01. Prefetch Study 02 after the first paint. Thereafter prefetch only the next chapter.
- Keep no more than two base images, two active overlays, and two active metadata documents mounted.
- Parse only trusted local SVG assets. Remove layer DOM and observers when it leaves the two-chapter window.
- Use one `requestAnimationFrame` scroll renderer. Do not attach one scroll listener per piece.
- Desktop target: 160 active pieces. Mobile target: 80–100 visible pieces selected from the same active set.

## Accessibility and resilience

- Semantic `main`, chapter `section` elements, one `h1`, logical `h2` headings, and a visible OpenStreetMap attribution footer.
- Each visual layer must have an accessible location description; decorative overlay SVGs use `aria-hidden="true"`.
- Keyboard and assistive-technology users receive the same chapter order and copy without depending on animation.
- Respect `prefers-reduced-motion`: disable all road translation and use a short reversible crossfade between bases.
- If an overlay or metadata file fails, show its base WebP and continue the story. Never show an empty viewport.
- Maintain readable contrast and visible keyboard focus.

## Responsive behavior

- Desktop: map crop fills the viewport; chapter copy occupies a narrow 24–30 character column in an open area of the map.
- Mobile: use `100dvh`; place copy in a paper-colored translucent strip near the bottom; reduce active pieces; preserve portrait crops.
- No horizontal scrolling at any breakpoint.

## Sites implementation

- Use the existing Sites starter and keep its supported single-route structure.
- Replace the starter skeleton and starter metadata completely.
- Use a small client component only for scroll measurement, active-layer loading, and SVG wrapper transforms. Keep the rest server-rendered/static.
- Do not add authentication, persistence, databases, uploads, analytics, or external APIs.
- Set the page title to `Eight Impressions — Street Networks in Japanese Ink` and the description to `Eight American street networks gathered into one continuous ink scroll.`
- Build successfully before publishing. Preserve the supplied assets exactly.

The first build is accepted only when it satisfies every item in `QA_CHECKLIST.md`.
