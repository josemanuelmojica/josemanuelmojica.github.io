# Interaction specification

## Architecture

Use one page-height story container, one sticky visual stage, and eight flow-positioned chapter sentinels.

```text
story container
├── sticky stage (100dvh)
│   ├── outgoing base WebP
│   ├── incoming base WebP
│   ├── outgoing active SVG overlay
│   ├── incoming active SVG overlay
│   ├── vermilion seal
│   └── current chapter copy
└── chapter timeline
    ├── sentinel 01 (150vh)
    ├── sentinel 02 (150vh)
    └── … sentinel 08
```

The timeline provides native document height. It should not capture pointer events or force the scroll position.

## Progress model

Calculate one normalized position using the story container rather than reading every sentinel on every frame.

```ts
raw = clamp((scrollY - storyTop) / chapterSpan, 0, chapterCount - 1)
index = min(floor(raw), chapterCount - 1)
local = raw - index
nextIndex = min(index + 1, chapterCount - 1)
```

Use a single passive scroll listener that only schedules one `requestAnimationFrame`. Recalculate `storyTop`, viewport height, and chapter span on resize.

Suggested helpers:

```ts
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
```

## Blend phases

For local chapter progress `p`:

```ts
const gather = smooth(0.62, 0.88, p)
const incomingSettle = 1 - smooth(0.60, 0.90, p)
const outgoingOpacity = 1 - smooth(0.76, 0.96, p)
const incomingOpacity = smooth(0.64, 0.94, p)
```

The current base uses `outgoingOpacity`. The next base uses `incomingOpacity`. On the last chapter, keep the final base at opacity 1 and replace the transition with a subtle hold.

## Road movement

Read each active piece centroid from `study-XX.active.json`. Convert the seal position from a normalized viewport point into the overlay SVG viewBox.

For an outgoing road:

```ts
dx = sealX - centerX
dy = sealY - centerY
t = smooth(pieceStart, pieceEnd, gather)
transform = translate(dx * t, dy * t) scale(1 - 0.18 * t)
opacity = 1 - 0.75 * t
```

For an incoming road, reverse the same transform:

```ts
t = smooth(pieceStart, pieceEnd, incomingSettle)
transform = translate(dx * t, dy * t) scale(1 - 0.18 * t)
opacity = 1 - 0.75 * t
```

Derive `pieceStart` from a stable string hash of the piece ID. Keep stagger within `0.00–0.22` of the gather phase. Reverse scrolling must reproduce the exact previous state.

Do not animate the 3,000-piece archival overlay. The active overlay already contains a spatially balanced set of 160 wrappers.

## Layer loading

1. Fetch `collection.json`.
2. Immediately load Study 01 base, active overlay, and active metadata.
3. After first paint, prefetch Study 02.
4. On chapter change, retain only `index` and `index + 1`; release earlier object URLs and DOM references.
5. Use the base image as a permanent fallback if overlay parsing fails.

Use `DOMParser` for the trusted local overlay SVG, adopt its root node, and append it through `replaceChildren`. Do not use a network URL with `dangerouslySetInnerHTML`.

## Copy behavior

- Copy fades in from `p 0.08–0.18`, remains, then fades from `p 0.55–0.70`.
- Maximum width: 26 characters desktop, 34 characters mobile.
- Do not animate individual letters.
- The small study caption may remain visible slightly longer than the poetic line.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Do not mount active overlays.
- Crossfade bases over a maximum of 180 ms.
- Keep all chapter copy visible in normal document flow.
- Do not pin for more than one viewport; avoid creating a long blank scroll experience.

## Failure states

- Base failure: paper background plus chapter copy and a small `Map drawing unavailable` status.
- Overlay failure: continue with base-only crossfade.
- Metadata failure: keep overlay at home and crossfade bases.
- Never retry continuously while the visitor scrolls.
