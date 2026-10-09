"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { AttributionControl, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { createMapStyle, type Perspective } from "@/lib/map-style";
import type { Place } from "@/lib/places";

export type MapStatus = "loading" | "ready" | "unavailable";

export interface AtlasMapProps {
  place: Place;
  perspective: Perspective;
  interactive: boolean;
  reducedMotion: boolean;
  recenterSignal: number;
  onStatus: (status: MapStatus) => void;
}

/**
 * The WebGL map itself. Loaded client-only (see background-map.tsx) so no
 * MapLibre code runs during static export.
 */
export default function AtlasMap({
  place, perspective, interactive, reducedMotion, recenterSignal, onStatus,
}: AtlasMapProps) {
  const mapRef = useRef<MapRef>(null);
  const ready = useRef(false);
  const mapStyle = useMemo(() => createMapStyle(perspective), [perspective]);
  const initialView = useRef({ longitude: place.center[0], latitude: place.center[1], zoom: place.zoom });

  const markReady = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (ready.current || !map || !map.isStyleLoaded()) return;
    if (!map.queryRenderedFeatures().some((feature) => feature.source === "openmaptiles")) return;
    ready.current = true;
    onStatus("ready");
  }, [onStatus]);

  // If tiles never arrive (blocked network, failed TileJSON), show the outline fallback.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!ready.current) onStatus("unavailable");
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [onStatus]);

  // Camera stops are driven by the story; ease between them unless motion is reduced.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready.current) return;
    const target = { center: place.center, zoom: place.zoom, bearing: 0, pitch: 0 };
    map.stop();
    if (reducedMotion) map.jumpTo(target);
    else map.flyTo({ ...target, duration: 1800, curve: 1.3, essential: false });
  }, [place, reducedMotion, recenterSignal]);

  return (
    <Map
      ref={mapRef}
      initialViewState={initialView.current}
      mapStyle={mapStyle}
      style={{ position: "absolute", inset: 0 }}
      minZoom={3}
      maxZoom={17}
      attributionControl={false}
      renderWorldCopies={false}
      // Handlers stay off while the page scrolls over the map; "Explore" turns them on.
      dragPan={interactive}
      scrollZoom={interactive}
      doubleClickZoom={interactive}
      touchZoomRotate={interactive}
      keyboard={interactive}
      dragRotate={false}
      touchPitch={false}
      onLoad={(event) => {
        const canvas = event.target.getCanvas();
        canvas.setAttribute("aria-label", `Map of ${place.name}. Use arrow keys to pan and plus or minus to zoom.`);
        event.target.jumpTo({ center: place.center, zoom: place.zoom });
        markReady();
      }}
      // MapLibre can fire `load` even when the tile source failed, so readiness
      // means real OpenFreeMap features have reached the canvas.
      onSourceData={(event) => {
        if (event.sourceId === "openmaptiles" && event.tile) markReady();
      }}
      onIdle={markReady}
      onError={() => {
        if (!ready.current) onStatus("unavailable");
      }}
    >
      {interactive && <NavigationControl position="bottom-right" showCompass={false} visualizePitch={false} />}
      <AttributionControl position="bottom-right" compact />
    </Map>
  );
}
