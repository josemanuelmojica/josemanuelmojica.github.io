"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Compass, Menu, Search } from "lucide-react";
import { useSite } from "@/components/site-provider";
import { PerspectiveToggle } from "@/components/perspective-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { navigationScrollStep, type NavigationScrollState } from "@/lib/navigation-motion";
import { assetPath } from "@/lib/asset-path";
import { SiteSidebar } from "./site-sidebar";

/**
 * Floating header. Framer owns its travel: it slides away while reading
 * downward and returns on any upward scroll, keyboard focus, or open menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { reducedMotion, exploring, setExploring } = useSite();
  const [hidden, setHidden] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reducedMotion) { setHidden(false); return; }
    let frame = 0;
    let state: NavigationScrollState = { y: window.scrollY, direction: 0, travel: 0, hidden: false };
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => {
      frame = 0;
      state = navigationScrollStep(state, window.scrollY, window.innerHeight * 0.6, coarse.matches);
      setHidden(state.hidden);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    setHidden(false);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); };
  }, [pathname, reducedMotion]);

  const tucked = hidden && !focusInside && !menuOpen && !exploring;

  return (
    <motion.header
      ref={header}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
      initial={reducedMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: tucked ? "-120%" : "0%", opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      onFocusCapture={(event) => setFocusInside((event.target as HTMLElement).matches(":focus-visible"))}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border bg-paper/90 p-1.5 pl-2 shadow-[0_8px_30px_rgb(23_40_51_/_0.08)] backdrop-blur-md">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Open navigation menu">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SiteSidebar onNavigate={() => setMenuOpen(false)} />
        </Sheet>

        <Link href="/" className="wordmark-crop w-[112px] shrink-0 rounded-md md:w-[132px]" aria-label="Arχ & Teχt home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath("/brand/ark-and-text-360w.webp")} alt="" width={360} height={189} />
        </Link>

        <nav aria-label="Primary" className="ml-3 hidden items-center gap-1 lg:flex">
          {[
            ["/", "The story"],
            ["/search/", "Live listings"],
            ["/home-value/", "Home value"],
          ].map(([href, label]) => {
            const current = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className="relative rounded-lg px-3 py-2 text-sm text-graphite transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {current && (
                  <motion.span layoutId="nav-current" className="absolute inset-0 rounded-lg bg-wash" aria-hidden="true" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PerspectiveToggle className="hidden md:flex" />
          <Button
            variant="outline"
            className="hidden rounded-xl sm:inline-flex"
            aria-pressed={exploring}
            onClick={() => setExploring(!exploring)}
          >
            <Compass aria-hidden="true" /> {exploring ? "Back to story" : "Explore map"}
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/search/">
              <Search aria-hidden="true" /> <span className="hidden sm:inline">Search homes</span><span className="sm:hidden">Search</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
