"use client";

import { useEffect, useRef, useState } from "react";
import { publicPath } from "../lib/publicPath";
import atlasManifest from "../../public/derived/atlas/atlas-manifest.json";

/**
 * Ambient luxury atlas rail.
 *
 * A decorative, continuously scrolling vertical tapestry of the eight metro
 * ink-map studies (precomposed with blended seams by
 * scripts/media/generate-atlas.mjs). It is purely atmospheric: aria-hidden,
 * pointer-events:none, and strictly cheaper than the interactive MarketStory.
 *
 * Contract:
 *   - Two stacked copies of one composed atlas; the track translates upward by
 *     exactly one atlas height, then resets — a seamless loop (the atlas is
 *     bookended by the same city so the wrap lands mid-city).
 *   - Motion is transform-only (translate3d) with no scroll-time React state.
 *   - Endless motion does not start until the atlas image has decoded.
 *   - prefers-reduced-motion: no animation; a single static atlas frame shows.
 *   - Mobile receives a genuinely smaller atlas payload via <source> widths.
 */

type AtlasBreakpoint = {
  width: number;
  height: number;
  avif: { path: string; bytes: number };
  webp: { path: string; bytes: number };
};

const BREAKPOINTS = Object.values(atlasManifest.breakpoints as Record<string, AtlasBreakpoint>).sort(
  (a, b) => a.width - b.width
);

// The largest atlas is the default <img> src; smaller ones are offered to
// narrow viewports through media-scoped <source> elements so a phone downloads
// the ~420w atlas, not the ~1100w one.
const LARGEST = BREAKPOINTS[BREAKPOINTS.length - 1];

// Seconds for one full atlas-height translation. Slow and calm, luxury pace.
const LOOP_DURATION_S = 90;

export function AtlasRail() {
  const [near, setNear] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Defer atlas loading until the section approaches the viewport, so it never
  // competes with the hero/LCP frame, but reliably loads before it is seen.
  // A generous rootMargin starts the fetch ~one viewport early.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" }
    );
    observer.observe(root);

    // Belt-and-suspenders: an IntersectionObserver never fires in a 0-height
    // viewport (some embedded/headless contexts) or if the rail is display:none
    // at mount. After the critical frame has had time to paint, flip `near` on
    // during idle so the ambient tapestry still loads for real users.
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idle =
      typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(() => setNear(true), { timeout: 3000 })
        : window.setTimeout(() => setNear(true), 2000);

    return () => {
      observer.disconnect();
      if (typeof win.requestIdleCallback === "function") {
        (win as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
    };
  }, []);

  // Once the primary copy is loaded, decode it before starting motion so the
  // first animation frame is paintable (no flash of a half-decoded image).
  useEffect(() => {
    if (!near) return;
    const img = imgRef.current;
    if (!img) return;
    let cancelled = false;
    const markDecoded = () => {
      if (!cancelled) setDecoded(true);
    };
    const decodeThenStart = () => {
      // img.decode() can hang in some environments; a short timeout guarantees
      // motion still starts once the bytes are loaded even if decode stalls.
      Promise.race([
        img.decode().catch(() => undefined),
        new Promise((resolve) => window.setTimeout(resolve, 400)),
      ]).then(markDecoded);
    };
    if (img.complete && img.naturalWidth > 0) {
      decodeThenStart();
    } else {
      img.addEventListener("load", decodeThenStart, { once: true });
    }
    return () => {
      cancelled = true;
    };
  }, [near]);

  const animate = decoded && !reducedMotion;

  function renderCopy(key: "a" | "b") {
    const isPrimary = key === "a";
    // Until the section is near, render no sources so nothing loads and the
    // hero/LCP frame is never contended. Once near, the browser picks the
    // right responsive/format variant from the <picture>.
    if (!near) {
      return (
        <picture key={key} className="atlas-rail__frame">
          <img
            ref={isPrimary ? imgRef : undefined}
            className="atlas-rail__img"
            alt=""
            width={LARGEST.width}
            height={LARGEST.height}
            draggable={false}
          />
        </picture>
      );
    }
    return (
      <picture key={key} className="atlas-rail__frame">
        {BREAKPOINTS.map((bp) => (
          <source
            key={`avif-${bp.width}`}
            type="image/avif"
            media={`(max-width: ${bp.width}px)`}
            srcSet={publicPath(bp.avif.path)}
          />
        ))}
        {BREAKPOINTS.map((bp) => (
          <source
            key={`webp-${bp.width}`}
            type="image/webp"
            media={`(max-width: ${bp.width}px)`}
            srcSet={publicPath(bp.webp.path)}
          />
        ))}
        <source type="image/avif" srcSet={publicPath(LARGEST.avif.path)} />
        <img
          ref={isPrimary ? imgRef : undefined}
          className="atlas-rail__img"
          src={publicPath(LARGEST.webp.path)}
          alt=""
          decoding="async"
          width={LARGEST.width}
          height={LARGEST.height}
          draggable={false}
        />
      </picture>
    );
  }

  return (
    <div className="atlas-rail" aria-hidden="true" ref={rootRef}>
      <div
        className={`atlas-rail__track${animate ? " atlas-rail__track--animate" : ""}`}
        style={animate ? { animationDuration: `${LOOP_DURATION_S}s` } : undefined}
      >
        {renderCopy("a")}
        {renderCopy("b")}
      </div>
    </div>
  );
}
