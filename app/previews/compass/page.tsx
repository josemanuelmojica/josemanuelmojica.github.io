"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArtworkWordmark,
  PreviewCanvas,
  learningLinks,
} from "../../components/PreviewShared";
import styles from "./Compass.module.css";

const bearings = [270, 330, 30, 90, 150, 210] as const;

export default function CompassPreview() {
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    firstLink.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <PreviewCanvas fork="03 / Survey compass">
      <header className={styles.header}>
        <a className={styles.brand} href="#start" aria-label="Arχ & Teχt customer field guide">
          <ArtworkWordmark compact />
        </a>
        <div className={styles.headerNote} aria-hidden="true">
          <span>Navigation study 03</span>
          <span>Orient by task</span>
        </div>
      </header>

      <div className={`${styles.scrim} ${open ? styles.scrimOpen : ""}`} aria-hidden="true" onClick={closeMenu} />

      <section className={`${styles.compassDock} ${open ? styles.isOpen : ""}`} aria-label="Customer guide compass">
        <p className={styles.dockLabel}>Set a bearing</p>

        <nav
          id="compass-navigation"
          className={styles.radialNav}
          aria-label="RealScout learning sections"
          hidden={!open}
        >
          <ol>
            {learningLinks.map((link, index) => (
              <li
                key={link.code}
                style={{
                  "--bearing": `${bearings[index]}deg`,
                  "--counter-bearing": `${bearings[index] * -1}deg`,
                } as CSSProperties}
              >
                <a
                  ref={index === 0 ? firstLink : undefined}
                  href={link.href}
                  onClick={closeMenu}
                >
                  <span>{link.code}</span>
                  <strong>{link.label}</strong>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.instrument} aria-hidden="true">
          <span className={styles.axisNorth}>N</span>
          <span className={styles.axisEast}>E</span>
          <span className={styles.axisSouth}>S</span>
          <span className={styles.axisWest}>W</span>
          <span className={styles.needle} />
          <span className={styles.centerMark} />
        </div>

        <button
          ref={trigger}
          className={styles.trigger}
          type="button"
          aria-expanded={open}
          aria-controls="compass-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true">{open ? "×" : "+"}</span>
          <strong>{open ? "Close" : "Navigate"}</strong>
        </button>
      </section>

      <aside className={styles.coordinateCard} aria-label="Drawing coordinates">
        <span>Origin</span>
        <strong>0, 0</strong>
        <small>Bearings are organized by the work in front of you.</small>
      </aside>
    </PreviewCanvas>
  );
}
