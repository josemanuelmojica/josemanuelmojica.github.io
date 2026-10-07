"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowDown, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/components/site-provider";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";
import { useInView } from "@/lib/use-in-view";

const FLOW =
  "Highland · Sloan Lake · Union Station · the South Platte · Washington Park · Clear Creek · Golden · the Flatirons · Boulder · Littleton · Cherry Creek · Berkeley · ";

const line = {
  hidden: { opacity: 0, y: 28 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const { reducedMotion, flyTo, setExploring } = useSite();

  const inView = useInView(scope, "-40% 0px -40% 0px");
  useEffect(() => { if (inView) flyTo("colorado"); }, [inView, flyTo]);

  // GSAP owns the contour drawing and the flowing text offset; nothing else touches them.
  useGSAP(() => {
    if (reducedMotion) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const contour = scope.current?.querySelector<SVGPathElement>("[data-contour]");
      const flow = scope.current?.querySelectorAll<SVGTextPathElement>("[data-flow]");
      if (contour) {
        gsap.fromTo(contour, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: "power2.out", delay: 0.3 });
      }
      if (flow?.length) {
        gsap.fromTo(flow, { attr: { startOffset: "0%" } }, {
          attr: { startOffset: "-38%" },
          ease: "none",
          scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    });
    return () => mm.revert();
  }, { scope, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section ref={scope} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-40" aria-labelledby="hero-title">
      {/* Soft paper wash so the headline stays legible over any map perspective. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_30%_45%,var(--paper)_35%,transparent_75%)] opacity-95" />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <motion.p className="eyebrow" initial="hidden" animate="shown" custom={0} variants={line}>
          Front Range · Colorado
        </motion.p>
        <h1 id="hero-title" className="mt-5 text-[clamp(3.2rem,9vw,8rem)] leading-[0.92] font-[450] tracking-[-0.04em] text-ink">
          <motion.span className="block" initial="hidden" animate="shown" custom={1} variants={line}>Be drawn</motion.span>
          <motion.span className="display-em block text-deep" initial="hidden" animate="shown" custom={2} variants={line}>to where you live.</motion.span>
        </h1>
        <motion.p className="mt-7 max-w-xl text-lg text-graphite" initial="hidden" animate="shown" custom={3} variants={line}>
          Editorial maps of the neighborhoods between Boulder and Littleton, drawn over live REColorado listings. Read the place first, then find the home inside it.
        </motion.p>
        <motion.div className="mt-9 flex flex-wrap gap-3" initial="hidden" animate="shown" custom={4} variants={line}>
          <Button asChild size="lg" className="h-12 rounded-xl px-6">
            <Link href="/search/"><Search aria-hidden="true" /> Search live listings</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 rounded-xl bg-paper/80 px-6" onClick={() => setExploring(true)}>
            <Compass aria-hidden="true" /> Explore the map
          </Button>
        </motion.div>
      </div>

      {/* Flowing text: place names riding a contour line, scrubbed by scroll. */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-6 h-[34vh] w-full text-blue"
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path id="hero-flow-path" d="M-40 250 C 220 150, 380 300, 640 210 S 1060 60, 1480 140" />
          <path id="hero-flow-path-2" d="M-40 286 C 240 190, 400 330, 660 248 S 1080 104, 1480 178" />
        </defs>
        <path data-contour d="M-40 250 C 220 150, 380 300, 640 210 S 1060 60, 1480 140" pathLength={1} strokeDasharray="1" fill="none" stroke="currentColor" strokeWidth={1} opacity={0.35} vectorEffect="non-scaling-stroke" />
        <use href="#hero-flow-path-2" fill="none" stroke="currentColor" strokeWidth={0.6} opacity={0.2} strokeDasharray="4 7" />
        <text className="fill-deep text-[19px] tracking-[0.06em]" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          <textPath data-flow href="#hero-flow-path" startOffset="0%">{FLOW.repeat(3)}</textPath>
        </text>
      </svg>

      <a href="#read-a-place" className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border bg-paper/90 px-4 py-2 text-xs tracking-[0.12em] text-graphite uppercase hover:text-ink">
        Scroll the story <ArrowDown className="size-3.5" aria-hidden="true" />
      </a>
    </section>
  );
}
