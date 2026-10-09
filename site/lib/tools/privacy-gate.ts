// Browser-only rebuild of the Privacy Gate method: redact deterministically in
// code before any model sees the text, keep who-said-what as role tokens so the
// conversation still makes sense, refuse malformed input instead of guessing,
// and verify the output with an independent second pass.

export type Category = "EMAIL" | "PHONE" | "URL" | "CARD" | "ADDRESS" | "NAME";

export interface GateResult {
  ok: boolean;
  error?: string;
  output: string;
  counts: Record<Category, number>;
  speakers: Array<{ name: string; token: string }>;
  leaks: string[];
}

const PATTERNS: Array<[Exclude<Category, "NAME">, RegExp]> = [
  ["EMAIL", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
  ["URL", /\bhttps?:\/\/[^\s)>\]]+|\bwww\.[^\s)>\]]+/gi],
  ["CARD", /\b(?:\d[ -]?){13,16}\b/g],
  ["PHONE", /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g],
  ["ADDRESS", /\b\d{1,5}\s+(?:[A-Z][a-z]+\s){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court)\b\.?/g],
];

const SPEAKER = /^\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*:\s/;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function runPrivacyGate(input: string): GateResult {
  const counts: Record<Category, number> = { EMAIL: 0, PHONE: 0, URL: 0, CARD: 0, ADDRESS: 0, NAME: 0 };
  const empty = { output: "", counts, speakers: [], leaks: [] };

  // Triage: skip input we cannot process safely instead of guessing.
  if (!input.trim()) return { ok: false, error: "Nothing to process. Paste a transcript first.", ...empty };
  if (input.length > 200_000) return { ok: false, error: "Input is over 200,000 characters. Split it and run each part.", ...empty };
  const lines = input.split(/\r?\n/);
  const speakerLines = lines.filter((line) => SPEAKER.test(line)).length;
  if (speakerLines === 0) {
    return { ok: false, error: "No speaker labels found (for example \"Dana: ...\"). The gate skips files it cannot attribute rather than guess.", ...empty };
  }

  // Role tokens keep the conversation readable after names are removed.
  const speakers: Array<{ name: string; token: string }> = [];
  for (const line of lines) {
    const match = SPEAKER.exec(line);
    if (match && !speakers.some((s) => s.name === match[1])) {
      speakers.push({ name: match[1], token: `[SPEAKER_${String.fromCharCode(65 + speakers.length)}]` });
    }
  }

  const found = new Set<string>();
  let output = input;
  for (const [category, pattern] of PATTERNS) {
    output = output.replace(pattern, (value) => {
      counts[category]++;
      found.add(value);
      return `[${category}]`;
    });
  }

  // Names: replace full names and each name part, longest first.
  const nameParts = new Map<string, string>();
  for (const speaker of speakers) {
    nameParts.set(speaker.name, speaker.token);
    for (const part of speaker.name.split(" ")) if (part.length > 2 && !nameParts.has(part)) nameParts.set(part, speaker.token);
  }
  for (const [name, token] of [...nameParts.entries()].sort((a, b) => b[0].length - a[0].length)) {
    output = output.replace(new RegExp(`\\b${escapeRegExp(name)}\\b`, "g"), () => {
      counts.NAME++;
      found.add(name);
      return token;
    });
  }

  // Independent second pass: nothing that was redacted may appear again,
  // and the structured patterns must find nothing left in the output.
  const leaks: string[] = [];
  for (const value of found) if (output.includes(value)) leaks.push(value);
  for (const [category, pattern] of PATTERNS) {
    for (const match of output.matchAll(new RegExp(pattern.source, pattern.flags))) {
      if (!match[0].startsWith("[")) leaks.push(`${category}: ${match[0]}`);
    }
  }

  return { ok: true, output, counts, speakers, leaks };
}

export const SAMPLE_TRANSCRIPT = `Dana Whitfield: Thanks for joining. Can you confirm the email on the account?
Marco Ruiz: Sure, it's marco.ruiz@example.com, and my cell is (555) 201-4477.
Dana Whitfield: Got it, Marco. I see the office at 4120 Orchard Lane.
Marco Ruiz: Right. The import keeps failing when I upload from www.example-crm.test/export.
Dana Whitfield: Let's walk through it. Dana here will send a recap after the call.`;
