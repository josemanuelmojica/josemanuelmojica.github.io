import ambiguousPlaceData from "../../content/ambiguous-place-names.json" with { type: "json" };
import cityStateData from "../../content/city-state-lookup.json" with { type: "json" };
import zipStateData from "../../content/zip-state-lookup.json" with { type: "json" };
import stateManifest from "../../public/maps/us-state-studies/v1/manifest.json" with { type: "json" };

type ZipRange = { prefixStart: number; prefixEnd: number; state: string };
type CityEntry = { city: string; state: string };
type AmbiguousEntry = { place: string; candidateStates: string[] };
type StateEntry = { id: string; name: string; postalCode: string };

const ZIP_RANGES = zipStateData as ZipRange[];
const CITY_TABLE = [...(cityStateData as CityEntry[])].sort(
  (left, right) => right.city.length - left.city.length,
);
const AMBIGUOUS_PLACES = ambiguousPlaceData as AmbiguousEntry[];
const STATES = stateManifest.states as StateEntry[];
const STATE_NAMES = new Map(STATES.map((entry) => [entry.postalCode, entry.name]));
const STATE_CODES_BY_NAME = new Map(
  STATES.map((entry) => [entry.name.toLowerCase(), entry.postalCode]),
);
const STATE_VISUAL_IDS = new Set(STATES.map((entry) => entry.id));

export type Intent = "buy" | "sell";

const BUY_PATTERN = /\b(?:buy|buying|purchase|purchasing|look(?:ing)?|search(?:ing)?|house hunt(?:ing)?)\b/i;
const SELL_PATTERN = /\b(?:sell|selling|sale|list(?:ing)?)\b/i;

export function detectIntent(utterance: string): Intent[] {
  const intents: Intent[] = [];
  if (BUY_PATTERN.test(utterance)) intents.push("buy");
  if (SELL_PATTERN.test(utterance)) intents.push("sell");
  return intents;
}

export function extractZip(utterance: string): string | null {
  return utterance.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1] ?? null;
}

function normalizePlace(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function zipToState(zip: string): string | null {
  const prefix = Number.parseInt(zip.slice(0, 3), 10);
  const range = ZIP_RANGES.find(
    (entry) => prefix >= entry.prefixStart && prefix <= entry.prefixEnd,
  );
  return range?.state ?? null;
}

function explicitState(rawInput: string, normalized: string): string | null {
  const exactCode = rawInput.trim().match(/^([A-Za-z]{2})$/)?.[1]?.toUpperCase();
  if (exactCode && STATE_NAMES.has(exactCode)) return exactCode;

  const qualifiedCode = rawInput
    .match(/(?:,\s*|\bin\s+)([A-Za-z]{2})\b/i)?.[1]
    ?.toUpperCase();
  if (qualifiedCode && STATE_NAMES.has(qualifiedCode)) return qualifiedCode;

  const stateNames = [...STATE_CODES_BY_NAME.keys()].sort(
    (left, right) => right.length - left.length,
  );
  const matchedName = stateNames.find((name) =>
    new RegExp(`(?:^|\\s)${name.replaceAll(" ", "\\s+")}(?:$|\\s)`).test(normalized),
  );
  return matchedName ? STATE_CODES_BY_NAME.get(matchedName) ?? null : null;
}

export type BundledResolution = {
  state: string | null;
  needsClarification: boolean;
  candidateStates: string[];
  unresolved: boolean;
  matchedPlace: string | null;
};

export function resolveFromBundledTables(rawInput: string): BundledResolution {
  const zip = extractZip(rawInput);
  if (zip) {
    const state = zipToState(zip);
    if (state && STATE_VISUAL_IDS.has(`US-${state}`)) {
      return {
        state,
        needsClarification: false,
        candidateStates: [],
        unresolved: false,
        matchedPlace: zip,
      };
    }
  }

  const normalized = normalizePlace(rawInput);
  const statedState = explicitState(rawInput, normalized);
  if (statedState) {
    const city = CITY_TABLE.find((entry) => normalized.includes(entry.city));
    return {
      state: statedState,
      needsClarification: false,
      candidateStates: [],
      unresolved: false,
      matchedPlace: city?.city ?? rawInput.trim(),
    };
  }

  const ambiguous = AMBIGUOUS_PLACES.find((entry) =>
    normalized.includes(entry.place),
  );
  if (ambiguous) {
    return {
      state: null,
      needsClarification: true,
      candidateStates: ambiguous.candidateStates,
      unresolved: false,
      matchedPlace: ambiguous.place,
    };
  }

  const city = CITY_TABLE.find((entry) => normalized.includes(entry.city));
  if (city) {
    return {
      state: city.state,
      needsClarification: false,
      candidateStates: [],
      unresolved: false,
      matchedPlace: city.city,
    };
  }

  return {
    state: null,
    needsClarification: false,
    candidateStates: [],
    unresolved: true,
    matchedPlace: null,
  };
}

async function resolveFromGeocoder(
  query: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL(
      "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
    );
    url.searchParams.set("address", query);
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");
    const response = await fetchImpl(url.toString(), { signal: controller.signal });
    if (!response.ok) return null;

    const body = await response.json();
    const state = body?.result?.addressMatches?.[0]?.addressComponents?.state;
    return typeof state === "string" && STATE_VISUAL_IDS.has(`US-${state}`)
      ? state
      : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type Interpretation = {
  intent: Intent[];
  query: string;
  locality: string;
  region: string | null;
  country: "US";
  visualScope: "state";
  visualId: string | null;
  needsConfirmation: boolean;
  candidateStates: string[];
  unresolved: boolean;
};

type InterpretOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export function stateNameFor(postalCode: string): string | null {
  return STATE_NAMES.get(postalCode) ?? null;
}

export async function interpretUtterance(
  utterance: string,
  options: InterpretOptions = {},
): Promise<Interpretation> {
  const query = utterance.trim();
  const bundled = resolveFromBundledTables(query);
  let resolvedState = bundled.needsClarification ? null : bundled.state;

  if (!resolvedState && !bundled.needsClarification && options.fetchImpl) {
    resolvedState = await resolveFromGeocoder(
      query,
      options.fetchImpl,
      options.timeoutMs ?? 2500,
    );
  }

  const visualId = resolvedState ? `US-${resolvedState}` : null;
  const unresolved = !resolvedState && !bundled.needsClarification;

  return {
    intent: detectIntent(query),
    query,
    locality: bundled.matchedPlace ?? query,
    region: resolvedState ? stateNameFor(resolvedState) : null,
    country: "US",
    visualScope: "state",
    visualId,
    needsConfirmation: bundled.needsClarification || unresolved,
    candidateStates: bundled.candidateStates,
    unresolved,
  };
}
