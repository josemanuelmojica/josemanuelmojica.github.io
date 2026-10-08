# Arχ & Teχt platform (Cloudflare Workers)

A Next.js App Router build of the cartography + real-estate experience: a full-screen OpenFreeMap background map, GSAP scroll choreography based on the Wispr storyboard, Framer Motion UI, shadcn/ui (Radix) controls, and the RealScout intake module for live REColorado listings.

This folder is its own project. The site at the repository root is not changed by it.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, `output: "export"` |
| Hosting | Cloudflare Workers static assets (assets-only Worker), serving `./out` from the edge |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css` |
| Components | shadcn/ui on `radix-ui` (Sheet, Tabs, ToggleGroup, Button, Separator) |
| Type and icons | `next/font/google` Work Sans + EB Garamond italic, `lucide-react` |
| Map | `react-map-gl/maplibre` + `maplibre-gl` v5, OpenFreeMap tiles |
| Motion | `framer-motion` for UI, routes, and controls; `gsap` + `@gsap/react` + ScrollTrigger for scroll-scrubbed scenes |

### Why a static export on Workers

`@cloudflare/next-on-pages` is deprecated and only supports Next.js up to 15.5.2, and Cloudflare now recommends Workers over Pages for new projects. Everything here runs in the browser (map, widgets, motion), so the site is a static export served by an assets-only Worker: prebuilt files from every location, no adapter, no server runtime. The repository root's site already deploys the same way (`wrangler.jsonc` at the root). If server routes are needed later (for example a lead-form `/api`), add a Worker script with `main` and `run_worker_first`, or move to `@opennextjs/cloudflare`.

## Commands to recreate from scratch

```bash
npx create-next-app@16 platform --ts --tailwind --app --no-eslint --no-src-dir --import-alias "@/*"
cd platform
npm install react-map-gl maplibre-gl framer-motion gsap @gsap/react lucide-react \
  radix-ui class-variance-authority clsx tailwind-merge
npm install -D tw-animate-css wrangler
npx shadcn@latest init
npx shadcn@latest add button sheet tabs toggle toggle-group separator tooltip
```

## Run, check, deploy

Node 22.13 or newer.

```bash
npm ci
npm run dev            # http://localhost:3000
npm run check          # typecheck + build + output tests
npm run preview        # build, then serve ./out locally with wrangler dev
npm run cf:dry         # build, then validate the Worker config without deploying
npm run deploy         # build, then wrangler deploy (needs a Cloudflare login)
```

Git-connected Worker (Workers Builds) settings, from **Workers & Pages → Create application → Import a repository**:

- Worker name: `ark-and-text-platform` (must match `name` in `wrangler.jsonc`)
- Root directory: `platform`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Build variable: `NODE_VERSION=22`

`public/_headers` sets the edge security headers (CSP, `X-Frame-Options: DENY`, `frame-ancestors 'none'`). The CSP allows OpenFreeMap tiles, `blob:` workers for MapLibre, and the RealScout script host.

## Map of the code

| Path | Role |
| --- | --- |
| `app/layout.tsx` | Fonts, provider, persistent background map, header, footer, motion dock |
| `app/template.tsx` | Framer route transition (opacity only, so GSAP pins keep working) |
| `app/page.tsx` | The story: hero, expanding frame, pinned chapters, highlight list, fan cards, FAQ |
| `app/search/`, `app/home-value/` | RealScout intake module and home value widget |
| `components/map/` | `react-map-gl` map, outline fallback, explore toolbar, ink trail |
| `components/story/` | GSAP scenes (`useGSAP` + `gsap.matchMedia`) |
| `components/shell/` | Header, Radix sidebar sheet, footer, motion dock |
| `components/widgets/` | RealScout loader/widget (adapted from the supplied `RealScoutWidget.tsx`) and intake tabs |
| `lib/map-style.ts` | Ink, blueprint, and today map perspectives over the OpenMapTiles schema |
| `lib/places.ts` | Camera stops for the Front Range story |

## Accessibility contract

- **Reduced motion.** System `prefers-reduced-motion` or the visitor's own toggle (bottom-left dot or menu) removes the ink trail, all pinning, and every scrubbed scene. Sections render as a stacked page. Framer runs with `MotionConfig reducedMotion="always"`, and MapLibre jumps instead of flying.
- **Keyboard.** Perspective toggles are a Radix radio group (arrow keys, Enter/Space). The menu is a Radix dialog with a focus trap and Escape to close. "Explore map" moves focus to "Done exploring". Escape returns to the story and restores focus. Map handlers are off until exploring, so page scroll never zooms the map.
- **Screen readers.** Landmarks, labelled sections, tab/tabpanel roles in the FAQ and intake, decorative SVG and the ink trail hidden with `aria-hidden`, and `inert` on hidden chapter copy and on the page while the map is being explored.
- **Ink trail.** `pointer-events: none`. It ignores pointers over links, buttons, inputs, and MapLibre controls, and it is not rendered while exploring.

## Known limits

- The RealScout components use a closed shadow root and no ready event. The widget reports "ready" from its painted size, not from a confirmed feed load.
- If OpenFreeMap or WebGL is unavailable, a Natural Earth national outline is shown instead.
- The listing card in "Read a place" is labelled illustrative. It is not a real listing.
