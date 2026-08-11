# ADR-001: Animate SVG wrapper groups with a direct frame engine

**Status:** Accepted for experiment  
**Date:** 2026-08-09  
**Deciders:** Experimental graphics owner; Copilot validates product integration

## Context

The proof must move original vector map pieces, preserve exact geometry, return without
drift, support 50–200 pieces initially, and avoid React frame updates. It must not commit
the product to a GIS stack or renderer before SVG performance is measured.

## Decision

Wrap each addressable geometry element in a stable SVG `g`. Keep source transforms on the
child and let a small `requestAnimationFrame` engine own only wrapper translations. Model
propagation and formations as pure functions so a GSAP engine can be substituted later.

## Options considered

| Option | Complexity | Exact return | Portability | V1 fit |
|---|---:|---:|---:|---:|
| SVG wrappers + RAF | Low | Strong | Strong | Best |
| SVG wrappers + GSAP | Medium/dependency | Strong | Strong | Good later |
| Canvas/WebGL | High | Requires new renderer | Medium | Premature |
| React state per frame | Medium | Possible | Strong | Poor at scale |

## Consequences

- The proof has no animation dependency and directly demonstrates the important SVG limit.
- Returning the wrapper to an empty transform reconstructs the original visual state.
- The V1 engine handles translations, not arbitrary rotation/scale choreography.
- Native path metrics are not used during string processing; centroids are approximations.
- If profiling shows persistent frame degradation, `MotionEngine` is the replacement seam.
