# Lead-capture map interview

Status: product/design concept for the next iteration. It is intentionally documented but not implemented in the current static build.

## Product intent

Turn “Tell us what you’re looking forward to” into a short, natural interview rather than a generic contact form. The visitor should be able to describe where they hope to buy, sell, or move in ordinary language, see a deliberately rough map interpretation, correct it, and then choose whether to share contact details.

The map is a conversational response, not a claim of property availability or exact boundary accuracy.

## Core flow

1. **Intent** — Ask what the visitor is looking forward to: buying, selling, both, or still exploring.
2. **First search** — Ask: “Where do you search first?” Accept a place name, ZIP/postal code, or short phrase such as “looking and selling in Boise.”
3. **Interpretation** — Parse the text into intent, candidate place, region, and confidence. Resolve ambiguous results with one short clarification instead of silently guessing.
4. **Map response** — Render a stationary, graph-paper or blueprint approximation of the resolved region. The initial visual scope is intentionally broad and editorial.
5. **Confirmation** — Say what was understood in plain language: “You’re looking around Boise, Idaho. Start with Idaho?” Let the visitor correct the place or narrow the scope.
6. **Needs** — Ask only the next useful questions: timing, property type, budget band, must-have, and whether there is a home to sell.
7. **Consent and contact** — Collect name plus one preferred contact method only after showing the useful map response. State what will happen next and require affirmative consent before submitting.

## Scope rule and required example

The first visualization should favor a recognizable state/region silhouette over false city-level precision.

Input: `looking/selling in Boise`

Expected interpretation:

```json
{
  "intent": ["buy", "sell"],
  "query": "Boise",
  "locality": "Boise",
  "region": "Idaho",
  "country": "US",
  "visual_scope": "state",
  "visual_id": "US-ID",
  "needs_confirmation": false
}
```

Expected next screen: an Idaho-shaped, stationary blueprint/map study. Do not default to a Boise city boundary or Ada County polygon. The copy may mention Boise while the graphic remains Idaho-level.

## Interpretation pipeline

Use a deterministic parser before an LLM:

1. Normalize whitespace, punctuation, common intent words, and US ZIP formats.
2. Detect intent terms (`buy`, `looking`, `sell`, `selling`, `relocate`, and close variants).
3. Resolve ZIP codes from a reviewed postal dataset, or geocode place text through an approved server-side provider.
4. Rank candidates by exact locality/region match, country, and confidence.
5. Map the winning locality to its containing first-order region (US state) for the initial visual.
6. Ask a clarification whenever candidate confidence is below the agreed threshold or multiple regions tie.
7. Optionally use an LLM only to structure genuinely conversational input. Validate its result against the deterministic geographic lookup before rendering or storing it.

Never expose a geocoding key in `NEXT_PUBLIC_*` variables. The static site should call an Appwrite Function (or another approved server endpoint) for geocoding, NLP, and lead submission.

## Suggested API boundary

`POST /interpret-location`

```json
{
  "utterance": "looking/selling in Boise",
  "locale": "en-US"
}
```

Response:

```json
{
  "intent": ["buy", "sell"],
  "display_place": "Boise, Idaho",
  "visual_scope": "state",
  "visual_id": "US-ID",
  "confidence": 0.96,
  "alternatives": [],
  "prompt": "You’re looking around Boise, Idaho. Start with Idaho?"
}
```

`POST /leads` should accept only the confirmed interpretation, interview answers, contact fields, consent timestamp/version, and a server-generated request ID. Rate-limit it, validate every field, and do not log raw contact details in normal diagnostic logs.

## Visual behavior

- Reuse the paper, blueprint, datum, survey-mark, and route-line language already in the site.
- Keep the first map stationary or limited to a short, reversible reveal. The interview must remain usable with reduced motion.
- A future art renderer may select a pre-generated state study or derive a coarse polygon. Never imply parcel-level accuracy.
- If the location cannot be resolved, show graph paper plus a clear correction prompt rather than a fabricated map.
- Preserve keyboard access, visible focus, a 44px minimum target, and plain-text status alongside the visual.

## Data minimization and trust

- Interpret location before asking for PII.
- Do not store the raw utterance longer than needed unless the visitor consents.
- Do not use precise browser geolocation by default.
- Make “Back,” “Edit location,” and “Skip for now” available.
- The form must not submit on hover, map interaction, or focus; only an explicit final action submits the lead.
- Add bot protection and abuse throttling server-side without creating an inaccessible CAPTCHA gate.

## Acceptance checks

- “Looking/selling in Boise” produces an Idaho-level visual and correct buy/sell intent.
- A valid ZIP resolves to the containing state, shows the normalized place in text, and can be corrected.
- An ambiguous place (for example, “Portland”) asks which state rather than choosing silently.
- No geocoding or CRM secret appears in `out/` or the browser network configuration.
- A failed interpretation leaves every entered answer recoverable.
- Keyboard-only, touch, reduced-motion, 200% zoom, and screen-reader flows can finish the interview.
- Lead submission is explicit, consented, rate-limited, and returns a useful success/failure state.

## Claude design brief

Design this as a calm editorial conversation, not a SaaS wizard. The map response should feel like the site has drawn what it heard. Explore how the broad state silhouette, graph-paper construction lines, and a movable datum can make the interpretation legible without competing with the questions. Preserve the existing wordmark artwork and the line “Be drawn to where you live.”
