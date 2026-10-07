"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useSite } from "@/components/site-provider";

/** The persistent dot from the storyboard, repurposed as a motion switch. */
export function MotionDock() {
  const { reducedMotion, systemReducedMotion, motionOverride, setMotionOverride, exploring } = useSite();
  if (exploring || systemReducedMotion) return null;
  return (
    <div className="fixed bottom-5 left-5 z-40">
      <button
        type="button"
        onClick={() => setMotionOverride(!motionOverride)}
        aria-pressed={reducedMotion}
        aria-label={reducedMotion ? "Turn motion back on" : "Reduce motion"}
        title={reducedMotion ? "Turn motion back on" : "Reduce motion"}
        className="group relative grid size-12 place-items-center rounded-full border bg-paper/95 text-deep shadow-lg backdrop-blur"
      >
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-blue"
            animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {reducedMotion ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
