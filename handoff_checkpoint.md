# 🔄 Project Handoff & Context Checkpoint

## 📋 Executive Summary

Arχ & Teχt is a portable, static Next.js real-estate experience built around the user-supplied wordmark, white/blueprint architectural language, and the line “Be drawn to where you live.” The working site includes an endlessly scrolling eight-market map story, collection filtering and property interactions, four architectural navigation studies, opposing X/Y navigation axes, a deny-by-default RealScout link boundary, and Cloudflare/Appwrite/GitHub Pages deployment contracts. The complete 50-state Quiet Watersheds corpus is wired into a conversational lead interview; secure submission is implemented as a Cloudflare Worker with D1, Turnstile, origin validation, and durable rate limiting.

This checkpoint also preserves the design lineage needed for the next Claude design pass: the exact original handoff package, every available full map/piece asset, the generator and ant-motion libraries, relevant poster iterations, the prior site source/build, all user-provided iteration screenshots, and pinned Natural Earth state/river source data. The production market target currently uses a neighborhood/subarea placeholder—not a property photograph—and reveals its CSS art state only on hover or keyboard focus.

## 🏗️ Current Project State

- **Completed Milestones:** Working static homepage; eight measured long-scroll market chapters; full-width market links; same-site market filtering; strict external-link validation; four preview routes; opposing top/left architectural navigation; real wordmark asset usage; responsive/reduced-motion behavior; static export and tests; Cloudflare/Appwrite/GitHub Pages configuration; conversational state-map lead interview; Cloudflare Worker/D1 schema and security controls; complete reference archive; deterministic 50-state Quiet Watersheds generation with 50 SVG + 50 WebP plates.
- **Key Decisions:** Preserve the exact wordmark kerning; spell the brand with Greek chi; maintain endless scroll; keep the visual field white/blueprint; render no property image in the right-side market target; show a named subarea there (Charlotte → Myers Park); reveal only on hover/focus and navigate on click; use no iframe; never invent RealScout URLs; keep secrets out of static output; preserve puzzle/ant motion as an archived option rather than loading 3,000 pieces live.
- **File/System Locations:** Working repository root is `/Users/jmg-mini/copilot-worktrees/maptoposter/josemanuelmojica-literate-goggles/ark-text-appwrite`. The state runtime is `public/maps/us-state-studies/v1/`; its pinned inputs are `reference/geodata/natural-earth/`, generator is `scripts/state-ink/generate_state_ink_maps.py`, and review artifacts are `reference/state-art-corpus/v1/`. Start with `PROJECT_MANIFEST.md`, `project-manifest.json`, `docs/DESIGN_LINEAGE.md`, `reference/README.md`, and `docs/security/`.
- **Cloudflare Preview:** Immutable version 17 is `https://7b13b5ea-ark-and-text.j-m-mojica-g.workers.dev`. It contains the tested source/export, D1 binding, encrypted Turnstile/rate-limit secrets, action-bound Turnstile verification, and protected `/api/lead`. Homepage/header, health, and CORS checks pass. The current branch additionally fails closed without the Turnstile secret and binds proof to the exact frontend hostname and per-form UUID; those changes need a new preview upload and interactive verification. Production remains 100% on the previous version.
- **Authentication boundary:** Public visitors do not need accounts. Lead reads remain inside Cloudflare's authenticated D1 console and no public read/export endpoint exists. A future staff dashboard must use Cloudflare Access plus Worker-side Access JWT verification.

Quiet Watersheds version `2026-08-10.1` includes `manifest.json`, `fallback/unresolved.svg`, and 50 SVG + 50 WebP state plates. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB); the runtime directory is ~3.3 MB. The live interview resolves Boise to `US-ID`. Delaware, Hawaii, and Rhode Island intentionally have no blue river line because the pinned Natural Earth data records no state-scale centerline intersections for them.

## ❓ Unanswered & Missed Questions

- Which of the four architectural navigation studies—or which combination—should become the production navigation?
- What are the exact, approved public RealScout market-search, Support, Learn, and Academy URLs?
- What is the real RealScout widget snippet, and does it satisfy the no-iframe requirement?
- What final neighborhood artwork will replace `.market-portal__art-slot`?
- Which optional geocoder and downstream CRM/export workflow should augment the current deterministic lead interview?
- What lead-retention period is approved before broad public traffic?
- Will GitHub store the large map archive directly, through Git LFS, or as a versioned release artifact?
- Which GitHub organization/repository and Appwrite project/site/domain should receive the eventual deployment?

## 🚧 Open Tasks & Known Issues

- [ ] Run the next Claude design pass across the homepage and all four previews using the preserved lineage and screenshots.
- [ ] Replace the CSS neighborhood placeholder with user-approved area art while retaining hover/focus/click accessibility.
- [ ] Test a real Turnstile-protected submission on a Cloudflare preview and inspect the resulting D1 row before production promotion.
- [ ] Approve and implement a lead-retention/export policy; no automatic lead deletion is enabled.
- [ ] Decide whether to add a separate 50-state atlas selector beyond the state visual already used by the interview.
- [ ] Validate and populate RealScout resource and market link manifests from an authenticated work account.
- [ ] Add and test the actual RealScout widget without framed content or exposed secrets.
- [x] Configure Cloudflare clickjacking, CSP, referrer, permissions, and MIME-sniffing response headers in `public/_headers`.
- [ ] Profile/optimize the scroll SVG loop, lazy-load below-fold media, and crop/optimize the approved wordmark without re-typesetting it.
- [ ] Consider splitting the large home client component and consolidating duplicated market data into one typed, validated manifest.
- [ ] Choose a large-asset Git strategy before pushing the archive.

## ⏭️ Next Steps

1. Run `npm ci`, `npm run typecheck`, and `npm test` from the repository root.
2. Read `PROJECT_MANIFEST.md`, `docs/DESIGN_LINEAGE.md`, and the six ordered iteration screenshots.
3. Open `/`, then compare `/previews/datum-rail/`, `/previews/plan-legend/`, `/previews/compass/`, and `/previews/sheet-tabs/`.
4. Review `reference/original-handoff/MASTER_PROMPT.md`, `INTERACTION_SPEC.md`, and the ant-motion/piece libraries before designing new map motion.
5. Review `public/maps/us-state-studies/v1/manifest.json` and `reference/state-art-corpus/v1/contact-sheet.webp`; verify the implemented Boise → `US-ID` flow against `docs/concepts/LEAD_CAPTURE_MAP_INTERVIEW.md`.
6. Propose design changes without publishing; keep the current Git commit as the rollback point.
7. After approval, choose GitHub/LFS/release-asset handling, connect the remote, then configure Appwrite using the security verification checklist.
