"use client";

import { useState } from "react";
import { runPreflight, SAMPLE_CSV, type PreflightResult } from "@/lib/tools/import-preflight";
import { DemoInput, Pill } from "./demo-shell";

const tone = { clean: "ok", repaired: "warning", critical: "critical" } as const;

export function PreflightDemo() {
  const [text, setText] = useState(SAMPLE_CSV);
  const [result, setResult] = useState<PreflightResult>(() => runPreflight(SAMPLE_CSV));

  return (
    <div className="space-y-6">
      <DemoInput
        id="preflight-input" label="CRM export (CSV)" value={text} onChange={setText}
        onRun={() => setResult(runPreflight(text))} onSample={() => { setText(SAMPLE_CSV); setResult(runPreflight(SAMPLE_CSV)); }}
        rows={8} hint="Headers can come from any CRM; the preflight maps them. The sample contacts are synthetic."
      />
      {!result.ok ? (
        <p role="status" className="rounded-xl border bg-paper p-5"><Pill tone="warning">Stopped</Pill> <span className="ml-2">{result.error}</span></p>
      ) : (
        <div>
          <div role="status" aria-live="polite" className="flex flex-wrap gap-2 text-sm">
            <Pill tone="ok">{result.totals.clean} clean</Pill>
            <Pill tone="warning">{result.totals.repaired} auto-repaired</Pill>
            <Pill tone="critical">{result.totals.critical} critical</Pill>
          </div>
          <p className="mt-3 text-sm text-graphite">
            Header map: {result.mapping.map((m) => `${m.header || "(blank)"} → ${m.field ?? "ignored"}`).join(" · ")}
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border bg-paper">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Preflight result for each row</caption>
              <thead className="border-b text-xs text-graphite">
                <tr>
                  {["Row", "Status", "First", "Last", "Email", "Phone", "ZIP", "Notes"].map((h) => <th key={h} scope="col" className="px-3 py-2 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.index} className="border-b last:border-0 align-top">
                    <td className="px-3 py-2 tabular-nums">{row.index}</td>
                    <td className="px-3 py-2"><Pill tone={tone[row.bucket]}>{row.bucket}</Pill></td>
                    <td className="px-3 py-2">{row.values.first_name}</td>
                    <td className="px-3 py-2">{row.values.last_name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.values.email || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.values.phone}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.values.zip}</td>
                    <td className="px-3 py-2 text-graphite">{row.notes.join("; ") || "No changes"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
