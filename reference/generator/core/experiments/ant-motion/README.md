# Ant-motion proof of concept

Serve the repository root (for example `python3 -m http.server 4173`) and open
`/experiments/ant-motion/`. The page processes the source SVG in-browser and moves actual
street `line`/`path` wrappers. No dots, particles, cross-fades, city labels, country names,
or coordinates are present. Six text-free treatments reflect the supplied poster palette
references while leaving geometry and animation behavior unchanged.

## What the experiment proves

- 20–1,000 existing SVG street pieces can be selected; the default is 120.
- Chain, breadth-first neighbor wave, and three interleaved local streams are selectable.
- Ring and spiral formations assign destinations to those same street pieces.
- Per-piece stagger, duration, and curve vary deterministically, creating a follow-the-trail
  cadence that remains replayable.
- Return always targets wrapper translation `[0, 0]`; reset clears it immediately. Original
  geometry and transforms live on children, so return does not accumulate matrix error.
- The telemetry shows currently active transformed elements and a rolling animation FPS.

## Propagation comparison

The nearest-neighbor chain most closely resembles ants marching one-by-one: motion has a
legible head and a continuous local trail. Wave propagation reads as an expanding ripple;
it is useful for a map "waking up" but less ant-like. Small streams feel more organic and
fill formations faster, but their three simultaneous heads reduce the singular marching
effect. Recommendation: chain as the product default, streams as a secondary mode.

## Long-path comparison

Only long `M`/`L` paths are split. In this fixture the three cross-map routes become 48
short segments, allowing the arterials to peel away progressively rather than moving as
three rigid bars. Short street elements and curved geometry are not split. This improves
the effect without exploding all source geometry.

## Performance procedure

Choose 50, 100, 200, 500, then the available maximum and run both ring and return. Record
the rolling FPS during the densest overlap, active count, visible stutter, and whether all
wrapper transforms are empty after reset. The important control is active count: the full
map remains mounted while only the selected subset moves.

See `PERFORMANCE.md` for recorded results and `INTEGRATION.md` for the stable handoff.

`browser-smoke.html` is a non-product deterministic verification page. It mounts all pieces,
pumps browser frames for 200 concurrent pieces through a ring and home, then asserts that
return and reset leave every wrapper at an empty transform. It validates DOM behavior, not
device FPS; use the interactive page telemetry for performance profiling.
