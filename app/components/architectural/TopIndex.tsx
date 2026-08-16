"use client";

/**
 * TopIndex — the top-margin field index, mirroring DrawingIndex.
 *
 * Where DrawingIndex is a vertical scale rule down the left (Y) edge, this is
 * a horizontal scale rule along the top (X) edge — the same drafting-sheet
 * vocabulary (hairline spine, tick marks, section marks registered against
 * it) rotated 90°, so together the two rules read as the ruled corner of a
 * drawing sheet rather than two unrelated nav bars.
 *
 * Reuses DrawingIndex's ENTRIES (the site's real five sections) rather than
 * a second, driftable copy, and its own compact active-section tracking —
 * a second IntersectionObserver alongside DrawingIndex's, not a shared one,
 * so this stays a self-contained addition rather than a refactor of the
 * already-working left rail.
 *
 * Desktop only (≥1180px, matching DrawingIndex's breakpoint): below that the
 * bottom tab strip already carries the horizontal index, and a second one at
 * the top would double the navigation on a narrow viewport.
 */

import { useEffect, useState } from "react";
import { ArchitecturalGlyph } from "./ArchitecturalGlyph";
import { ENTRIES } from "./DrawingIndex";

export function TopIndex() {
  const [active, setActive] = useState<string>("top");

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

  return (
    <nav className="top-index" aria-label="Section index">
      <span className="top-index__rule" aria-hidden="true" />
      <ul className="top-index__list">
        {ENTRIES.map((entry) => {
          const isActive = active === entry.id;
          return (
            <li key={entry.id} className="top-index__item">
              <a
                className={`top-index__link${isActive ? " is-active" : ""}`}
                href={`#${entry.id}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={entry.label}
              >
                <span className="top-index__mark">
                  <ArchitecturalGlyph name={entry.glyph} />
                </span>
                <span className="top-index__tick" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
