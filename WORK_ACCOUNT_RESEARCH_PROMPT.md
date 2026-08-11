# Work-account prompt: verified RealScout learning links

Copy the prompt below into the authenticated RealScout work account. Return its result to the developer with the real widget snippet. Do not paste passwords, session tokens, customer data, private ticket links, or unpublished internal content.

---

I am building a public RealScout customer learning hub. Research the official RealScout resources available to this authenticated work account and return a verified URL manifest that a developer can use without guessing routes.

## What to research

Find the best official destination for each customer task below. Cover the Help Center, the logged-in Learn RealScout library, RealScout Academy, and relevant in-product destinations when those links are appropriate to share.

- set up or update an agent profile;
- import, add, organize, invite, or collaborate with clients;
- build and manage searches, criteria, listing alerts, and results;
- understand the buyer experience and notifications;
- learn core workflows through courses or guided training;
- configure supported integrations;
- troubleshoot common account, search, alert, invitation, or delivery problems;
- contact agent support or broker support when self-service is not enough.

Known starting points that must still be opened and re-verified during this research:

- [RealScout Help Center](https://support.realscout.com)
- [Profile Setup Guide](https://support.realscout.com/hc/en-us/articles/24716093932955)

## Verification rules

1. Open every returned URL. Record the exact page title and the final canonical HTTPS URL after redirects.
2. Use only official RealScout-owned or RealScout-approved destinations. Exclude search-result URLs, personal bookmarks, staging sites, ticket-specific links, and URLs containing user or session identifiers.
3. Do not invent a URL from a page title. If a needed destination cannot be verified, put `Needs URL provided.` in the unresolved report; do not place it in the JSON manifest.
4. Classify access as exactly `public`, `login_required`, or `internal_only`. When possible, confirm public access in a signed-out or private window without exposing credentials.
5. Set `safe_for_public_site` to `true` only when the link itself is approved for public discovery. A login requirement does not automatically mean a link is safe to advertise publicly.
6. Summarize what the destination helps a customer do. Do not copy restricted lesson or support content into the response.
7. Mark `verified` as `true` only for URLs you personally opened during this task. Omit anything you could not open.
8. Consolidate duplicates. Prefer the most canonical, durable destination over campaign, tracking, or redirect URLs.

## Required output

First return one valid JSON array, with no comments inside it. Use this exact shape for every item:

```json
[
  {
    "title": "Exact official page title",
    "url": "https://canonical-official-url.example/path",
    "source": "support.realscout.com | learn.realscout.com | RealScout Academy | RealScout platform | other verified official source",
    "audience": ["agent", "team_admin", "broker_admin"],
    "journey_stage": "setup | daily_work | collaboration | training | troubleshooting | escalation",
    "customer_goal": "Short task-first label",
    "description": "One or two plain sentences describing what the customer can accomplish here.",
    "content_type": "article | course | video | academy_program | product_page | support_contact | other",
    "access_level": "public | login_required | internal_only",
    "safe_for_public_site": true,
    "recommended_placement": "page | popup | widget | troubleshooting",
    "suggested_popup_trigger": "Short trigger description or null",
    "suggested_cta": "Short action label",
    "verified": true
  }
]
```

Use only the audience values that actually apply. Do not include placeholder objects. The JSON must parse as-is.

After the JSON array, add a short `Unresolved or restricted` table with these columns:

| Needed destination | Status | Why it was not included | Owner or next verification step |
| --- | --- | --- | --- |

Use `Needs URL provided.` for any unverified destination. Call out deprecated or redirected URLs separately so the developer does not reuse them.

Finally, add a `Coverage check` list showing which research tasks have at least one verified resource and which still need an owner.

---

The developer will validate the JSON against `content/resources.schema.json` before rendering any link. Internal-only items may remain in the research return for review, but they will not be published.
