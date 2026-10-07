"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "./reveal";

const faqs = [
  {
    q: "Where do the listings come from?",
    a: "Live search results come from REColorado, the Denver-area MLS, through RealScout's official search tools. What appears depends on what the MLS shares at that moment.",
  },
  {
    q: "Are the maps real geography?",
    a: "Yes. Streets, water, and parks come from OpenStreetMap through OpenFreeMap. The ink, blueprint, and today perspectives are original drawings over that data. The dashed ink trail is decoration, never a route.",
  },
  {
    q: "What happens to what I type into a search?",
    a: "The search and home value forms are RealScout's own components. Anything you submit there goes to RealScout under its terms; this site does not store it.",
  },
  {
    q: "Can I turn the motion off?",
    a: "Yes. Use the round button at the bottom left or the menu. A reduced-motion setting on your device is honored automatically, and every section becomes a plain, stacked page.",
  },
  {
    q: "Which areas does the story cover?",
    a: "The story walks the Front Range: Boulder, Golden, Denver's Highland and Washington Park, and Littleton. The live search covers wherever REColorado listings are available.",
  },
];

/** Two-panel FAQ. Radix Tabs gives arrow-key navigation and tab/tabpanel roles. */
export function Questions() {
  const [value, setValue] = useState("0");
  return (
    <section id="questions" aria-labelledby="questions-title" className="relative px-3 py-24 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-paper/95 px-5 py-14 md:px-12">
        <Reveal className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 id="questions-title" className="mt-3 text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.035em]">
            Good <span className="display-em text-deep">questions.</span>
          </h2>
        </Reveal>

        <Tabs value={value} onValueChange={setValue} orientation="vertical" className="mt-10 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <TabsList className="h-auto w-full flex-col items-stretch gap-1 rounded-2xl bg-deep p-3 text-paper/70">
            <p className="px-3 pt-1 pb-2 text-xs tracking-[0.14em] text-paper/60 uppercase" aria-hidden="true">Questions</p>
            {faqs.map((faq, i) => (
              <TabsTrigger
                key={faq.q}
                value={String(i)}
                className="h-auto justify-start rounded-xl px-3 py-3 text-left text-sm leading-snug whitespace-normal text-paper/75 hover:text-paper focus-visible:outline-paper data-[state=active]:bg-paper/12 data-[state=active]:text-paper"
              >
                {faq.q}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="graph-paper relative min-h-[260px] rounded-2xl border bg-wash/50 p-6 md:p-8">
            {faqs.map((faq, i) => (
              <TabsContent key={faq.q} value={String(i)} className="outline-none">
                <AnimatePresence mode="wait">
                  {value === String(i) && (
                    <motion.div
                      key={faq.q}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="eyebrow">Answer</p>
                      <h3 className="mt-2 text-2xl tracking-tight">{faq.q}</h3>
                      <p className="mt-4 text-graphite">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
