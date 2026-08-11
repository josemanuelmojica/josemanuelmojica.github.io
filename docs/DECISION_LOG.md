# Decision log

This is the concise chronological record of user direction. Later entries supersede earlier experiments when they conflict.

1. Build a working luxury real-estate experience from the Japanese Ink Scroll handoff; the supplied prompt may be misaligned, but its visual/interaction ideas are sound.
2. Bring in the Streamline Freehand icon language where appropriate.
3. Correct the brand name to **Arχ & Teχt**; `χ` is Greek chi and the name should hint at “architect.”
4. Use a white background with blueprint-blue gradients. Preserve the exact wordmark kerning from the supplied artwork rather than recreating it as text.
5. Keep the theme and line **“Be drawn to where you live.”** Remove generic luxury copy and over-written AI phrasing.
6. Keep the site portable as normal HTML/static output for GitHub and Appwrite rather than depending on a proprietary site builder.
7. Provide RealScout customer-learning pages/popups later, using verified Support, Learn, Academy, and product links. Never invent routes; the work-account research prompt is part of the repository.
8. The real RealScout widget will be supplied separately. Do not use an iframe for market/support destinations.
9. Build four separate architectural graph-paper navigation studies so the best ideas can later be recombined.
10. Restore the endlessly scrolling market narrative from the earlier site.
11. Make “Explore this market” a line that spans the entire viewport. A click should go to a city/market search link.
12. The temporary pink marker in the Minneapolis screenshot indicated placement, not final art.
13. A property-photo portal was tested on the right edge, then tested centered with a faded blueprint gradient after clipping feedback.
14. Final direction superseding the photo tests: **render no property image** in the market target. Move a named neighborhood/subarea target to the right (for example, Charlotte → Myers Park). Keep its art placeholder dormant until hover or keyboard focus; click navigates. The user will create the final artwork.
15. Preserve all iterations, prompts, image-generation/map libraries, full puzzle-piece assets, and ant-like motion experiments for a Claude design pass. Claude is a teammate and should receive the complete lineage, not only the latest code.
16. Expand “Tell us what you’re looking forward to” into a future conversational lead-capture interview. It should interpret a place or ZIP, draw a rough graph-paper region, confirm the result, and only then collect a consented lead. Required example: “looking/selling in Boise” produces an Idaho-level visual, not a city/county boundary.
17. Do not upload to GitHub or activate Appwrite until the local repository, manifest, security review, and Claude handoff are complete and the user authorizes the external destination.
18. Preserve **Quiet Watersheds** as a deterministic 50-state asset corpus: 50 SVG + 50 WebP plates, manifest, and fallback under `public/maps/us-state-studies/v1/`, generated from pinned public-domain Natural Earth data with `npm run generate:state-art` and verified with `npm run check:state-art`. Idaho (`US-ID`) is ready for the future Boise response. Delaware, Hawaii, and Rhode Island retain no blue river line where the source has no state-scale centerline intersection; do not fabricate one. This decision creates asset readiness only—no atlas UI or conversational lead form is implemented.
