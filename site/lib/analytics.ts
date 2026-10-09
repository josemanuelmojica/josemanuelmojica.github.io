// Visitor analytics, in one place.
//
// Google Analytics 4 counts visits: which pages people read, roughly where they
// are (city or country, never an exact address), what device and browser they
// use, how they found the site, and the few clicks tracked below.
//
// Meta Pixel does the same for Meta (Facebook and Instagram). Its main use is
// measuring and retargeting Meta ads. It stays off until `metaPixelId` holds the
// number from Meta Events Manager.
//
// Both are skipped for visitors whose browser sends Global Privacy Control, the
// opt-out signal California law recognizes. What people paste into the demos is
// never sent: events carry only the demo's name.

export const analytics = {
  googleId: "G-19W7RVVR7K",
  metaPixelId: "",
} as const;

/** Clicks worth counting. Elements opt in with `data-track="<name>"`. */
export type TrackedEvent = "try_the_work" | "email" | "resume" | "linkedin" | "github" | "demo_run";

type Params = Record<string, string | number>;

interface AnalyticsWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}

/** Send one event to whichever trackers loaded. A no-op when none did. */
export function track(event: TrackedEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  w.gtag?.("event", event, params);
  if (event === "email") w.fbq?.("track", "Contact");
  else w.fbq?.("trackCustom", event, params);
}

/**
 * The loader that runs on every page. It checks Global Privacy Control first,
 * then loads Google's gtag.js (the same snippet Google gives you) and, when an
 * ID is set, Meta's standard Pixel snippet.
 */
export function bootstrapScript(): string {
  const { googleId, metaPixelId } = analytics;
  const google = `
window.dataLayer = window.dataLayer || [];
window.gtag = function(){ dataLayer.push(arguments); };
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleId)}, { allow_google_signals: false, allow_ad_personalization_signals: false });
var g = document.createElement('script'); g.async = true;
g.src = 'https://www.googletagmanager.com/gtag/js?id=' + ${JSON.stringify(googleId)};
document.head.appendChild(g);`;
  const meta = metaPixelId
    ? `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(metaPixelId)});
fbq('track', 'PageView');`
    : "";
  return `(function(){
if (navigator.globalPrivacyControl === true) return;
${google}
${meta}
})();`;
}
