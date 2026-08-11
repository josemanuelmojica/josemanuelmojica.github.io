# Appwrite security handoff

Status: preparation only. No Appwrite project, Site, Function, variable, domain, or Git integration was created or changed.

This directory separates what can be committed safely now from changes that require the owner of the Appwrite account to review and authorize.

## Local access result

The read-only audit on 2026-08-10 found:

- no `appwrite` executable on `PATH`;
- no live `appwrite.config.json` in this repository (only `appwrite.config.example.json`);
- no Appwrite CLI preference/authentication file in the standard local locations checked;
- no environment-variable names beginning with `APPWRITE`; and
- no Appwrite connector available to this task.

No credential values were read. These findings do not prove that the user has no Appwrite account; they prove only that this workspace has no usable local authorization. See [ACCESS_AUDIT.md](./ACCESS_AUDIT.md).

## Documents

- [APPWRITE_SITES_SECURITY_HANDOFF.md](./APPWRITE_SITES_SECURITY_HANDOFF.md) defines the static-site boundary, variables, CSP and header posture, optional Function proxy, Git access, environments, logging, and rollback.
- [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) is the release gate for the account owner or deployer.
- [realscout-allowlist.example.json](./realscout-allowlist.example.json) is a deny-by-default review artifact for the future RealScout resource manifest and widget contract.

## Decision summary

| Area | Safe to prepare in source | Requires Appwrite authorization |
| --- | --- | --- |
| Static export | Build/test `out/`; keep secrets out | Create Site; choose Static; configure build settings |
| Public configuration | `NEXT_PUBLIC_BASE_PATH`, canonical public origin | Set environment-specific public values and redeploy |
| Private credentials | Do not add them to this static project | Create a scoped secret on an optional Function |
| RealScout links | Empty manifest, schema, explicit allowlist rules | Approve every public URL and access classification |
| Widget | Stable empty mount point; document expected origins | Approve vendor snippet, credential type, and allowed origins |
| HTTPS | Test plan | Attach/verify domain; Appwrite issues and enforces TLS |
| CSP/security headers | Draft policy and test cases | Confirm response-header capability or approve source-level fallback |
| Git | Workflow and branch expectations | Install Appwrite Git integration for this repository only |
| Rollback | Triggers and drill | Set deployment retention; promote a known-good deployment |

Appwrite's current Sites documentation says Sites receive TLS, CDN delivery, and network protections. DDoS mitigation is automatic on Appwrite Cloud; configurable WAF rules are an Enterprise feature. Do not treat those controls as a substitute for application authorization, output encoding, URL allowlisting, or endpoint throttling. Official references: [Sites](https://appwrite.io/docs/products/sites), [DDoS mitigation](https://appwrite.io/docs/products/network/ddos), and [WAF availability](https://appwrite.io/docs/products/network/waf).
