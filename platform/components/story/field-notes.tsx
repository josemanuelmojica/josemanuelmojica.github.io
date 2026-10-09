"use client";

import { useRef } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/components/site-provider";
import { ENHANCED, gsap, useGSAP } from "@/lib/gsap";
import { fieldNotePlaces, places } from "@/lib/places";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const tints = ["#e5edf3", "#f3ead9", "#dfe9e1", "#ebe4f0", "#f1e1dc"];
const fan = { rotate: [-11, -5.5, 0, 5.5, 11], y: [46, 14, 0, 14, 46] };

function Sketch({ seed }: { seed: number }) {
  const offset = seed * 17;
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full text-deep" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.55}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M-10 ${24 + i * 20} C 50 ${10 + i * 20 + (offset % 13)}, 110 ${40 + i * 18 - (offset % 11)}, 210 ${18 + i * 21}`} />
        ))}
      </g>
      <circle cx={70 + (offset % 60)} cy={52 + (offset % 20)} r={5} fill="var(--blue)" />
      <circle cx={70 + (offset % 60)} cy={52 + (offset % 20)} r={13} fill="none" stroke="var(--blue)" />
    </svg>
  );
}

/** Fan-card layout: notes start stacked, then fan out across the map as you scroll. */
export function FieldNotes() {
  const scope = useRef<HTMLElement>(null);
  const { reducedMotion, flyTo, setExploring } = useSite();
  const wide = useMediaQuery(ENHANCED);
  const enhanced = wide && !reducedMotion;

  useGSAP(() => {
    if (!enhanced || !scope.current) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-note]", scope.current);
    const deck = scope.current.querySelector<HTMLElement>("[data-deck]");
    if (!deck) return;
    const center = deck.getBoundingClientRect().left + deck.offsetWidth / 2;
    gsap.set(cards, { rotate: (i) => fan.rotate[i], y: (i) => fan.y[i], transformOrigin: "50% 120%" });
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope.current.querySelector("[data-fan-stage]"),
        start: "top 8%",
        end: "+=110%",
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    }).from(cards, {
      x: (_i, card: HTMLElement) => center - (card.getBoundingClientRect().left + card.offsetWidth / 2),
      y: 0,
      rotate: (i) => (i - 2) * 2.5,
      duration: 1,
      stagger: 0.04,
    });
  }, { scope, dependencies: [enhanced], revertOnUpdate: true });

  return (
    <section ref={scope} id="field-notes" aria-labelledby="notes-title" className="relative overflow-x-clip">
      <div data-fan-stage className="px-5 py-20 md:px-10">
        <Reveal className="mx-auto max-w-2xl rounded-2xl bg-paper/90 p-6 text-center backdrop-blur">
          <p className="eyebrow">Field notes</p>
          <h2 id="notes-title" className="mt-3 text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.035em]">
            Five places <span className="display-em text-deep">worth a slow walk.</span>
          </h2>
        </Reveal>

        <ul
          data-deck
          className={cn(
            "mx-auto mt-14 max-w-6xl",
            enhanced ? "flex justify-center pb-16" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {fieldNotePlaces.map((id, i) => {
            const place = places[id];
            return (
              <li
                key={id}
                data-note
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border bg-paper shadow-[0_24px_60px_-30px_rgb(6_58_100_/_0.55)]",
                  enhanced && "-mx-2 w-[232px] shrink-0",
                )}
                style={{ zIndex: enhanced ? 10 - Math.abs(i - 2) : undefined }}
              >
                <div className="aspect-[5/3]" style={{ background: tints[i] }}>
                  <Sketch seed={i + 1} />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="eyebrow">{place.region}</p>
                  <h3 className="text-2xl tracking-tight">{place.name}</h3>
                  <p className="text-sm text-graphite">{place.note}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto self-start rounded-lg"
                    aria-label={`Show ${place.name} on the map`}
                    onClick={() => { flyTo(id); setExploring(true); }}
                  >
                    <MapPin aria-hidden="true" /> Show on map
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
