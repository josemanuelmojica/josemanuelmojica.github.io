# Cloudflare lead-capture operations

Status: source, D1 schema, encrypted secrets, and Cloudflare preview version 17 are prepared at `https://7b13b5ea-ark-and-text.j-m-mojica-g.workers.dev`. Automated contracts plus the preview homepage headers, `/api/health`, and CORS preflight pass; production remains unchanged. Do not promote the preview until an interactive Turnstile submission and D1-row inspection complete the gate below.

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
7. When `TURNSTILE_SECRET_KEY` exists, Siteverify must succeed with the exact `lead-interview` action before a lead is written.
8. `request_id` is the D1 primary key and inserts use `ON CONFLICT DO NOTHING`, making retries idempotent.
9. Responses are `no-store`; errors contain no submitted personal data.

`public/_headers` adds CSP, clickjacking, referrer, permissions, and MIME-sniffing protections to Cloudflare static responses. The CSP permits only the exact Turnstile origin in addition to the site itself.

## Required secrets

Configure these through Wrangler or the Cloudflare dashboard, never in Git:

- `RATE_LIMIT_SALT`: a long random value used only to make abuse-counter hashes unlinkable outside this Worker.
- `TURNSTILE_SECRET_KEY`: the private key paired with the public site key in `content/public-runtime-config.json`.

Optional non-secret configuration:

- `LEAD_ALLOWED_ORIGINS`: comma-separated exact origins for an Appwrite or GitHub Pages frontend. Each origin must also be approved in the Turnstile widget. Do not include paths, wildcards, or trailing slashes.
- `NEXT_PUBLIC_SUBMIT_LEAD_URL`: build-time public URL used by a frontend hosted away from the Worker. Leave empty for Cloudflare same-origin hosting.

The committed `.dev.vars.example` contains names and placeholders only. A real `.dev.vars` file is ignored.

## Preview release gate

1. Run `npm run typecheck` and `npm test`.
2. Confirm `npx wrangler d1 migrations list ark-and-text-leads --remote` has no pending migration.
3. Configure both required secrets.
4. Upload a version with `npx wrangler versions upload --tag architectural-symbol-system`; do not run `wrangler deploy` yet.
5. On the version preview, complete the Boise buy/sell interview and confirm the Idaho state plate appears.
6. Submit once through Turnstile. Confirm a single D1 row exists with the matching request ID, consent timestamp, `US-ID`, and no IP-address column.
7. Submit the same request ID again and confirm no duplicate row appears.
8. Test a malformed payload, an unapproved Origin, and six rapid valid attempts; expect 400, 403, and then 429 behavior.
9. Inspect Worker logs and confirm no name, email, narrative, Turnstile token, secret, or raw IP appears.
10. Only after all checks pass should an authorized owner promote that exact version.

## Lead handling and retention

The `leads` table currently does not delete records automatically. This is deliberate: retention is a business/privacy decision, not a code default. Before broad public traffic, the owner must choose a retention period, document who may export or change lead status, and approve a deletion procedure. The rate-limit table is maintenance data and old windows are deleted opportunistically.

Use Cloudflare's authenticated D1 console or a narrowly scoped administrative workflow to inspect/export leads. Never expose a read endpoint in the public Worker and never paste live rows into issue trackers, AI chats, test fixtures, or repository files.

## Rollback

Cloudflare versions are immutable. If preview verification fails, leave production unchanged. If a promoted version later fails, roll traffic back to the previously verified version, then disable the lead form or remove its endpoint override while investigating. Do not delete the D1 database during rollback; it may contain legitimate inquiries.
