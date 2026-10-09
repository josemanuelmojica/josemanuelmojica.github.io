import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { analytics } from "@/lib/analytics";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site measures, what it never collects, and how to opt out.",
  alternates: { canonical: "/privacy/" },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-8">
      <h2 className="text-2xl tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-lg leading-relaxed text-graphite">{children}</div>
    </section>
  );
}

export default function Privacy() {
  const meta = Boolean(analytics.metaPixelId);
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 pt-14 pb-24 md:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to the site
        </Link>
        <p className="eyebrow mt-8">Privacy</p>
        <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] leading-[1] tracking-[-0.035em]">
          What this site counts, <span className="em text-deep">in plain English.</span>
        </h1>

        <div className="mt-10">
          <Block title="What is measured">
            <p>
              This site uses Google Analytics{meta ? " and Meta Pixel" : ""} to see how many people visit and what they read.
              That includes the pages you open, your approximate location (city or country), your device and browser, and the
              site or link that sent you here.
            </p>
            <p>
              A few clicks are counted too: the email, résumé, LinkedIn, and GitHub buttons, and pressing Run check in a demo.
              Those counts tell me which parts of the site are useful.
            </p>
          </Block>

          <Block title="What is never collected">
            <p>
              Anything you paste into a demo stays in your browser. The demos run entirely on this page, and the only thing
              recorded about them is which demo was run, never what you typed.
            </p>
            <p>There are no forms and no accounts, and nothing on this site asks for your name or email.</p>
          </Block>

          <Block title="Who sees it">
            <p>
              Google{meta ? " and Meta" : ""} process the measurements, and I see the totals in their dashboards. Google&apos;s ad
              personalization and cross-device signals are switched off for this site.
            </p>
            {meta && (
              <p>
                Meta Pixel lets Meta connect a visit here to a Meta account, which is how ads on Facebook and Instagram are
                measured and targeted.
              </p>
            )}
          </Block>

          <Block title="How to opt out">
            <p>
              If your browser sends Global Privacy Control, none of the trackers load. Browsers like Firefox, Brave, and DuckDuckGo
              offer it as a setting. A content blocker also works.
            </p>
            <p>
              Questions: <a href={`mailto:${profile.email}`} className="text-blue underline underline-offset-4">{profile.email}</a>
            </p>
          </Block>
        </div>
      </main>
    </>
  );
}
