// Every claim on the site lives here, so it can be reviewed and corrected in
// one place. Sources: José's October 2026 Anthropic résumés and the Notion
// "Knowledge Architecture & Impact Standard". Public-site rules:
// - numbers describe José's own output; company performance metrics stay off
//   the public site (company scale, e.g. "100,000+ agents", is public context);
// - claims the Notion standard marks do-not-use or retired are not used here.

export const profile = {
  name: "José Manuel Garcia",
  domain: "mojicagarcia.com",
  email: "jm@mojicagarcia.com",
  linkedin: "https://www.linkedin.com/in/josemanuelmgarcia",
  linkedinLabel: "linkedin.com/in/josemanuelmgarcia",
  github: "https://github.com/josemanuelmojica",
  location: "Northern California",
  relocation: "Relocating to the San Francisco Bay Area · available three office days per week",
  title: "Senior Member Support Coach & Trainer",
  employer: "RealScout",
  employerContext: "Real estate search platform used by 100,000+ agents",
  dates: "Nov 2020 to present · Remote",
  headline: {
    plain: "I turn support knowledge into",
    italic: "systems AI can run on.",
  },
  summary:
    "I design how an AI support agent answers and when a person takes over, run Claude as daily work infrastructure, and turn what surfaces in support calls into programs people run without me.",
} as const;

export const proof = [
  { value: "66", label: "custom Claude skills in daily use" },
  { value: "178 of 299", label: "Help Center articles, current author of record" },
  { value: "12,000+", label: "assigned support conversations, 2022 to 2026" },
  { value: "8", label: "CRM integration paths owned at API depth" },
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
    id: "fin-agent",
    kicker: "AI support agent design",
    title: "A production AI agent,",
    italic: "and the knowledge it answers from",
    summary:
      "I designed the knowledge, routing, identity checks, and handoff rules for a production Intercom Fin agent, and I govern the Help Center it reads.",
    points: [
      "Current author of record on 178 of 299 published Help Center articles, the knowledge customers, teammates, and Fin all read.",
      "Ran a 65-article live verification wave against real product behavior, which found about 20 corrections across 12 to 14 product facts.",
      "Audited the Help Center as an information system and documented 20 concrete gaps in topics, use cases, audiences, and consistency.",
      "Closed a whole defect class: 161 link fixes across 82 articles, then a linter and runbook so it stays closed.",
    ],
    tools: ["Intercom Fin", "Help Center", "Conversation design", "Content audits"],
  },
  {
    id: "claude-infrastructure",
    kicker: "Claude as infrastructure",
    title: "66 custom skills,",
    italic: "with a person on every irreversible step",
    summary:
      "Claude is my daily work infrastructure: custom skills, multi-agent workflows that pause for human approval before anything irreversible, and a prompt eval loop.",
    points: [
      "A prompt eval loop backed by a 28-scenario red-team suite.",
      "Loom recordings and call notes go through Claude into engineering-ready Linear tickets with reproduction steps and proposed fixes. Teammates adopted the workflow.",
      "Loom, Zoom, and Intercom transcripts pass through a sanitizer pipeline (6,109 redactions across 95 sessions) before becoming indexed support guidance and workshop material.",
      "Wrote the team's working guide for Claude and Wispr Flow.",
    ],
    tools: ["Claude", "Claude Code", "Cowork", "Skills", "MCP", "Linear", "Loom"],
  },
  {
    id: "mcp-assistant",
    kicker: "Shipped",
    title: "A live MCP",
    italic: "support assistant",
    summary:
      "A support assistant that answers questions from the knowledge base, running on a Cloudflare Worker with the Anthropic API and Notion MCP.",
    points: [
      "Built because the tool the team needed did not exist yet.",
      "Answers from the same knowledge base the team maintains.",
    ],
    tools: ["Anthropic API", "Model Context Protocol", "Notion MCP", "Cloudflare Workers"],
  },
  {
    id: "enablement",
    kicker: "Enablement",
    title: "Training that",
    italic: "keeps running without me",
    summary:
      "I turn recurring support questions into live programs, and I train the trainers.",
    points: [
      "Runs a weekly customer workshop plus an enterprise session every other week: 36 sessions solo since April 2026.",
      "Named trainer on 14+ brokerage trainings in 2026, scheduled by another team.",
      "Prepared a brokerage's corporate trainer, who serves about 2,000 agents, to teach the platform independently.",
      "One recorded webinar has drawn nearly 4,000 views.",
    ],
    tools: ["Live facilitation", "Curriculum design", "Train-the-trainer", "Zoom"],
  },
  {
    id: "integrations",
    kicker: "Integrations and escalations",
    title: "Eight CRM paths,",
    italic: "and the escalations behind them",
    summary:
      "Follow Up Boss, Zapier, Zillow Connect, MoxiWorks, BoldTrail, Rechat, Cloze, and Realtor.com.",
    points: [
      "Diagnose API, authentication, field-mapping, and sync failures, and separate configuration issues from product defects.",
      "The senior backstop on colleagues' conversations: 287 times in 2025, up from 24 in 2022.",
      "Handled 12,000+ assigned support conversations from 2022 to 2026.",
    ],
    tools: ["REST APIs", "OAuth & SSO", "Webhooks", "Zapier MCP", "Postman"],
  },
  {
    id: "data-systems",
    kicker: "Data and retrieval",
    title: "Retrieval and",
    italic: "data systems",
    summary:
      "Engineering projects behind the knowledge work, used where a role calls for them.",
    points: [
      "A retrieval pipeline on FastAPI, pgvector, ChromaDB, and Ollama with cross-encoder reranking.",
      "An MLS knowledge-graph compiler in Python with JSON Schema contracts and SQLite full-text search, covering about 149 profiles.",
      "A fair-practice MLS framework spanning 216 MLS systems and 1,728 synthetic test leads, with fairness designed in as a constraint.",
    ],
    tools: ["Python", "FastAPI", "pgvector", "ChromaDB", "SQLite", "JSON Schema"],
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
      "MapLibre map with three original map styles, scroll-driven GSAP scenes, and a Framer Motion interface.",
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
    title: "Fix the source before the prompt.",
    body: "When an answer is wrong, I check the knowledge, routing, permissions, and retrieval first. Most bad answers start upstream.",
  },
  {
    title: "Leave a system, not a heroic fix.",
    body: "A good answer helps one customer. A skill, an article, or a program helps everyone after them, and keeps working when I am not there.",
  },
];

