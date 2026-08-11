# Comprehensive review record

Date: 2026-08-10
Scope: the local, uncommitted Arχ & Teχt repository snapshot

## Review method and assurance boundary

The repository was examined in twelve focused review passes: two independent passes each for architecture, security, performance, code quality, requirements compliance, and bug finding. The passes reviewed the supplied patch, the complete changed files, related consumers, configuration, tests, and repository documentation.

The review passes were static analysis. They did not constitute a live penetration test, authenticated Appwrite assessment, dynamic application-security scan, load test, or production-host verification. No claim is made that a live site was attacked, that TLS or deployed response headers were observed, or that Appwrite account controls were inspected. The local access audit records that no usable Appwrite CLI session, credentials, live project configuration, or Appwrite connector was available; see [security/ACCESS_AUDIT.md](security/ACCESS_AUDIT.md).

The supplied review artifact contained no explicit task requirements or acceptance criteria and explicitly prohibited deriving task intent from code or documentation. Both requirements-compliance passes therefore returned no task-description findings. That outcome means requirements compliance was not assessable from the supplied task description; it is not an assertion that every product requirement has been met. The design and operational contracts now recorded in [../PROJECT_MANIFEST.md](../PROJECT_MANIFEST.md), [DECISION_LOG.md](DECISION_LOG.md), and [DESIGN_LINEAGE.md](DESIGN_LINEAGE.md) remain useful evidence for future acceptance testing.

## Status definitions

- **Fixed in source**: the current repository contains a concrete correction or guard for the confirmed finding.
- **Open in source**: the finding remains visible in the current files or still requires implementation.
- **Deferred by design**: useful hardening or restructuring is recorded for later work and is not represented as complete.
- **Host/account verification required**: source alone cannot establish the control; an authorized deployer must verify it on the real host or account.

## Confirmed findings fixed in source

