import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { credentials, experience, lookingFor, profile, toolkit, work } from "@/lib/profile";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${profile.name}: AI operations, integrations, and support systems.`,
  alternates: { canonical: "/resume/" },
};

export default function Resume() {
  return (
    <main id="main" className="resume mx-auto max-w-3xl px-5 py-10 text-[15px] leading-relaxed print:max-w-none print:p-0">
      <div className="no-print mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to the site
        </Link>
        <PrintButton />
      </div>

      <header className="border-b pb-5">
        <h1 className="text-4xl tracking-tight print:text-[22pt]">{profile.name}</h1>
        <p className="mt-1 text-lg text-deep print:text-[12pt]">AI operations · Integrations · Support systems</p>
        <p className="mt-2 text-sm text-graphite">
          {profile.location} · <a href={`mailto:${profile.email}`} className="underline">{profile.email}</a> · {profile.domain} · github.com/josemanuelmojica
        </p>
      </header>

      <section aria-labelledby="r-summary" className="mt-6">
        <h2 id="r-summary" className="eyebrow">Summary</h2>
        <p className="mt-2">{profile.summary}</p>
      </section>

      <section aria-labelledby="r-experience" className="mt-6">
        <h2 id="r-experience" className="eyebrow">Experience</h2>
        <h3 className="mt-2 font-medium">
          {experience.role}, {experience.company} <span className="font-normal text-graphite">({experience.context})</span>
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {experience.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>

      <section aria-labelledby="r-work" className="mt-6">
        <h2 id="r-work" className="eyebrow">Selected work</h2>
        <ul className="mt-2 space-y-3">
          {work.map((item) => (
            <li key={item.id} className="break-inside-avoid">
              <h3 className="font-medium">{item.title} {item.italic}</h3>
              <p className="text-graphite">{item.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="r-creds" className="mt-6 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
        <div>
          <h2 id="r-creds" className="eyebrow">Certifications</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {credentials.earned.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <h3 className="eyebrow mt-4">In progress</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {credentials.inProgress.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow">Toolkit</h2>
          <p className="mt-2">{toolkit.join(" · ")}</p>
          <h2 className="eyebrow mt-4">Looking for</h2>
          <p className="mt-2">{lookingFor.roles.join(" · ")}</p>
        </div>
      </section>
    </main>
  );
}
