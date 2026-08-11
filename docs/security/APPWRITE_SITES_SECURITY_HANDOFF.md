# Appwrite Sites security handoff

This is the security design for the static Arχ & Teχt export. It does not authorize an external deployment.

## 1. Static-site trust boundary

The production build is a Next.js static export. Appwrite will serve the files in `out/`; there is no trusted application server behind a page request.

Anything in the following locations is public:

- generated HTML, CSS, JavaScript, source maps, and assets in `out/`;
- values compiled into the client bundle;
- every `NEXT_PUBLIC_*` value;
- canonical/resource URLs in the resource manifest; and
- widget markup, script URLs, custom-element attributes, and browser requests.

The browser must never receive a private RealScout credential, Appwrite API key, server JWT, or private support URL. Appwrite lets a static Site read variables during its build, but a variable marked Secret is only hidden from later Console/API reads; it can still be read by the build. If build code inlines or copies it, it becomes public. This static Site therefore needs no private variable. See [Sites environment variables](https://appwrite.io/docs/products/sites/environment-variables).

Do not set keys beginning with `APPWRITE_`; Appwrite reserves that prefix for deployment-injected values. In particular, never copy `APPWRITE_SITE_API_KEY` into generated output.

### Source-controlled now

- Keep `content/resources.json` empty until official URLs are verified.
- Keep the widget mount point inert until the exact snippet and network contract are supplied.
- Treat `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` as public strings.
- Use only HTTPS canonical URLs.
- Keep `out/`, `.env*`, local CLI preferences, and real Appwrite config out of commits when they contain environment-specific data.

### Console action later

- Configure the Site as **Static** with `npm ci`, `npm test`, and output directory `out` so source and exported-output security contracts gate activation.
- Leave `NEXT_PUBLIC_BASE_PATH` empty on Appwrite.
- Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and redeploy.
- Do not create a Site secret merely because Appwrite offers the option.

Appwrite's Static guide requires `output: "export"` for Next.js and a matching build output directory: [Static Sites](https://appwrite.io/docs/products/sites/rendering/static).

## 2. HTTPS, response headers, and CSP

Appwrite generates TLS certificates and enforces HTTPS for generated and custom Sites domains. Verify the certificate and redirects after DNS is active; do not infer success from a green build alone. See [Sites domains](https://appwrite.io/docs/products/sites/domains) and [Appwrite TLS](https://appwrite.io/docs/advanced/security/tls).

### What current Appwrite documentation proves

- Sites support Static and SSR adapters, domains, variables, logging, build settings, and deployments.
- Appwrite-managed domains enforce HTTPS/TLS.
- The current Sites API does **not** document a custom response-header collection on Site configuration.

The final point is a documentation/API finding, not a claim that Appwrite can never add the feature. Confirm the current Console at setup time. The authoritative Site fields are listed in the [Sites API reference](https://appwrite.io/docs/references/cloud/server-nodejs/sites).

### CSP plan for the current static build

Before a widget is added, a source-level `<meta http-equiv="Content-Security-Policy">` can provide a limited document CSP. It cannot replace every response header, and `frame-ancestors` must be sent as an HTTP response header to protect against framing. Do not add a policy blindly: Next.js bootstrap code and the future widget must be tested against it.

Staging draft, not an approved production policy:

```text
default-src 'self';
base-uri 'none';
object-src 'none';
form-action 'self';
img-src 'self' data:;
font-src 'self' data:;
style-src 'self' 'unsafe-inline';
script-src 'self' 'unsafe-inline';
connect-src 'self';
frame-src 'none';
worker-src 'none';
upgrade-insecure-requests
```

This draft deliberately excludes every third-party execution and connection origin. After the real widget arrives, inventory its exact origins and add only the minimum directives required. Never replace that review with `script-src https:`, `connect-src *`, `frame-src *`, or a blanket `*.realscout.com` wildcard.

If production requires response-only controls such as `frame-ancestors`, `X-Content-Type-Options`, `Permissions-Policy`, or a report-only CSP, the owner must first confirm whether the Appwrite Console/account exposes a supported header control. If it does not, choose one of these explicitly:

1. keep the static dual-hosting design and place an authorized response-header layer in front of Appwrite;
2. change production to a server-rendered Site that sets response headers, accepting that GitHub Pages is no longer the identical runtime; or
3. record the missing header as an accepted risk with an owner and review date.

Do not claim a header is active until `curl` and a browser network inspection show it on the production response.

## 3. RealScout URL allowlist

External resource links are data, not trusted markup.

- Permit only `https:` URLs.
- Match hostnames exactly after URL parsing; do not use substring tests.
- The initial public-link host list is `support.realscout.com` and `learn.realscout.com`, based on the provided handoff scope.
- RealScout Academy remains unlisted until its canonical hostname is returned and verified by the authenticated work account.
- Require `verified: true`, `safe_for_public_site: true`, and `access_level: "public"` before rendering a link on the public static site.
- Keep login-required and internal-only records out of generated navigation even if their hostname is allowed.
- Reject URL usernames/passwords, non-default ports, IP literals, protocol-relative URLs, redirects to another hostname, and executable schemes.
- Open third-party pages with `rel="noopener noreferrer"`; never inject returned titles or descriptions as HTML.

The example allowlist is intentionally split by capability. A host allowed for an ordinary link is **not** automatically allowed to execute script, receive browser API calls, frame content, load styles, or receive form submissions.

## 4. Optional Function proxy for a private widget credential

First ask RealScout whether the widget value is intentionally public. Many browser widgets use a public site identifier. Adding a proxy without a private credential creates complexity without adding secrecy.

If RealScout confirms a credential must remain private, do not add it to this static Site. Create a separate Appwrite Function only after the owner approves its endpoint and data flow.

### Minimum Function design

- Store the credential as a **Function-scoped Secret** variable, not a project-wide or Site variable. Appwrite secret variables become unreadable from the Console/API after creation and changes require a redeployment. See [Function environment variables](https://appwrite.io/docs/products/functions/environment-variables).
- Use a fixed upstream RealScout origin and fixed operation. Never accept a caller-provided destination URL, host, authorization header, or arbitrary upstream path.
- Accept only the needed method and content type. Reject unexpected methods with `405`, oversized bodies with `413`, invalid schemas with `400`, and throttled callers with `429`.
- Parse and rebuild the upstream payload from an allowlisted schema. Do not forward raw browser headers or bodies.
- Return a minimal response and generic public errors. Do not expose upstream bodies, stack traces, environment values, or account identifiers.
- Set exact CORS origins for production and staging. Origin checks reduce browser misuse but are not authentication.
- Set a short upstream timeout and fail closed.
- Give the Function dynamic Appwrite API key no scopes unless the Function truly needs Appwrite project resources. Appwrite documents Function execute access and dynamic-key scopes in [Functions](https://appwrite.io/docs/products/functions/functions).

Function domains are guest endpoints. Appwrite states that anyone using a generated or custom Function domain is considered a guest; a domain call that must be public uses `Any` execute access, while protected operations need authentication such as JWT. See [Function execution and permissions](https://appwrite.io/docs/products/functions/execute). For a public marketing page, assume attackers can call the domain outside a browser.

### Abuse controls

Appwrite Cloud's managed DDoS protection is enabled on all plans, but it does not enforce the widget's business quota. Appwrite also notes that its API route limits apply to Client SDK routes and not Server SDK calls authenticated with API keys. See [DDoS mitigation](https://appwrite.io/docs/products/network/ddos) and [API rate limits](https://appwrite.io/docs/advanced/security/rate-limits).

For a public Function proxy, implement application-level throttling before the upstream call:

- provisional launch ceiling: burst of 3 and 10 requests per minute per normalized client key;
- a separate global circuit breaker tied to the RealScout vendor quota;
- bounded request body and response sizes;
- idempotency/deduplication if the operation mutates state; and
- a deny response when the counter store is unavailable.

The numbers are starting limits, not Appwrite defaults. Replace them with the vendor's documented quota and measured traffic before production. Do not use an unverified client IP header as the only identity signal; combine available Appwrite request metadata with a short-lived anonymous client token, or require Appwrite authentication for non-public operations.

## 5. Logs and privacy

Keep Site request logging enabled through staging and launch. Appwrite Site logs show method, path, status, duration, and request/response details. Current retention is 24 hours on Free and 7 days on Pro; longer retention needs an explicitly permissioned store and cleanup plan. See [Site logs](https://appwrite.io/docs/products/sites/logs).

For the optional Function:

- log request ID, outcome category, status, duration, throttle decision, and upstream status class;
- never log credentials, authorization headers, request/response bodies, email addresses, names, or full query strings;
- do not place secrets or personal data in URLs;
- enable execution logs during staging and use redacted structured events in production; and
- define who reviews alerts and within what time window.

Appwrite creates an execution record for each run and exposes execution status and duration. See [Function executions](https://appwrite.io/docs/products/functions/executions).

## 6. Environment separation

Preferred boundary:

- separate Appwrite projects for development/staging and production;
- separate RealScout credentials and quotas;
- separate Site/Function domains; and
- no production variables in pull-request builds.

Appwrite project variables are inherited by every Site and Function in that project. If separate projects are not available, use Site-scoped and Function-scoped variables, distinct staging resources, and exact domain allowlists. Do not put a production credential in a shared project variable. Variable changes require redeployment. See [Sites environment variables](https://appwrite.io/docs/products/sites/environment-variables).

Appwrite can map a domain to the active deployment or to a Git branch. Use the active-deployment rule for production and a separate branch domain for staging. See [domain rule types](https://appwrite.io/docs/products/sites/domains).

## 7. Least-privilege Git integration

Owner actions in Appwrite:

1. Install the Appwrite GitHub integration for this repository only, not all repositories.
2. Set `main` as the production branch.
3. Set the repository root to the app root.
4. Use branch/path filters so unrelated branches and files do not trigger production builds.
5. Keep preview URLs limited to authorized Appwrite organization members.
6. Review Appwrite organization membership before connecting the repository and after staff changes.
7. Do not store a Git personal access token in source or Site variables.

Appwrite's Git flow automatically activates pushes to the configured production branch; other branches receive previews for organization members. Build trigger filters are configured in Site Git settings. See [Deploy from Git](https://appwrite.io/docs/products/sites/deploy-from-git).

Because production-branch pushes auto-activate, require source-control review and a passing static-export test before merge. That control lives in the source host and must be configured by the repository owner.

## 8. Incident response and rollback

### Roll back immediately when

- a secret or internal URL appears in `out/`, browser traffic, logs, or source;
- the widget sends data to an unapproved origin;
- a malicious or incorrect resource link is published;
- the proxy bypasses its method/schema/size/allowlist checks;
- abuse threatens the upstream quota; or
- the Site's primary learning or inquiry flow is broken after deployment.

### Containment order

1. If a private credential may be exposed, revoke or rotate it with RealScout first.
2. Disable the affected Function or remove public execute access; deleting the Site build alone does not stop a separate Function domain.
3. In Appwrite Sites, use **Instant Rollback** to promote the last known-good ready deployment.
4. Confirm the production domain serves the previous commit and the suspect deployment is no longer active.
5. Preserve only redacted evidence: deployment/commit IDs, timestamps, status codes, and affected routes.
6. Fix and validate in staging, then create a new deployment. Do not reactivate the suspect build.

Appwrite instant rollback changes the active deployment without rebuilding or deleting code. Keep enough non-active deployments to retain at least one reviewed known-good release; Appwrite deployment retention controls how long they remain available. See [Instant rollbacks](https://appwrite.io/docs/products/sites/instant-rollbacks) and [Site deployments and retention](https://appwrite.io/docs/products/sites/deployments).

After recovery, review Git access, Appwrite organization membership, variable scope, Function permissions, logs, and the RealScout allowlist before closing the incident.
