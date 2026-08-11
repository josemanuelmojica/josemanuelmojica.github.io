# Reference archive

This directory is a design/source archive for the next collaborator. Nothing under `reference/` is imported by the production application or copied into Next.js `out/`; the offline state-art generator does read its pinned source data from here.

## Inventory

| Path | Files | Purpose |
| --- | ---: | --- |
| `original-handoff/` | 10 | Exact uploaded handoff: master prompt, interaction/component specs, copy, design tokens, QA, follow-ups, asset guide, README, and original asset zip. |
| `generator/full-map-assets/` | 65 | Complete eight-study map set: base and preview rasters, active overlays/metadata, archival motion SVGs, 3,000-piece overlays/metadata, and per-study manifests. |
| `generator/posters/` | 20 | Japanese-ink poster/source iterations, including earlier New York and Tokyo studies. |
| `generator/core/` | 85 | Python poster generator, themes, fonts, JS map-piece library, web UI, build/package scripts, storyboard, tests, sample assets, and ant-motion experiment. |
| `previous-site/` | 168 | Source and built snapshot of the earlier endlessly scrolling site iteration, excluding its `.git`, caches, and installed dependencies. |
| `iteration-screenshots/` | 7 | Six user-provided design checkpoints plus their index. |
| `geodata/natural-earth/` | 3 | Two pinned public-domain Natural Earth GeoJSON sources plus retrieval/checksum notes. |
| `state-art-corpus/v1/` | 4 | Quiet Watersheds contact sheet, provenance, corpus notes, and algorithmic-art review record. |

The archive is deliberately large because it preserves the high-resolution, piece-addressable map sources needed for puzzle/explode/reorganize experiments. No individual archived file should exceed GitHub's 100MB single-file limit, but repository transfer size should be considered before choosing Git LFS or a release-asset strategy.

`FILE_INDEX.json` is the complete machine-readable inventory: 362 files, 659,741,003 bytes, with a SHA-256 digest for every archived file. Regenerate it after changing the archive with `npm run manifest:reference`.

## Recommended reading order

1. `../PROJECT_MANIFEST.md`
2. `../handoff_checkpoint.md`
3. `../docs/DESIGN_LINEAGE.md`
4. `original-handoff/MASTER_PROMPT.md`
5. `original-handoff/INTERACTION_SPEC.md`
6. `generator/core/experiments/ant-motion/README.md`
7. `generator/core/packages/map-pieces/README.md`
8. The four live `/previews/` routes

## Runtime versus archive

- Production-safe active assets live in `../public/maps/japanese-ink-scroll/` and are intentionally small.
- The versioned Quiet Watersheds runtime lives in `../public/maps/us-state-studies/v1/`: 50 SVG + 50 WebP plates, a manifest, and an unresolved fallback. Manifest-declared assets total 3,250,794 bytes (~3.10 MiB); the directory is ~3.3 MB.
- Regenerate it from the pinned sources here with `npm run generate:state-art`, then verify with `npm run check:state-art`. Idaho is available as `US-ID`; Delaware, Hawaii, and Rhode Island intentionally have no fabricated river line where Natural Earth records no state-scale centerline intersection.
- The 50-state corpus is asset readiness only. No atlas UI, place interpreter, or conversational lead form is implemented.
- Archival 3,000-piece and full-motion assets live here so they cannot be fetched accidentally by the site.
- `previous-site/` is historical reference. Do not deploy its Cloudflare/Vinext build in place of the root Appwrite/GitHub Pages configuration.
- User-created neighborhood artwork should eventually replace the CSS-only `.market-portal__art-slot`; add the new source and usage notes to this archive before changing the live component.
