# @maptoposter/map-pieces

`processMap(svgString, options)` discovers SVG `path`, `polygon`, `polyline`, `line`,
and useful `rect` geometry, wraps every piece in an independently transformable `g`,
and returns `{ processedSvg, pieces, metadata }`.

The wrapper owns motion transforms; the original geometry and its transform remain on a
child. This makes `transform=""` on the wrapper an exact visual home state and avoids
matrix accumulation. Existing safe unique IDs are retained. Missing, unsafe, or duplicate
IDs receive deterministic `piece-00001` style IDs.

Each descriptor contains `id`, CSS element references, detected type, centroid, bounding
box, approximate length, original transform/position, source ID, and nearest neighbors.
Centroids and bounds are V1 coordinate approximations from geometry points. They are for
propagation and formations, not cartographic measurement.

Long-path splitting is intentionally conservative: only paths made of `M`/`L` commands,
over the configured length and segment count, are divided. Curves/arcs are retained to
avoid changing geometry. Set `splitLongPaths: false` to compare the visual result.

Run `npm test` and `npm run build:sample` from this directory. Generated sample artifacts
are committed so integration can be inspected without a build step.

For dense Matplotlib poster exports, call `prepareMotionSvg(source, { candidateLimit })`
first. It removes poster typography and raster fade layers, keeps the complete vector road
network static, and spatially marks a bounded candidate pool. Then call `processMap` with
`candidateAttribute: "data-motion-candidate"`. Neighbor calculation uses a spatial grid
rather than an all-pairs scan, so candidate preparation remains practical at product scale.
