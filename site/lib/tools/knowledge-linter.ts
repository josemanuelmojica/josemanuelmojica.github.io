// Browser-only rebuild of the Knowledge Linter method: treat a help article
// like code, check every in-page link against the real heading tree, and emit
// work orders (line, target, suggested fix) instead of vague warnings.
// Dependency-free so it runs in the browser and under `node --test`.

export type Severity = "critical" | "warning" | "info";

export interface WorkOrder {
  line: number;
  severity: Severity;
  rule: string;
  found: string;
  fix: string;
}

export interface LintReport {
  anchors: string[];
  links: number;
  orders: WorkOrder[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return dp[b.length];
}

/** Closest real anchor to a broken fragment, if one is plausibly what was meant. */
export function nearestAnchor(target: string, anchors: string[]): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const anchor of anchors) {
    const score = distance(target, anchor) / Math.max(target.length, anchor.length, 1);
    if (score < bestScore) {
      bestScore = score;
      best = anchor;
    }
  }
  return best !== null && bestScore <= 0.5 ? best : null;
}

const HEDGES = /\b(might|may be able to|should be able to|possibly|try to|in some cases|it depends)\b/i;
const VAGUE_LINK = /^(click here|here|this|link|this link|read more)$/i;
const SCREENSHOT_ONLY = /\b(as shown (below|above|in the screenshot)|see (the )?(screenshot|image) below)\b/i;
const HARD_DATE = /\b(?:19|20)\d{2}\b|\b(?:jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2}\b/i;

/** Lint Markdown or HTML help-center content. */
export function lintArticle(source: string): LintReport {
  const lines = source.split(/\r?\n/);
  const anchors: string[] = [];
  const anchorLines = new Map<string, number>();
  const orders: WorkOrder[] = [];

  const addAnchor = (id: string, line: number) => {
    if (anchorLines.has(id)) {
      orders.push({
        line, severity: "warning", rule: "duplicate-anchor", found: `#${id}`,
        fix: `Rename one of the headings that both resolve to #${id} (first on line ${anchorLines.get(id)}), or links will land on the wrong one.`,
      });
      return;
    }
    anchorLines.set(id, line);
    anchors.push(id);
  };

  // Pass 1: build the canonical heading tree.
  lines.forEach((text, index) => {
    const line = index + 1;
    const md = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(text);
    if (md) addAnchor(slugify(md[1]), line);
    for (const match of text.matchAll(/<h[1-6][^>]*\sid=["']([^"']+)["'][^>]*>/gi)) addAnchor(match[1], line);
  });

  // Pass 2: check every link and line against the tree and the writing rules.
  let links = 0;
  lines.forEach((text, index) => {
    const line = index + 1;
    const found: Array<{ label: string; href: string }> = [];
    for (const m of text.matchAll(/\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) found.push({ label: m[1], href: m[2] });
    for (const m of text.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) found.push({ label: m[2].replace(/<[^>]+>/g, ""), href: m[1] });

    for (const link of found) {
      links++;
      const label = link.label.trim();
      if (!label) {
        orders.push({ line, severity: "critical", rule: "empty-link-text", found: link.href, fix: "Give the link visible text that says where it goes." });
      } else if (VAGUE_LINK.test(label)) {
        orders.push({ line, severity: "warning", rule: "vague-link-text", found: `"${label}"`, fix: "Name the destination in the link text so people and retrieval both know what it points to." });
      }
      if (link.href.startsWith("#")) {
        const target = decodeURIComponent(link.href.slice(1));
        if (!anchors.includes(target)) {
          const suggestion = nearestAnchor(target, anchors);
          orders.push({
            line, severity: "critical", rule: "broken-anchor", found: link.href,
            fix: suggestion ? `Point it to #${suggestion}, the closest existing heading.` : "No heading matches. Add the section or remove the link.",
          });
        }
      }
    }

    const plain = text.replace(/<[^>]+>/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    const hedge = HEDGES.exec(plain);
    if (hedge) orders.push({ line, severity: "info", rule: "hedged-language", found: `"${hedge[0]}"`, fix: "State what happens directly. Hedged steps make an AI agent hedge its answer too." });
    const shot = SCREENSHOT_ONLY.exec(plain);
    if (shot) orders.push({ line, severity: "info", rule: "screenshot-dependency", found: `"${shot[0]}"`, fix: "Describe the step in text. Retrieval cannot read the screenshot." });
    const date = HARD_DATE.exec(plain);
    if (date) orders.push({ line, severity: "info", rule: "hard-coded-date", found: `"${date[0]}"`, fix: "Check this is still true, or remove the date so the article does not go stale." });
  });

  const rank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  orders.sort((a, b) => rank[a.severity] - rank[b.severity] || a.line - b.line);
  return { anchors, links, orders };
}

export const SAMPLE_ARTICLE = `# Connect your CRM

Use this guide to connect your CRM and keep contacts in sync.

## Before you start
You need admin access. See [permissions](#admin-permisions) first.

## Admin permissions
Ask your account owner to grant access. You might need to log out and back in.

## Connect the integration
1. Open Settings, then Integrations.
2. Select your CRM and sign in, as shown in the screenshot below.
3. [Click here](#troubleshooting) if the connection fails.

## Sync rules
New contacts sync every 15 minutes. This changed in March 2024.

## Sync rules
Tags sync in one direction only. Read the [tag guide](#tag-mapping).
`;
