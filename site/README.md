# mojicagarcia.com

José Manuel Mojica Garcia's personal site: a one-page portfolio and a printable one-page résumé.

- `lib/profile.ts` holds every claim on the site. Edit facts there; both pages update.
- `app/page.tsx` is the home page; `app/resume/page.tsx` prints to a single Letter page.
- Next.js 16 static export (`./out`), Tailwind CSS v4, `next/font` (Work Sans and EB Garamond), no client JavaScript beyond the print button.
- Served by an assets-only Cloudflare Worker (`wrangler.jsonc`). Security headers are in `public/_headers`.

## Run and check

```bash
npm ci
npm run dev     # http://localhost:3000
npm run check   # typecheck + build + output tests
npm run cf:dry  # validate the Worker config without deploying
```

## Go live on mojicagarcia.com

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Import a repository** → this repo.
2. Worker name `mojicagarcia`, root directory `site`, build command `npm run build`, deploy command `npx wrangler deploy`, variable `NODE_VERSION=22`.
3. If the domain was bought outside Cloudflare, add it as a site in Cloudflare and switch the registrar's nameservers to the two Cloudflare gives you.
4. Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → `mojicagarcia.com` (and `www.mojicagarcia.com`). Or uncomment `routes` in `wrangler.jsonc`.
5. **Email Routing** for the domain: forward `hello@mojicagarcia.com` to your inbox, since the site links to that address.
