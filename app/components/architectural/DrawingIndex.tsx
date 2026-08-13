"use client";

/**
 * DrawingIndex — the left-margin field index.
 *
 * This is the binding edge of a drawing sheet, not a sidebar: no panel, no
 * background fill, no border, no chrome. Marks sit directly on the paper and
 * stay quiet until a section becomes current, at which point the sheet is
 * "registered" — a datum line extends from the mark toward the content and
 * carries the section number at its terminus.
 *
 * Sections are the real site IA only (#top, #properties, #markets, #approach,
 * #contact); nothing here is invented to fill the rail.
 *
 * Scroll awareness uses ONE IntersectionObserver with a middle-band
 * rootMargin, so whichever section owns the viewport's centre wins. State is
 * set only when the active section CHANGES — never per scroll event and never
 * per animation frame, which keeps the InfiniteAtlasCanvas stability work
 * intact (no competing continuous scroll listeners).
 *
 * On viewports below the desktop breakpoint this renders as a bottom-edge
 * drawing-sheet tab strip instead — the same vocabulary composed for the crop,
 * touch-sized, with no hover dependency. See .drawing-index rules in
 * globals.css.
 */

import { useEffect, useState } from "react";
import { ArchitecturalGlyph, type ArchitecturalGlyphName } from "./ArchitecturalGlyph";

type IndexEntry = {
  id: string;
  label: string;
  plate: string;
  glyph: ArchitecturalGlyphName;
};

/** Real sections only — these ids all exist in InkEstates. */
const ENTRIES: IndexEntry[] = [
  { id: "top", label: "Home", plate: "00", glyph: "origin" },
  { id: "properties", label: "Residences", plate: "01", glyph: "property-plate" },
  { id: "markets", label: "Places", plate: "02", glyph: "survey-point" },
  { id: "approach", label: "Approach", plate: "03", glyph: "field-note" },
  { id: "contact", label: "Inquire", plate: "04", glyph: "intersection" },
];

export function DrawingIndex() {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const sections = ENTRIES.map((e) => document.getElementById(e.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    // Whichever section occupies the viewport's middle band is "current".
    // Ratios are compared across entries so a tall section that merely
    // overlaps the band does not beat one centred in it.
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
        // Only touch React state when the section actually changes.
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

  return (
    <nav className="drawing-index" aria-label="Drawing index">
      <p className="drawing-index__plate" aria-hidden="true">
        A<span className="drawing-index__chi">χ</span>T / 001
        <span className="drawing-index__plate-sub">FIELD INDEX</span>
      </p>

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
