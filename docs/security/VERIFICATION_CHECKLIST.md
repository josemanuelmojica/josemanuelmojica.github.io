# Production security verification checklist

Date: __________
Reviewer: __________
Commit: __________
Appwrite deployment: __________
Production origin: __________

Do not mark this checklist complete from configuration screenshots alone. Verify the built artifact and deployed response.

## A. Source and export

- [ ] `npm test` succeeds on the exact commit being deployed.
- [ ] `out/index.html`, `out/previews/index.html`, and all four `out/previews/*/index.html` files exist.
- [ ] `content/resources.json` validates against its schema.
- [ ] Every rendered resource has `verified: true`, `safe_for_public_site: true`, and `access_level: "public"`.
- [ ] Every RealScout resource URL uses `https:` and an exactly allowlisted hostname.
- [ ] RealScout Academy remains absent until its canonical hostname is verified.
- [ ] No third-party resource title or description is rendered as raw HTML.
- [ ] The production export contains no `.env`, Appwrite config, source map containing secrets, private support URL, token, API key, JWT, password, authorization header, or credential-bearing query string.
- [ ] `NEXT_PUBLIC_BASE_PATH` is empty for the Appwrite build.
- [ ] `NEXT_PUBLIC_SITE_URL` equals the final HTTPS production origin.

Suggested local review commands:

```bash
npm test
rg -n --hidden -i 'api[_-]?key|secret|token|password|authorization|bearer|private[_-]?key' out
rg -n -o "https://[^\"' <>)]+" out
```

Review every match; pattern scans produce false positives and do not prove safety by themselves.

## B. Appwrite Site Console — owner authorization required

- [ ] Rendering strategy is **Static**.
- [ ] Install command is `npm ci` against the committed lockfile.
- [ ] Build command is `npm test`.
- [ ] Output directory is `out`.
- [ ] Production branch is `main` and repository root is correct.
- [ ] Appwrite Git access is limited to this repository.
- [ ] Branch/path build filters match the intended release policy.
- [ ] No private variable is attached to the static Site.
- [ ] No custom variable starts with the reserved `APPWRITE_` prefix.
- [ ] Site request logging is enabled for launch.
- [ ] Deployment retention preserves at least one reviewed known-good release.
- [ ] The production domain points to the active deployment, not a staging branch.
- [ ] A separate staging branch/domain exists if the widget or CSP will change.

Appwrite references: [Static Sites](https://appwrite.io/docs/products/sites/rendering/static), [Git deployments](https://appwrite.io/docs/products/sites/deploy-from-git), [variables](https://appwrite.io/docs/products/sites/environment-variables), and [deployment retention](https://appwrite.io/docs/products/sites/deployments).

## C. HTTPS and headers

- [ ] The generated Appwrite URL and custom production URL use a valid certificate.
- [ ] Plain HTTP redirects to HTTPS.
- [ ] No page, script, image, font, API call, or form action produces mixed content.
- [ ] The actual response headers have been recorded and reviewed.
- [ ] Any claimed CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`, and cross-origin policy is present on the response where required.
- [ ] A source-level CSP meta policy, if used, appears before content it governs and passes all route/widget smoke tests.
- [ ] No CSP directive uses an unreviewed wildcard, `script-src https:`, or `connect-src *`.
- [ ] Missing response-only headers are either supplied by an authorized layer or recorded as an accepted risk with owner and review date.

After the domain is authorized, replace the placeholder and run:

```bash
curl -fsSI https://<PRODUCTION_HOST>/
curl -fsSI http://<PRODUCTION_HOST>/
curl -fsSI https://<PRODUCTION_HOST>/previews/
```

Appwrite documents enforced TLS for Site domains at [Sites domains](https://appwrite.io/docs/products/sites/domains).

## D. Browser and outbound-origin review

- [ ] Home page, preview index, and four navigation studies load at production URLs.
- [ ] Browser Network panel shows no unexpected external origin.
- [ ] Browser Console shows no CSP, mixed-content, integrity, hydration, or widget errors.
- [ ] Link clicks preserve exact canonical paths and never downgrade to HTTP.
- [ ] External links open with `rel="noopener noreferrer"` when a new tab is used.
- [ ] No login-required or internal-only resource is visible in page HTML, JavaScript data, search, sitemap, or UI.
- [ ] Widget failure leaves a usable fallback link and does not block the rest of the page.

## E. Optional Function proxy — complete only if one exists

- [ ] RealScout has confirmed the proxied credential is private and cannot be used safely in a browser.
- [ ] Credential is a Function-scoped Appwrite Secret, not source, a `NEXT_PUBLIC_*` value, project-wide variable, or Site variable.
- [ ] Function dynamic API key has no Appwrite scopes beyond those required.
- [ ] Upstream RealScout origin/path are fixed in server code and cannot be supplied by a caller.
- [ ] CORS allows only the exact staging and production origins.
- [ ] Unsupported method returns `405`.
- [ ] Wrong content type or invalid schema returns `400` or `415`.
- [ ] Oversized request returns `413` before the upstream request.
- [ ] Throttled request returns `429` and does not call RealScout.
- [ ] Upstream timeout/error returns a generic response without upstream body or stack trace.
- [ ] Logs contain no request body, personal data, credential, authorization header, or full query string.
- [ ] Function can be disabled independently of the Site.
- [ ] Vendor quota and the global circuit-breaker owner are documented.

Appwrite notes that Function-domain requests are guest executions and require application authentication if they are not truly public: [Function execution](https://appwrite.io/docs/products/functions/execute).

## F. Environment isolation

- [ ] Development/staging and production use separate Appwrite projects, or the weaker shared-project exception is documented.
- [ ] Production secrets are unavailable to staging and pull-request builds.
- [ ] Production and staging use different Function variables/credentials and exact CORS origins.
- [ ] Appwrite organization membership and Git installation access were reviewed.
- [ ] No production credential was copied into a project-wide variable inherited by other Sites/Functions.

## G. Rollback drill

- [ ] Identify the last known-good ready deployment before activation.
- [ ] Confirm the reviewer knows where **Instant Rollback** is in the Appwrite Site Overview.
- [ ] Confirm rollback does not rotate/revoke a separate Function or vendor credential; those are separate containment steps.
- [ ] After activation, check the primary domain, all six static routes, outbound origins, and logs.
- [ ] Monitor errors, `429` responses, unexpected origins, and Function upstream failures for at least 15 minutes.
- [ ] If any rollback trigger in the handoff occurs, promote the known-good deployment immediately and verify its commit.

Appwrite's rollback changes the active ready deployment without a rebuild: [Instant rollbacks](https://appwrite.io/docs/products/sites/instant-rollbacks).

## Approval

- [ ] Source/artifact reviewer: __________
- [ ] Security/URL allowlist reviewer: __________
- [ ] Appwrite account owner: __________
- [ ] RealScout widget/resource owner: __________
- [ ] Production deployer: __________
