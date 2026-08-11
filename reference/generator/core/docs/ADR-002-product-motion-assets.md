# ADR-002: Prebuild bounded motion assets from complete poster SVGs

**Status:** Accepted  
**Date:** 2026-08-10  
**Deciders:** Project owner and Codex integration owner

## Context

Authentic Matplotlib poster SVGs contain about 80,000 road paths and may exceed 13 MB. The
website must retain that visual density, animate real roads, preserve existing generation
and exports, and remain usable without React updating every element per frame.

## Decision

Generate a paired motion SVG and metadata document after poster creation. Keep the complete
road network in the SVG, remove visible poster typography and raster fade layers, spatially
select 3,000 potential pieces, wrap only those pieces, and calculate six grid-indexed
neighbors. Mount the prepared asset once and animate 100–200 wrappers by default.

## Options considered

| Option | Complexity | Runtime cost | Visual fidelity | Decision |
|---|---:|---:|---:|---|
| Process all 80k paths in-browser | Medium | Very high | Exact | Rejected |
| Replace map pieces with particles | Low | Low | Incorrect concept | Rejected |
| Raster clip fragments | Low | Low | Not real geometry | Rejected |
| Prebuilt bounded SVG candidate pool | Medium | Bounded | Exact map | Accepted |
| Canvas/WebGL renderer | High | Low after build | Requires rewrite | Deferred |

## Trade-off analysis

The prepared SVG remains large because static detail is intentionally preserved. In return,
the browser avoids parsing metadata or calculating neighbors for tens of thousands of
pieces. Candidate selection is deterministic and spatially distributed, while motion count
can be tuned independently.

## Consequences

- Existing SVG and PNG poster exports remain unchanged.
- Motion assets are text-free and reusable across the UI and export flow.
- Initial asset transfer remains approximately 13 MB and should eventually use HTTP
  compression/CDN caching.
- User-supplied SVG ingestion must add sanitization before it becomes public-facing.
- Canvas/WebGL is unnecessary until representative mobile profiling demonstrates a need.

## Action items

1. [x] Add spatial candidate preparation and grid neighbors.
2. [x] Build a real 80k-road motion asset.
3. [x] Mount it through the React integration seam.
4. [ ] Profile representative iOS and low-end Android devices.
5. [ ] Add production SVG sanitization and compressed asset delivery.
