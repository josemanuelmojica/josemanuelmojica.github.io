# Component blueprint

Keep the first Sites build intentionally small.

```text
app/page.tsx
├── InkScrollStory (client boundary)
│   ├── StickyStage
│   │   ├── MapLayer current
│   │   ├── MapLayer next
│   │   ├── Seal
│   │   └── ChapterCopy
│   └── ChapterTimeline
└── AttributionFooter
```

## Responsibilities

### `page.tsx`

- Fetch or import `collection.json`.
- Render the opening, story component, semantic chapter headings, and footer.
- Supply metadata and page description.

### `InkScrollStory`

- Own one passive scroll listener and one animation-frame renderer.
- Calculate chapter index/local progress.
- Maintain the two-layer loading window.
- Detect reduced motion.
- Pass transform progress to both layers.

### `MapLayer`

- Render the base WebP.
- Fetch and parse one trusted local active-overlay SVG.
- Fetch active metadata.
- Cache wrapper element references once after mounting.
- Update wrapper transforms in a tight loop without React state per piece.
- Remove the DOM and abort fetches on disposal.

### `ChapterTimeline`

- Provide normal-flow page height and semantic chapter content.
- Do not render controls or capture pointer/touch events.
- Use real headings even when visible copy is the poetic caption.

## State boundary

React state should contain only the active index, loaded layer records, and reduced-motion mode. Scroll progress belongs in refs and DOM style updates; putting it in React state will cause needless rendering.

## Asset types

```ts
type Study = {
  id: string
  city: string
  state: string
  visibleCaption: string
  line: string
  baseUrl: string
  activeOverlayUrl: string
  activeMetadataUrl: string
  activeCount: number
}

type ActivePiece = {
  id: string
  element: string
  centroid: [number, number]
  neighbors: string[]
}
```

## Important implementation constraint

The base image already contains every road. Hide all overlay wrappers at rest and reveal only the selected roads during gather/settle. Otherwise the active roads will appear artificially darker while idle.
