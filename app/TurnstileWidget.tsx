"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "light";
      appearance: "interaction-only";
      action: "lead-interview";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = "cloudflare-turnstile";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) {
      onToken("");
      return;
    }

    let widgetId: string | null = null;
    let disposed = false;

    const render = () => {
      if (disposed || widgetId || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        appearance: "interaction-only",
        action: "lead-interview",
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    if (window.turnstile) render();
    else script.addEventListener("load", render, { once: true });

    return () => {
      disposed = true;
      script?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken, siteKey]);

  return (
    <div className="lead-interview__turnstile">
      <div ref={containerRef} />
      <p>{siteKey ? "Protected by Cloudflare Turnstile." : "Secure verification is not configured."}</p>
    </div>
  );
}
