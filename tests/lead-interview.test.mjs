import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the homepage mounts the state-map lead interview", async () => {
  const homepage = await readFile(new URL("app/InkEstates.tsx", root), "utf8");
  const interview = await readFile(new URL("app/LeadInterview.tsx", root), "utf8");

  assert.match(homepage, /<LeadInterview\s*\/\s*>/);
  assert.doesNotMatch(homepage, /This concept form works locally/);
  assert.match(interview, /Where do you search first\?/);
  assert.match(interview, /interpretUtterance/);
  assert.match(interview, /\/maps\/us-state-studies\/v1\/states\//);
});

test("submission uses the same-origin Worker and never claims delivery after rejection", async () => {
  const interview = await readFile(new URL("app/LeadInterview.tsx", root), "utf8");

  assert.match(interview, /NEXT_PUBLIC_SUBMIT_LEAD_URL/);
  assert.match(interview, /publicPath\("\/api\/lead"\)/);
  assert.match(interview, /consentAt: new Date\(\)\.toISOString\(\)/);
  assert.match(interview, /<TurnstileWidget/);
  assert.match(interview, /turnstileToken/);
  assert.match(interview, /if \(!response\.ok\)/);
  assert.match(interview, /setSubmitState\("error"\)/);
  assert.doesNotMatch(interview, /openai|anthropic|gemini|langchain/i);
});

test("the exported homepage contains the interview entry point", async () => {
  const html = await readFile(new URL("out/index.html", root), "utf8");

  assert.match(html, /What are you looking forward to\?/);
  assert.doesNotMatch(html, /This concept form works locally/);
});
