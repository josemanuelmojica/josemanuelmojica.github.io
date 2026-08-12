"use client";

/**
 * Hero architectural reveal (Branch 1).
 *
 * An editorial opening sequence layered behind the hero content, in the
 * vocabulary of architectural drawing registering onto a map:
 *
 *   paper → drafting grid → street trace → building footprints →
 *   coordinate / datum / registration marks → stillness
 *
 * Motion is the only new runtime dependency. The sequence runs once on mount
 * and then RESOLVES TO STILLNESS — it is not a loop (the ambient AtlasRail is
 * the site's single persistent-motion element). Under prefers-reduced-motion,
 * every layer renders in its final state immediately with no animation.
 *
 * Performance: this is a small inline SVG overlay (paths from a 6.7 KiB
 * build-time trace file). It adds no raster assets and never blocks the LCP
 * hero image, which paints independently beneath it.
 */

import { useMemo } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import {
  BuildingTrace,
  CoordinateStamp,
  DatumMark,
  DrawingGrid,
  MapTrace,
  NorthMark,
  RegistrationMarks,
} from "./primitives";
import heroTraces from "../../lib/heroTraces.json";

// San Francisco datum — study-01's real coordinates (design source of truth).
const SF = { latitude: 37.7749, longitude: -122.4194 };

// A few footprints in the normalized 0..1000 space, placed over denser street
// areas so they read as buildings registering onto the plan.
const FOOTPRINTS = [
  { x: 470, y: 430, w: 70, h: 48 },
  { x: 560, y: 500, w: 52, h: 60 },
  { x: 430, y: 520, w: 44, h: 40 },
  { x: 520, y: 402, w: 38, h: 34 },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroReveal() {
  const reduced = useReducedMotion();
  const paths = useMemo(() => heroTraces.paths as string[], []);

  // Final (settled) state values, shared by the reduced-motion path.
  const shown = { opacity: 1 };
  const hidden = { opacity: 0 };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="hero-reveal" aria-hidden="true">
        {/* Adaptive drafting grid fades in first. */}
        <m.div
          className="hero-reveal__grid"
          initial={reduced ? shown : hidden}
          animate={shown}
          transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
        >
          <DrawingGrid spacing={72} subdivisions={4} opacity={0.45} />
        </m.div>

        {/* Street network traces on. Stroke draw-on via CSS custom prop below. */}
        <m.div
          className="hero-reveal__map"
          initial={reduced ? shown : hidden}
          animate={shown}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.5, ease: EASE }}
        >
          <MapTrace
            paths={paths}
            className={`hero-reveal__trace${reduced ? "" : " hero-reveal__trace--draw"}`}
            pathClassName="hero-reveal__road"
            strokeWidth={1.1}
          />
        </m.div>

        {/* Building footprints register onto the plan. */}
        <m.div
          className="hero-reveal__buildings"
          initial={reduced ? shown : hidden}
          animate={shown}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 1.4, ease: EASE }}
        >
          <BuildingTrace footprints={FOOTPRINTS} className="hero-reveal__trace" pathClassName="hero-reveal__footprint" />
        </m.div>

        {/* Architectural marks arrive last and stay. */}
        <m.div
          className="hero-reveal__marks"
          initial={reduced ? shown : hidden}
          animate={shown}
          transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 1.9, ease: EASE }}
        >
          <div className="hero-reveal__datum">
            <DatumMark size={30} />
          </div>
          <CoordinateStamp
            className="hero-reveal__coords"
            latitude={SF.latitude}
            longitude={SF.longitude}
          />
          <div className="hero-reveal__north">
            <NorthMark size={34} />
          </div>
          <RegistrationMarks inset={16} size={14} />
        </m.div>
      </div>
    </LazyMotion>
  );
}
