# Focused follow-up prompts for Sites

Use only the prompt matching the observed problem. Avoid “make it better,” which tends to erase the deliberate visual direction.

## If the page looks like separate slides

> Keep the current Japanese Ink visual system and copy. Change only the chapter transition: overlap the outgoing and incoming base layers for the full final 38% of each chapter, make both active overlays visible during that overlap, and use the same vermilion seal point for outgoing gather and incoming settle. Remove any pause, blank frame, hard cut, or scroll snap between chapters.

## If scrolling feels hijacked

> Preserve the design and animation, but remove mandatory scroll snapping, wheel interception, programmatic scrolling, and touch prevention. The document must use native vertical scrolling. Drive progress from scroll position with a passive listener and one requestAnimationFrame loop.

## If performance is poor

> Audit network and DOM usage against the supplied asset contract. The live page may load only each study’s base WebP, active-overlay SVG, and active JSON. Keep only current and next studies mounted. Never load motion.svg, overlay.svg, or pieces.json. Limit mobile to 80 active wrappers and desktop to 160. Do not put scroll progress in React state.

## If the design becomes generic

> Remove cards, pills, rounded panels, gradients, icon decorations, and large marketing typography. Restore the supplied paper/ink/wash/vermilion palette, Japanese editorial type stacks, one fixed seal point, sparse copy, and full-viewport maps. Do not change the supplied assets.

## If map labels appear

> Remove all visible city, state, country, and coordinate labels from the map artwork. Keep real location names only in semantic headings, accessibility descriptions, metadata, and optional small editorial captions. Preserve the visible poetic captions from COPY_DECK.md.

## If reverse scrolling breaks

> Replace time-based animation timelines with pure functions of local chapter scroll progress. Every wrapper transform, base opacity, copy opacity, and seal state must be derived deterministically from progress so scrolling upward reconstructs the prior frame exactly.

## Final verification prompt

> Validate the finished single-route page against every checkbox in QA_CHECKLIST.md. Fix only failed checks. Then run the Sites production build. Do not redesign, add features, replace assets, or publish publicly without the access behavior I requested.
