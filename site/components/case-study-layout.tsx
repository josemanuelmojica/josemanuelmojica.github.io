import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { caseStudies, type CaseStudy } from "@/lib/case-studies";

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t py-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
      <h2 className="eyebrow pt-1">{label}</h2>
      <div className="space-y-3 text-lg leading-relaxed">{children}</div>
    </section>
  );
}

export function CaseStudyLayout({ study, demo }: { study: CaseStudy; demo: ReactNode }) {
  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];
  return (
    <>
      <SiteHeader />
      <main id="main">
        <header className="graph-paper border-b">
          <div className="mx-auto max-w-5xl px-5 pt-14 pb-16 md:px-8">
            <Link href="/#lab" className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden="true" /> All case studies
            </Link>
            <p className="eyebrow mt-8">Case study · {study.kicker}</p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.035em]">
              {study.title} <span className="em block text-deep">{study.italic}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-graphite">{study.oneLine}</p>
            <a href="#try" className="mt-8 inline-flex h-11 items-center rounded-lg bg-blue px-5 font-medium text-paper hover:bg-deep">
              Try it below
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
          <Block label="Scene"><p>{study.scene}</p></Block>
          <Block label="Constraint"><p>{study.constraint}</p></Block>
          <Block label="Decision">
            <ol className="list-decimal space-y-2 pl-5">{study.decision.map((d) => <li key={d}>{d}</li>)}</ol>
          </Block>
          <Block label="Result">
            <ul className="space-y-2">{study.result.map((r) => <li key={r} className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />{r}</li>)}</ul>
          </Block>
          <Block label="Takeaway"><p className="em text-2xl text-deep">{study.takeaway}</p></Block>
        </div>

        <section id="try" aria-labelledby="try-title" className="border-t bg-wash/40">
          <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
            <p className="eyebrow">Working demo</p>
            <h2 id="try-title" className="mt-3 text-3xl tracking-tight">Try the method</h2>
            <p className="mt-3 max-w-2xl text-graphite">{study.demoNote}</p>
            <div className="mt-8">{demo}</div>
          </div>
        </section>

        <nav aria-label="Next case study" className="border-t">
          <Link href={`/work/${next.slug}/`} className="group mx-auto flex max-w-5xl items-center justify-between gap-6 px-5 py-10 md:px-8">
            <span>
              <span className="eyebrow block">Next case study</span>
              <span className="mt-2 block text-2xl tracking-tight">{next.title} <span className="em text-deep">{next.italic}</span></span>
            </span>
            <ArrowRight className="size-6 shrink-0 text-blue transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </nav>
      </main>
    </>
  );
}
