import Link from "next/link";
import { profile } from "@/lib/profile";

const nav = [
  { href: "/#lab", label: "Case studies" },
  { href: "/#work", label: "Work", wide: true },
  { href: "/#experience", label: "Experience", wide: true },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 md:px-8">
        <Link href="/" className="mr-auto text-[15px] font-medium tracking-tight">
          {profile.name.split(" ").slice(0, 2).join(" ")} <span className="em text-deep">{profile.name.split(" ").slice(2).join(" ")}</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${item.wide ? "hidden md:inline-flex" : "inline-flex"} rounded-md px-2.5 py-2 text-graphite hover:text-ink`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/resume/" className="ml-1 inline-flex rounded-md bg-ink px-3 py-2 text-paper hover:bg-deep">
            Résumé
          </Link>
        </nav>
      </div>
    </header>
  );
}
