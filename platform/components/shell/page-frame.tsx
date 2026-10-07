"use client";

import type { ReactNode } from "react";
import { useSite } from "@/components/site-provider";

/** Page content sits above the map; while exploring it steps aside entirely. */
export function PageFrame({ children }: { children: ReactNode }) {
  const { exploring } = useSite();
  return (
    <div
      className="relative z-10 transition-opacity duration-500"
      style={{ opacity: exploring ? 0 : 1, pointerEvents: exploring ? "none" : undefined }}
      inert={exploring}
      aria-hidden={exploring || undefined}
    >
      {children}
    </div>
  );
}
