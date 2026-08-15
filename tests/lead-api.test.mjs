import assert from "node:assert/strict";
import test from "node:test";
import { handleLeadRequest, validateLeadPayload } from "../worker/lead.ts";

export const validLead = {
  requestId: "3bc184bc-8cf8-4caa-9fd8-b2ad34ca78af",
  name: "Jamie Rivera",
  email: "jamie@example.com",
  consent: true,
  consentAt: "2026-08-15T20:00:00.000Z",
  website: "",
  intent: ["buy", "sell"],
  location: {
    query: "looking/selling in Boise",
    locality: "boise",
    region: "Idaho",
    country: "US",
    visualScope: "state",
    visualId: "US-ID",
  },
  needs: "A shorter school run and room for family.",
  source: "ark-and-text-lead-interview",
  pagePath: "/",
  turnstileToken: "browser-challenge-token",
};

function leadRequest(payload = validLead) {
  return new Request("https://example.com/api/lead", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://example.com",
      "cf-connecting-ip": "192.0.2.20",
    },
    body: JSON.stringify(payload),
  });
}

function leadDatabase({ failRates = false, failLeads = false } = {}) {
  const leads = [];
  return {
    leads,
    database: {
      prepare(sql) {
        let values = [];
        const statement = {
          bind(...bound) {
            values = bound;
            return statement;
          },
          async first() {
            if (failRates) throw new Error("D1 rate failure");
            return { count: 1 };
          },
          async run() {
            if (sql.includes("INSERT INTO leads")) {
              if (failLeads) throw new Error("D1 lead failure");
              leads.push(values);
            }
            return { success: true };
          },
        };
        return statement;
      },
    },
  };
}

test("accepts a complete state-aware interview payload", () => {
  const result = validateLeadPayload(validLead);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.location.visualId, "US-ID");
    assert.deepEqual(result.data.intent, ["buy", "sell"]);
  }
});

test("normalizes contact fields without altering the visitor's narrative", () => {
  const result = validateLeadPayload({
    ...validLead,
    name: "  Jamie Rivera  ",
    email: "  JAMIE@EXAMPLE.COM ",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.name, "Jamie Rivera");
    assert.equal(result.data.email, "jamie@example.com");
    assert.equal(result.data.needs, validLead.needs);
  }
});

test("rejects absent consent, malformed email, and unknown state artwork", () => {
  for (const payload of [
    { ...validLead, consent: false },
    { ...validLead, email: "not-an-email" },
    { ...validLead, location: { ...validLead.location, visualId: "US-ZZ" } },
  ]) {
    assert.equal(validateLeadPayload(payload).ok, false);
  }
});

test("rejects oversized content and additional intent values", () => {
  assert.equal(validateLeadPayload({ ...validLead, needs: "x".repeat(2001) }).ok, false);
  assert.equal(validateLeadPayload({ ...validLead, intent: ["rent"] }).ok, false);
});

test("recognizes the honeypot without treating it as a real lead", () => {
  const result = validateLeadPayload({ ...validLead, website: "https://spam.example" });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.website.length > 0, true);
});

test("verifies Turnstile server-side before writing a lead", async () => {
  const { database, leads } = leadDatabase();
  let verificationRequest;
  const response = await handleLeadRequest(
    leadRequest(),
    {
      LEADS: database,
      RATE_LIMIT_SALT: "test-rate-salt",
      TURNSTILE_SECRET_KEY: "server-only-secret",
    },
    {
      async fetch(_url, init) {
        verificationRequest = init;
        return Response.json({ success: true, action: "lead-interview" });
      },
    },
  );

  assert.equal(response.status, 202);
  assert.equal(leads.length, 1);
  assert.match(verificationRequest.body.toString(), /response=browser-challenge-token/);
  assert.doesNotMatch(verificationRequest.body.toString(), /Jamie|jamie%40example/);
});

test("does not store a lead when Turnstile rejects the token", async () => {
  const { database, leads } = leadDatabase();
  const response = await handleLeadRequest(
    leadRequest(),
    {
      LEADS: database,
      RATE_LIMIT_SALT: "test-rate-salt",
      TURNSTILE_SECRET_KEY: "server-only-secret",
    },
    { fetch: async () => Response.json({ success: false }) },
  );

  assert.equal(response.status, 400);
  assert.equal(leads.length, 0);
});

test("does not accept a Turnstile token minted for another action", async () => {
  const { database, leads } = leadDatabase();
  const response = await handleLeadRequest(
    leadRequest(),
    {
      LEADS: database,
      RATE_LIMIT_SALT: "test-rate-salt",
      TURNSTILE_SECRET_KEY: "server-only-secret",
    },
    { fetch: async () => Response.json({ success: true, action: "newsletter" }) },
  );

  assert.equal(response.status, 400);
  assert.equal(leads.length, 0);
});

test("returns a retryable service response when durable storage fails", async () => {
  for (const options of [{ failRates: true }, { failLeads: true }]) {
    const { database } = leadDatabase(options);
    const response = await handleLeadRequest(leadRequest(), {
      LEADS: database,
      RATE_LIMIT_SALT: "test-rate-salt",
    });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "Lead service unavailable" });
  }
});
