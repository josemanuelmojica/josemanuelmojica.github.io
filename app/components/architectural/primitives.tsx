/**
 * Architectural primitive system — hero subset (Branch 1).
 *
 * Lightweight, resolution-independent SVG/CSS marks in the vocabulary of
 * architectural drawing + cartography. These are editorial composition
 * elements, not general UI chrome. All are pure/presentational; motion is
 * applied by the hero orchestrator, not baked in here, so each stays trivially
 * reusable and reduced-motion-safe by default.
 *
 * Coordinates use the real San Francisco datum where a mark represents a place.
 */

import type { CSSProperties, ReactNode } from "react";

const INK = "var(--ink)";
const BLUEPRINT = "var(--blueprint)";
const ASH = "var(--ash)";

/**
 * DrawingGrid — an adaptive vector drafting grid. Because it is drawn with an
 * SVG <pattern>, it is resolution-independent (never a raster scaled up) and
 * can subdivide: `subdivisions` adds finer lines between the majors, which the
 * hero increases as it "zooms in", giving an infinite-drafting-grid feel with
 * no raster tiling.
 */
export function DrawingGrid({
  spacing = 64,
  subdivisions = 4,
  className,
  style,
  opacity = 0.5,
}: {
  spacing?: number;
  subdivisions?: number;
  className?: string;
  style?: CSSProperties;
  opacity?: number;
}) {
  const minor = spacing / subdivisions;
  return (
    <svg
      className={className}
      style={style}
      aria-hidden="true"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="ag-minor" width={minor} height={minor} patternUnits="userSpaceOnUse">
          <path d={`M ${minor} 0 L 0 0 0 ${minor}`} fill="none" stroke={ASH} strokeWidth="0.5" opacity="0.5" />
        </pattern>
        <pattern id="ag-major" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <rect width={spacing} height={spacing} fill="url(#ag-minor)" />
          <path d={`M ${spacing} 0 L 0 0 0 ${spacing}`} fill="none" stroke={ASH} strokeWidth="0.9" opacity="0.75" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ag-major)" opacity={opacity} />
    </svg>
  );
}

/**
 * CoordinateStamp — a monospaced lat/long readout, the way a survey sheet
 * annotates a location. Uses real coordinates; never shows system/meta text.
 */
export function CoordinateStamp({
  latitude,
  longitude,
  label,
  className,
  style,
}: {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const lat = `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? "E" : "W"}`;
  return (
    <span className={className} style={style} role="text">
      {label ? <span className="coordinate-stamp__label">{label}</span> : null}
      <span className="coordinate-stamp__value">
        {lat} · {lon}
      </span>
    </span>
  );
}

/**
 * DatumMark — a survey datum: a small crosshair-in-circle placed at a point of
 * origin. `size` in SVG user units; render inside an SVG or as a standalone.
 */
export function DatumMark({ size = 28, stroke = BLUEPRINT }: { size?: number; stroke?: string }) {
  const c = size / 2;
  const r = size / 2 - 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth="1" />
      <line x1={c} y1="0" x2={c} y2={size} stroke={stroke} strokeWidth="0.75" />
      <line x1="0" y1={c} x2={size} y2={c} stroke={stroke} strokeWidth="0.75" />
      <circle cx={c} cy={c} r="1.5" fill={stroke} />
    </svg>
  );
}

/**
 * RegistrationMarks — printer's corner registration crosses that frame a
 * composition and read as "this is a drawing sheet". Rendered at the four
 * corners of the parent via absolute positioning in CSS.
 */
export function RegistrationMarks({ inset = 18, size = 14 }: { inset?: number; size?: number }) {
  const corners = [
    { top: inset, left: inset },
    { top: inset, right: inset },
    { bottom: inset, left: inset },
    { bottom: inset, right: inset },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <svg
          key={i}
          className="registration-mark"
          style={{ position: "absolute", ...pos, width: size, height: size }}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke={ASH} strokeWidth="0.75" />
          <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke={ASH} strokeWidth="0.75" />
          <circle cx={size / 2} cy={size / 2} r={size / 3} fill="none" stroke={ASH} strokeWidth="0.6" />
        </svg>
      ))}
    </>
  );
}

/**
 * NorthMark — a compass north arrow, the cartographic convention for
 * orientation. Small, quiet, upper-corner.
 */
export function NorthMark({ size = 34 }: { size?: number }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="north-mark">
      <polygon points={`${c},3 ${c - 5},${c} ${c + 5},${c}`} fill={INK} />
      <polygon points={`${c},${c} ${c - 5},${c} ${c + 5},${c}`} fill="none" stroke={INK} strokeWidth="0.75" />
      <line x1={c} y1={c} x2={c} y2={size - 5} stroke={ASH} strokeWidth="0.75" />
      <text x={c} y={size} textAnchor="middle" fontSize="7" fill={INK} fontFamily="var(--utility)">
        N
      </text>
    </svg>
  );
}

/**
 * MapTrace — draws a set of normalized street paths inside a 0..viewBox square.
 * The paths come from real geometry (heroTraces.json). Stroke draw-on is done
 * by the caller via CSS/Motion (stroke-dasharray), so this stays presentational.
 */
export function MapTrace({
  paths,
  viewBox = 1000,
  className,
  pathClassName,
  stroke = INK,
  strokeWidth = 1.1,
}: {
  paths: string[];
  viewBox?: number;
  className?: string;
  pathClassName?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          className={pathClassName}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/**
 * BuildingTrace — a few architectural footprint rectangles, drawn as outlines,
 * to read as building plans registering onto the map. Positions are given in
 * the same 0..viewBox space as MapTrace so they align.
 */
export function BuildingTrace({
  footprints,
  viewBox = 1000,
  className,
  pathClassName,
  stroke = BLUEPRINT,
}: {
  footprints: Array<{ x: number; y: number; w: number; h: number }>;
  viewBox?: number;
  className?: string;
  pathClassName?: string;
  stroke?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {footprints.map((f, i) => (
        <rect
          key={i}
          className={pathClassName}
          x={f.x}
          y={f.y}
          width={f.w}
          height={f.h}
          stroke={stroke}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** Small shared wrapper for absolutely-positioned mark clusters. */
export function MarkCluster({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style} aria-hidden="true">
      {children}
    </div>
  );
}
