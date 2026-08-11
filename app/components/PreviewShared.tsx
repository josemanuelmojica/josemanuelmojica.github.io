import Link from "next/link";
import { publicPath } from "../lib/publicPath";
import styles from "./PreviewShared.module.css";

export const learningLinks = [
  { code: "A.01", label: "Start", href: "#start" },
  { code: "A.02", label: "Searches", href: "#searches" },
  { code: "A.03", label: "Clients", href: "#clients" },
  { code: "A.04", label: "Learn", href: "#learn" },
  { code: "A.05", label: "Support", href: "#support" },
  { code: "A.06", label: "Academy", href: "#academy" },
] as const;

const previewLinks = [
  ["01", "Datum rail", "/previews/datum-rail/"],
  ["02", "Plan legend", "/previews/plan-legend/"],
  ["03", "Compass", "/previews/compass/"],
  ["04", "Sheet tabs", "/previews/sheet-tabs/"],
] as const;

export function ArtworkWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? `${styles.wordmark} ${styles.wordmarkCompact}` : styles.wordmark}>
      <img src={publicPath("/brand/ark-and-text-source.png")} alt="" aria-hidden="true" />
      <span className={styles.srOnly}>Arχ &amp; Teχt</span>
    </span>
  );
}

export function PreviewCanvas({
  fork,
  children,
}: {
  fork: string;
  children: React.ReactNode;
}) {
  return (
    <main className={styles.canvas}>
      {children}
      <section className={styles.hero} id="start">
        <div className={styles.heroGridNote} aria-hidden="true">
          <span>37° 46′ N</span>
          <span>122° 25′ W</span>
        </div>
        <p className={styles.kicker}>RealScout customer field guide</p>
        <h1>Find the answer.<br />Get back to the client.</h1>
        <p className={styles.lede}>
          RealScout help, courses, and academy training. Organized by the work in front of you.
        </p>
        <div className={styles.quickGrid} id="searches" aria-label="Common learning paths">
          <a href="#searches"><span>01</span><strong>Build a search</strong><small>Alerts, criteria, and results</small></a>
          <a href="#clients"><span>02</span><strong>Invite a client</strong><small>Start the collaboration</small></a>
          <a href="#learn"><span>03</span><strong>Learn a workflow</strong><small>Courses and guided practice</small></a>
          <a href="#support"><span>04</span><strong>Fix an issue</strong><small>Verified support answers</small></a>
        </div>
      </section>
      <section className={styles.detailStrip}>
        <p>Current sheet</p>
        <strong>Customer learning navigation study</strong>
        <span>{fork}</span>
      </section>
      <section className={styles.resourceSections} aria-label="Sample learning destinations">
        <article id="clients"><span>A.03</span><h2>Clients</h2><p>Invitations, collaboration, and the buyer experience.</p></article>
        <article id="learn"><span>A.04</span><h2>Learn</h2><p>Courses organized around the task you need to finish.</p></article>
        <article id="support"><span>A.05</span><h2>Support</h2><p>Verified answers from the RealScout support library.</p></article>
        <article id="academy"><span>A.06</span><h2>Academy</h2><p>Deeper training for agents, teams, and administrators.</p></article>
      </section>
      <PreviewSwitcher />
    </main>
  );
}

export function PreviewSwitcher() {
  return (
    <aside className={styles.switcher} aria-label="Navigation design previews">
      <span>Navigation studies</span>
      <div>
        {previewLinks.map(([number, label, href]) => (
          <Link key={href} href={href} title={label}>{number}</Link>
        ))}
      </div>
    </aside>
  );
}
