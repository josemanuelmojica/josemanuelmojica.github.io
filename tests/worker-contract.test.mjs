import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.ts";

// A minimal ASSETS stub: records whether it was called and returns a
// recognizable static-asset response so delegation can be asserted.
function makeEnv() {
  const calls = [];
  return {
    calls,
    env: {
      ASSETS: {
        async fetch(request) {
          calls.push(new URL(request.url).pathname);
          return new Response("static-asset", { status: 200 });
        },
      },
    },
  };
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

test("non-/api request delegates to static ASSETS binding", async () => {
  const { env, calls } = makeEnv();
  const response = await worker.fetch(new Request("https://example.com/index.html"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "static-asset");
  assert.deepEqual(calls, ["/index.html"]);
});
