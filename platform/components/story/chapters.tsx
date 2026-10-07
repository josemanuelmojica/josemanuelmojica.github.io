"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/components/site-provider";
import { ENHANCED, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { places, type PlaceId } from "@/lib/places";
import { useMediaQuery } from "@/lib/use-media-query";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

interface Chapter {
  label: string;
  place: PlaceId;
  title: string;
  em: string;
  text: string;
  drawing: ReactNode;
  cta?: { href: string; label: string };
}

const BEATS = [0.12, 0.5, 0.88];
const chapterAt = (progress: number) => (progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2);

const chapters: Chapter[] = [
  {
    label: "Read the terrain",
    place: "denver",
    title: "Start wide.",
    em: "Water, ridgelines, the grid.",
    text: "Denver's street grid turns to follow the South Platte, and the foothills close almost every western view. Get that shape in your head before you look at a single house.",
    drawing: (
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path data-draw d="M40 330 C 120 280, 150 200, 230 170 S 340 90, 380 40" strokeWidth={7} opacity={0.25} pathLength={1} strokeDasharray="1" />
        {[80, 130, 180, 230, 280, 330].map((x) => <path key={x} data-draw d={`M${x} 60 L${x} 340`} strokeWidth={0.8} opacity={0.5} pathLength={1} strokeDasharray="1" />)}
        {[90, 140, 190, 240, 290].map((y) => <path key={y} data-draw d={`M40 ${y} L380 ${y}`} strokeWidth={0.8} opacity={0.5} pathLength={1} strokeDasharray="1" />)}
        <path data-draw d="M20 60 L70 30 L110 55 L160 20 L210 50" strokeWidth={1.4} pathLength={1} strokeDasharray="1" />
      </g>
    ),
  },
  {
    label: "Mark what matters",
    place: "highland",
    title: "Then mark",
    em: "what your week needs.",
    text: "Coffee, a commute, a park for the dog. Put your three anchors on the map and the right neighborhoods start to outline themselves.",
    drawing: (
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path data-draw d="M90 290 Q 150 200 210 210 T 320 110" strokeWidth={2.2} strokeDasharray="1" pathLength={1} />
        <path data-draw d="M90 290 Q 200 320 300 270" strokeWidth={1.2} strokeDasharray="1" pathLength={1} opacity={0.6} />
        {[[90, 290], [210, 210], [320, 110], [300, 270]].map(([x, y]) => (
          <g key={`${x}-${y}`} data-mark>
            <circle cx={x} cy={y} r={7} fill="currentColor" />
            <circle cx={x} cy={y} r={17} />
          </g>
        ))}
        <circle data-draw cx={215} cy={220} r={120} strokeWidth={0.8} strokeDasharray="1" pathLength={1} opacity={0.5} />
      </g>
    ),
  },
  {
    label: "Search live listings",
    place: "washington-park",
    title: "Now search",
    em: "inside the lines.",
    text: "Live REColorado listings, searched through RealScout, so the homes you tour already fit the map you drew.",
    cta: { href: "/search/", label: "Open the live search" },
    drawing: (
      <g>
        <rect x={50} y={60} width={320} height={44} rx={10} fill="var(--paper)" stroke="currentColor" strokeWidth={1} />
        <rect x={66} y={77} width={150} height={10} rx={5} fill="currentColor" opacity={0.25} />
        <rect x={300} y={70} width={58} height={24} rx={7} fill="var(--blue)" />
        {[0, 1, 2].map((i) => (
          <g key={i} data-mark transform={`translate(${50 + i * 110} 130)`}>
            <rect width={100} height={150} rx={10} fill="var(--paper)" stroke="currentColor" strokeWidth={0.8} />
            <rect x={10} y={10} width={80} height={70} rx={6} fill="currentColor" opacity={0.12} />
            <rect x={10} y={92} width={60} height={8} rx={4} fill="currentColor" opacity={0.35} />
            <rect x={10} y={108} width={44} height={8} rx={4} fill="currentColor" opacity={0.2} />
          </g>
        ))}
      </g>
    ),
  },
];

export function Chapters() {
  const scope = useRef<HTMLElement>(null);
  const { reducedMotion, flyTo } = useSite();
  const wide = useMediaQuery(ENHANCED);
  const enhanced = wide && !reducedMotion;
  const [active, setActive] = useState(0);
  const trigger = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const inView = useInView(scope, "-45% 0px -45% 0px");

  // Pinned, scrubbed version: one timeline crossfades copy and cards and draws each sketch.
  useGSAP(() => {
    if (!enhanced) return;
    const q = gsap.utils.selector(scope);
    const copies = q("[data-copy]");
    const cards = q("[data-card]");
    gsap.set(copies.slice(1), { autoAlpha: 0, y: 24 });
    gsap.set(cards.slice(1), { autoAlpha: 0, y: 40, rotate: 2 });
    // The first sketch is already drawn when the stage pins; later ones draw in.
    cards.slice(1).forEach((card) => {
      gsap.set(card.querySelectorAll("[data-draw]"), { strokeDashoffset: 1 });
      gsap.set(card.querySelectorAll("[data-mark]"), { autoAlpha: 0 });
    });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: q("[data-chapter-stage]")[0],
        start: "top top",
        end: "+=260%",
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = chapterAt(self.progress);
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        },
      },
    });
    trigger.current = timeline.scrollTrigger ?? null;

    cards.forEach((card, i) => {
      const at = i * 1.2;
      const draw = (card as HTMLElement).querySelectorAll("[data-draw]");
      const marks = (card as HTMLElement).querySelectorAll("[data-mark]");
      if (i > 0) {
        timeline
          .to(copies[i - 1], { autoAlpha: 0, y: -24, duration: 0.3 }, at - 0.3)
          .to(cards[i - 1], { autoAlpha: 0, y: -40, rotate: -2, duration: 0.3 }, at - 0.3)
          .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.3 }, at - 0.1)
          .to(card, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.3 }, at - 0.1);
      }
      if (i === 0) return;
      timeline
        .to(draw, { strokeDashoffset: 0, duration: 0.6, stagger: 0.03 }, at)
        .to(marks, { autoAlpha: 1, duration: 0.15, stagger: 0.08 }, at + 0.3);
    });
    timeline.to({}, { duration: 0.4 });

    return () => { trigger.current = null; };
  }, { scope, dependencies: [enhanced], revertOnUpdate: true });

  // While the section is on screen, the active chapter steers the shared background map.
  useEffect(() => {
    if (inView) flyTo(chapters[active].place);
  }, [active, inView, flyTo]);

  // Stacked (reduced-motion or small screen) version: the chapter in view steers the map.
  useEffect(() => {
    if (enhanced || !scope.current) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.index));
    }, { rootMargin: "-25% 0px -40% 0px", threshold: [0, 0.3, 0.6] });
    scope.current.querySelectorAll("[data-stacked]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enhanced]);

  function seek(index: number) {
    const st = trigger.current;
    if (!enhanced || !st) {
      setActive(index);
      scope.current?.querySelector(`[data-stacked][data-index="${index}"]`)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    window.scrollTo({ top: st.start + (st.end - st.start) * BEATS[index], behavior: "smooth" });
  }

  const index = (
    <nav aria-label="Story chapters" className="w-full">
      <ol className="space-y-1">
        {chapters.map((chapter, i) => (
          <li key={chapter.label}>
            <button
              type="button"
              onClick={() => seek(i)}
              aria-current={active === i ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                active === i ? "bg-paper text-ink shadow-sm" : "text-graphite hover:text-ink",
              )}
            >
              <span className={cn("h-5 w-0.5 rounded-full transition-colors", active === i ? "bg-blue" : "bg-rule")} aria-hidden="true" />
              <span className="tabular-nums text-xs text-graphite">0{i + 1}</span>
              {chapter.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );

  const card = (chapter: Chapter, i: number, extra?: string) => (
    <figure
      data-card
      className={cn("w-full overflow-hidden rounded-3xl border bg-paper shadow-[0_30px_80px_-30px_rgb(6_58_100_/_0.45)]", extra)}
      aria-hidden={enhanced && active !== i ? true : undefined}
    >
      <div className="graph-paper relative aspect-[4/3.4]">
        <svg viewBox="0 0 420 360" className="absolute inset-0 h-full w-full text-deep" aria-hidden="true" focusable="false">{chapter.drawing}</svg>
      </div>
      <figcaption className="flex items-center justify-between border-t px-5 py-3 text-xs text-graphite">
        <span>{places[chapter.place].name} · {places[chapter.place].region}</span>
        <span className="tabular-nums">0{i + 1} / 03</span>
      </figcaption>
    </figure>
  );

  const copy = (chapter: Chapter, i: number) => (
    <>
      <p className="eyebrow">0{i + 1} · {chapter.label}</p>
      <h3 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] leading-[1] tracking-[-0.03em]">
        {chapter.title} <span className="display-em block text-deep">{chapter.em}</span>
      </h3>
      <p className="mt-4 text-graphite">{chapter.text}</p>
      {chapter.cta && (
        <Button asChild className="mt-6 rounded-xl">
          <Link href={chapter.cta.href}>{chapter.cta.label} <ArrowUpRight aria-hidden="true" /></Link>
        </Button>
      )}
    </>
  );

  return (
    <section ref={scope} id="chapters" aria-labelledby="chapters-title" className="relative">
      <h2 id="chapters-title" className="sr-only">Three ways into a neighborhood</h2>
      {/* The pinned element stays mounted in both modes so React never removes a node GSAP has re-parented. */}
      <div data-chapter-stage className={cn("relative", enhanced && "flex h-[100svh] items-center")}>
        {enhanced ? (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[200px_minmax(0,1fr)_minmax(0,300px)] items-center gap-10 px-10">
            <div className="rounded-2xl bg-paper/80 p-2 backdrop-blur">{index}</div>
            <div className="relative mx-auto aspect-[4/4.1] w-full max-w-md">
              {chapters.map((chapter, i) => (
                <div key={chapter.label} className="absolute inset-0">{card(chapter, i)}</div>
              ))}
            </div>
            <div className="relative min-h-[320px]">
              {chapters.map((chapter, i) => (
                <article
                  key={chapter.label}
                  data-copy
                  className="absolute inset-x-0 top-0 rounded-2xl bg-paper/90 p-5 backdrop-blur"
                  aria-hidden={active !== i ? true : undefined}
                  inert={active !== i}
                >
                  {copy(chapter, i)}
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-16 px-5 py-20 md:px-10">
            <div className="sticky top-24 z-10 rounded-2xl bg-paper/90 p-2 backdrop-blur md:max-w-xs">{index}</div>
            {chapters.map((chapter, i) => (
              <article key={chapter.label} data-stacked data-index={i} className="grid items-center gap-8 md:grid-cols-2">
                {card(chapter, i)}
                <div className="rounded-2xl bg-paper/90 p-5">{copy(chapter, i)}</div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
