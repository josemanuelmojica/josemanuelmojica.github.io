/**
 * Arχ & Teχt edge Worker.
 *
 * This Worker runs FIRST only for `/api/*` requests (see `run_worker_first`
 * in wrangler.jsonc). Every other request is served directly from the static
 * export in ./out via the ASSETS binding and never reaches this code.
 *
 * Current API surface:
 *   GET /api/health -> liveness probe
 *   POST /api/lead  -> validated, rate-limited D1 lead capture
 *
 * Turnstile verification is mandatory and fails closed if its Worker secret
 * is absent or invalid.
 */

import { handleLeadRequest, type LeadEnv, type LeadRuntime } from "./lead.ts";

export interface Env extends LeadEnv {
  /** Static assets binding for ./out (declared in wrangler.jsonc). */
  ASSETS: Fetcher;
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  // The API responds to same-origin browser calls; do not cache liveness.
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
} as const;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export function createWorker(runtime: LeadRuntime = { fetch }) {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);

      // Only /api/* reaches the Worker (per run_worker_first). Anything else
      // that arrives here is defensively delegated back to static assets.
      if (!url.pathname.startsWith("/api/")) {
        return env.ASSETS.fetch(request);
      }

      if (url.pathname === "/api/health") {
        if (request.method !== "GET") {
          return jsonResponse({ error: "Method not allowed" }, 405);
        }
        return jsonResponse({ status: "ok", service: "ark-and-text" });
      }

      if (url.pathname === "/api/lead") {
        return handleLeadRequest(request, env, runtime);
      }

      return jsonResponse({ error: "Not found" }, 404);
    },
  } satisfies ExportedHandler<Env>;
}

export default createWorker();
