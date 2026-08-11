import Link from "next/link";
import { ArtworkWordmark } from "../components/PreviewShared";
import styles from "./previews.module.css";

const studies = [
  {
    number: "01",
    title: "Datum rail",
    route: "/previews/datum-rail/",
    note: "A measured horizontal axis. Navigation behaves like coordinates along a drawing baseline.",
    className: styles.rail,
  },
  {
    number: "02",
    title: "Plan legend",
    route: "/previews/plan-legend/",
    note: "A permanent sheet index. Navigation borrows the hierarchy of an architect’s title block.",
    className: styles.legend,
  },
  {
    number: "03",
    title: "Survey compass",
    route: "/previews/compass/",
    note: "A spatial navigation instrument. The menu opens around a surveyed center point.",
    className: styles.compass,
  },
  {
    number: "04",
    title: "Sheet tabs",
    route: "/previews/sheet-tabs/",
    note: "A drawing-set edge. Section tabs open a compact resource index from the right margin.",
    className: styles.tabs,
  },
] as const;

export default function PreviewIndex() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <ArtworkWordmark />
        <div>
          <p>Navigation study set / four forks</p>
          <span>Appwrite + GitHub Pages production fork</span>
        </div>
      </header>
      <section className={styles.intro}>
        <p>Architectural graph paper as interface</p>
        <h1>Four ways into the same field guide.</h1>
        <span>Select a drawing to open the full navigation study.</span>
      </section>
      <section className={styles.grid} aria-label="Navigation design variants">
        {studies.map((study) => (
          <Link className={styles.card} href={study.route} key={study.route}>
            <div className={`${styles.diagram} ${study.className}`} aria-hidden="true">
              <i /><i /><i /><i />
            </div>
            <div className={styles.cardTitle}>
              <span>{study.number}</span>
              <h2>{study.title}</h2>
              <b>Open study ↗</b>
            </div>
            <p>{study.note}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
