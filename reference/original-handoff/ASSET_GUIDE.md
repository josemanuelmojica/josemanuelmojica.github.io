# Asset guide

## Upload this package

Upload `japanese-ink-sites-assets.zip` with the master prompt. Its contents are intended to be copied under:

```text
public/maps/japanese-ink-scroll/
├── collection.json
├── base/
│   └── study-01.webp … study-08.webp
├── study-01.active-overlay.svg … study-08.active-overlay.svg
└── study-01.active.json … study-08.active.json
```

## Live-page contract

For each study, `collection.json` provides:

- `baseUrl` — flattened Japanese Ink map, 1200 × 1600 WebP.
- `activeOverlayUrl` — transparent SVG containing only 160 movable road wrappers.
- `activeMetadataUrl` — centroids, bounds, selectors, and six active neighbors.
- `visibleCaption` and `line` — approved copy.
- `formation` and `propagation` — art-direction hints.
- `city` and `state` — internal/accessibility data; do not burn these into the map.

## Do not upload to the live Sites project

The repository also contains archival files:

- `study-XX.motion.svg` — complete text-free vector map.
- `study-XX.overlay.svg` — all 3,000 candidate roads.
- `study-XX.pieces.json` — complete 3,000-piece metadata.

These are source/archive assets, not website delivery files. Loading them would add roughly 200 MB and hundreds of thousands of DOM nodes.

## Rendering model

The WebP is the complete static visual. The active overlay starts transparent except for the 80–160 chosen wrappers during a transition. At the home position the overlay aligns exactly with matching streets in the base.

Keep the base visible if JavaScript, overlay parsing, or metadata loading fails.

## Attribution

The artwork deliberately contains no embedded city or attribution typography. The site must include a visible `Map data © OpenStreetMap contributors` line in its footer.
