"use client";

import { useState } from "react";
import { lintArticle, SAMPLE_ARTICLE, type LintReport } from "@/lib/tools/knowledge-linter";
import { DemoInput, Pill } from "./demo-shell";

export function LinterDemo() {
  const [text, setText] = useState(SAMPLE_ARTICLE);
  const [report, setReport] = useState<LintReport>(() => lintArticle(SAMPLE_ARTICLE));
  const critical = report.orders.filter((o) => o.severity === "critical").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <DemoInput
        id="linter-input" label="Help article (Markdown or HTML)" value={text} onChange={setText}
        onRun={() => setReport(lintArticle(text))} onSample={() => { setText(SAMPLE_ARTICLE); setReport(lintArticle(SAMPLE_ARTICLE)); }}
        rows={18} hint="The sample has the kinds of defects the real audit found. Edit it, or paste your own."
      />
      <div>
        <p role="status" aria-live="polite" className="text-sm text-graphite">
          {report.anchors.length} headings · {report.links} links · <strong className="text-ink">{report.orders.length} work orders</strong>, {critical} critical
        </p>
        {report.orders.length === 0 ? (
          <p className="mt-4 rounded-xl border bg-paper p-5"><Pill tone="ok">Pass</Pill> <span className="ml-2">No defects found. This article is ready to publish.</span></p>
        ) : (
          <ol className="mt-4 space-y-3">
            {report.orders.map((o, i) => (
              <li key={`${o.line}-${o.rule}-${i}`} className="rounded-xl border bg-paper p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Pill tone={o.severity}>{o.severity}</Pill>
                  <span className="font-mono text-xs text-graphite">line {o.line}</span>
                  <span className="font-medium">{o.rule}</span>
                  <code className="rounded bg-wash px-1.5 py-0.5 text-xs">{o.found}</code>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{o.fix}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