| Area | Confirmed finding | Current resolution and evidence | Status |
| --- | --- | --- | --- |
| Bugs / portability | The runtime map collection contained root-absolute or missing references that were not portable under a repository base path. | [../public/maps/japanese-ink-scroll/collection.json](../public/maps/japanese-ink-scroll/collection.json) is now a runtime-only manifest with document-relative references to assets that exist. [../tests/source-contract.test.mjs](../tests/source-contract.test.mjs) resolves and checks every runtime reference. | Fixed in source |
| Security / CI | The Pages workflow originally granted deployment privileges too broadly, omitted pull-request validation, and used mutable action version tags. | [../.github/workflows/pages.yml](../.github/workflows/pages.yml) defaults to `contents: read`, gives `pages: write` and `id-token: write` only to the deploy job, validates pull requests without deploying them, and pins third-party actions to commit SHAs. | Fixed in source |
| Security / CI | A repository-wide `github-pages` concurrency key allowed an unrelated pull-request run to cancel a main-branch Pages run. | [../.github/workflows/pages.yml](../.github/workflows/pages.yml) qualifies the group with `github.ref`, and [../tests/source-contract.test.mjs](../tests/source-contract.test.mjs) records that contract. | Fixed in source |
| Deployment verification | The Appwrite example could build with `npm run build`, bypassing source and exported-output contracts. | [../appwrite.config.example.json](../appwrite.config.example.json) and the production setup table in [../README.md](../README.md) now use `npm test`, matching the Pages workflow. | Fixed in source |
| Secret hygiene | The ignore rules did not cover every normal `.env` variant or a generated live Appwrite configuration. | [../.gitignore](../.gitignore) ignores `.env*` while explicitly retaining `.env.example`, and ignores `appwrite.config.json`. | Fixed in source |
| Bugs / configuration | An empty or malformed `NEXT_PUBLIC_SITE_URL` could make metadata initialization throw during a build. | [../app/lib/siteUrl.ts](../app/lib/siteUrl.ts) trims and parses the value, rejects unsupported schemes and credentials, and uses a non-production placeholder fallback for missing or invalid input; [../app/layout.tsx](../app/layout.tsx) consumes the resulting `URL`. The real production origin still requires deployer configuration and HTTPS verification. | Fixed in source |
| Security / SVG | The original runtime SVG handling removed only a narrow set of active elements and did not comprehensively reject external links, event attributes, or unsafe CSS references. | `sanitizeMapSvg` and `safeLocalSvgReference` in [../app/InkEstates.tsx](../app/InkEstates.tsx) remove active/embedding elements, event handlers, non-local links, and unsafe URL-bearing values before insertion. This is source hardening, not a claim of formal sanitizer verification against every browser quirk. | Fixed in source |
| Performance | Per-piece `transform-origin` and seal deltas were recalculated and rewritten on every scroll frame, and `will-change` was permanently applied to every animated SVG piece. | [../app/InkEstates.tsx](../app/InkEstates.tsx) initializes transform origins and deltas when an overlay is prepared; [../app/globals.css](../app/globals.css) no longer promotes every piece with `will-change`. | Fixed in source |
| Performance | Each scroll frame measured all market chapters and continued doing animation work before the market story was near the viewport. | `MarketStory` in [../app/InkEstates.tsx](../app/InkEstates.tsx) uses an intersection gate and advances from the current chapter with bounded adjacent geometry checks rather than rebuilding all chapter rectangles on every frame. | Fixed in source |
| Performance | Below-fold property and contact media loaded eagerly. | Property-card and contact-map images in [../app/InkEstates.tsx](../app/InkEstates.tsx) use lazy loading and asynchronous decoding; the hero remains explicitly prioritized. | Fixed in source |
| Bugs | A failed base image left a reused `MapLayer` permanently failed when its study URL changed. | `MapLayer` resets `baseFailed` when `study.baseUrl` changes. | Fixed in source |
| Bugs / resilience | Corrupt or unavailable favorites storage could interrupt client setup. | Favorites hydration in [../app/InkEstates.tsx](../app/InkEstates.tsx) catches storage/JSON failures, validates saved IDs against known listings, and leaves in-memory favorites usable when persistence is unavailable. | Fixed in source |
| Bugs / state lifecycle | Persistence inside the React state updater mixed side effects with state calculation and could race hydration by overwriting saved favorites. | The toggle updater is now pure; a guarded effect persists only after favorites hydration completes. [../tests/source-contract.test.mjs](../tests/source-contract.test.mjs) records this source contract. | Fixed in source |
| Bugs / rendering | Inline map SVGs did not explicitly preserve the same cover-like aspect behavior as their base images. | Runtime overlays set `preserveAspectRatio="xMidYMid slice"` before insertion. | Fixed in source |
| Bugs / accessibility | Keying the market portal by active study remounted the anchor and could discard keyboard focus during a chapter change. | The portal anchor is no longer keyed by `portalStudy.id`; its destination and accessible name update without replacing the focused node. | Fixed in source |

## Open or deferred source work

These items were confirmed during the review but are not represented as completed:

| Area | Remaining work | Status |
| --- | --- | --- |
| Map I/O | Preserve or cache a parsed incoming SVG/metadata layer when it becomes current. The two fixed layer slots can still fetch/parse the same study more than once. | Deferred by design |
| Architecture | Split the 1,000+ line home client module into focused client islands and server/static sections. | Deferred by design |
| Data contracts | Establish one typed market/study manifest and run real schema validation for content manifests rather than relying only on parallel data and source-shape assertions. | Deferred by design |
| Asset delivery | Crop/optimize the supplied wordmark artwork without re-typesetting it or changing approved kerning. | Deferred by design |
| Responsive media | Add responsive `srcset`/`sizes` or pre-generated modern-format variants; lazy loading alone does not prevent mobile clients from receiving full-size originals once requested. | Deferred by design |
| Preview maintenance | Consolidate duplicated preview route metadata and replace positional companion arrays with keyed, typed records. | Deferred by design |
| Test quality | Replace implementation-text regular expressions with direct tests of exported pure URL, sanitizer, and manifest functions where practical. | Deferred by design |
| RealScout content | Validate and consume the actual `content/resources.json` manifest in the UI. It remains intentionally empty and no real widget snippet is installed. | Deferred pending authenticated work-account input |
| Listing model | Store a single canonical numeric price and derive the display label to prevent filter/display drift. | Deferred by design |
| Runtime profiling | Profile the SVG scroll loop under CPU throttling and representative mobile GPU/memory conditions before increasing the active piece count. | Host/runtime measurement required |

