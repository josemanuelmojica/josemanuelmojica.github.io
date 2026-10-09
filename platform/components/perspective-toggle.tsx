"use client";

import { motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSite } from "@/components/site-provider";
import { perspectives, type Perspective } from "@/lib/map-style";
import { cn } from "@/lib/utils";

/**
 * Map perspective switch. Radix ToggleGroup supplies the radio-group roles,
 * roving focus with arrow keys, and Enter/Space activation; Framer slides the
 * shared highlight between options.
 */
export function PerspectiveToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { perspective, setPerspective } = useSite();
  return (
    <ToggleGroup
      type="single"
      value={perspective}
      onValueChange={(value) => { if (value) setPerspective(value as Perspective); }}
      aria-label="Map perspective"
      className={cn("relative rounded-xl border bg-paper/90 p-1", className)}
    >
      {perspectives.map((option) => {
        const active = option.id === perspective;
        return (
          <ToggleGroupItem
            key={option.id}
            value={option.id}
            aria-label={option.description}
            title={option.description}
            className={cn(
              "relative h-9 rounded-lg px-3 text-xs font-medium tracking-wide text-graphite hover:bg-transparent hover:text-ink data-[state=on]:bg-transparent data-[state=on]:text-paper",
              "data-[spacing=0]:first:rounded-lg data-[spacing=0]:last:rounded-lg data-[spacing=0]:rounded-lg",
              compact && "h-8 px-2.5",
            )}
          >
            {active && (
              <motion.span
                layoutId={compact ? "perspective-pill-compact" : "perspective-pill"}
                className="absolute inset-0 -z-0 rounded-lg bg-deep"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
