"use client";

/**
 * DrawingIndex — the left-margin scale rule.
 *
 * This is an architect's scale rule laid down the binding edge of the sheet,
 * not a sidebar. A drawn vertical rule carries graduated ticks — minor every
 * unit, major every fifth with a number — and the numbers count DOWNWARD, so
 * scrolling reads as measuring down the drawing. The five real sections
 * register against that rule as survey marks at their measured depth.
 *
 * Sections are the real site IA only (#top, #properties, #markets, #approach,
 * #contact); nothing here is invented to fill the rail.
 *
 * Cost control:
 *   - The graduation is ONE static inline SVG, rendered once. It never
 *     re-renders on scroll.
 *   - Section registration uses ONE IntersectionObserver with a middle-band
 *     rootMargin; React state is set only when the active section CHANGES.
 *   - The travelling position indicator is driven by a CSS custom property
 *     written directly to the element (no React state per frame), inside a
 *     rAF that is scheduled only while scrolling and parks when at rest —
 *     the same demand-driven pattern as InfiniteAtlasCanvas, so the two do
 *     not compete.
 *
 * Below the desktop breakpoint the rule is replaced by a drawing-sheet tab
 * strip; a vertical measuring scale is meaningless in a horizontal crop.
 */

import { useEffect, useRef, useState } from "react";
import { ArchitecturalGlyph, type ArchitecturalGlyphName } from "./ArchitecturalGlyph";

export type IndexEntry = {
  id: string;
  label: string;
  plate: string;
  glyph: ArchitecturalGlyphName;
};

/**
 * Real sections only — these ids all exist in InkEstates. Exported so the
 * top horizontal index (TopIndex.tsx) mirrors the same five entries rather
 * than maintaining a second, driftable copy of the site's IA.
 */
export const ENTRIES: IndexEntry[] = [
  { id: "top", label: "Home", plate: "00", glyph: "origin" },
  { id: "properties", label: "Residences", plate: "01", glyph: "property-plate" },
  { id: "markets", label: "Places", plate: "02", glyph: "survey-point" },
  { id: "approach", label: "Approach", plate: "03", glyph: "field-note" },
  { id: "contact", label: "Inquire", plate: "04", glyph: "intersection" },
];

/**
 * Scale graduation. The rule spans the rail's height in a 0..1000 viewBox so
 * it scales to any viewport without recomputing tick positions in JS.
 * DIVISIONS minor ticks, every MAJOR_EVERY-th one long and numbered.
 */
const DIVISIONS = 40;
const MAJOR_EVERY = 5;

function ScaleRule() {
  const ticks = [];
  for (let i = 0; i <= DIVISIONS; i += 1) {
    const y = (i / DIVISIONS) * 1000;
    const isMajor = i % MAJOR_EVERY === 0;
    ticks.push(
      <line
        key={`t${i}`}
        x1="0"
        y1={y}
        x2={isMajor ? 11 : 5.5}
        y2={y}
        stroke="currentColor"
        strokeWidth={isMajor ? 1 : 0.6}
        vectorEffect="non-scaling-stroke"
      />
    );
  }
  return (
    <svg
      className="drawing-index__rule"
      viewBox="0 0 34 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* The rule's spine. */}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="1000"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {ticks}
    </svg>
  );
}

export function DrawingIndex() {
  const [active, setActive] = useState<string>("top");
  const railRef = useRef<HTMLElement>(null);

  // Section registration — one observer, state only on change.
  useEffect(() => {
    const sections = ENTRIES.map((e) => document.getElementById(e.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visibility) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive((current) => (current === best ? current : best));
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Travelling position indicator: writes a CSS custom property, never React
  // state. Demand-driven rAF that parks when the value stops changing, and
  // suspends while the tab is hidden — matching InfiniteAtlasCanvas so the
  // two never both spin.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Still position it, just never animate toward it.
      const setOnce = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        rail.style.setProperty("--rule-progress", String(p));
      };
      setOnce();
      window.addEventListener("scroll", setOnce, { passive: true });
      return () => window.removeEventListener("scroll", setOnce);
    }

    let raf = 0;
    let running = false;
    let rendered = -1;

    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? window.scrollY / max : 0;
      if (Math.abs(target - rendered) < 0.0005) {
        running = false;
        raf = 0;
        return;
      }
      rendered = target;
      rail.style.setProperty("--rule-progress", String(target));
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        running = false;
      } else {
        start();
      }
    };

    tick();
    window.addEventListener("scroll", start, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", start);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav className="drawing-index" aria-label="Drawing index" ref={railRef}>
      <p className="drawing-index__plate" aria-hidden="true">
        A<span className="drawing-index__chi">χ</span>T / 001
        <span className="drawing-index__plate-sub">FIELD INDEX</span>
      </p>

      {/* The rule itself: spine, graduation, and the travelling depth
          indicator. All decorative. Inline numbers beside the major ticks
          were removed — they crowded the rule at this width without adding
          legible information the section marks don't already carry. */}
      <div className="drawing-index__scale-rule">
        <ScaleRule />
        <span className="drawing-index__cursor" aria-hidden="true" />
      </div>

      <ul className="drawing-index__list">
        {ENTRIES.map((entry) => {
          const isActive = active === entry.id;
          return (
            <li key={entry.id} className="drawing-index__item">
              <a
                className={`drawing-index__link${isActive ? " is-active" : ""}`}
                href={`#${entry.id}`}
                aria-current={isActive ? "true" : undefined}
                /* The plate number is drawing annotation, not part of the
                   link's name — without this the accessible name computes
                   as "01Residences". */
                aria-label={entry.label}
              >
                <span className="drawing-index__mark">
                  <ArchitecturalGlyph name={entry.glyph} />
                </span>
                {/* The datum line is the active expression: it extends from
                    the mark toward the content and terminates in the plate
                    number, the way a marked-up sheet reads. */}
                <span className="drawing-index__datum" aria-hidden="true" />
                <span className="drawing-index__plate-no" aria-hidden="true">
                  {entry.plate}
                </span>
                <span className="drawing-index__label">{entry.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="drawing-index__meta" aria-hidden="true">
        <span>37.7749°N</span>
        <span>122.4194°W</span>
        {/* Scale is drawn as the scale-bar glyph plus a typed ratio, rather
            than a Unicode infinity character standing in for a symbol. */}
        <span className="drawing-index__scale">
          <ArchitecturalGlyph name="scale" />
          <span>CONT.</span>
        </span>
      </p>
    </nav>
  );
}
