"use client";

import { useEffect, useRef } from "react";

type InkPoint = { x: number; y: number; at: number };

const LIFETIME = 2600;
const MAX_POINTS = 48;
const INTERACTIVE = "a, button, input, select, textarea, label, summary, [role='tab'], [role='radio'], [role='dialog'], .maplibregl-ctrl, [data-no-trail]";

/**
 * Decorative, screen-space ink line that follows a mouse or pen across the map
 * field. It is `pointer-events: none`, never listens on map controls, stores
 * nothing, and is not rendered at all when motion is reduced or the visitor is
 * actively exploring the map.
 */
export function InkTrail({ active }: { active: boolean }) {
  const halo = useRef<SVGPathElement>(null);
  const line = useRef<SVGPathElement>(null);
  const group = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!active) return;
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
    if (!fine.matches) return;
    let points: InkPoint[] = [];
    let frame = 0;

    const paint = () => {
      const now = performance.now();
      points = points.filter((point) => now - point.at < LIFETIME);
      const last = points.at(-1);
      if (!last) {
        halo.current?.setAttribute("d", "");
        line.current?.setAttribute("d", "");
        frame = 0;
        return;
      }
      const d = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
      halo.current?.setAttribute("d", d);
      line.current?.setAttribute("d", d);
      group.current?.setAttribute("opacity", String(Math.min(0.7, (LIFETIME - (now - last.at)) / 700)));
      frame = requestAnimationFrame(paint);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE)) return;
      const last = points.at(-1);
      if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 3) return;
      points = [...points, { x: event.clientX, y: event.clientY, at: performance.now() }].slice(-MAX_POINTS);
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      halo.current?.setAttribute("d", "");
      line.current?.setAttribute("d", "");
    };
  }, [active]);

  if (!active) return null;
  return (
    <svg className="pointer-events-none fixed inset-0 z-[1] h-full w-full text-blue" aria-hidden="true" focusable="false">
      <g ref={group} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path ref={halo} stroke="var(--paper)" strokeWidth={5} opacity={0.8} />
        <path ref={line} stroke="currentColor" strokeWidth={1.7} strokeDasharray="3 5" />
      </g>
    </svg>
  );
}
