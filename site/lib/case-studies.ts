// Scrubbed, external-use case studies from José's Notion "Portfolio & Proof 2026".
export interface CaseStudy {
  slug: string;
  kicker: string;
  title: string;
  italic: string;
  oneLine: string;
  scene: string;
  constraint: string;
  decision: string[];
  result: string[];
  takeaway: string;
  demoNote: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "knowledge-linter",
    kicker: "Knowledge operations",
    title: "The Knowledge Linter:",
    italic: "treat a help center like code",
    oneLine: "Find broken anchors, vague links, and hedged steps, and get a work order for each.",
    scene:
      "A customer-facing Help Center had grown through product iterations, feature renames, and migrations. Nobody knew how many internal anchor links were silently broken. With an AI support agent indexing the knowledge base directly, a broken anchor is not just annoying: it sends retrieval to the wrong place.",
    constraint:
      "No engineering bandwidth for knowledge-base tooling, nothing existing to audit anchor-level integrity, and any manual check would decay the moment someone edited a heading. It had to run deterministically, offline, at zero cost and zero production risk.",
    decision: [
      "Built a link-integrity pipeline that parsed the exported articles, checked every link against the real heading tree, and classified defects by severity.",
      "Generated machine-readable work orders (exact file, line, target, and suggested fix) instead of a list of complaints.",
      "Kept the linter and a runbook so the check runs before publishing, not after a customer finds the problem.",
    ],
    result: [
      "Closed the link-integrity defect class: 161 corrections across 82 articles.",
      "Surfaced a systemic anchor-defect pattern that had been invisible.",
      "Turned link integrity from a reactive complaint into a pre-publish quality gate.",
    ],
    takeaway: "Knowledge rot is a systems problem, not an authoring problem. Lint deterministically, generate work orders, and never let unchecked knowledge reach people or models.",
    demoNote: "A small, browser-only version of the method, rebuilt for this site. It adds three writing checks from the same audit work: hedged language, screenshot-only steps, and hard-coded dates.",
  },
  {
    slug: "privacy-gate",
    kicker: "AI guardrails",
    title: "The Privacy Gate:",
    italic: "redact in code, before any model sees it",
    oneLine: "Turn a raw transcript into something safe to reuse, with an independent leak check.",
    scene:
      "Over a hundred onboarding recordings, support calls, and training sessions held valuable operational knowledge, but the transcripts were full of personal information: names, phone numbers, emails, and client details.",
    constraint:
      "Zero tolerance for leaks, and policy meant raw transcripts could not be sent to an external AI service to clean them. Processing had to be local, deterministic, and auditable.",
    decision: [
      "A deterministic redaction engine for structured identifiers like emails, phones, links, and addresses.",
      "Role tokens instead of blanks, so the conversation still reads as who said what.",
      "Strict triage: skip malformed files rather than guess.",
      "An independent second pass that checks the output against everything that was redacted.",
    ],
    result: [
      "Ingested 107 raw transcripts, processed 95, and deliberately skipped 12 malformed files.",
      "6,109 verified redactions across the corpus.",
      "Zero forbidden-identifier leaks in the second-pass audit.",
      "About 1.56 million characters turned into a clean, searchable repository.",
    ],
    takeaway: "Privacy cannot be a prompt instruction. Redact deterministically at the edge, keep role meaning, and audit the output with a separate pass.",
    demoNote: "A small, browser-only version of the method, rebuilt for this site. Nothing you paste leaves this page.",
  },
  {
    slug: "import-preflight",
    kicker: "Data onboarding",
    title: "The Import Preflight:",
    italic: "fix the data before it touches a wire",
    oneLine: "Map messy CRM exports to one schema and dry-fit every row before import.",
    scene:
      "When brokerages moved to the platform, their contacts arrived as exports from dozens of legacy CRMs: colliding headers, inconsistent phone formats, missing emails, and duplicates.",
    constraint:
      "Bad records in production split client histories and bounced emails, and support had no time to hand-clean spreadsheets. Validation had to happen in the browser, before any network request.",
    decision: [
      "A schema-mapping engine that recognizes source CRM headers and maps them to one canonical contact schema.",
      "In-browser normalization: E.164 phone numbers, email deduplication, ZIP repair.",
      "A dry-fit preflight that sorts every record into Clean, Auto-repaired, or Critical before anything is committed.",
      "An automated test suite: 229 assertions across 12 test files.",
    ],
    result: [
      "57 TypeScript modules and 8 interactive components.",
      "Schema mismatches, duplicates, and missing required fields caught on the desktop, before data reached an API.",
      "A multi-day engineering ticket became a self-service workflow.",
    ],
    takeaway: "The cheapest place to repair bad data is on the client, before it touches a wire. Dry-fit against your schema and reject bad joints early.",
    demoNote: "A small, browser-only version of the method, rebuilt for this site with synthetic contacts. Nothing you paste leaves this page.",
  },
];

export const caseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug)!;
