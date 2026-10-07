"use client";

import { useEffect } from "react";
import { useSite } from "@/components/site-provider";
import type { PlaceId } from "@/lib/places";

/** Moves the shared background map when a route mounts. */
export function CameraStop({ place }: { place: PlaceId }) {
  const { flyTo } = useSite();
  useEffect(() => { flyTo(place); }, [flyTo, place]);
  return null;
}