## Host-level and integration risks

The following cannot be closed by the current static source alone:

1. **Clickjacking response headers.** The meta CSP blocks framed child content with `frame-src 'none'`, but a meta policy cannot provide `frame-ancestors`. Production needs `Content-Security-Policy: frame-ancestors 'none'` or `X-Frame-Options: DENY` from Appwrite or an approved edge layer. Verify the actual response, not a Console screenshot.
2. **Inline-policy allowances.** The Next.js static export currently needs `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` in its source-level CSP. This is a known limitation, not equivalent to a nonce/hash-based policy. Re-evaluate it against the generated output and any future widget.
3. **TLS, redirects, and response-only headers.** HSTS, `X-Content-Type-Options`, `Permissions-Policy`, cross-origin policies, and plain-HTTP redirects must be observed on the authorized production domain.
4. **Account controls.** GitHub installation scope, Appwrite organization membership, branch/path filters, environment protection, deployment retention, logging, rollback readiness, and any Site/Function variable scope require owner review in the real accounts.
5. **RealScout integration.** Exact resource URLs, widget markup, network origins, access levels, and credential semantics are unverified. Do not broaden the CSP or allowlists, publish internal links, or add a browser-visible secret until the authenticated work account supplies and approves the contract.
6. **Optional private proxy.** If RealScout confirms a private credential is required, the proxy, rate limits, logs, CORS, upstream allowlist, and abuse controls require a separately authorized Appwrite Function and live verification.

The operational gate for these checks is [security/VERIFICATION_CHECKLIST.md](security/VERIFICATION_CHECKLIST.md); the rationale and containment plan are in [security/APPWRITE_SITES_SECURITY_HANDOFF.md](security/APPWRITE_SITES_SECURITY_HANDOFF.md).

## Automated-check evidence and limitations

The repository defines `npm run typecheck` and `npm test`. The latter runs source contracts, creates the production static export, and checks exported routes, assets, CSP/referrer markup, market links, neighborhood-target behavior, and absence of legacy worker/iframe output. The workflow and Appwrite example are configured to use that verification command.

After the final source fixes recorded above, the root review ran `npm test`: all 9 source-contract tests passed, the Next.js production static export and its type validation passed, and all 6 static-export tests passed (15 tests total). Two remediation passes also separately reported `npm run typecheck` passing.

Those local checks are evidence for the reviewed source snapshot, not evidence of a live penetration test. This report does not claim that the twelve static review passes exercised a deployed host, authenticated account, browser attack suite, dynamic scanner, or production traffic. Before handoff or deployment, inspect the resulting `out/`, rerun the commands after any subsequent change, and complete the host checklist against the real production origin.

## Release-oriented follow-up

1. Re-review any final candidate changes against the fixed and deferred items above.
2. Rerun `npm run typecheck` and `npm test` after any subsequent change; preserve the final command output with the release record.
3. Inspect the exported files for unexpected origins, secrets, internal URLs, iframes, and stale runtime references.
4. Profile the market story with CPU throttling and a representative mobile device before increasing animation complexity.
5. Have the GitHub/Appwrite owner complete the production verification and rollback checklist.
6. Record explicitly that no live penetration test has occurred unless a separately scoped, authorized engagement is actually performed.
