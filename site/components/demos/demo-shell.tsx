"use client";

import type { ReactNode } from "react";

/** Shared input panel: a labeled textarea with run / sample / clear controls. */
export function DemoInput({
  id, label, value, onChange, onRun, onSample, rows = 12, hint,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  onRun: () => void; onSample: () => void; rows?: number; hint: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-paper p-4 md:p-5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <p id={`${id}-hint`} className="mt-1 text-sm text-graphite">{hint}</p>
      <textarea
        id={id}
        aria-describedby={`${id}-hint`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="mt-3 w-full resize-y rounded-lg border bg-white p-3 font-mono text-[13px] leading-relaxed focus-visible:border-blue"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onRun} className="inline-flex h-10 items-center rounded-lg bg-blue px-4 text-sm font-medium text-paper hover:bg-deep">Run check</button>
        <button type="button" onClick={onSample} className="inline-flex h-10 items-center rounded-lg border px-4 text-sm hover:border-blue hover:text-blue">Load sample</button>
        <button type="button" onClick={() => onChange("")} className="inline-flex h-10 items-center rounded-lg border px-4 text-sm hover:border-blue hover:text-blue">Clear</button>
      </div>
    </div>
  );
}

export function Pill({ tone, children }: { tone: "critical" | "warning" | "info" | "ok"; children: ReactNode }) {
  const styles = {
    critical: "bg-[#fde8e6] text-[#8a1c12]",
    warning: "bg-[#fdf1d8] text-[#7a4b00]",
    info: "bg-wash text-deep",
    ok: "bg-[#e3f2e6] text-[#1f5a2c]",
  }[tone];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>{children}</span>;
}
