import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:px-10">
        <p className="text-4xl leading-[1.05] tracking-tight md:text-6xl">
          Be drawn <br />
          <span className="display-em">to where you live.</span>
        </p>
        <div className="space-y-4 text-sm text-paper/75">
          <p>Editorial maps of the Front Range, with live REColorado listings through RealScout. A personal project by {siteConfig.ownerName}.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-paper">
            <Link href="/" className="underline-offset-4 hover:underline">The story</Link>
            <Link href="/search/" className="underline-offset-4 hover:underline">Live listings</Link>
            <Link href="/home-value/" className="underline-offset-4 hover:underline">Home value</Link>
          </nav>
          <p className="text-xs">
            Map data{" "}
            <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>,{" "}
            <a className="underline" href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">© OpenMapTiles</a>, served by{" "}
            <a className="underline" href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>. National outline: Natural Earth.
          </p>
        </div>
      </div>
    </footer>
  );
}
