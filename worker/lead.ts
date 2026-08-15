import stateManifest from "../public/maps/us-state-studies/v1/manifest.json" with { type: "json" };

const MAX_BODY_BYTES = 32_768;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const STATE_VISUALS = new Set(
  (stateManifest.states as Array<{ id: string }>).map((state) => state.id),
);

type LeadIntent = "buy" | "sell";

export type LeadPayload = {
  requestId: string;
  name: string;
  email: string;
  consent: true;
  consentAt: string;
  website: string;
  intent: LeadIntent[];
  location: {
    query: string;
    locality: string;
    region: string;
    country: "US";
    visualScope: "state";
    visualId: string;
  };
  needs: string;
  source: "ark-and-text-lead-interview";
  pagePath: string;
  turnstileToken: string;
};

export type LeadEnv = {
  LEADS: D1Database;
  RATE_LIMIT_SALT: string;
  LEAD_ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type ValidationResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; error: string };

export type LeadRuntime = {
  fetch: typeof fetch;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > maxLength) return null;
  return value;
}

export function validateLeadPayload(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, error: "Invalid request" };

  const location = input.location;
  if (!isRecord(location)) return { ok: false, error: "Invalid request" };

  const requestId = requiredText(input.requestId, 128);
  const name = requiredText(input.name, 160);
  const rawEmail = requiredText(input.email, 254);
  const email = rawEmail?.toLowerCase() ?? null;
  const consentAt = requiredText(input.consentAt, 64);
  const website = optionalText(input.website, 500);
  const query = requiredText(location.query, 300);
  const locality = requiredText(location.locality, 200);
  const region = requiredText(location.region, 100);
  const visualId = requiredText(location.visualId, 8);
  const needs = requiredText(input.needs, 2000);
  const pagePath = requiredText(input.pagePath, 500);
  const turnstileToken = optionalText(input.turnstileToken, 4096);

  const rawIntent = input.intent;
  const intent = Array.isArray(rawIntent)
    ? [...new Set(rawIntent)]
    : [];

  if (
    !requestId ||
    !REQUEST_ID_PATTERN.test(requestId) ||
    !name ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
    input.consent !== true ||
    !consentAt ||
    Number.isNaN(Date.parse(consentAt)) ||
    website === null ||
    intent.length > 2 ||
    intent.some((value) => value !== "buy" && value !== "sell") ||
    !query ||
    !locality ||
    !region ||
    location.country !== "US" ||
    location.visualScope !== "state" ||
    !visualId ||
    !STATE_VISUALS.has(visualId) ||
    !needs ||
    input.source !== "ark-and-text-lead-interview" ||
    !pagePath ||
    !pagePath.startsWith("/") ||
    turnstileToken === null
  ) {
    return { ok: false, error: "Invalid request" };
  }

  return {
    ok: true,
    data: {
      requestId,
      name,
      email,
      consent: true,
      consentAt: new Date(consentAt).toISOString(),
      website,
      intent: intent as LeadIntent[],
      location: {
        query,
        locality,
        region,
        country: "US",
        visualScope: "state",
        visualId,
      },
      needs,
      source: "ark-and-text-lead-interview",
      pagePath,
      turnstileToken,
    },
  };
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function json(body: unknown, status: number, origin?: string): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

function allowedOrigin(request: Request, configuredOrigins?: string): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowed = new Set([
    new URL(request.url).origin,
    ...(configuredOrigins ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  return allowed.has(origin) ? origin : null;
}

async function rateLimitKey(request: Request, salt: string, windowStart: number) {
  const address =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const bytes = new TextEncoder().encode(`${salt}:${windowStart}:${address}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTurnstile(
  token: string,
  secret: string,
  request: Request,
  requestId: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: requestId,
  });
  const remoteIp = request.headers.get("cf-connecting-ip");
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetchImpl(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    if (!response.ok) return false;
    const result = await response.json<{ success?: boolean; action?: string }>();
    return result.success === true && result.action === "lead-interview";
  } catch {
    return false;
  }
}

export async function handleLeadRequest(
  request: Request,
  env: LeadEnv,
  runtime: LeadRuntime = { fetch },
): Promise<Response> {
  const origin = allowedOrigin(request, env.LEAD_ALLOWED_ORIGINS);
  if (!origin) {
    return json({ error: "Forbidden" }, 403);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  const respond = (body: unknown, status: number) => json(body, status, origin);
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return respond({ error: "Unsupported media type" }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return respond({ error: "Request too large" }, 413);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return respond({ error: "Request too large" }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return respond({ error: "Invalid request" }, 400);
  }

  const validation = validateLeadPayload(parsed);
  if (!validation.ok) return respond({ error: validation.error }, 400);
  const lead = validation.data;

  // Silently accept the honeypot so automated submitters receive no signal
  // that their payload was discarded.
  if (lead.website) return respond({ status: "accepted", requestId: lead.requestId }, 202);

  if (!env.LEADS || !env.RATE_LIMIT_SALT) {
    return respond({ error: "Lead service unavailable" }, 503);
  }

  const windowStart = Math.floor(Date.now() / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  const clientHash = await rateLimitKey(request, env.RATE_LIMIT_SALT, windowStart);
  let rate: { count: number } | null;
  try {
    rate = await env.LEADS.prepare(
      `INSERT INTO lead_rate_limits (client_hash, window_start, count)
       VALUES (?1, ?2, 1)
       ON CONFLICT(client_hash, window_start)
       DO UPDATE SET count = count + 1
       RETURNING count`,
    )
      .bind(clientHash, windowStart)
      .first<{ count: number }>();
  } catch {
    return respond({ error: "Lead service unavailable" }, 503);
  }

  if (!rate || rate.count > RATE_LIMIT) {
    return respond({ error: "Too many requests" }, 429);
  }

  if (
    env.TURNSTILE_SECRET_KEY &&
    !(await verifyTurnstile(
      lead.turnstileToken,
      env.TURNSTILE_SECRET_KEY,
      request,
      lead.requestId,
      runtime.fetch,
    ))
  ) {
    return respond({ error: "Verification failed" }, 400);
  }

  try {
    await env.LEADS.prepare(
      `INSERT INTO leads (
         request_id, created_at, name, email, intent, location_query,
         locality, region, visual_id, needs, consent_at, source, page_path
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
       ON CONFLICT(request_id) DO NOTHING`,
    )
      .bind(
        lead.requestId,
        new Date().toISOString(),
        lead.name,
        lead.email,
        JSON.stringify(lead.intent),
        lead.location.query,
        lead.location.locality,
        lead.location.region,
        lead.location.visualId,
        lead.needs,
        lead.consentAt,
        lead.source,
        lead.pagePath,
      )
      .run();

  } catch {
    return respond({ error: "Lead service unavailable" }, 503);
  }

  // Cleanup is deliberately best-effort: a maintenance failure must not make
  // a successfully stored, idempotent lead look lost to the visitor.
  try {
    await env.LEADS.prepare(
      "DELETE FROM lead_rate_limits WHERE window_start < ?1",
    )
      .bind(windowStart - 24 * 60 * 60 * 1000)
      .run();
  } catch {
    // The next accepted submission will try again. No personal data is logged.
  }

  return respond({ status: "accepted", requestId: lead.requestId }, 202);
}
