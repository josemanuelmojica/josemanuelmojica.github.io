"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Compass, MapPin, Pause, Play } from "lucide-react";
import { SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PerspectiveToggle } from "@/components/perspective-toggle";
import { useSite } from "@/components/site-provider";
import { fieldNotePlaces, places } from "@/lib/places";
import { siteConfig } from "@/lib/config";
import { assetPath } from "@/lib/asset-path";

const routes = [
  { href: "/", label: "The story", hint: "Scroll the Front Range" },
  { href: "/search/", label: "Live listings", hint: "REColorado search via RealScout" },
  { href: "/home-value/", label: "Home value", hint: "Request a home value report" },
];

const sections = [
  { href: "/#read-a-place", label: "Read a place" },
  { href: "/#chapters", label: "Three ways in" },
  { href: "/#field-notes", label: "Field notes" },
  { href: "/#questions", label: "Good questions" },
];

const list = { hidden: {}, shown: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } };
const item = { hidden: { opacity: 0, x: -12 }, shown: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } } };

/** Radix Dialog-based sidebar: focus trap, Escape to close, labelled dialog role. */
export function SiteSidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const { flyTo, setExploring, reducedMotion, systemReducedMotion, motionOverride, setMotionOverride } = useSite();

  return (
    <SheetContent side="left" className="w-[88vw] gap-0 overflow-y-auto bg-paper p-0 sm:max-w-sm">
      <SheetHeader className="gap-3 border-b p-5 pr-12">
        <span className="wordmark-crop w-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath("/brand/ark-and-text-360w.webp")} alt="" width={360} height={189} />
        </span>
        <SheetTitle className="sr-only">Site navigation</SheetTitle>
        <SheetDescription className="text-sm text-graphite">{siteConfig.tagline}</SheetDescription>
      </SheetHeader>

      <motion.nav aria-label="Site" className="p-3" variants={list} initial={reducedMotion ? false : "hidden"} animate="shown">
        <ul className="space-y-1">
          {routes.map((route) => (
            <motion.li key={route.href} variants={item}>
              <SheetClose asChild>
                <Link
                  href={route.href}
                  onClick={onNavigate}
                  aria-current={pathname === route.href ? "page" : undefined}
                  className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-wash aria-[current=page]:bg-wash"
                >
                  <span>
                    <span className="block text-lg leading-tight">{route.label}</span>
                    <span className="block text-xs text-graphite">{route.hint}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-graphite transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </SheetClose>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      <Separator />
      <nav aria-label="On the story page" className="p-5">
        <p className="eyebrow mb-3">On the story</p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {sections.map((section) => (
            <li key={section.href}>
              <SheetClose asChild>
                <Link href={section.href} onClick={onNavigate} className="block rounded-lg border px-3 py-2 hover:border-blue hover:text-blue">
                  {section.label}
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />
      <section aria-labelledby="sidebar-map" className="space-y-4 p-5">
        <h2 id="sidebar-map" className="eyebrow">Map</h2>
        <PerspectiveToggle />
        <ul className="flex flex-wrap gap-2" aria-label="Fly the map to a place">
          {fieldNotePlaces.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => flyTo(id)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs hover:border-blue hover:text-blue"
              >
                <MapPin className="size-3" aria-hidden="true" /> {places[id].name}
              </button>
            </li>
          ))}
        </ul>
        <SheetClose asChild>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setExploring(true)}>
            <Compass aria-hidden="true" /> Explore the map
          </Button>
        </SheetClose>
      </section>

      <Separator />
      <section aria-labelledby="sidebar-motion" className="space-y-3 p-5">
        <h2 id="sidebar-motion" className="eyebrow">Motion</h2>
        <Button
          variant="ghost"
          className="w-full justify-start rounded-xl border"
          aria-pressed={reducedMotion}
          disabled={systemReducedMotion}
          onClick={() => setMotionOverride(!motionOverride)}
        >
          {reducedMotion ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {systemReducedMotion ? "Reduced by your system setting" : reducedMotion ? "Turn motion back on" : "Reduce motion"}
        </Button>
        <p className="text-xs text-graphite">Reduced motion removes pinning, scrubbed scenes, and the ink trail. Every section stays readable as a stacked page.</p>
      </section>
    </SheetContent>
  );
}
