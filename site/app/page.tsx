import Link from "next/link";
import { ArrowUpRight, Code2, FileText, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Contour } from "@/components/contour";
import { credentials, experience, lookingFor, principles, profile, proof, toolkit, work } from "@/lib/profile";

function SectionHead({ id, eyebrow, title, italic }: { id: string; eyebrow: string; title: string; italic: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">
        {title} <span className="em text-deep">{italic}</span>
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden border-b">
          <div className="graph-paper absolute inset-0" aria-hidden="true" />
          <Contour className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full text-blue/50 md:h-72" />
          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-36 md:px-8 md:pt-28 md:pb-48">
            <p className="eyebrow rise">AI support operations · Claude workflows · Enablement</p>
            <h1 id="hero-title" className="rise mt-5 max-w-4xl text-[clamp(2.7rem,7vw,5.6rem)] leading-[0.95] font-[450] tracking-[-0.04em]" style={{ animationDelay: "0.08s" }}>
              {profile.headline.plain} <span className="em block text-deep">{profile.headline.italic}</span>
            </h1>
            <p className="rise mt-7 max-w-2xl text-lg leading-relaxed text-graphite" style={{ animationDelay: "0.16s" }}>
              {profile.summary}
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
              <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue px-5 font-medium text-paper hover:bg-deep">
                <Mail className="size-4" aria-hidden="true" /> Email me
              </a>
              <Link href="/resume/" className="inline-flex h-12 items-center gap-2 rounded-lg border bg-paper px-5 font-medium hover:border-blue hover:text-blue">
                <FileText className="size-4" aria-hidden="true" /> Résumé
              </Link>
            </div>
          </div>
        </section>

        {/* Proof */}
        <section aria-label="At a glance" className="border-b bg-paper">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {proof.map((item, i) => (
              <div key={item.label} className={`px-5 py-8 md:px-8 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}>
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="block text-3xl tracking-tight text-deep md:text-[2.6rem]">{item.value}</span>
                  <span className="mt-1 block text-sm text-graphite">{item.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Work */}
        <section aria-labelledby="work-title" id="work" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          <SectionHead id="work-title" eyebrow="Selected work" title="Systems I built" italic="and still run." />
          <ol className="mt-14 space-y-6">
            {work.map((item, i) => (
              <li key={item.id}>
                <article aria-labelledby={`${item.id}-title`} className="grid gap-6 rounded-2xl border bg-paper p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-10">
                  <div>
                    <p className="eyebrow">
                      <span className="tabular-nums text-blue">0{i + 1}</span> · {item.kicker}
                    </p>
                    <h3 id={`${item.id}-title`} className="mt-3 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.05] tracking-[-0.02em]">
                      {item.title} <span className="em text-deep">{item.italic}</span>
                    </h3>
                    <p className="mt-4 text-graphite">{item.summary}</p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tools">
                      {item.tools.map((tool) => (
                        <li key={tool} className="rounded-full border px-3 py-1 text-xs text-graphite">{tool}</li>
                      ))}
                    </ul>
                    {item.link && (
                      <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue underline-offset-4 hover:underline">
                        {item.link.label} <ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                  <ul className="space-y-4 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-10">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3 leading-relaxed">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* Approach */}
        <section aria-labelledby="approach-title" id="approach" className="border-y bg-deep text-paper">
          <div className="mx-auto max-w-6xl px-5 py-24 md:px-8">
            <p className="eyebrow !text-paper/70">How I work</p>
            <h2 id="approach-title" className="mt-3 max-w-2xl text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">
              Three habits <span className="em">I bring to every system.</span>
            </h2>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-paper/15 md:grid-cols-3">
              {principles.map((item, i) => (
                <li key={item.title} className="bg-deep p-7">
                  <span className="em text-3xl text-paper/60">{i + 1}.</span>
                  <h3 className="mt-3 text-xl tracking-tight">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-paper/75">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Experience + credentials */}
        <section aria-labelledby="experience-title" id="experience" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
          <SectionHead id="experience-title" eyebrow="Experience" title="The title, and" italic="the actual scope." />
          <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <article className="rounded-2xl border p-6 md:p-8">
              <p className="eyebrow">{experience.dates}</p>
              <h3 className="mt-2 text-2xl tracking-tight">
                {experience.role} <span className="text-graphite">· {experience.company}</span>
              </h3>
              <p className="mt-1 text-sm text-graphite">{experience.context}</p>
              <ul className="mt-6 space-y-3">
                {experience.points.map((point) => (
                  <li key={point} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
            <div className="space-y-8">
              <div>
                <h3 className="eyebrow">Certifications</h3>
                <ul className="mt-3 space-y-2">
                  {credentials.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="eyebrow">Toolkit</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {toolkit.map((t) => <li key={t} className="rounded-full border px-3 py-1 text-sm">{t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Looking for + contact */}
        <section aria-labelledby="contact-title" id="contact" className="relative overflow-hidden border-t">
          <div className="graph-paper absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-5 py-24 md:px-8">
            <p className="eyebrow">What I&apos;m looking for</p>
            <h2 id="contact-title" className="mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.035em]">
              Let&apos;s put Claude <span className="em text-deep">to work, properly.</span>
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Roles">
              {lookingFor.roles.map((r) => (
                <li key={r} className="rounded-full border bg-paper px-4 py-2 text-sm">{r}</li>
              ))}
            </ul>
            {lookingFor.note && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">{lookingFor.note}</p>}
            <p className="mt-6 text-graphite">{profile.relocation}.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue px-5 font-medium text-paper hover:bg-deep">
                <Mail className="size-4" aria-hidden="true" /> {profile.email}
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border bg-paper px-5 font-medium hover:border-blue hover:text-blue">
                <ArrowUpRight className="size-4" aria-hidden="true" /> LinkedIn <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border bg-paper px-5 font-medium hover:border-blue hover:text-blue">
                <Code2 className="size-4" aria-hidden="true" /> GitHub <span className="sr-only">(opens in a new tab)</span>
              </a>
              <Link href="/resume/" className="inline-flex h-12 items-center gap-2 rounded-lg border bg-paper px-5 font-medium hover:border-blue hover:text-blue">
                <FileText className="size-4" aria-hidden="true" /> Printable résumé
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-graphite md:px-8">
          <span>{profile.name} · {profile.location}</span>
          <span>Designed and built with Claude Code.</span>
        </div>
      </footer>
    </>
  );
}
