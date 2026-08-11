import type { Metadata } from "next";
import {
  ArtworkWordmark,
  learningLinks,
  PreviewCanvas,
} from "../../components/PreviewShared";
import styles from "./datum-rail.module.css";

export const metadata: Metadata = {
  title: "Datum Rail — Arχ & Teχt Navigation Study",
  description:
    "A coordinate-line navigation study for the RealScout customer field guide.",
};

const coordinates = ["00+00", "18+40", "37+20", "56+00", "74+80", "93+60"];

export default function DatumRailPage() {
  return (
    <div className={styles.page}>
      <PreviewCanvas fork="Fork 01 · Datum rail">
        <header className={styles.header}>
          <div className={styles.identityRow}>
            <a className={styles.brand} href="#start" aria-label="Arχ & Teχt, go to start">
              <ArtworkWordmark compact />
            </a>
            <p className={styles.drawingTitle}>
              <span>Customer field guide</span>
              <strong>Navigation study / survey datum</strong>
            </p>
            <p className={styles.issue}>
              <span>Issue</span>
              <strong>01 · 08.10.26</strong>
            </p>
          </div>

          <div className={styles.railViewport}>
            <div className={styles.rail}>
              <div className={styles.origin} aria-hidden="true">
                <span>RL 100.00</span>
                <i />
              </div>
              <nav className={styles.links} aria-label="Customer learning sections">
                {learningLinks.map((item, index) => (
                  <a
                    key={item.code}
                    href={item.href}
                    aria-current={index === 0 ? "location" : undefined}
                  >
                    <small>{coordinates[index]}</small>
                    <span>{item.label}</span>
                    <b>{item.code}</b>
                  </a>
                ))}
                <span className={styles.datum} aria-hidden="true" />
              </nav>
              <div className={styles.terminus} aria-hidden="true">
                <i />
                <span>END DATUM</span>
              </div>
            </div>
          </div>
        </header>

        <p className={styles.scaleNote} aria-hidden="true">
          NTS&nbsp;&nbsp;|&nbsp;&nbsp;ALL COORDINATES VERIFY ON SITE
        </p>
      </PreviewCanvas>
    </div>
  );
}
