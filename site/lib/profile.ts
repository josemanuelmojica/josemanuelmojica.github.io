// Every claim on the site lives here, so it can be reviewed and corrected in
// one place. Only verified proof points are used; numbers describe José's own
// output, never employer metrics.

export const profile = {
  name: "José Manuel Mojica Garcia",
  shortName: "José",
  domain: "mojicagarcia.com",
  email: "hello@mojicagarcia.com",
  github: "https://github.com/josemanuelmojica",
  location: "Fresno, California",
  title: "Senior Member Support Coach and Trainer",
  employer: "RealScout",
  employerContext: "B2B real estate SaaS",
  headline: {
    plain: "I turn support knowledge into",
    italic: "systems AI can run on.",
  },
  summary:
    "My title is support coach and trainer. The work is AI operations, integrations, and enablement: I own eight CRM integrations at API depth, run the knowledge base behind Intercom's Fin AI agent, and have written more than sixty Claude skills that automate real support workflows.",
} as const;

export const proof = [
  { value: "60+", label: "Claude skills authored" },
  { value: "218+", label: "Help Center articles" },
  { value: "8", label: "CRM integrations at API depth" },
  { value: "5", label: "Intercom certifications, incl. AI Operations" },
] as const;

export interface WorkItem {
  id: string;
  kicker: string;
  title: string;
  italic: string;
  summary: string;
  points: string[];
  tools: string[];
  link?: { href: string; label: string };
}

export const work: WorkItem[] = [
  {
    id: "claude-skills",
    kicker: "AI operations",
    title: "A Claude skills library",
    italic: "for support operations",
    summary:
      "More than sixty SKILL.md files that turn repeatable support work into instructions Claude follows the same way every time.",
    points: [
      "Contact data pipeline: detects the source CRM, maps columns, validates and filters emails, parses and scores addresses, and produces import-ready files with an error report.",
      "Integration authority: one source of truth for troubleshooting eight CRM integrations, including tags, sync behavior, and webhook recipes.",
      "Knowledge base tooling: authoring and auditing rules for AI-answered help content, plus macro and SOP drafting in a consistent support voice.",
      "Guardrails: a sanitizer that checks documents for names, customer data, and internal metrics before anything leaves the building.",
    ],
    tools: ["Claude", "Claude Code", "Skills", "Python"],
  },
  {
    id: "fin-ai",
    kicker: "Knowledge architecture",
    title: "The knowledge base behind",
    italic: "an AI support agent",
    summary:
      "I manage the Intercom Fin AI implementation: the content it answers from, how that content is structured, and whether its answers are right.",
    points: [
      "Wrote and maintain 218+ Help Center articles.",
      "Architected the knowledge base for retrieval: direct assertions, action-first steps, and agent-facing specificity instead of hedged prose.",
      "Audit answer quality and hallucination risk, then fix the source content rather than patching individual replies.",
      "Built integration documentation from API references and live session transcripts.",
    ],
    tools: ["Intercom Fin AI", "Help Center", "Content audits"],
  },
  {
    id: "integrations",
    kicker: "Integrations",
    title: "Eight CRM integrations,",
    italic: "owned at API depth",
    summary:
      "Follow Up Boss, Cloze, MoxiWorks, BoldTrail (kvCORE), Rechat, Zapier, Zillow, and Realtor.com. When one breaks, I am usually the person who finds out why.",
    points: [
      "Diagnose sync, tag, and routing failures at the API level, not by guessing from the UI.",
      "Serve as the mid-level escalation point and internal source of truth for integration behavior.",
      "Support customers building their own Zapier workflows on top of the platform's triggers.",
    ],
    tools: ["REST APIs", "Webhooks", "Zapier", "n8n", "Postman"],
  },
  {
    id: "mls-research",
    kicker: "Data",
    title: "MLS research and",
    italic: "synthetic test data",
    summary:
      "Groundwork for lead workflows built on synthetic data instead of real customer records.",
    points: [
      "Researched 216 MLS systems.",
      "Generated 1,728+ synthetic test contacts.",
      "Designed a Fair Housing-compliant lead taxonomy with 40 segments.",
    ],
    tools: ["Python", "Data modeling", "Fair Housing compliance"],
  },
  {
    id: "arx-text",
    kicker: "Built with Claude Code",
    title: "Arχ & Teχt,",
    italic: "a cartography platform",
    summary:
      "A real estate experience where an editorial map of Colorado's Front Range moves as you scroll, with live listing search built in.",
    points: [
      "Next.js App Router static export served from Cloudflare Workers.",
      "MapLibre map with three original map styles, scroll-driven GSAP scenes, and Framer Motion interface.",
      "Full reduced-motion mode, keyboard navigation, and screen-reader labels throughout.",
    ],
    tools: ["Next.js", "React", "MapLibre", "GSAP", "Tailwind", "Cloudflare"],
    link: { href: "https://github.com/josemanuelmojica/josemanuelmojica.github.io", label: "View the code" },
  },
];

export const principles = [
  {
    title: "Write for the model and the person.",
    body: "Content an AI agent answers from has to be unambiguous for both. I write direct, action-first instructions and test them against real questions.",
  },
  {
    title: "Start from the failure.",
    body: "The happy path teaches little. I learn a system by what breaks it, then document the diagnosis so the next person does not have to rediscover it.",
  },
  {
    title: "Leave a system, not a heroic fix.",
    body: "A good answer helps one customer. A skill, an article, or a pipeline helps everyone after them, and keeps working when I am not there.",
  },
];

export const experience = {
  role: profile.title,
  company: profile.employer,
  context: profile.employerContext,
  points: [
    "Own eight native CRM integrations at API depth and serve as the escalation specialist for integration issues.",
    "Manage the Intercom Fin AI implementation, including knowledge base architecture, accuracy auditing, and answer quality review.",
    "Deliver recurring live training for enterprise brokerages.",
    "Built the integration knowledge base from API documentation and session transcripts.",
    "Authored 60+ Claude skills that automate data imports, integration troubleshooting, and support content.",
  ],
};

export const credentials = {
  earned: [
    "Intercom certifications (5), including AI Operations",
    "Postman API Fundamentals Student Expert",
  ],
  inProgress: [
    "AWS Certified Cloud Practitioner",
    "HubSpot Revenue Operations",
    "Postman API Testing",
    "Calbright College, Data Analytics certificate",
  ],
};

export const toolkit = [
  "Claude & Claude Code", "Intercom Fin AI", "Zapier", "n8n", "Postman", "REST APIs & webhooks",
  "Python", "FastAPI", "React", "Next.js", "ChromaDB", "pgvector", "Ollama", "Cloudflare Workers",
];

export const lookingFor = {
  roles: ["AI Operations", "Solutions Engineering", "Technical Account Management", "Implementation"],
  note:
    "I want to do this work at Anthropic: helping customers put Claude into real operations, and making sure what it answers from is right. I already build with Claude every day; I would like to help other teams do the same.",
};
