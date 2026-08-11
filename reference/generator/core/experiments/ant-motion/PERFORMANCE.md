# SVG transform performance notes

Fixture: 1,336 mounted pieces (1,291 source elements plus selective route splits). Recorded
2026-08-09 in Chrome 151.0.7922.76 on an Apple M4 using local headless Chrome with renderer
background throttling disabled. Browser telemetry sampled actual frame timestamps during
movement and excluded the intentional formation hold. Exact return checked every wrapper.

| Selected | Avg FPS | Peak active | End state | Residual transforms |
|---:|---:|---:|---|---:|
| 50 | 60 | 50 | HOME | 0 |
| 100 | 60 | 100 | HOME | 0 |
| 200 | 60 | 200 | HOME | 0 |
| 500 | 60 | 500 | HOME | 0 |
| 1,000 | 60 | 1,000 | HOME | 0 |

These numbers demonstrate feasibility on this desktop, not a cross-device ceiling. The
experiment exposes live FPS and active count for profiling Safari, Firefox, and representative
phones. Product recommendation remains: mount the full static map, animate about 100–200
pieces, and avoid keeping hundreds active concurrently by increasing stagger or batching.

The engine uses one centralized `requestAnimationFrame` scheduler regardless of selected
piece count. Per-frame work therefore scales with active transforms, not callback count.
Re-run the sweep with `scripts/cdp-benchmark.js` against a local Chrome debugging port.
