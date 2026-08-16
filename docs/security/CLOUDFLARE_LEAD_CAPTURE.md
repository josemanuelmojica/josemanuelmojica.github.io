# Cloudflare lead-capture operations

Status: source, D1 schema, encrypted secrets, and Cloudflare preview version 17 are prepared at `https://7b13b5ea-ark-and-text.j-m-mojica-g.workers.dev`. Automated contracts plus the preview homepage headers, `/api/health`, and CORS preflight pass; production remains unchanged. The current branch adds fail-closed Turnstile configuration and exact hostname/request binding after version 17, so it requires a new preview upload and the complete release gate below before promotion.

## Architecture

- `app/LeadInterview.tsx` collects intent, location, state-visual confirmation, needs, contact details, and affirmative contact consent.
- `app/TurnstileWidget.tsx` obtains a short-lived browser challenge token. Its site key is public.
- `worker/lead.ts` accepts `POST /api/lead`; browser clients never receive D1 access or a Turnstile secret.
- D1 database `ark-and-text-leads` is bound as `LEADS`. Its public database ID is recorded in `wrangler.jsonc`.
- `migrations/0001_lead_capture.sql` creates `leads`, `lead_rate_limits`, and their indexes.

## Security controls

The endpoint is deny-by-default:

1. Only exact same-origin requests are accepted unless an origin is listed verbatim in `LEAD_ALLOWED_ORIGINS`.
2. Approved cross-origin clients receive a bounded `POST`/`OPTIONS` CORS policy; wildcard origins are never used.
3. JSON is required and the encoded body is limited to 32 KiB.
4. The validator accepts only known fields, a valid email, affirmative consent, an ISO consent timestamp, a known `US-XX` state-art ID, the expected source ID, and a local page path.
5. A honeypot submission receives the same accepted response but is not written.
6. A salted SHA-256 client hash is rate-limited to five attempts per ten-minute window in D1. Raw IP addresses are never stored or logged.
7. `TURNSTILE_SECRET_KEY` is mandatory. A missing secret returns `503`; the endpoint never falls back to accepting an unverified lead.
8. Siteverify has an eight-second timeout and must return the exact `lead-interview` action, the requesting frontend's exact hostname, and the form's UUID in `cdata`. A token copied from another host or submission is rejected.
9. `request_id` is a UUIDv4, the D1 primary key, the Turnstile `cdata` value, and the Siteverify idempotency key. Inserts use `ON CONFLICT DO NOTHING`, making retries idempotent.
10. Responses are `no-store` and `nosniff`; errors contain no submitted personal data.

`public/_headers` adds CSP, clickjacking, referrer, permissions, and MIME-sniffing protections to Cloudflare static responses. The CSP permits only the exact Turnstile origin in addition to the site itself.

## Required secrets

Configure these through Wrangler or the Cloudflare dashboard, never in Git:

- `RATE_LIMIT_SALT`: a long random value used only to make abuse-counter hashes unlinkable outside this Worker.
- `TURNSTILE_SECRET_KEY`: the private key paired with the public site key in `content/public-runtime-config.json`.

Optional non-secret configuration:

- `LEAD_ALLOWED_ORIGINS`: comma-separated exact origins for an Appwrite or GitHub Pages frontend. Each origin must also be approved in the Turnstile widget. Do not include paths, wildcards, or trailing slashes.
- `NEXT_PUBLIC_SUBMIT_LEAD_URL`: build-time public URL used by a frontend hosted away from the Worker. Leave empty for Cloudflare same-origin hosting.

The committed `.dev.vars.example` contains names and placeholders only. A real `.dev.vars` file is ignored.

## Authentication and spoofing boundary

The visitor interview is intentionally a public contact form, not an account login. Requiring brokerage credentials or a social login would block legitimate prospects without proving that their housing inquiry is truthful. Its security boundary is therefore Turnstile proof, exact-origin enforcement, strict validation, throttling, affirmative consent, and server-only database access.

Lead administration is authenticated separately. For the current release, reads and exports remain in Cloudflare's authenticated D1 console; the public Worker has no lead-list, lead-read, or lead-export endpoint. If a staff dashboard is added, protect its hostname or path with Cloudflare Access and also validate the `Cf-Access-Jwt-Assertion` JWT in the Worker against the exact Access audience and issuer. Do not rely on the Access cookie alone and do not reuse the public lead endpoint for administration.

Turnstile proves that Cloudflare accepted a short-lived browser challenge; it does not prove that the visitor owns the email address they typed. If verified email ownership becomes a requirement, add a double-opt-in or one-time-code flow through an approved transactional-email provider. Until then, treat new leads as unverified contact requests and never automate irreversible actions from the submitted text.

For a custom production domain proxied through a Cloudflare zone, add a WAF rate-limiting rule for `POST /api/lead` as a coarse outer limit. Keep the D1 limit as the application-level backstop: the two layers protect different failure modes, and feature availability for WAF rules varies by Cloudflare plan.

## Preview release gate

1. Run `npm run typecheck` and `npm test`.
2. Confirm `npx wrangler d1 migrations list ark-and-text-leads --remote` has no pending migration.
3. Configure both required secrets.
4. Upload a version with `npx wrangler versions upload --tag architectural-symbol-system`; do not run `wrangler deploy` yet.
5. On the version preview, complete the Boise buy/sell interview and confirm the Idaho state plate appears.
6. Submit once through Turnstile. Confirm a single D1 row exists with the matching UUID request ID, consent timestamp, `US-ID`, and no IP-address column.
7. Submit the same request ID again and confirm no duplicate row appears.
8. Test a malformed payload, an unapproved Origin, a mismatched Turnstile hostname/`cdata`, a missing Turnstile secret in a disposable local environment, and six rapid valid attempts; expect 400, 403, 400, 503, and then 429 behavior.
9. Inspect Worker logs and confirm no name, email, narrative, Turnstile token, secret, or raw IP appears.
10. Only after all checks pass should an authorized owner promote that exact version.

## Lead handling and retention

The `leads` table currently does not delete records automatically. This is deliberate: retention is a business/privacy decision, not a code default. Before broad public traffic, the owner must choose a retention period, document who may export or change lead status, and approve a deletion procedure. The rate-limit table is maintenance data and old windows are deleted opportunistically.

Use Cloudflare's authenticated D1 console or a narrowly scoped administrative workflow to inspect/export leads. Never expose a read endpoint in the public Worker and never paste live rows into issue trackers, AI chats, test fixtures, or repository files.

## Rollback

Cloudflare versions are immutable. If preview verification fails, leave production unchanged. If a promoted version later fails, roll traffic back to the previously verified version, then disable the lead form or remove its endpoint override while investigating. Do not delete the D1 database during rollback; it may contain legitimate inquiries.
