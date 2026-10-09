"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Focus, X } from "lucide-react";
import { useSite } from "@/components/site-provider";
import { PerspectiveToggle } from "@/components/perspective-toggle";
import { Button } from "@/components/ui/button";
import { InkTrail } from "./ink-trail";
import type { MapStatus } from "./atlas-map";
import { assetPath } from "@/lib/asset-path";

const AtlasMap = dynamic(() => import("./atlas-map"), { ssr: false });

class MapBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Full-screen map field behind every route. It stays mounted across
 * navigation so camera moves read as one continuous drawing.
 */
export function BackgroundMap() {
  const { place, perspective, exploring, setExploring, reducedMotion } = useSite();
  const [status, setStatus] = useState<MapStatus>("loading");
  const [recenter, setRecenter] = useState(0);
  const doneButton = useRef<HTMLButtonElement>(null);
  const onStatus = useCallback((next: MapStatus) => setStatus(next), []);

  useEffect(() => {
    if (!exploring) return;
    // Remember where focus came from so leaving the map returns the visitor there.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    doneButton.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExploring(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      requestAnimationFrame(() => opener?.isConnected && opener.focus({ preventScroll: true }));
    };
  }, [exploring, setExploring]);

  const blueprint = perspective === "blueprint";

  return (
    <>
      <div
        className="fixed inset-0 z-0 transition-colors duration-700"
        style={{ background: blueprint ? "var(--deep)" : "var(--paper)" }}
        data-map-status={status}
        data-perspective={perspective}
        role="region"
        aria-label={`Background map: ${place.name}, ${place.region}`}
        inert={!exploring}
      >
        <MapBoundary onFail={() => setStatus("unavailable")}>
          <AtlasMap
            place={place}
            perspective={perspective}
            interactive={exploring}
            reducedMotion={reducedMotion}
            recenterSignal={recenter}
            onStatus={onStatus}
          />
        </MapBoundary>

        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/maps/national-outline.svg")}
              alt=""
              className={`h-full max-h-[78vh] w-full object-contain transition-opacity duration-700 ${blueprint ? "opacity-30 invert" : "opacity-70"}`}
            />
          </div>
        )}

        {blueprint && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#c9e6ea 1px, transparent 1px), linear-gradient(90deg, #c9e6ea 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        )}

        <span className="pointer-events-none absolute bottom-3 left-20 hidden text-[11px] tracking-[0.12em] uppercase text-graphite/80 md:block" aria-hidden="true">
          {status === "unavailable" ? "National outline · Natural Earth" : `${place.name} · ${place.region}`}
        </span>
      </div>

      <InkTrail active={!reducedMotion && !exploring} />

      <AnimatePresence>
        {exploring && (
          <motion.div
            key="explore-toolbar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            <div
              role="toolbar"
              aria-label="Map exploration"
              className="flex flex-wrap items-center gap-2 rounded-2xl border bg-paper/95 p-2 shadow-lg backdrop-blur"
            >
              <Button ref={doneButton} onClick={() => setExploring(false)} className="rounded-xl">
                <X aria-hidden="true" /> Done exploring
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setRecenter((n) => n + 1)} aria-label={`Recenter on ${place.name}`}>
                <Focus aria-hidden="true" /> Recenter
              </Button>
              <PerspectiveToggle compact />
              <p className="px-2 text-xs text-graphite" role="status">
                {status === "ready"
                  ? "Drag or use arrow keys to pan. Escape returns to the story."
                  : "Detailed map unavailable here. Escape returns to the story."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
