import assert from "node:assert/strict";
import test from "node:test";

import {
  detectIntent,
  extractZip,
  interpretUtterance,
  resolveFromBundledTables,
} from "./locationResolver.ts";

test("detectIntent finds buy and sell in the required Boise example", () => {
  assert.deepEqual(detectIntent("looking/selling in Boise"), ["buy", "sell"]);
});

test("detectIntent handles explicit buy, sell, and exploratory language", () => {
  assert.deepEqual(detectIntent("I want to purchase a home"), ["buy"]);
  assert.deepEqual(detectIntent("thinking about selling our place"), ["sell"]);
  assert.deepEqual(detectIntent("just curious about the area"), []);
});

test("extractZip accepts ZIP and ZIP+4 without accepting arbitrary digits", () => {
  assert.equal(extractZip("I'm in 83702 right now"), "83702");
  assert.equal(extractZip("83702-1234"), "83702");
  assert.equal(extractZip("looking in Boise"), null);
});

test("bundled tables resolve Boise and its ZIP to Idaho", () => {
  const city = resolveFromBundledTables("boise");
  const zip = resolveFromBundledTables("83702");
  assert.equal(city.state, "ID");
  assert.equal(city.needsClarification, false);
  assert.equal(zip.state, "ID");
});

test("an ambiguous city asks before selecting a visual", () => {
  const result = resolveFromBundledTables("portland");
  assert.equal(result.needsClarification, true);
  assert.deepEqual(result.candidateStates, ["OR", "ME"]);
});

test("an explicit state disambiguates a repeated city name", () => {
  const result = resolveFromBundledTables("Portland, OR");
  assert.equal(result.state, "OR");
  assert.equal(result.needsClarification, false);
});

test("full state names and explicit abbreviations resolve all state plates", () => {
  assert.equal(resolveFromBundledTables("somewhere in Idaho").state, "ID");
  assert.equal(resolveFromBundledTables("Albany, NY").state, "NY");
});

test("unknown input remains unresolved", () => {
  const result = resolveFromBundledTables("nowhere special");
  assert.equal(result.state, null);
  assert.equal(result.unresolved, true);
});

test("required Boise example resolves buy/sell intent and the Idaho plate", async () => {
  const result = await interpretUtterance("looking/selling in Boise");
  assert.deepEqual(result.intent, ["buy", "sell"]);
  assert.equal(result.query, "looking/selling in Boise");
  assert.equal(result.region, "Idaho");
  assert.equal(result.visualScope, "state");
  assert.equal(result.visualId, "US-ID");
  assert.equal(result.needsConfirmation, false);
});

test("ambiguity never fabricates a map", async () => {
  const result = await interpretUtterance("looking in Portland");
  assert.equal(result.needsConfirmation, true);
  assert.equal(result.visualId, null);
  assert.deepEqual(result.candidateStates, ["OR", "ME"]);
});

test("unresolvable input returns the correction state", async () => {
  const result = await interpretUtterance("somewhere nice");
  assert.equal(result.visualId, null);
  assert.equal(result.unresolved, true);
});

test("an optional geocoder can resolve places absent from bundled tables", async () => {
  const fetchStub = async () => ({
    ok: true,
    json: async () => ({
      result: { addressMatches: [{ addressComponents: { state: "WA" } }] },
    }),
  });
  const result = await interpretUtterance("Seattle", { fetchImpl: fetchStub });
  assert.equal(result.visualId, "US-WA");
});

test("geocoder failure leaves unknown input unresolved", async () => {
  const fetchStub = async () => {
    throw new Error("network unavailable");
  };
  const result = await interpretUtterance("somewhere nice", { fetchImpl: fetchStub });
  assert.equal(result.visualId, null);
  assert.equal(result.unresolved, true);
});
