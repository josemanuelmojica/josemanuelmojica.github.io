"use client";

/**
 * InfiniteAtlasCanvas — a site-wide, fixed, decorative atlas plane behind all
 * page content: one continuous field the whole site appears to travel across.
 *
 * Architecture (compositor-oriented):
 *   - A clipped, fixed, full-viewport container holds ONE oversized repeating
 *     plane (viewport + one tile of slack on each axis).
 *   - Movement is SCROLL-COUPLED: page scroll drives a very slow diagonal drift
 *     applied as `transform: translate3d(...)` on that single plane, wrapped
 *     modulo the tile size so the slack always covers the viewport and the
 *     field never runs out. The site and atlas travel together.
 *   - Transform is a compositor-friendly property: the plane rasters once and
 *     subsequent frames only update its transform, rather than repainting a
 *     full-viewport background every frame.
 *   - The rAF loop is demand-driven: it only runs while the scroll position is
 *     still converging on its target, and stops when the field is at rest. It
 *     is additionally suspended while the tab is hidden.
 *   - Deferred: the tile image is only requested after mount (idle), so it
 *     never competes with critical content / LCP.
 *   - prefers-reduced-motion: no drift; a static tiled field.
 *   - Decorative: pointer-events:none, aria-hidden.
 *
 * Candidate selection is delegated to the browser via CSS `image-set()`, which
 * picks AVIF where supported and WebP otherwise. This replaces a canvas-based
 * capability probe that produced false negatives: that probe asked the canvas
 * to *encode* AVIF, which Chrome cannot do even though it decodes AVIF fine,
 * so every Chrome user was served the larger WebP.
 */

import { useEffect, useRef, useState } from "react";
import { publicPath } from "../lib/publicPath";
import tileManifest from "../../public/derived/atlas-tile/tile-manifest.json";

type TileEntry = { size: number; avif: { path: string; bytes: number }; webp: { path: string; bytes: number } };

const TILES = Object.values(tileManifest.sizes as Record<string, TileEntry>).sort((a, b) => a.size - b.size);

// Drift: CSS-pixels of background travel per pixel of page scroll. Small = slow.
// Diagonal: x drifts at a different (smaller) rate than y for an angled sweep.
const DRIFT_Y = 0.18;
const DRIFT_X = 0.11;

// Below this delta (px) the plane is considered at rest and the loop parks.
const REST_EPSILON = 0.05;

function pickTile(): TileEntry {
  // Choose the smallest tile whose size covers the viewport's smaller side,
  // so phones decode the 512 tile and large screens the 1024. SSR falls back
  // to the middle tile; the effect corrects on mount.
  if (typeof window === "undefined") return TILES[Math.floor(TILES.length / 2)];
  const min = Math.min(window.innerWidth, window.innerHeight);
  return TILES.find((t) => t.size >= min) ?? TILES[TILES.length - 1];
}

/**
 * Browser-native candidate selection. `image-set()` lets the UA choose the
 * first type it can decode, so no JS capability detection is involved and no
 * unused candidate is fetched.
 */
function tileImageSet(tile: TileEntry): string {
  const avif = publicPath(tile.avif.path);
  const webp = publicPath(tile.webp.path);
  return `image-set(url("${avif}") type("image/avif"), url("${webp}") type("image/webp"))`;
}

export function InfiniteAtlasCanvas() {
  const planeRef = useRef<HTMLDivElement>(null);
  const [tile, setTile] = useState<TileEntry | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Defer the tile fetch until after the critical frame, during idle.
  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const load = () => setTile(pickTile());
    const id =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(load, { timeout: 2500 })
        : window.setTimeout(load, 1200);
    return () => {
      if (typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  // Scroll-coupled diagonal drift via compositor transform. A passive scroll
  // listener records the latest scrollY; a demand-driven rAF loop writes the
  // plane's transform and parks itself once the field is at rest.
  useEffect(() => {
    if (!tile || reducedMotion) return;
    const plane = planeRef.current;
    if (!plane) return;

    const tileSize = tile.size;
    let targetY = window.scrollY || 0;
    let renderedY: number | null = null;
    let raf = 0;
    let running = false;

    const draw = (scrollValue: number) => {
      const x = -((scrollValue * DRIFT_X) % tileSize);
      const y = -((scrollValue * DRIFT_Y) % tileSize);
      plane.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      renderedY = scrollValue;
    };

    const tick = () => {
      // Park when the rendered position already matches the target: an idle
      // page performs no per-frame work at all.
      if (renderedY !== null && Math.abs(targetY - renderedY) < REST_EPSILON) {
        running = false;
        raf = 0;
        return;
      }
      draw(targetY);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      targetY = window.scrollY || 0;
      start();
    };

    const onVisibility = () => {
      if (document.hidden) {
        // Suspend: no decorative work while the tab is backgrounded.
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        running = false;
      } else {
        // Resume seamlessly at the current scroll position.
        targetY = window.scrollY || 0;
        start();
      }
    };

    // Paint the initial position once, then wait for scroll.
    draw(targetY);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tile, reducedMotion]);

  const tileSize = tile?.size ?? (TILES.length ? TILES[Math.floor(TILES.length / 2)].size : 768);

  return (
    <div className="infinite-atlas" aria-hidden="true">
      <div
        ref={planeRef}
        className="infinite-atlas__plane"
        style={
          tile
            ? {
                backgroundImage: tileImageSet(tile),
                backgroundRepeat: "repeat",
                backgroundSize: `${tileSize}px ${tileSize}px`,
                // Slack of one tile on each axis so a wrapped translate never
                // exposes an edge of the plane.
                width: `calc(100vw + ${tileSize}px)`,
                height: `calc(100vh + ${tileSize}px)`,
              }
            : undefined
        }
      />
    </div>
  );
}
