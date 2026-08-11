# Quiet Watersheds generator

This offline generator creates the complete 50-state map-art corpus from the pinned Natural Earth sources in `reference/geodata/natural-earth/`.

```bash
python3 -m pip install -r scripts/state-ink/requirements.txt
npm run generate:state-art
npm run check:state-art
```

Outputs:

- `public/maps/us-state-studies/v1/manifest.json`
- `public/maps/us-state-studies/v1/states/US-XX.svg`
- `public/maps/us-state-studies/v1/states/US-XX.webp`
- `reference/state-art-corpus/v1/contact-sheet.webp`
- `reference/state-art-corpus/v1/PROVENANCE.json`

Generation is deterministic for the pinned source files and code. It uses real state and Natural Earth river/lake-centerline geometry, never fabricated waterways. Natural Earth has no state-scale centerline intersections for Delaware, Hawaii, or Rhode Island; those plates intentionally contain no blue river line. Hawaii is framed to the main island chain for a legible editorial composition.

The output is an editorial approximation, not a legal boundary, parcel, navigation, or listing-availability map. Do not load all 50 images at page startup; select one by ISO 3166-2 ID after the location interpretation step.
