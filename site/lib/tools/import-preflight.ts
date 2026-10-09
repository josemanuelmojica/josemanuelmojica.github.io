// Browser-only rebuild of the Import Preflight method: map messy CRM headers to
// one canonical schema, normalize what can be repaired safely, and dry-fit every
// row into Clean / Auto-repaired / Critical before anything is imported.

export type Field = "first_name" | "last_name" | "email" | "phone" | "zip";
export type Bucket = "clean" | "repaired" | "critical";

export interface PreflightRow {
  index: number;
  values: Record<Field, string>;
  bucket: Bucket;
  notes: string[];
}

export interface PreflightResult {
  ok: boolean;
  error?: string;
  mapping: Array<{ header: string; field: Field | null }>;
  rows: PreflightRow[];
  totals: Record<Bucket, number>;
}

const SYNONYMS: Record<Field, string[]> = {
  first_name: ["first name", "first", "firstname", "given name", "fname"],
  last_name: ["last name", "last", "lastname", "surname", "family name", "lname"],
  email: ["email", "e-mail", "email address", "primary email", "email 1"],
  phone: ["phone", "phone number", "mobile", "cell", "mobile phone", "primary phone", "phone 1"],
  zip: ["zip", "zip code", "zipcode", "postal code", "postal"],
};

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

export function mapHeader(header: string): Field | null {
  const key = header.trim().toLowerCase().replace(/[_\s]+/g, " ");
  for (const [field, names] of Object.entries(SYNONYMS) as Array<[Field, string[]]>) {
    if (names.includes(key)) return field;
  }
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normalizePhone(raw: string): { value: string; valid: boolean } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return { value: `+1${digits}`, valid: true };
  if (digits.length === 11 && digits.startsWith("1")) return { value: `+${digits}`, valid: true };
  return { value: raw.trim(), valid: raw.trim() === "" };
}

const titleCase = (value: string) =>
  value.trim().toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());

export function runPreflight(csv: string): PreflightResult {
  const totals: Record<Bucket, number> = { clean: 0, repaired: 0, critical: 0 };
  const table = parseCsv(csv);
  if (table.length < 2) return { ok: false, error: "Paste a header row and at least one contact.", mapping: [], rows: [], totals };

  const [headers, ...body] = table;
  const mapping = headers.map((header) => ({ header, field: mapHeader(header) }));
  if (!mapping.some((m) => m.field === "email")) {
    return { ok: false, error: "No email column found. Email is the key every row is checked against.", mapping, rows: [], totals };
  }

  const seen = new Map<string, number>();
  const rows: PreflightRow[] = body.map((cells, i) => {
    const raw: Record<Field, string> = { first_name: "", last_name: "", email: "", phone: "", zip: "" };
    mapping.forEach((m, col) => { if (m.field && !raw[m.field]) raw[m.field] = (cells[col] ?? "").trim(); });

    const values = { ...raw };
    const notes: string[] = [];
    let critical = false;

    values.email = raw.email.toLowerCase();
    if (!values.email) { critical = true; notes.push("Missing email"); }
    else if (!EMAIL.test(values.email)) { critical = true; notes.push(`Invalid email "${raw.email}"`); }
    else if (seen.has(values.email)) { critical = true; notes.push(`Duplicate of row ${seen.get(values.email)}`); }
    else {
      seen.set(values.email, i + 1);
      if (values.email !== raw.email) notes.push("Email lowercased");
    }

    for (const field of ["first_name", "last_name"] as const) {
      const fixed = titleCase(raw[field]);
      if (raw[field] && fixed !== raw[field]) { values[field] = fixed; notes.push(`${field === "first_name" ? "First" : "Last"} name recased`); }
    }

    if (raw.phone) {
      const phone = normalizePhone(raw.phone);
      if (!phone.valid) notes.push(`Phone "${raw.phone}" kept as-is; not a US number`);
      else if (phone.value !== raw.phone) { values.phone = phone.value; notes.push("Phone to E.164"); }
    }

    if (/^\d{4}$/.test(raw.zip)) { values.zip = `0${raw.zip}`; notes.push("ZIP leading zero restored"); }
    else if (/^\d{5}-?\d{4}$/.test(raw.zip)) { values.zip = raw.zip.slice(0, 5); notes.push("ZIP+4 trimmed to 5 digits"); }

    const bucket: Bucket = critical ? "critical" : notes.length ? "repaired" : "clean";
    totals[bucket]++;
    return { index: i + 1, values, bucket, notes };
  });

  return { ok: true, mapping, rows, totals };
}

export const SAMPLE_CSV = `Given Name,Surname,E-mail,Mobile,Postal Code,Lead Source
avery,LOPEZ,Avery.Lopez@Example.com,(555) 301-8890,2134,Open house
Jordan,Kim,jordan.kim@example.com,+1 555 410 2290,94110,Website
Sam,Patel,,555-555-0101,73301,Referral
Riley,Chen,riley.chen@example,555.880.1234,60614-2210,Website
Morgan,Diaz,jordan.kim@example.com,5552018844,30301,Zillow
Taylor,Nguyen,taylor.nguyen@example.com,+15559201100,10001,Website`;
