// Every claim on the site lives here, so it can be reviewed and corrected in
// one place. The site is for any employer, not one company. Primary source:
// José's approved résumé (October 2026), plus claims from his other October
// résumés that the Notion
// "Knowledge Architecture & Impact Standard" grades as usable. Public-site rules:
// - numbers describe José's own output; company performance metrics stay off
//   the public site (company scale, e.g. "100,000+ agents", is public context);
// - claims the Notion standard marks do-not-use or retired are not used here.
//   José confirmed (Oct 9) to keep these off: the Fin resolution rate, "400+
//   agents across 27 brands", and the "12 requests a month to one" claim.

export const profile = {
  name: "José Manuel Garcia",
  domain: "mojicagarcia.com",
  email: "jm@mojicagarcia.com",
  linkedin: "https://www.linkedin.com/in/josemanuelmgarcia",
  linkedinLabel: "linkedin.com/in/josemanuelmgarcia",
  github: "https://github.com/josemanuelmojica",
  location: "Northern California",
  relocation: "Relocating to the San Francisco Bay Area",
  title: "Senior Member Support Coach & Trainer",
  employer: "RealScout",
  employerContext: "Real estate search platform used by 100,000+ agents",
  dates: "Nov 2020 to present · Remote",
  headline: {
    plain: "I turn support knowledge into",
    italic: "systems AI can run on.",
  },
  summary:
    "Nearly six years building support systems and live learning programs for a platform used by 100,000+ agents. I design how AI answers and when a person takes over, run Claude as daily work infrastructure, and turn what surfaces in support into programs that keep running without me.",
} as const;

export const proof = [
  { value: "66", label: "custom Claude skills in daily use" },
  { value: "178 of 299", label: "Help Center articles, current author of record" },
  { value: "12,000+", label: "assigned support conversations, 2022 to 2026" },
  { value: "36", label: "live sessions hosted solo since April 2026" },
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
    link: { href: "/work/knowledge-linter/", label: "Try the Knowledge Linter" },
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
      "Shared ready-to-use skills with the team and brought teammates who were new to AI, or wary of it, in through small, low-risk wins.",
      "Wrote the team's working guide for Claude and Wispr Flow.",
    ],
    tools: ["Claude", "Claude Code", "Cowork", "Skills", "MCP", "Linear", "Loom"],
    link: { href: "/work/privacy-gate/", label: "Try the Privacy Gate" },
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
    kicker: "Live programs",
    title: "A weekly program",
    italic: "with no single point of failure",
    summary:
      "I run a recurring live program end to end, train the trainers, and build the run-of-show and prep that let anyone pick it up.",
    points: [
      "Runs the weekly program from invitations and agenda to demo, Q&A, recording, and follow-up, plus an every-other-week enterprise session whose takeaways roll out across 20+ brokerage labels: 36 sessions hosted solo since April 2026.",
      "The April 2026 relaunch drew 160 registrants and 62 attendees, 3.6x to 5.1x the prior baseline.",
      "Named trainer on 14+ brokerage trainings in 2026, scheduled by another team. Prepared a corporate brokerage trainer who serves about 2,000 agents to teach independently, and many regular attendees now train their own offices.",
      "Built the run-of-show documents, checklists, SOPs, and 154 workshop artifacts. Follow-on workshops were redesigned into narrower, more tactical sessions after attendee feedback.",
    ],
    tools: ["Live facilitation", "Run-of-show", "Train-the-trainer", "Zoom", "Loom"],
  },
  {
    id: "coaching",
    kicker: "New-hire coaching",
    title: "From first ticket",
    italic: "to independence",
    summary:
      "A repeatable method for bringing new teammates up to speed.",
    points: [
      "Each coaching moment covers the answer, the reasoning, a reusable reply in their own words, the article to reuse, and a clear escalation rule, backed by Loom walkthroughs.",
      "Teammates coached in 2024 now help others.",
      "Built the team's operating model (system map, one rule per tool, ownership, SOPs) and trained the team and its Director on it.",
    ],
    tools: ["Coaching", "Loom", "SOPs", "Notion"],
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

// Mirrors the approved résumé, minus the claims José asked to keep off the site.
export const experience = {
  role: profile.title,
  company: profile.employer,
  context: profile.employerContext,
  dates: profile.dates,
  points: [
    "Weekly delivery: run the Thursday program end to end, from invitations and agenda to demo, Q&A, recording, and follow-up, plus an every-other-week session for enterprise and A/B-tier accounts whose takeaways roll out as best practice across 20+ brokerage labels; 36 sessions hosted solo since April 2026.",
    "Relaunch: the April 2026 relaunch of the recurring series drew 160 registrants and 62 attendees, 3.6x to 5.1x the prior baseline, with returning participants.",
    "Presenters and trainers: named trainer on 14+ brokerage trainings in 2026, scheduled by another team; prepared a corporate brokerage trainer who serves about 2,000 agents to teach independently; many regular attendees became advocates who train their own offices.",
    "New-hire coaching: brought new teammates from first tickets to independence with a repeatable method and Loom walkthroughs; teammates coached in 2024 now help others.",
    "Operating system: built run-of-show documents, 154 workshop artifacts, checklists, and SOPs, plus the team's operating model and the training on it for the team and its Director.",
    "Feedback into content: redesigned follow-on workshops into narrower, more tactical sessions after attendee feedback, and updates training with Product and Engineering as the product changes.",
    "AI that lowers the barrier: Claude and Notion workflows with human review for prep, intake, and reporting (66 custom skills); shared ready-to-use skills with the team and brought teammates new to or wary of AI in through small, low-risk wins.",
    "Calm when plans change: the senior escalation point for the most charged customer situations, across 12,000+ assigned support conversations since 2022.",
  ],
};

export const earlierExperience = [
  "Starbucks, Shift Supervisor and Learning Coach (2006 to 2009): onboarded and coached new partners in store; training notes and SOPs adopted at the district level",
  "AT&T, Sales and Service Representative (2010 to 2012): response templates adopted by 12 colleagues, then 500+",
  "Peet's Coffee, Barista (2016 to 2019)",
  "FishBowl360, Sales Manager and Virtual Tour Photographer (2012 to 2016)",
  "Special Education Paraeducator and AmeriCorps Head Start Support Aide: in-classroom teaching support",
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
  roles: ["AI operations", "Support operations", "Enablement and live programs", "Implementation and AI deployment"],
  // Optional: a short note in your own words about the work you want next,
  // written for any employer. It is only shown when filled in.
  note: "",
};
