"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealScoutWidget, type WidgetKind } from "./realscout-widget";

const modes: { value: WidgetKind; label: string; hint: string }[] = [
  { value: "simple", label: "Quick search", hint: "A city, ZIP, or neighborhood." },
  { value: "advanced", label: "Advanced search", hint: "Price, beds, baths, and property type." },
  { value: "your-listings", label: "Featured listings", hint: "Active, in-contract, and recently sold." },
];

/**
 * Intake module for live REColorado data. Each tab mounts its RealScout
 * component only when selected, so the vendor script loads on demand.
 */
export function IntakeModule() {
  const [mode, setMode] = useState<WidgetKind>("simple");
  return (
    <section aria-labelledby="intake-title" className="rounded-[2rem] border bg-paper p-5 shadow-[0_30px_80px_-40px_rgb(6_58_100_/_0.5)] md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Live data · REColorado via RealScout</p>
          <h2 id="intake-title" className="mt-2 text-3xl tracking-tight md:text-4xl">
            Search <span className="display-em text-deep">the live market.</span>
          </h2>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as WidgetKind)} className="mt-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-wash p-1 md:w-fit">
          {modes.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="relative h-10 flex-none rounded-lg px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              {mode === item.value && (
                <motion.span layoutId="intake-tab" className="absolute inset-0 rounded-lg bg-paper shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 36 }} aria-hidden="true" />
              )}
              <span className="relative">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {modes.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-5 space-y-3">
            <p className="text-sm text-graphite">{item.hint}</p>
            <RealScoutWidget kind={item.value} label={`${item.label}: RealScout search`} />
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-6 border-t pt-4 text-xs text-graphite">
        Personal project powered by RealScout. Listing availability depends on the connected MLS. Anything you submit in these forms goes to RealScout.
      </p>
    </section>
  );
}
