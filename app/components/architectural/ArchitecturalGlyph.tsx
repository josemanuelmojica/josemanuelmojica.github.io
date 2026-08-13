/**
 * ArchitecturalGlyph — the Arχ & Teχt marginal notation vocabulary.
 *
 * Sixteen marks in the language of an architect's field notebook and a
 * surveyed atlas: drawing language first, UI second. Every path here is
 * project-original geometry on a 24×24 canonical grid — no third-party SVG
 * files are vendored, so the set carries no attribution obligation and one
 * consistent stroke weight rather than four normalized dialects. See
 * `docs/design/ICON_SOURCES.md` for the provenance record and the license
 * research behind that decision.
 *
 * Drawing rules (matching DatumMark / RegistrationMarks / NorthMark in
 * ./primitives.tsx): fill="none" by default, currentColor so the mark
 * inherits --ink / --blueprint / --ash from its context, square caps and
 * miter joins for drafting character, and no rounded consumer-app softening.
 *
 * Accessibility: decorative by default (aria-hidden). Interactive instances
 * must pass `decorative={false}` with a `label`, which promotes the mark to
 * role="img" with an accessible name.
 */

import type { ReactNode, SVGProps } from "react";

export type ArchitecturalGlyphName =
  | "origin"
  | "section-cut"
  | "coordinate"
  | "survey-point"
  | "triangulation"
  | "datum"
  | "registration"
  | "measure"
  | "detail-callout"
  | "north-mark"
  | "scale"
  | "field-note"
  | "property-plate"
  | "trace"
  | "intersection"
  | "archive-mark";

type ArchitecturalGlyphProps = SVGProps<SVGSVGElement> & {
  name: ArchitecturalGlyphName;
  label?: string;
  decorative?: boolean;
};

const glyphs: Record<ArchitecturalGlyphName, ReactNode> = {
  /**
   * 01 ORIGIN
   * Home / reset / top of sheet
   */
  origin: (
    <>
      <circle cx="12" cy="12" r="5.25" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <path d="M12 2.5v4.25M12 17.25v4.25M2.5 12h4.25M17.25 12h4.25" />
    </>
  ),

  /**
   * 02 SECTION CUT
   * Residences / chapters / sectional transition
   */
  "section-cut": (
    <>
      <path d="M4 12h16" />
      <path d="M8.25 7.5 3.75 12l4.5 4.5" />
      <path d="m15.75 7.5 4.5 4.5-4.5 4.5" />
      <path d="M12 8.25v7.5" />
      <circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * 03 COORDINATE
   * Place / inspect / precise location
   */
  coordinate: (
    <>
      <path d="M12 2.5v6M12 15.5v6M2.5 12h6M15.5 12h6" />
      <circle cx="12" cy="12" r="3.1" />
      <circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * 04 SURVEY POINT
   * Active geography / selected market
   */
  "survey-point": (
    <>
      <circle cx="12" cy="12" r="6.3" />
      <path d="M12 5.7v12.6M5.7 12h12.6" />
      <path d="m12 8.4 3.6 3.6-3.6 3.6L8.4 12 12 8.4Z" />
      <circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * 05 TRIANGULATION
   * Orientation / map / secondary geographic marker
   */
  triangulation: (
    <>
      <path d="m12 3.75 7.25 15H4.75l7.25-15Z" />
      <path d="M12 7.5v7.25M9.5 14.75h5" />
      <circle cx="12" cy="17.25" r=".75" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * 06 DATUM
   * Section registration / alignment
   */
  datum: (
    <>
      <path d="M2.5 12h19" />
      <path d="M6.5 8.5v7M17.5 8.5v7" />
      <path d="M10 10h4v4h-4z" />
      <circle cx="12" cy="12" r=".75" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * 07 REGISTRATION
   * Selection / corners / focus
   */
  registration: (
    <>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
      <path d="M12 7.5v9M7.5 12h9" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),

  /**
   * 08 MEASURE
   * Dimensions / compare
   */
  measure: (
    <>
      <path d="M4 12h16" />
      <path d="m7 9-3 3 3 3M17 9l3 3-3 3" />
      <path d="M4 7v10M20 7v10" />
      <path d="M10 10v4M14 10v4" />
    </>
  ),

  /**
   * 09 DETAIL CALLOUT
   * Deep link / expand / inspect detail
   */
  "detail-callout": (
    <>
      <circle cx="9.5" cy="9.5" r="4.75" />
      <path d="M12.8 12.8 20 20" />
      <path d="M9.5 6.75v5.5M6.75 9.5h5.5" />
      <path d="M16.5 5.5h3v3" />
    </>
  ),

  /**
   * 10 NORTH MARK
   * Orientation
   */
  "north-mark": (
    <>
      <path d="M12 2.75 16.25 12 12 10.25 7.75 12 12 2.75Z" />
      <path d="M12 10.25v10.5" />
      <path d="M8.75 20.75h6.5" />
    </>
  ),

  /**
   * 11 SCALE
   * Map / drawing metadata
   */
  scale: (
    <>
      <path d="M3 13h18" />
      <path d="M3 9v8M7.5 11v4M12 9v8M16.5 11v4M21 9v8" />
      <path d="M3 18.5h9" />
    </>
  ),

  /**
   * 12 FIELD NOTE
   * Journal / editorial
   */
  "field-note": (
    <>
      <path d="M6.5 3.5h11v17h-11z" />
      <path d="M4 6h4.25M4 10h4.25M4 14h4.25M4 18h4.25" />
      <path d="M10 8h5M10 11.5h5M10 15h3.75" />
    </>
  ),

  /**
   * 13 PROPERTY PLATE
   * Residence selection
   */
  "property-plate": (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M7 8h10M7 12h6M7 15.5h8" />
      <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
    </>
  ),

  /**
   * 14 TRACE
   * Hover / reveal / neighborhood tracing
   */
  trace: (
    <>
      <path d="M3.5 18.5c3.5-8.5 6.25 1.5 10-6 2.25-4.5 4.5-5.75 7-6" />
      <circle cx="3.5" cy="18.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="20.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <path d="M9.5 15.5h3M15.25 10h2.75" strokeDasharray="1.4 1.4" />
    </>
  ),

  /**
   * 15 INTERSECTION
   * Inquiry / action / convergence
   */
  intersection: (
    <>
      <path d="M12 2.5v19M2.5 12h19" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5 5 5M16.5 16.5 19 19" />
    </>
  ),

  /**
   * 16 ARCHIVE MARK
   * Saved / collected / indexed
   */
  "archive-mark": (
    <>
      <path d="M4.5 7h15v13h-15z" />
      <path d="M3.5 4h17v3h-17z" />
      <path d="M9 11h6" />
      <path d="M8 4V2.75h8V4" />
      <path d="M12 14v3M10.5 15.5h3" />
    </>
  ),
};

export function ArchitecturalGlyph({
  name,
  label,
  decorative = true,
  className,
  ...props
}: ArchitecturalGlyphProps) {
  const accessibleProps = decorative
    ? {
        "aria-hidden": true as const,
      }
    : {
        role: "img" as const,
        "aria-label": label ?? name,
      };

  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      focusable="false"
      className={className}
      {...accessibleProps}
      {...props}
    >
      {glyphs[name]}
    </svg>
  );
}
