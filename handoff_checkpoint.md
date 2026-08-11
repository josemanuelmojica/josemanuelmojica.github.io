# 🔄 Project Handoff & Context Checkpoint

## 📋 Executive Summary

Arχ & Teχt is a portable, static Next.js real-estate experience built around the user-supplied wordmark, white/blueprint architectural language, and the line “Be drawn to where you live.” The working site includes an endlessly scrolling eight-market map story, collection filtering and property interactions, four separate architectural navigation studies, a deny-by-default RealScout link boundary, and Appwrite/GitHub Pages deployment contracts. The handoff now also includes the complete 50-state Quiet Watersheds asset corpus; it is not wired to an atlas or lead form.

This checkpoint also preserves the design lineage needed for the next Claude design pass: the exact original handoff package, every available full map/piece asset, the generator and ant-motion libraries, relevant poster iterations, the prior site source/build, all user-provided iteration screenshots, and pinned Natural Earth state/river source data. The production market target currently uses a neighborhood/subarea placeholder—not a property photograph—and reveals its CSS art state only on hover or keyboard focus.

## 🏗️ Current Project State

- **Completed Milestones:** Working static homepage; eight measured long-scroll market chapters; full-width market links; same-site market filtering; strict external-link validation; four preview routes; real wordmark asset usage; responsive/reduced-motion behavior; static export and tests; Appwrite/GitHub Pages configuration; security/access documentation; complete reference archive; human and machine manifests; deterministic 50-state Quiet Watersheds generation with 50 SVG + 50 WebP plates.
- **Key Decisions:** Preserve the exact wordmark kerning; spell the brand with Greek chi; maintain endless scroll; keep the visual field white/blueprint; render no property image in the right-side market target; show a named subarea there (Charlotte → Myers Park); reveal only on hover/focus and navigate on click; use no iframe; never invent RealScout URLs; keep secrets out of static output; preserve puzzle/ant motion as an archived option rather than loading 3,000 pieces live.
- **File/System Locations:** Working repository root is `/Users/jmg-mini/copilot-worktrees/maptoposter/josemanuelmojica-literate-goggles/ark-text-appwrite`. The state runtime is `public/maps/us-state-studies/v1/`; its pinned inputs are `reference/geodata/natural-earth/`, generator is `scripts/state-ink/generate_state_ink_maps.py`, and review artifacts are `reference/state-art-corpus/v1/`. Start with `PROJECT_MANIFEST.md`, `project-manifest.json`, `docs/DESIGN_LINEAGE.md`, `reference/README.md`, and `docs/security/`.

Quiet Watersheds version `2026-08-10.1` includes `manifest.json`, `fallback/unresolved.svg`, and 50 SVG + 50 WebP state plates. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB); the runtime directory is ~3.3 MB. Idaho is ready as `US-ID` for the future Boise interpretation. Delaware, Hawaii, and Rhode Island intentionally have no blue river line because the pinned Natural Earth data records no state-scale centerline intersections for them.

## ❓ Unanswered & Missed Questions

- Which of the four architectural navigation studies—or which combination—should become the production navigation?
- What are the exact, approved public RealScout market-search, Support, Learn, and Academy URLs?
- What is the real RealScout widget snippet, and does it satisfy the no-iframe requirement?
- What final neighborhood artwork will replace `.market-portal__art-slot`?
- Which geocoder/NLP service and CRM destination are approved for the future lead-capture interview?
- Will GitHub store the large map archive directly, through Git LFS, or as a versioned release artifact?
- Which GitHub organization/repository and Appwrite project/site/domain should receive the eventual deployment?

## 🚧 Open Tasks & Known Issues

- [ ] Run the next Claude design pass across the homepage and all four previews using the preserved lineage and screenshots.
- [ ] Replace the CSS neighborhood placeholder with user-approved area art while retaining hover/focus/click accessibility.
- [ ] Implement the conversational lead-capture map interview in `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` with server-side geocoding and lead submission.
- [ ] Design and implement any atlas/selector/gallery that will consume the Quiet Watersheds manifest; no atlas UI or lead form exists yet.
- [ ] Validate and populate RealScout resource and market link manifests from an authenticated work account.
- [ ] Add and test the actual RealScout widget without framed content or exposed secrets.
- [ ] Configure production clickjacking response headers through Appwrite or an approved edge layer.
- [ ] Profile/optimize the scroll SVG loop, lazy-load below-fold media, and crop/optimize the approved wordmark without re-typesetting it.
- [ ] Consider splitting the large home client component and consolidating duplicated market data into one typed, validated manifest.
- [ ] Choose a large-asset Git strategy before pushing the archive.

## ⏭️ Next Steps

1. Run `npm ci`, `npm run typecheck`, and `npm test` from the repository root.
2. Read `PROJECT_MANIFEST.md`, `docs/DESIGN_LINEAGE.md`, and the six ordered iteration screenshots.
3. Open `/`, then compare `/previews/datum-rail/`, `/previews/plan-legend/`, `/previews/compass/`, and `/previews/sheet-tabs/`.
4. Review `reference/original-handoff/MASTER_PROMPT.md`, `INTERACTION_SPEC.md`, and the ant-motion/piece libraries before designing new map motion.
5. Review `public/maps/us-state-studies/v1/manifest.json` and `reference/state-art-corpus/v1/contact-sheet.webp`; treat `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md` as the source of truth for the future Boise → `US-ID` interview example.
6. Propose design changes without publishing; keep the current Git commit as the rollback point.
7. After approval, choose GitHub/LFS/release-asset handling, connect the remote, then configure Appwrite using the security verification checklist.
