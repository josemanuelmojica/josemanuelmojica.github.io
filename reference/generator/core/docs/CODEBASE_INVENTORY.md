# Codebase inventory and preservation contract

## Existing generator

`create_map_poster.py` remains the source of truth for geographic acquisition and poster
rendering. It provides:

- `get_coordinates()` — Nominatim lookup with a pickle cache.
- `fetch_graph()` — OSMnx street-network retrieval cached by center and distance.
- `fetch_features()` — cached water and park feature retrieval.
- `get_crop_limits()` — aspect-aware projected bounds.
- `load_theme()` / `get_available_themes()` — JSON theme discovery and loading.
- `create_poster()` — projected roads, water, parks, fades, typography, and output.
- `generate_output_filename()` — timestamped files under `posters/`.

The CLI already exports PNG, SVG, and PDF. Product integration invokes this CLI rather than
copying its logic, preserving the existing cache, geographic calculations, themes, fonts,
and export behavior.

## Themes and fonts

Theme JSON lives in `themes/` and supplies background, text, water, park, gradient, and road
hierarchy colors. `font_management.py` loads bundled Roboto faces and optionally downloads
Google Fonts. The web application reads the same theme catalog through `/api/themes`; it
does not create a second theme registry.

## Cache and generated assets

OSM data is cached under `cache/`. Original poster exports remain under `posters/`.
Web-ready, text-free animation assets are generated under `public/maps/` as:

- `*.motion.svg` — complete static vector map with only a bounded candidate pool wrapped.
- `*.pieces.json` — descriptors and spatial neighbors for the candidate pool.
- `*.manifest.json` — stable URLs and counts consumed by the app.

Root-level `processed.svg` and `pieces.json` are legacy prototype output, not product assets.

## Product boundaries

- `packages/map-pieces` owns SVG preparation, candidate selection, wrappers, geometry
  metadata, and spatial-grid neighbors.
- `packages/map-motion` owns propagation, formations, frame scheduling, and exact return.
- `server/index.js` owns generator orchestration, catalog endpoints, asset storage, and
  static serving. It uses only Node built-ins and invokes the Python CLI through `uv`.
- `web/` owns React controls, trusted SVG mounting, direct animation initialization, and
  browser SVG/PNG downloads.
- React never owns per-frame transforms.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| 80k-path SVG overwhelms processing | Keep all roads static; spatially select 3,000 candidates. |
| All-pairs neighbor cost | Spatial-grid neighbor lookup on candidates only. |
| Poster labels appear in animation assets | Remove Matplotlib text and divider groups during preparation. |
| Raster gradient bloats or fragments incorrectly | Remove embedded raster images from motion assets. |
| Animation accumulates transform drift | Animate wrapper groups and return each wrapper to empty transform. |
| React frame churn | `MotionEngine` directly updates SVG attributes in one RAF scheduler. |
| Generator regression | Server invokes the existing CLI and does not change its rendering internals. |
| Untrusted SVG execution | V1 mounts only locally generated/trusted assets; public upload requires a sanitizer before release. |

## Test strategy

Package tests cover stable IDs, selective splitting, candidate preparation, grid neighbors,
formations, propagation, one-loop scheduling, and reset. Server tests cover catalogs and
the default asset contract. The browser integration test loads the authentic map, starts
`AntSequence`, returns home, and verifies no residual transforms. Existing Python syntax
and CLI behavior are checked separately so the product seam cannot silently break them.
