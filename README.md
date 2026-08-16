# Arχ & Teχt

Portable Next.js static build of the Arχ & Teχt site, four architectural-graph-paper navigation studies, and a Cloudflare Worker/D1 lead-capture boundary. The same frontend can deploy to Cloudflare Workers Static Assets, Appwrite Sites, or GitHub Pages.

For the complete Claude/design handoff, start with `PROJECT_MANIFEST.md`, `handoff_checkpoint.md`, and `docs/DESIGN_LINEAGE.md`. The non-runtime `reference/` archive preserves the prior site, every available Japanese-ink map/poster asset, the puzzle/ant-motion libraries, original prompts/specs, and user feedback screenshots. `reference/FILE_INDEX.json` contains a SHA-256 inventory of the full archive.

## Run it locally

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The navigation studies live at:

- `/previews/datum-rail/`
- `/previews/plan-legend/`
- `/previews/compass/`
- `/previews/sheet-tabs/`

Build and verify the full static export with:

```bash
npm test
```

The dependency-free source contract can also be checked before installation with `npm run test:source`.

The build output is `out/`. It contains `index.html` plus one HTML document for every preview route. No Node server is needed to serve it.

## Quiet Watersheds state art

`public/maps/us-state-studies/v1/` contains the complete versioned runtime corpus: `manifest.json`, `fallback/unresolved.svg`, and 50 SVG + 50 WebP state plates under `states/`. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB); the directory is ~3.3 MB. The live interview maps the required Boise example to the `US-ID` plate.

The deterministic generator uses pinned, public-domain Natural Earth 1:10m data from `reference/geodata/natural-earth/`:

```bash
python3 -m pip install -r scripts/state-ink/requirements.txt
npm run generate:state-art
npm run check:state-art
```

Delaware (`US-DE`), Hawaii (`US-HI`), and Rhode Island (`US-RI`) intentionally have no blue river line because the source has no state-scale river/lake-centerline intersections there. No waterways are fabricated. The conversational interview resolves supported place/state/ZIP language to this corpus and never invents a state for unresolved input.

## Production: Cloudflare Worker + D1

Cloudflare is the complete full-stack target. Static pages and media are served from `out/`; only `/api/*` runs `worker/index.ts`. `POST /api/lead` validates the interview payload, verifies consent and the selected state-art ID, rejects unapproved origins, requires Turnstile server verification with exact action/hostname/UUID binding, rate-limits a salted client hash in D1, and stores the consented inquiry without retaining a raw IP address. A missing Turnstile secret fails closed with a service error.

The provisioned D1 database is `ark-and-text-leads`, bound as `LEADS`. Apply migrations, configure secrets, test an uploaded preview version, and only then promote it:

```bash
npx wrangler d1 migrations apply ark-and-text-leads --remote
npx wrangler versions secret put RATE_LIMIT_SALT --name ark-and-text
npx wrangler versions secret put TURNSTILE_SECRET_KEY --name ark-and-text
npm test
npx wrangler versions upload --tag architectural-symbol-system
```

Do not put either secret in `.env`, `.dev.vars.example`, `wrangler.jsonc`, GitHub, or Appwrite public variables. The Turnstile site key in `content/public-runtime-config.json` is intentionally public. `public/_headers` supplies the Cloudflare response-header policy in addition to the portable HTML meta policy.

See `docs/security/CLOUDFLARE_LEAD_CAPTURE.md` for schema, controls, preview verification, lead handling, retention, and rollback.

## Production: Appwrite Sites from GitHub

This repository uses the standard Next.js static-export path. `next.config.ts` sets `output: "export"`; Appwrite should serve the generated `out/` directory as a static site.

1. Push this project to a GitHub repository.
2. In the Appwrite Console, open **Sites**, choose **Create site**, and connect that repository.
3. Select `main` as the production branch and `.` as the repository root.
4. Choose **Next.js**, then select the **Static** rendering strategy.
5. Override Appwrite's normal Next.js output-directory default with the exact settings below.

| Appwrite setting | Value |
| --- | --- |
| Rendering strategy | `Static` |
| Root directory | `.` |
| Production branch | `main` |
| Install command | `npm ci` |
| Build command | `npm test` |
| Output directory | `out` |
| Fallback file | Leave blank |
| Build runtime | Node.js 22 |

Leave `NEXT_PUBLIC_BASE_PATH` unset or empty in Appwrite. Appwrite serves this site from the root of its assigned or custom domain.
Set `NEXT_PUBLIC_SITE_URL` to the final Appwrite or custom-domain origin so canonical social metadata uses the production address.