export const experience = {
  role: profile.title,
  company: profile.employer,
  context: profile.employerContext,
  dates: profile.dates,
  points: [
    "Designed the knowledge, routing, identity checks, and handoff rules for a production Intercom Fin agent.",
    "Shipped a live MCP support assistant (Cloudflare Worker, Anthropic API, Notion MCP) that answers support questions from the knowledge base.",
    "Runs Claude as daily work infrastructure: 66 custom skills, multi-agent workflows with human approval on irreversible steps, and a prompt eval loop backed by a 28-scenario red-team suite.",
    "Current author of record on 178 of 299 published Help Center articles; shipped 161 link fixes across 82 articles to zero, with a linter and runbook.",
    "Handled 12,000+ assigned support conversations from 2022 to 2026; joined colleagues' conversations as the senior backstop 287 times in 2025, up from 24 in 2022.",
    "Built the team's operating model (system map, one rule per tool, ownership, SOPs), trained the team and its Director on it, and led the move to Intercom.",
    "Runs a weekly customer workshop and a biweekly enterprise session, 36 sessions solo since April 2026; prepared a brokerage corporate trainer who serves about 2,000 agents.",
  ],
};

export const earlierExperience = [
  "AT&T, Sales and Service Representative (2010 to 2012): built response templates adopted by 12 colleagues, then 500+; ranked #1 in sales from a service role",
  "FishBowl360, Sales Manager and Virtual Tour Photographer (2012 to 2016)",
  "Peet's Coffee, Barista (2016 to 2019)",
  "Starbucks, Shift Supervisor and Learning Coach (2006 to 2009)",
  "Special Education Paraeducator; AmeriCorps Head Start Aide",
];

export const education =
  "Psychology coursework at Saint Mary's College of California and Merced College; Architectural Drafting and CAD coursework at Diablo Valley College and Oregon State University. Languages: English, Spanish (limited).";

export const credentials = [
  "Anthropic (5): Claude 101, Claude Code 101, Claude Cowork, Model Context Protocol, MCP Advanced Topics",
  "Intercom (3)",
  "Notion (3)",
  "Postman API Documentation",
  "HubSpot Academy (12)",
];

export const toolkit = [
  "Claude (Projects, Cowork, Claude Code, skills, MCP)", "Anthropic API", "Intercom & Fin", "Notion", "Linear",
  "Loom", "Zoom", "Wispr Flow", "Zapier & Zapier MCP", "Follow Up Boss", "Google Workspace", "Python",
  "FastAPI", "Next.js", "Cloudflare Workers",
];

export const lookingFor = {
  roles: ["AI deployment", "Support operations", "Technical enablement", "AI operations"],
  // Write this in your own words. Anthropic's candidate AI guidance asks for a
  // candidate-authored first draft, and your Notion rules say the same. It is
  // only shown when filled in.
  note: "",
};
