"use client";

/**
 * InfiniteAtlasCanvas — a site-wide, fixed, decorative atlas plane behind all
 * page content. It replaces the section-scoped vertical AtlasRail with one
 * continuous field the whole site appears to travel across.
 *
 * Behavior:
 *   - A single fixed, full-viewport layer paints one seamless (4-edge toroidal)
 *     tile via CSS background-repeat, so it fills any viewport by tiling.
 *   - Movement is SCROLL-COUPLED: page scroll drives a very slow diagonal drift
 *     of the background-position through the infinite plane (modulo-wrapped, so
 *     it never runs out). It is not a user-controlled map and not an autonomous
 *     carousel — the site and atlas travel together.
 *   - The drift is applied to background-position inside a rAF loop reading a
 *     scroll value captured by a passive listener; NO React state updates per
 *     frame.
 *   - Deferred: the tile image is only requested after mount (idle), so it never
 *     competes with critical content / LCP.
 *   - prefers-reduced-motion: no drift; a static tiled field.
 *   - Decorative: pointer-events:none, aria-hidden.
 *
 * The tile asset comes from the responsive tile manifest; the runtime is
 * agnostic to which tile ships, so a refined seamless tile can replace the
 * current one with no code change.
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

function pickTile(): TileEntry {
  // Choose the smallest tile whose size covers the viewport's smaller side,
  // so phones decode the 512 tile and large screens the 1024. SSR falls back
  // to the middle tile; the effect corrects on mount.
  if (typeof window === "undefined") return TILES[Math.floor(TILES.length / 2)];
  const min = Math.min(window.innerWidth, window.innerHeight);
  return TILES.find((t) => t.size >= min) ?? TILES[TILES.length - 1];
}

function supportsAvif(): boolean {
  // Cheap runtime AVIF check via canvas toDataURL; defaults to webp on failure.
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.toDataURL("image/avif").startsWith("data:image/avif");
}

export function InfiniteAtlasCanvas() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [tileUrl, setTileUrl] = useState<string | null>(null);
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
    const tile = pickTile();
    const url = publicPath(supportsAvif() ? tile.avif.path : tile.webp.path);
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const load = () => setTileUrl(url);
    const id =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(load, { timeout: 2500 })
        : window.setTimeout(load, 1200);
    return () => {
      if (typeof win.cancelIdleCallback === "function") win.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  // Scroll-coupled diagonal drift. A passive scroll listener records the latest
  // scrollY; a rAF loop writes background-position with modulo wrapping. No
  // per-frame React state, so this stays compositor-friendly.
  useEffect(() => {
    if (!tileUrl || reducedMotion) return;
    const layer = layerRef.current;
    if (!layer) return;

    const tileSize = pickTile().size;
    let scrollY = window.scrollY || 0;
    let raf = 0;

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      // Wrap with modulo so the position never grows unbounded; the tile
      // repeats, so any multiple of tileSize is visually identical.
      const x = -((scrollY * DRIFT_X) % tileSize);
      const y = -((scrollY * DRIFT_Y) % tileSize);
      layer.style.backgroundPosition = `${x}px ${y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [tileUrl, reducedMotion]);

  const tileSize = TILES.length ? pickTile().size : 768;

  return (
    <div
      ref={layerRef}
      className="infinite-atlas"
      aria-hidden="true"
      style={
        tileUrl
          ? {
              backgroundImage: `url(${tileUrl})`,
              backgroundRepeat: "repeat",
              backgroundSize: `${tileSize}px ${tileSize}px`,
            }
          : undefined
      }
    />
  );
}
