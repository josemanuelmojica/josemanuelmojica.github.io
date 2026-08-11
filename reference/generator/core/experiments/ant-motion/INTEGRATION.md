# Copilot integration contract

1. Pass the clean, serialized SVG string to `processMap(svg, options)`. It returns
   `{ processedSvg, pieces, metadata }`; no React nodes or app state are required.
2. Mount `processedSvg` once (for example via a sanitized trusted SVG boundary), then keep
   the resulting `<svg>` element. Every descriptor's `element` points to its motion wrapper.
3. Construct `new AntSequence(pieces, { root: svgElement })` after mount.
4. Call `start({ count, strategy, formation })`; `map-motion` directly owns wrapper
   transform attributes for every animation frame. React owns mounting, controls, and
   high-level state only.
5. Use `pause`, `resume`, `returnHome`, or `reset`. `reset` aborts a running sequence and
   synchronously restores zero translation. Call `destroy()` before unmount so frames are
   cancelled and transforms are cleared.
6. There are no runtime dependencies in V1. Both packages are native ES modules. A build
   system may transpile them or replace `MotionEngine` with a GSAP adapter later.

Stable concepts: `MapPiece`, `processMap`, `AntSequence`, `MotionEngine`, `Formation`, and
the wrapper-transform ownership rule. Experimental cadence constants and palette/UI code
are not part of the contract.

Security note: product integration must sanitize untrusted SVG before mounting it. The
processor is geometry preparation, not an SVG sanitizer.
