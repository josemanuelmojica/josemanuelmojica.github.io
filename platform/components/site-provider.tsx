"use client";

import { MotionConfig } from "framer-motion";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import type { Perspective } from "@/lib/map-style";
import { places, type Place, type PlaceId } from "@/lib/places";

interface SiteState {
  perspective: Perspective;
  setPerspective: (value: Perspective) => void;
  place: Place;
  flyTo: (id: PlaceId) => void;
  exploring: boolean;
  setExploring: (value: boolean) => void;
  /** System preference OR the visitor's own "reduce motion" choice. */
  reducedMotion: boolean;
  systemReducedMotion: boolean;
  motionOverride: boolean;
  setMotionOverride: (value: boolean) => void;
}

const SiteContext = createContext<SiteState | null>(null);
const STORAGE_KEY = "ark-text:reduce-motion";

export function SiteProvider({ children }: { children: ReactNode }) {
  const [perspective, setPerspective] = useState<Perspective>("ink");
  const [placeId, setPlaceId] = useState<PlaceId>("colorado");
  const [exploring, setExploring] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [motionOverride, setMotionOverrideState] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    try {
      setMotionOverrideState(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage can be unavailable (private mode); the default is fine.
    }
    return () => media.removeEventListener("change", update);
  }, []);

  const setMotionOverride = useCallback((value: boolean) => {
    setMotionOverrideState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // Preference simply will not persist.
    }
  }, []);

  const reducedMotion = systemReducedMotion || motionOverride;

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  const flyTo = useCallback((id: PlaceId) => setPlaceId(id), []);

  const value = useMemo<SiteState>(() => ({
    perspective, setPerspective,
    place: places[placeId], flyTo,
    exploring, setExploring,
    reducedMotion, systemReducedMotion, motionOverride, setMotionOverride,
  }), [perspective, placeId, flyTo, exploring, reducedMotion, systemReducedMotion, motionOverride, setMotionOverride]);

  return (
    <SiteContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>{children}</MotionConfig>
    </SiteContext.Provider>
  );
}

export function useSite(): SiteState {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside <SiteProvider>");
  return context;
}
