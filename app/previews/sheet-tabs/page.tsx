import {
  ArtworkWordmark,
  PreviewCanvas,
  learningLinks,
} from "../../components/PreviewShared";
import styles from "./SheetTabs.module.css";

const linkNotes = [
  "Orientation and account setup",
  "Criteria, alerts, and results",
  "Invitations and collaboration",
  "Courses and guided practice",
  "Answers from the help desk",
  "Training and certification",
] as const;

export default function SheetTabsPreview() {
  return (
    <PreviewCanvas fork="04 / Drawing-set tabs">
      <header className={styles.header}>
        <a className={styles.brand} href="#start" aria-label="Arχ & Teχt customer field guide">
          <ArtworkWordmark compact />
        </a>
        <div className={styles.sheetTitle} aria-label="Current drawing sheet">
          <span>Customer learning set</span>
          <strong>A-001</strong>
        </div>
      </header>

      <nav className={styles.tabRail} aria-label="RealScout learning drawing set">
        <ol>
          {learningLinks.map((link) => (
            <li key={link.code}>
              <a href={link.href}>
                <span>{link.code}</span>
                <strong>{link.label}</strong>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <details className={styles.indexDrawer}>
        <summary>
          <span className={styles.indexIcon} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <small>Drawing index</small>
            <strong>Open set</strong>
          </span>
        </summary>
        <div className={styles.indexPanel}>
          <div className={styles.indexHeading}>
            <span>Sheet</span>
            <span>Title</span>
            <span>Scope</span>
          </div>
          <ol>
            {learningLinks.map((link, index) => (
              <li key={link.code}>
                <a href={link.href}>
                  <span>{link.code}</span>
                  <strong>{link.label}</strong>
                  <small>{linkNotes[index]}</small>
                </a>
              </li>
            ))}
          </ol>
          <p>Issue 01 · Customer field guide · For navigation review</p>
        </div>
      </details>

      <aside className={styles.revisionBlock} aria-label="Drawing revision information">
        <div><span>Project</span><strong>RealScout field guide</strong></div>
        <div><span>Drawing</span><strong>Navigation study</strong></div>
        <div><span>Issue</span><strong>01</strong></div>
        <div><span>Scale</span><strong>NTS</strong></div>
      </aside>
    </PreviewCanvas>
  );
}