Deploy once from the Console. After the Git repository is connected, pushes to `main` create and activate production deployments automatically. Other branches can produce Appwrite preview deployments for organization members.

`appwrite.config.example.json` records the matching static build fields for a future CLI workflow. Its ID fields are intentionally empty. Run the Appwrite CLI initialization commands for the real project and site, then copy the build fields into the generated `appwrite.config.json`. Do not commit API keys or other credentials.

Appwrite references: [static-site configuration](https://appwrite.io/docs/products/sites/rendering/static), [Git deployments](https://appwrite.io/docs/products/sites/deploy-from-git), and [Next.js on Sites](https://appwrite.io/docs/products/sites/quick-start/nextjs).

## Optional preview: GitHub Pages

The workflow at `.github/workflows/pages.yml` builds, tests, and publishes `out/` whenever `main` changes.

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main`, or run **Deploy static export to GitHub Pages** from the Actions tab.

The workflow uses GitHub's Pages metadata to set `NEXT_PUBLIC_BASE_PATH` during the build:

- Project Pages (`https://owner.github.io/repository/`) builds with `/repository`.
- User, organization, and custom-domain Pages builds use the base path reported by GitHub, often an empty string.
- Appwrite and normal local builds leave the variable empty.

Next.js applies the base path to framework assets and links. Hand-authored public asset URLs go through `app/lib/publicPath.ts`, so the wordmark, maps, property photographs, and icons work from both a domain root and a GitHub Pages repository subpath. Do not hard-code `/asset-name` URLs in new components; use that helper for files under `public/`.

GitHub's workflow requirements are documented in [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## RealScout widget handoff

The real widget snippet has not been added yet. `app/components/RealScoutWidgetSlot.tsx` provides the reviewed mount point. When the verified snippet arrives from the authenticated RealScout work account:

1. Record its source URL, required attributes, target pages, and any allowed domains.
2. Put browser-only loading logic in a client component. Load the vendor script once and clean up any event listeners the component creates.
3. Keep the supplied widget markup and documented attributes intact. Wrap it for layout without rewriting vendor internals.
4. Add only browser-safe configuration to `NEXT_PUBLIC_*` variables. Values with that prefix are visible in the exported JavaScript. A private token needs an Appwrite Function or another server-side service and cannot ship in this static site.
5. Test the widget on an Appwrite branch preview and on GitHub Pages, including the repository base path.
6. Add a local fallback link and plain-language error state in case the third-party script is blocked.

GitHub Pages is public static hosting. It cannot protect internal RealScout URLs or keep credentials secret.

## Verified resource manifest: next step

Do not guess RealScout support or training URLs. Hand `WORK_ACCOUNT_RESEARCH_PROMPT.md` to the authenticated work account, then replace the empty `content/resources.json` manifest with its verified JSON return. The manifest validation contract is recorded in `content/resources.schema.json` and includes:

- canonical URL and exact official title;
- source (`support.realscout.com`, `learn.realscout.com`, RealScout Academy, or another verified official source);
- audience and customer task;
- public, login-required, or internal-only access;
- whether the link is safe for this public site; and
- page, popup, widget, or troubleshooting placement.

Only entries explicitly marked safe for a public site should be rendered in the static build. Keep login-required and internal-only resources out of public navigation unless RealScout approves that use.

City search destinations use `content/market-links.json`. Each entry falls back to the working same-site `?market=City#properties` collection until its exact RealScout URL is both verified and marked safe. External destinations must also match an exact origin in `content/market-link-origins.json`; the application rejects credentials, ports, non-HTTPS schemes, malformed URLs, and unlisted origins.

The long-scroll market story intentionally contains no property photograph in its right-side neighborhood target. Each market exposes a named subarea placeholder (for example, Charlotte → Myers Park). The placeholder's architectural art layer appears only on mouse hover or keyboard focus; a click follows the verified market-search link. Replace the CSS-only `.market-portal__art-slot` with commissioned neighborhood artwork later without changing the link boundary or accessible name.

## Repository checks

`npm test` builds the site and checks that:

- the home page, preview index, and all four navigation studies were exported;
- the key site and customer-learning copy is present;
- required brand, map, icon, and property assets were copied to `out/`; and
- the Worker API, D1 schema, Turnstile boundary, CORS allowlist, static response headers, and state-aware interview stay aligned.
