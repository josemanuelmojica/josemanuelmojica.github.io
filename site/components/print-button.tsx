"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:border-blue hover:text-blue"
    >
      <Printer className="size-4" aria-hidden="true" /> Print or save as PDF
    </button>
  );
}
