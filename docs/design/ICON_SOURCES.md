# Arχ & Teχt symbol provenance

Updated: 2026-08-12

## Summary

**No third-party SVG files are vendored into this repository.** All sixteen
glyphs in `app/components/architectural/ArchitecturalGlyph.tsx` are original
Arχ & Teχt artwork, drawn as inline SVG geometry on a 24×24 canonical grid.

Consequently the symbol system carries **no attribution obligation, no
third-party license text to redistribute, and no icon package in the runtime
bundle**.

This file records the license research that led to that decision, so the
provenance question does not need to be re-litigated later.

## License research (verified per source, August 2026)

Candidate source families were evaluated before deciding to draw the set
ourselves. Each license was read at its authoritative source rather than
taken from a summary or aggregator page.

| Source | License | Attribution required | Verified at |
| --- | --- | --- | --- |
| Iconoir | MIT (© 2021 Luca Burgio) | **Yes** | `github.com/iconoir-icons/iconoir/blob/main/LICENSE` |
| Maki (Mapbox) | CC0-1.0 | No | `github.com/mapbox/maki` |
| Japanese map symbols (Wikimedia Commons) | **Varies per file** | Depends on file | Individual file description pages |
| Tabler | MIT | Yes | Not evaluated further — not needed |

### Notes on Iconoir

A claim circulates that Iconoir requires no attribution. That is **incorrect**.
Iconoir is MIT licensed, and the MIT license states: *"The above copyright
notice and this permission notice shall be included in all copies or
substantial portions of the Software."* Vendoring Iconoir SVGs would
therefore require carrying its copyright notice.

### Notes on Japanese map symbols

Wikimedia Commons' `Category:Map_symbols_of_Japan` provides **no
category-wide license guarantee**. The category page states that "Files are
available under licenses specified on their description page."

Two individual files were checked directly:

- `File:Japanese Map symbol (Standard point).svg`
- `File:Japanese Map symbol (Museum).svg`

Both carry: *"This work is ineligible for copyright and therefore in the
public domain because it consists entirely of information that is common
property and contains no original authorship."*

That is a strong position — these are standardised Geospatial Information
Authority of Japan symbols with no original authorship — but it applies to
those specific files, not to the category. Any future file would need its own
check.

A further subtlety informed the decision to draw rather than copy: while the
*symbol geometry* is public domain, a particular contributor's **SVG
rendering** of it could carry thin copyright of its own. Redrawing from the
public-domain symbol vocabulary avoids that question entirely.

## Japanese influence

The Japanese cartographic influence in this set is **abstraction and economy
of line**, not copied artwork:

- restraint in stroke count
- functional marks rather than illustration
- quiet information density
- precision over decoration

No file, path, or glyph was copied from any Japanese symbol set. There are no
kanji, pseudo-Japanese type, or ornamental motifs in the vocabulary.

## The sixteen glyphs

All are **original Arχ & Teχt artwork**, © the project, drawn for this
repository. Defined in
`app/components/architectural/ArchitecturalGlyph.tsx`.

| # | Name | Meaning | Primary use |
| --- | --- | --- | --- |
| 01 | `origin` | home / reset | Drawing index → `#top` |
| 02 | `section-cut` | residences / chapters | Section navigation, chapter changes |
| 03 | `coordinate` | place / inspect | Geographic inspection, map metadata |
| 04 | `survey-point` | active geography | Drawing index → `#markets`, selected place |
| 05 | `triangulation` | orientation / map | Secondary map marker, survey geometry |
| 06 | `datum` | section registration | Active navigation state, alignment |
| 07 | `registration` | selection / corners | Selected object, keyboard focus, active frame |
| 08 | `measure` | dimensions / compare | Property dimensions, distance |
| 09 | `detail-callout` | deep link / expand | Inspect detail, reveal deeper information |
| 10 | `north-mark` | orientation | Maps, market chapters, geographic metadata |
| 11 | `scale` | map / drawing metadata | Drawing index footer, scale readouts |
| 12 | `field-note` | journal / editorial | Drawing index → `#approach`, notes, essays |
| 13 | `property-plate` | residence selection | Drawing index → `#properties`, listing object |
| 14 | `trace` | hover / reveal | Traceable geometry, neighborhood reveal |
| 15 | `intersection` | inquiry / action | Drawing index → `#contact`, primary action |
| 16 | `archive-mark` | saved / collected | Saved property, collection, indexed material |

### Relationship to the existing primitives

`app/components/architectural/primitives.tsx` already contained original
project artwork predating this set — `DatumMark`, `RegistrationMarks`,
`NorthMark`, `CoordinateStamp`, `DrawingGrid`, `MapTrace`, `BuildingTrace`.
Those remain in place and continue to serve the hero composition, where they
are used at composition scale rather than as 24×24 marks. The glyph set
follows their drawing conventions (currentColor, `fill="none"`, square caps,
miter joins, ~0.75–1.25px perceived stroke) so the two read as one language.

## Drawing rules

Any glyph added to this set must follow:

- 24×24 canonical `viewBox`
- `fill="none"` by default; fills only for small registration dots
- `currentColor` so the mark inherits `--ink` / `--blueprint` / `--ash`
- `strokeLinecap="square"`, `strokeLinejoin="miter"`
- perceived stroke weight approximately 0.75–1.25px
- no rounded consumer-app softening
- no emoji or Unicode glyph substitution in production
- decorative instances `aria-hidden`; interactive instances need a `label`

If a future symbol genuinely cannot be drawn in-house and a third-party file
must be vendored, add a row to the license table above recording the icon
name, source, URL, license, attribution requirement, and the local component
that consumes it — and do not include it if the license is unclear.
