import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the Arχ & Teχt experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Arχ &amp; Teχt — Be Drawn to Where You Live<\/title>/i);
  assert.match(html, /Be <em>drawn<\/em> to where you live/);
  assert.match(html, /The house matters\. So does the life outside it\./);
  assert.match(html, /Start with Tuesday\./);
  assert.match(html, /The private collection/);
  assert.match(html, /Map data © OpenStreetMap contributors/);
  assert.doesNotMatch(html, /Exceptional homes|high-touch property experience|not a checklist/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});
