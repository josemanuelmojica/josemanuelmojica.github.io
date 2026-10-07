"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

// Adapted from the supplied reference RealScoutWidget.tsx: same official custom
// elements, shared lazy loader, visibility gating, render check, and fallbacks.
export type WidgetKind = "simple" | "advanced" | "your-listings" | "home-value";
type WidgetState = "waiting" | "loading" | "rendering" | "ready" | "error";

const tags: Record<WidgetKind, string> = {
  simple: "realscout-simple-search",
  advanced: "realscout-advanced-search",
  "your-listings": "realscout-your-listings",
  "home-value": "realscout-home-value",
};

let scriptPromise: Promise<void> | null = null;

// One loader for every mounted widget; a failed attempt can be retried.
function loadWidgetScript(): Promise<void> {
  if (customElements.get(tags.simple)) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) => script.src === siteConfig.widgetScript);
    const script = existing ?? document.createElement("script");
    const timer = window.setTimeout(() => finish(new Error("The widget service took too long to respond.")), 15000);
    function finish(error?: Error) {
      window.clearTimeout(timer);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (error) {
        if (!existing) script.remove();
        reject(error);
      } else resolve();
    }
    function onLoad() { finish(); }
    function onError() { finish(new Error("The widget service is unavailable.")); }
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.src = siteConfig.widgetScript;
      script.type = "module";
      script.dataset.realscoutLoader = "true";
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });
  return scriptPromise;
}

function waitForDefinition(tag: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("The widget did not become available.")), 15000);
    customElements.whenDefined(tag).then(() => { window.clearTimeout(timer); resolve(); });
  });
}

const widgetStyle = {
  width: "100%", display: "block", fontFamily: "var(--font-work-sans), sans-serif",
  "--rs-ss-font-primary": "var(--font-work-sans), sans-serif",
  "--rs-as-font-family": "var(--font-work-sans), sans-serif",
  "--rs-wc-font-family": "var(--font-work-sans), sans-serif",
  "--rs-ss-font-primary-color": "#172833",
  "--rs-ss-searchbar-border-color": "#405563",
  "--rs-ss-box-shadow": "none", "--rs-ss-widget-width": "100%",
  "--rs-as-button-text-color": "#fffefd", "--rs-as-background-color": "#fffefd",
  "--rs-as-button-color": "#0a5f97", "--rs-as-widget-width": "100%",
  "--rs-listing-divider-color": "#0a5f97",
  "--rs-hvw-background-color": "#fffefd", "--rs-hvw-title-color": "#172833",
  "--rs-hvw-subtitle-color": "#405563", "--rs-hvw-input-text-color": "#172833",
  "--rs-hvw-primary-button-text-color": "#fffefd", "--rs-hvw-primary-button-color": "#0a5f97",
  "--rs-hvw-secondary-button-text-color": "#172833", "--rs-hvw-secondary-button-color": "#fffefd",
  "--rs-hvw-widget-width": "auto",
} as CSSProperties;

export function RealScoutWidget({ kind, label }: { kind: WidgetKind; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<WidgetState>("waiting");
  const [attempt, setAttempt] = useState(0);
  const fallback = kind === "home-value" ? siteConfig.homeValue : siteConfig.portal;

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "150px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setState("loading");
    loadWidgetScript()
      .then(() => waitForDefinition(tags[kind]))
      .then(() => { if (!cancelled) setState("rendering"); })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [visible, kind, attempt]);

  useEffect(() => {
    if (state !== "rendering") return;
    const element = widget.current;
    if (!element) return;
    // The official components use a closed shadow root and publish no ready event.
    // Watch the host's painted size rather than inaccessible inner state.
    const checkRendered = () => {
      const bounds = element.getBoundingClientRect();
      if (element.isConnected && bounds.width > 0 && bounds.height >= 24) setState("ready");
    };
    const timer = window.setTimeout(() => setState("error"), 20000);
    const frame = window.requestAnimationFrame(checkRendered);
    const observer = new ResizeObserver(checkRendered);
    observer.observe(element);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [state]);

  const attributes: Record<string, unknown> = { "agent-encoded-id": siteConfig.realScoutId, style: widgetStyle, ref: widget };
  if (kind === "home-value") {
    attributes["remove-title"] = "";
    attributes["remove-subtitle"] = "";
  }
  if (kind === "your-listings") {
    attributes["listing-status"] = "For Sale,In Contract,Sold";
    attributes["include-co-listings"] = "";
    attributes["include-seller-listings"] = "";
  }

  const busy = state === "loading" || state === "rendering";
  return (
    <div className="space-y-4">
      <div ref={host} aria-busy={busy} aria-label={label} role="group" style={{ minHeight: kind === "your-listings" ? 240 : 110 }}>
        {(state === "waiting" || busy) && (
          <div className="flex min-h-[110px] items-center gap-3 rounded-xl border border-dashed p-5 text-sm text-graphite" role="status">
            <span className="size-2 animate-pulse rounded-full bg-blue" aria-hidden="true" />
            {state === "waiting" ? "The live search loads when it reaches the screen." : "Loading live REColorado search…"}
          </div>
        )}
        {state === "error" && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-5 text-sm text-graphite" role="status">
            <p className="w-full">The embedded search is unavailable right now. Retry, or open the full search portal.</p>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setAttempt((n) => n + 1)}>
              <RotateCcw aria-hidden="true" /> Try again
            </Button>
          </div>
        )}
        {(state === "rendering" || state === "ready") && createElement(tags[kind], attributes)}
      </div>
      <a href={fallback} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue underline-offset-4 hover:underline">
        {kind === "home-value" ? "Open the home value page" : "Open the full search portal"} <ArrowUpRight className="size-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}
