"use client";

import { useRef } from "react";
import { useSite } from "@/components/site-provider";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

const lines = [
  { lead: "Search live listings", rest: "by map, price, beds, and baths." },
  { lead: "Save a search", rest: "and hear when a new home fits it." },
  { lead: "Ask for a home value", rest: "on a place you already own." },
  { lead: "Keep the map", rest: "next to every listing you open." },
];

/** Flowing-type list: each line inks in as it crosses the reading line. */
export function HighlightList() {
  const scope = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  useGSAP(() => {
    if (reducedMotion) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>("[data-line]", scope.current).forEach((line) => {
        gsap.fromTo(line, { opacity: 0.18, x: -18 }, {
          opacity: 1, x: 0, ease: "none",
          scrollTrigger: { trigger: line, start: "top 80%", end: "top 50%", scrub: 0.5 },
        });
      });
    });
    return () => mm.revert();
  }, { scope, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section ref={scope} aria-labelledby="tools-title" className="relative px-3 py-24 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-paper/95 px-6 py-16 shadow-[0_20px_60px_-40px_rgb(6_58_100_/_0.5)] md:px-14">
        <p className="eyebrow">Live REColorado search, through RealScout</p>
        <h2 id="tools-title" className="sr-only">What the live search can do</h2>
        <ul className="mt-8 space-y-6">
          {lines.map((line) => (
            <li key={line.lead} data-line className="text-[clamp(1.7rem,3.6vw,3rem)] leading-[1.08] tracking-[-0.03em]">
              {line.lead} <span className="display-em text-deep">{line.rest}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
