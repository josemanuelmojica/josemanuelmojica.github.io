"use client";

import { useState } from "react";
import { runPrivacyGate, SAMPLE_TRANSCRIPT, type GateResult } from "@/lib/tools/privacy-gate";
import { DemoInput, Pill } from "./demo-shell";

export function PrivacyDemo() {
  const [text, setText] = useState(SAMPLE_TRANSCRIPT);
  const [result, setResult] = useState<GateResult>(() => runPrivacyGate(SAMPLE_TRANSCRIPT));
  const total = Object.values(result.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DemoInput
        id="privacy-input" label="Raw transcript" value={text} onChange={setText}
        onRun={() => setResult(runPrivacyGate(text))} onSample={() => { setText(SAMPLE_TRANSCRIPT); setResult(runPrivacyGate(SAMPLE_TRANSCRIPT)); }}
        hint={<>Lines need a speaker label like <code>Dana: …</code>. The sample is fictional.</>}
      />
      <div>
        {!result.ok ? (
          <p role="status" className="rounded-xl border bg-paper p-5"><Pill tone="warning">Skipped</Pill> <span className="ml-2">{result.error}</span></p>
        ) : (
          <>
            <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2 text-sm">
              <Pill tone={result.leaks.length ? "critical" : "ok"}>{result.leaks.length ? `${result.leaks.length} leaks` : "0 leaks on second pass"}</Pill>
              <span className="text-graphite">{total} redactions</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              {Object.entries(result.counts).map(([k, v]) => (
                <div key={k} className="rounded-lg border bg-paper px-3 py-2">
                  <dt className="text-xs text-graphite">{k}</dt>
                  <dd className="text-lg tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm font-medium">Safe output</p>
            <pre className="mt-2 max-h-80 overflow-auto rounded-xl border bg-white p-4 text-[13px] leading-relaxed whitespace-pre-wrap">{result.output}</pre>
            {result.speakers.length > 0 && (
              <p className="mt-3 text-sm text-graphite">Role tokens: {result.speakers.map((s) => s.token).join(", ")}. The name-to-token key stays on this page and is never shown in the output.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
