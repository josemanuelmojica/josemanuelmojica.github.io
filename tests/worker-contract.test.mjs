import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.ts";

// A minimal ASSETS stub: records whether it was called and returns a
// recognizable static-asset response so delegation can be asserted.
function makeEnv() {
  const calls = [];
  const leads = [];
  const rates = new Map();
  const database = {
    prepare(sql) {
      let values = [];
      const statement = {
        bind(...bound) {
          values = bound;
          return statement;
        },
        async first() {
          if (!sql.includes("lead_rate_limits")) return null;
          const key = `${values[0]}:${values[1]}`;
          const count = (rates.get(key) ?? 0) + 1;
          rates.set(key, count);
          return { count };
        },
        async run() {
          if (sql.includes("INSERT INTO leads")) leads.push(values);
          return { success: true };
        },
      };
      return statement;
    },
  };
  return {
    calls,
    leads,
    env: {
      ASSETS: {
        async fetch(request) {
          calls.push(new URL(request.url).pathname);
          return new Response("static-asset", { status: 200 });
        },
      },
      LEADS: database,
      RATE_LIMIT_SALT: "test-only-rate-limit-salt",
    },
  };
}

function leadPayload(overrides = {}) {
  return {
    requestId: "3bc184bc-8cf8-4caa-9fd8-b2ad34ca78af",
    name: "Jamie Rivera",
    email: "jamie@example.com",
    consent: true,
    consentAt: "2026-08-15T20:00:00.000Z",
    website: "",
    turnstileToken: "",
    intent: ["buy"],
    location: {
      query: "Boise, Idaho",
      locality: "boise",
      region: "Idaho",
      country: "US",
      visualScope: "state",
      visualId: "US-ID",
    },
    needs: "A shorter school run.",
    source: "ark-and-text-lead-interview",
    pagePath: "/",
    ...overrides,
  };
}

function leadRequest(payload, headers = {}) {
  return new Request("https://example.com/api/lead", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://example.com",
      "cf-connecting-ip": "192.0.2.10",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

test("GET /api/health returns ok status JSON", async () => {
  const { env } = makeEnv();
  const response = await worker.fetch(new Request("https://example.com/api/health"), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "ark-and-text");
});

test("GET /api/health is not cached", async () => {
  const { env } = makeEnv();
  const response = await worker.fetch(new Request("https://example.com/api/health"), env);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("non-GET /api/health returns 405", async () => {
  const { env } = makeEnv();
  const response = await worker.fetch(
    new Request("https://example.com/api/health", { method: "POST" }),
    env,
  );
  assert.equal(response.status, 405);
});

test("unknown /api/* route returns 404 JSON", async () => {
  const { env } = makeEnv();
  const response = await worker.fetch(new Request("https://example.com/api/unknown"), env);
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.error, "Not found");
});

test("POST /api/lead validates and stores a state-aware inquiry", async () => {
  const { env, leads } = makeEnv();
  const response = await worker.fetch(leadRequest(leadPayload()), env);
  assert.equal(response.status, 202);
  assert.equal(leads.length, 1);
  assert.equal(leads[0][0], "3bc184bc-8cf8-4caa-9fd8-b2ad34ca78af");
  assert.equal(leads[0][8], "US-ID");
});

test("POST /api/lead rejects cross-origin and malformed submissions", async () => {
  const { env, leads } = makeEnv();
  const crossOrigin = await worker.fetch(
    leadRequest(leadPayload(), { origin: "https://attacker.example" }),
    env,
  );
  assert.equal(crossOrigin.status, 403);

  const invalid = await worker.fetch(leadRequest(leadPayload({ email: "invalid" })), env);
  assert.equal(invalid.status, 400);
  assert.equal(leads.length, 0);
});

test("POST /api/lead permits only configured cross-origin browser clients", async () => {
  const { env } = makeEnv();
  env.LEAD_ALLOWED_ORIGINS = "https://josemanuelmojica.github.io";

  const preflight = await worker.fetch(
    new Request("https://example.com/api/lead", {
      method: "OPTIONS",
      headers: {
        origin: "https://josemanuelmojica.github.io",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type",
      },
    }),
    env,
  );
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get("access-control-allow-origin"),
    "https://josemanuelmojica.github.io",
  );
  assert.equal(preflight.headers.get("vary"), "Origin");

  const accepted = await worker.fetch(
    leadRequest(leadPayload(), { origin: "https://josemanuelmojica.github.io" }),
    env,
  );
  assert.equal(accepted.status, 202);
  assert.equal(
    accepted.headers.get("access-control-allow-origin"),
    "https://josemanuelmojica.github.io",
  );
});

test("POST /api/lead rate-limits repeated clients in durable storage", async () => {
  const { env } = makeEnv();
  for (let index = 0; index < 5; index += 1) {
    const response = await worker.fetch(
      leadRequest(leadPayload({ requestId: `request-${index}-valid` })),
      env,
    );
    assert.equal(response.status, 202);
  }
  const limited = await worker.fetch(
    leadRequest(leadPayload({ requestId: "request-six-valid" })),
    env,
  );
  assert.equal(limited.status, 429);
});

test("non-/api request delegates to static ASSETS binding", async () => {
  const { env, calls } = makeEnv();
  const response = await worker.fetch(new Request("https://example.com/index.html"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "static-asset");
  assert.deepEqual(calls, ["/index.html"]);
});
