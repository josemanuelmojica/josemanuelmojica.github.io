"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  type Intent,
  type Interpretation,
  interpretUtterance,
  stateNameFor,
} from "./lib/locationResolver";
import { publicPath } from "./lib/publicPath";
import runtimeConfig from "../content/public-runtime-config.json";
import { TurnstileWidget } from "./TurnstileWidget";

type InterviewStep = "intent" | "location" | "confirm" | "needs" | "contact" | "sent";
type SelectedIntent = Intent | "both" | "exploring";
type SubmitState = "idle" | "submitting" | "error";

const intentOptions: Array<{ value: SelectedIntent; label: string; note: string }> = [
  { value: "buy", label: "Find a home", note: "A place that fits the life around it." },
  { value: "sell", label: "Sell a home", note: "A thoughtful plan for what comes next." },
  { value: "both", label: "Move between both", note: "Coordinate a sale and a purchase." },
  { value: "exploring", label: "Still drawing it out", note: "Start with the place, not the transaction." },
];

function intentList(selected: SelectedIntent | null, detected: Intent[]): Intent[] {
  const values = new Set<Intent>(detected);
  if (selected === "buy" || selected === "both") values.add("buy");
  if (selected === "sell" || selected === "both") values.add("sell");
  return [...values];
}

function createRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function LeadInterview() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || runtimeConfig.turnstileSiteKey;
  const [step, setStep] = useState<InterviewStep>("intent");
  const [selectedIntent, setSelectedIntent] = useState<SelectedIntent | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [needs, setNeeds] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [requestId, setRequestId] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileAttempt, setTurnstileAttempt] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const visualUrl = interpretation?.visualId
    ? publicPath(`/maps/us-state-studies/v1/states/${interpretation.visualId}.svg`)
    : publicPath("/maps/us-state-studies/v1/fallback.svg");
  const visualName = interpretation?.region ?? "Your search area";
  const progress = useMemo(() => {
    const position: Record<InterviewStep, number> = {
      intent: 1,
      location: 2,
      confirm: 3,
      needs: 4,
      contact: 5,
      sent: 5,
    };
    return position[step];
  }, [step]);

  async function locate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await interpretUtterance(locationQuery);
    setInterpretation(result);
    setStep("confirm");
  }

  function chooseState(postalCode: string) {
    if (!interpretation) return;
    setInterpretation({
      ...interpretation,
      region: stateNameFor(postalCode),
      visualId: `US-${postalCode}`,
      needsConfirmation: false,
      candidateStates: [],
      unresolved: false,
    });
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setErrorMessage("");

    const functionUrl =
      process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL?.trim() || publicPath("/api/lead");

    const payload = {
      requestId,
      name,
      email,
      consent,
      consentAt: new Date().toISOString(),
      website,
      turnstileToken,
      intent: intentList(selectedIntent, interpretation?.intent ?? []),
      location: {
        query: locationQuery.trim(),
        locality: interpretation?.locality ?? locationQuery.trim(),
        region: interpretation?.region,
        country: "US",
        visualScope: "state",
        visualId: interpretation?.visualId,
      },
      needs: needs.trim(),
      source: "ark-and-text-lead-interview",
      pagePath: window.location.pathname,
    };

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Lead delivery returned ${response.status}`);
      setSubmitState("idle");
      setStep("sent");
    } catch {
      setRequestId(createRequestId());
      setTurnstileToken("");
      setTurnstileAttempt((current) => current + 1);
      setSubmitState("error");
      setErrorMessage("We could not send this inquiry. Your answers are still here—please try again shortly.");
    }
  }

  if (step === "sent") {
    return (
      <div className="lead-interview lead-interview--sent" role="status">
        <p className="lead-interview__index">Interview / received</p>
        <h3>We have your first point on the map.</h3>
        <p>A person will read what you shared and reply to you directly.</p>
        <button type="button" onClick={() => {
          setStep("intent");
          setSubmitState("idle");
        }}>Begin another inquiry</button>
      </div>
    );
  }

  return (
    <div className="lead-interview">
      <div className="lead-interview__header">
        <p className="lead-interview__index">Interview / 0{progress}–05</p>
        <div className="lead-interview__progress" aria-label={`Step ${progress} of 5`}>
          <span style={{ width: `${progress * 20}%` }} />
        </div>
      </div>

      {step === "intent" && (
        <fieldset className="lead-interview__step">
          <legend>What are you looking forward to?</legend>
          <p>Choose the closest answer. It does not need to be final.</p>
          <div className="lead-interview__choices">
            {intentOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => {
                setSelectedIntent(option.value);
                setStep("location");
              }}>
                <strong>{option.label}</strong>
                <span>{option.note}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "location" && (
        <form className="lead-interview__step" onSubmit={locate}>
          <label htmlFor="lead-location">Where do you search first?</label>
          <p>Enter a city, state, or ZIP code. We’ll draw the wider state around it.</p>
          <input
            id="lead-location"
            value={locationQuery}
            onChange={(event) => setLocationQuery(event.target.value)}
            placeholder="Boise, Idaho or 83702"
            autoComplete="postal-code"
            required
          />
          <div className="lead-interview__actions">
            <button type="button" className="lead-interview__back" onClick={() => setStep("intent")}>Back</button>
            <button type="submit">Draw this area <span>↗</span></button>
          </div>
        </form>
      )}

      {step === "confirm" && interpretation && (
        <div className="lead-interview__step lead-interview__confirmation">
          <div className="lead-interview__plate">
            <img src={visualUrl} alt={`${visualName} rendered as a quiet blue watershed drawing`} />
            <span>{visualName}</span>
          </div>
          <div className="lead-interview__confirm-copy">
            {interpretation.candidateStates.length > 0 ? (
              <fieldset>
                <legend>Which {interpretation.locality} did you mean?</legend>
                <div className="lead-interview__state-choices">
                  {interpretation.candidateStates.map((postalCode) => (
                    <button type="button" key={postalCode} onClick={() => chooseState(postalCode)}>
                      {stateNameFor(postalCode)} <span>{postalCode}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : interpretation.unresolved ? (
              <>
                <h3>Help us place that point.</h3>
                <p>Add the state or a five-digit ZIP code so we can select the right drawing.</p>
              </>
            ) : (
              <>
                <p className="eyebrow">First approximation</p>
                <h3>{interpretation.region}</h3>
                <p>We’re beginning with the state, then a person can narrow the search with you.</p>
              </>
            )}
            <div className="lead-interview__actions">
              <button type="button" className="lead-interview__back" onClick={() => setStep("location")}>Edit place</button>
              {!interpretation.needsConfirmation && !interpretation.unresolved && (
                <button type="button" onClick={() => setStep("needs")}>That’s the area <span>↗</span></button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === "needs" && (
        <form className="lead-interview__step" onSubmit={(event) => {
          event.preventDefault();
          setRequestId(createRequestId());
          setTurnstileToken("");
          setStep("contact");
        }}>
          <label htmlFor="lead-needs">What should life there make easier?</label>
          <p>A few plain words are more useful than a perfect brief.</p>
          <textarea
            id="lead-needs"
            value={needs}
            onChange={(event) => setNeeds(event.target.value)}
            placeholder="Morning walks, room for family, a shorter school run…"
            rows={5}
            required
          />
          <div className="lead-interview__actions">
            <button type="button" className="lead-interview__back" onClick={() => setStep("confirm")}>Back</button>
            <button type="submit">One last step <span>↗</span></button>
          </div>
        </form>
      )}

      {step === "contact" && (
        <form className="lead-interview__step" onSubmit={submitLead}>
          <h3>Where should we reply?</h3>
          <div className="lead-interview__contact-grid">
            <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
            <label><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          </div>
          <label className="lead-interview__honeypot" aria-hidden="true">
            <span>Website</span><input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          <label className="lead-interview__consent">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
            <span>I agree that Arχ &amp; Teχt may contact me about this inquiry. I can ask to stop at any time.</span>
          </label>
          <TurnstileWidget
            key={turnstileAttempt}
            siteKey={turnstileSiteKey}
            requestId={requestId}
            onToken={setTurnstileToken}
          />
          {submitState === "error" && <p className="lead-interview__error" role="alert">{errorMessage}</p>}
          <div className="lead-interview__actions">
            <button type="button" className="lead-interview__back" onClick={() => setStep("needs")}>Back</button>
            <button
              type="submit"
              disabled={submitState === "submitting" || !requestId || !turnstileToken}
            >
              {submitState === "submitting" ? "Sending…" : "Request a private conversation"} <span>↗</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
