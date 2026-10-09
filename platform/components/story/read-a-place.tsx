"use client";

import { useRef } from "react";
import { useSite } from "@/components/site-provider";
import { ENHANCED, gsap, useGSAP } from "@/lib/gsap";
import { Reveal } from "./reveal";

const FLOW = "the walk to coffee · the light rail stop · a view of the foothills · the park loop · the quiet block · the school run · ";

// Deterministic contour lines for the drawing (no randomness between renders).
const contours = Array.from({ length: 9 }, (_, i) => {
  const y = 70 + i * 34;
  const a = 26 + (i % 3) * 9;
  return `M-20 ${y} C 160 ${y - a}, 300 ${y + a}, 470 ${y - 6} S 760 ${y - a - 10}, 920 ${y + 4}`;
});

export function ReadAPlace() {
  const scope = useRef<HTMLElement>(null);
  const { reducedMotion } = useSite();

  // Expanding frame: the listing card yields while the neighborhood card grows to fill the panel.
  useGSAP(() => {
    if (reducedMotion) return;
    const mm = gsap.matchMedia();
    mm.add(ENHANCED, () => {
      const q = gsap.utils.selector(scope);
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q("[data-stage]")[0],
          start: "top 12%",
          end: "+=140%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to(q("[data-listing]"), { flexBasis: "0%", opacity: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0, duration: 1 }, 0)
        .to(q("[data-place-card]"), { height: "64vh", duration: 1 }, 0)
        .fromTo(q("[data-contours] path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.04, duration: 0.6 }, 0)
        .fromTo(q("[data-flow-card]"), { attr: { startOffset: "0%" } }, { attr: { startOffset: "-42%" }, duration: 1.2 }, 0)
        .fromTo(q("[data-pin]"), { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.25 }, 0.55)
        .fromTo(q("[data-place-caption]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, 0.8);
    });
    return () => mm.revert();
  }, { scope, dependencies: [reducedMotion], revertOnUpdate: true });

  return (
    <section ref={scope} id="read-a-place" aria-labelledby="read-title" className="relative px-3 py-10 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-deep px-5 pt-14 pb-6 text-paper md:px-10 md:pt-20 md:pb-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow !text-paper/70">One address, or the whole picture</p>
          <h2 id="read-title" className="mt-4 text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.98] tracking-[-0.035em]">
            Read a place <span className="display-em">before you tour it.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-paper/75">
            A listing tells you about one house. The blocks around it tell you how a day there actually goes.
          </p>
        </Reveal>

        <div data-stage className="mt-12 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
          <article data-listing className="flex shrink-0 basis-[30%] flex-col justify-between overflow-hidden rounded-2xl border border-paper/20 bg-paper/5 p-6 md:mr-4">
            <div>
              <p className="eyebrow !text-paper/60">Listing view</p>
              <p className="mt-2 text-4xl tracking-tight">One address</p>
            </div>
            <dl className="mt-10 space-y-2 text-sm text-paper/70">
              <div className="flex justify-between gap-6 border-t border-paper/15 pt-2"><dt>Beds / baths</dt><dd>3 / 2</dd></div>
              <div className="flex justify-between gap-6 border-t border-paper/15 pt-2"><dt>Square feet</dt><dd>1,850</dd></div>
              <div className="flex justify-between gap-6 border-t border-paper/15 pt-2"><dt>Lot</dt><dd>0.14 ac</dd></div>
            </dl>
            <p className="mt-6 text-xs text-paper/50">Illustrative card, not a real listing.</p>
          </article>

          <article
            data-place-card
            className="relative h-[52vh] min-h-[340px] flex-1 overflow-hidden rounded-2xl bg-paper text-ink"
            aria-labelledby="place-card-title"
          >
            <div className="graph-paper absolute inset-0" aria-hidden="true" />
            <svg className="absolute inset-0 h-full w-full text-blue" viewBox="0 0 900 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
              <defs>
                <path id="place-flow" d="M-30 330 C 180 250, 330 360, 520 280 S 820 150, 960 190" />
              </defs>
              <g data-contours fill="none" stroke="currentColor" strokeWidth={0.9} opacity={0.45}>
                {contours.map((d) => <path key={d} d={d} pathLength={1} strokeDasharray="1" />)}
              </g>
              <path d="M-20 360 C 200 300, 280 210, 470 180 S 780 70, 920 40" fill="none" stroke="var(--blue)" strokeWidth={6} opacity={0.18} />
              <g fill="var(--deep)">
                <g data-pin><circle cx="300" cy="230" r="7" /><circle cx="300" cy="230" r="16" fill="none" stroke="var(--deep)" /></g>
                <g data-pin><circle cx="520" cy="170" r="7" /><circle cx="520" cy="170" r="16" fill="none" stroke="var(--deep)" /></g>
                <g data-pin><circle cx="690" cy="250" r="7" /><circle cx="690" cy="250" r="16" fill="none" stroke="var(--deep)" /></g>
              </g>
              <text className="fill-deep text-[17px]" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                <textPath data-flow-card href="#place-flow" startOffset="0%">{FLOW.repeat(3)}</textPath>
              </text>
            </svg>
            <div className="absolute top-5 left-5 rounded-xl bg-paper/90 px-4 py-3 shadow-sm">
              <p className="eyebrow">Neighborhood view</p>
              <p id="place-card-title" className="mt-1 text-3xl tracking-tight">
                The <span className="display-em">whole</span> picture
              </p>
            </div>
            <p data-place-caption className="absolute right-5 bottom-5 max-w-xs rounded-xl bg-paper/90 px-4 py-3 text-sm text-graphite shadow-sm">
              Mark the three places your week depends on. The right home is usually the one between them.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
