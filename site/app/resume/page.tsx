import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { credentials, earlierExperience, education, experience, lookingFor, profile, toolkit } from "@/lib/profile";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${profile.name}: AI support operations, Claude workflows, and enablement.`,
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
        <p className="mt-1 text-lg text-deep print:text-[12pt]">{lookingFor.roles.join(" · ")}</p>
        <p className="mt-2 text-sm text-graphite">
          {profile.location} · <a href={`mailto:${profile.email}`} className="underline">{profile.email}</a> · {profile.linkedinLabel} · {profile.domain}
        </p>
        <p className="text-sm text-graphite">{profile.relocation}</p>
      </header>

      <section aria-labelledby="r-summary" className="mt-6">
        <h2 id="r-summary" className="eyebrow">Summary</h2>
        <p className="mt-2">{profile.summary}</p>
      </section>

      <section aria-labelledby="r-experience" className="mt-6">
        <h2 id="r-experience" className="eyebrow">Experience</h2>
        <h3 className="mt-2 font-medium">
          {experience.company} · {experience.role} <span className="font-normal text-graphite">· {experience.dates}</span>
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {experience.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </section>

      <section aria-labelledby="r-tools" className="mt-6">
        <h2 id="r-tools" className="eyebrow">Daily stack</h2>
        <p className="mt-2">{toolkit.join(" · ")}</p>
      </section>

      <section aria-labelledby="r-creds" className="mt-6">
        <h2 id="r-creds" className="eyebrow">Certifications</h2>
        <p className="mt-2">{credentials.join(" · ")}</p>
      </section>

      <section aria-labelledby="r-earlier" className="mt-6">
        <h2 id="r-earlier" className="eyebrow">Earlier experience</h2>
        <p className="mt-2">{earlierExperience.join(" · ")}</p>
      </section>

      <section aria-labelledby="r-education" className="mt-6">
        <h2 id="r-education" className="eyebrow">Education</h2>
        <p className="mt-2">{education}</p>
      </section>
    </main>
  );
}
