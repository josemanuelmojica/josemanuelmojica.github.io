# Claude review, addition, and polish brief

Work as the design-engineering teammate for **Arχ & Teχt**. Review the existing implementation, preserve the strongest work from every recorded iteration, add only features that are supported by repository evidence, and polish the working site rather than replacing it with a new concept.

## Ground truth

- Repository: `josemanuelmojica/josemanuelmojica.github.io`
- Branch: `architectural-symbol-system`
- Required starting commit: `45e9abf` or a verified descendant
- Pull request: `https://github.com/josemanuelmojica/josemanuelmojica.github.io/pull/2`
- Current immutable Cloudflare preview: `https://64137e6e-ark-and-text.j-m-mojica-g.workers.dev`
- Production Cloudflare traffic has **not** been promoted to this version.

Read these files before editing:

1. `CLAUDE.md`
2. `PROJECT_MANIFEST.md`
3. `handoff_checkpoint.md`
4. `project-manifest.json`
5. `docs/DESIGN_LINEAGE.md`
6. `docs/DECISION_LOG.md`
7. `docs/security/CLOUDFLARE_LEAD_CAPTURE.md`
8. `reference/README.md`
9. `reference/original-handoff/MASTER_PROMPT.md`
10. `reference/original-handoff/INTERACTION_SPEC.md`

Then inspect the ordered screenshots under `reference/iteration-screenshots/`, the prior working site under `reference/previous-site/`, and the puzzle/ant-motion sources under `reference/generator/core/` and `reference/generator/full-map-assets/`.

## Product goal

Produce a working, editorial luxury-real-estate experience at least as thoughtful and robust as a strong Luxury Presence site, using simulated/demo listings until the verified RealScout feed and links arrive. The site must feel specific to Arχ & Teχt: architectural drawing, Japanese ink, white paper, blueprint blue, precise typography, and “Be drawn to where you live.” It must not become a generic luxury template.

## Invariants: do not weaken or redesign these away

- Use the exact supplied wordmark artwork at `public/brand/ark-and-text-source.png`; do not re-typeset it or alter its kerning.
- Display the brand as **Arχ & Teχt**, with Greek chi.
- Preserve the endlessly scrolling eight-market narrative and its measured sticky transitions.
- Preserve the full-width “Explore this market” architectural rule and normal link behavior.
- The right-side market target names the subarea/neighborhood. It shows no property photograph, reveals its placeholder/art only on hover or keyboard focus, and navigates on click. No timer reveal and no iframe.
- Keep the white-paper field, restrained ink/graphite typography, and blue gradient/rivers. Do not flood the site with opaque blue panels.
- Keep all four navigation studies available under `/previews/`; do not delete alternatives while reviewing the opposing X/Y production axes.
- Keep reduced-motion behavior, keyboard focus, 44px-or-larger touch targets, responsive layout, and static export/base-path portability.
- Keep all 50 Quiet Watersheds state plates, their deterministic generator/provenance, and Boise → Idaho (`US-ID`) behavior.
- Do not fabricate RealScout URLs, MLS data, inventory, testimonials, statistics, awards, or brokerage claims. Demo property records must remain clearly demo data.
- Do not add a RealScout iframe. Add the real widget only when its authenticated, approved snippet is supplied and passes the existing trust boundary.
- Never commit a secret or expose a D1 read/export route.

## Security invariants

The public lead interview does not require account login. Staff lead access is separate and currently remains inside Cloudflare's authenticated D1 console.

Do not weaken `worker/lead.ts`, `app/TurnstileWidget.tsx`, CSP, or the tests. The endpoint must continue to enforce:

- exact allowed origin;
- mandatory server-side Turnstile with fail-closed secret handling;
- exact `lead-interview` action, frontend hostname, and UUID-bound `cdata`;
- body and field limits, known state-art IDs, affirmative consent, honeypot discard, and generic errors;
- salted durable throttling without retaining raw IP addresses; and
- idempotent D1 writes.

If you propose a staff dashboard, place it behind Cloudflare Access **and** validate `Cf-Access-Jwt-Assertion` in the Worker. Do not build a public lead-list endpoint. If you propose verified email ownership, specify a double-opt-in or OTP provider; Turnstile alone does not verify ownership.

## Review first

Before changing code:

1. Run `npm ci`, `npm run typecheck`, and `npm test`.
2. Capture and compare `/` at desktop, tablet, and narrow mobile widths.
3. Inspect `/previews/`, `/previews/datum-rail/`, `/previews/plan-legend/`, `/previews/compass/`, and `/previews/sheet-tabs/`.
4. Test keyboard-only navigation, reduced motion, long-scroll pacing, the market target reveal, property filters/dialog/favorites, and all five lead-interview steps.
5. Write a short prioritized audit with evidence: critical functional defects, high-value visual polish, accessibility/performance issues, and optional experiments.

## Add or polish

Implement high-confidence improvements that preserve the invariants. Prioritize:

1. Wordmark scale/crop and surrounding spacing without modifying the asset.
2. Typographic rhythm, intentional headline breaks, copy legibility over map lines, and removal of vague/generic luxury copy.
3. Desktop/tablet/mobile geometry for the opposing axes, hero, sticky market chapters, full-width CTA rule, and right-side subarea target.
4. A pale-to-blue gradient that reads as ink gathering on paper; the market art must remain absent until hover/focus.
5. Long-scroll continuity, reversible motion, hover/focus parity, reduced-motion fallbacks, and no layout jumps.
6. Lead-interview clarity, validation, recovery after expired Turnstile proof, and state-plate confirmation—without turning it into a conventional CRM form.
7. Performance: below-fold lazy loading, LCP/CLS review, compositor-friendly motion, and no public loading of the archival 3,000-piece map dataset.
8. Maintainability: consider splitting the large home client component and consolidating repeated market records into one typed manifest, but only if tests preserve behavior.

The repository has 50 state visuals but **not complete metro coverage**. If you work on metros, first propose a deterministic, licensed, performance-bounded pipeline and a manifest schema. Do not claim all metros are loaded until assets, provenance, fallbacks, tests, and runtime selection actually exist.

## Still requires owner input or an approved service

- final neighborhood/subarea artwork;
- exact RealScout market, Support, Learn, and Academy URLs;
- real RealScout widget snippet;
- lead notification destination/CRM or transactional-email provider;
- verified-email requirement;
- retention/deletion period;
- custom production domain and any zone-level WAF rule.

Represent these honestly as controlled placeholders or documented integration seams. Do not guess.

## Verification and delivery

After edits:

1. Run `git diff --check`, `npm run typecheck`, and `npm test`.
2. Re-test desktop/tablet/mobile, keyboard, reduced motion, every preview route, and the full lead interview.
3. Report exactly what changed, what remains simulated, and what still needs owner credentials/content.
4. Commit and push to `architectural-symbol-system` (or a review branch based on it) without adding `.claude/`, secrets, build output, or personal lead data.
5. Upload only an immutable Cloudflare preview. Do **not** merge the PR or promote production traffic without explicit owner approval and a successful synthetic Turnstile/D1 verification.

Begin by giving me the prioritized audit and a concise implementation plan. Then make the highest-confidence additions and polish in the same working session.
