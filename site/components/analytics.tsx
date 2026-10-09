"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track, type TrackedEvent } from "@/lib/analytics";

/**
 * Counts `data-track` clicks and tells Meta about in-app page changes. Google
 * counts those on its own (GA4 enhanced measurement follows browser history),
 * so it is not sent a second page view. The loader itself is in app/layout.tsx.
 */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    (window as Window & { fbq?: (...args: unknown[]) => void }).fbq?.("track", "PageView");
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (el) track(el.dataset.track as TrackedEvent, { location: pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
