import type { Metadata } from "next";
import {
  ArtworkWordmark,
  learningLinks,
  PreviewCanvas,
} from "../../components/PreviewShared";
import styles from "./plan-legend.module.css";

export const metadata: Metadata = {
  title: "Plan Legend — Arχ & Teχt Navigation Study",
  description:
    "An architectural title-block navigation study for the RealScout customer field guide.",
};

const notes = [
  "Set up the account",
  "Build alerts and criteria",
  "Work with buyers",
  "Follow a guided lesson",
  "Find a verified answer",
  "Continue your training",
];

export default function PlanLegendPage() {
  return (
    <div className={styles.preview}>
      <aside className={styles.legend} aria-label="Drawing legend and site navigation">
        <div className={styles.legendHead}>
          <a className={styles.brand} href="#start" aria-label="Arχ & Teχt, go to start">
            <ArtworkWordmark compact />
          </a>
          <p>RS–LG</p>
        </div>

        <div className={styles.sheetTitle}>
          <span>Drawing title</span>
          <strong>Customer learning plan</strong>
          <small>Navigation option 02</small>
        </div>

        <nav className={styles.sheetIndex} aria-label="Customer learning sections">
          {learningLinks.map((item, index) => (
            <a
              key={item.code}
              href={item.href}
              aria-current={index === 0 ? "location" : undefined}
            >
              <b>{item.code}</b>
              <span>{item.label}</span>
              <small>{notes[index]}</small>
            </a>
          ))}
        </nav>

        <dl className={styles.issueBlock}>
          <div>
            <dt>Scale</dt>
            <dd>NTS</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Study</dd>
          </div>
          <div>
            <dt>Sheet</dt>
            <dd>A–02</dd>
          </div>
          <div>
            <dt>Rev</dt>
            <dd>01</dd>
          </div>
        </dl>
      </aside>

      <PreviewCanvas fork="Fork 02 · Plan legend">
        <div className={styles.orientation} aria-hidden="true">
          <span>N</span>
          <i />
          <small>PLAN NORTH</small>
        </div>
      </PreviewCanvas>
    </div>
  );
}
