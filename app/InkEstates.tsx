"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import marketLinkOrigins from "../content/market-link-origins.json";
import marketLinks from "../content/market-links.json";
import { LeadInterview } from "./LeadInterview";
import { AtlasRail } from "./components/AtlasRail";
import { publicPath } from "./lib/publicPath";
import { responsiveSources } from "./lib/derivedMedia";

type Study = {
  id: string;
  city: string;
  state: string;
  subarea: string;
  caption: string;
  line: string;
  note: string;
  baseUrl: string;
  overlayUrl: string;
  metadataUrl: string;
  searchUrl: string;
};

type Listing = {
  id: string;
  market: string;
  state: string;
  neighborhood: string;
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
  imageAlt: string;
  note: string;
};

type ActiveMetadata = {
  pieces: Array<{
    id: string;
    element: string;
    centroid: [number, number];
  }>;
};

type MapLayerHandle = {
  update: (amount: number) => void;
};

const marketSearchUrl = (city: string) =>
  publicPath(`/?market=${encodeURIComponent(city)}#properties`);

const marketAnchor = (city: string) =>
  `market-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

const allowedMarketLinkOrigins = new Set(marketLinkOrigins);

const resolvedMarketSearchUrl = (id: string, city: string) => {
  const fallback = marketSearchUrl(city);
  const configured = marketLinks.find((entry) => entry.id === id && entry.city === city);

  if (!configured?.verified || !configured.safe_for_public_site || !configured.url) {
    return fallback;
  }

  try {
    const url = new URL(configured.url);
    const safe =
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      allowedMarketLinkOrigins.has(url.origin);

    return safe ? url.href : fallback;
  } catch {
    return fallback;
  }
};

const studies: Study[] = [
  {
    id: "study-01",
    city: "San Francisco",
    state: "CA",
    subarea: "Pacific Heights",
    caption: "Pacific edge / 01",
    line: "A grid loosens at the water.",
    note: "Pacific Heights, seen from the slope to the bay.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-01.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-01.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-01.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-01", "San Francisco"),
  },
  {
    id: "study-02",
    city: "San Diego",
    state: "CA",
    subarea: "La Jolla",
    caption: "Southern coast / 02",
    line: "The shoreline keeps the quiet.",
    note: "La Jolla, from village streets to the coast.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-02.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-02.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-02.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-02", "San Diego"),
  },
  {
    id: "study-03",
    city: "Portland",
    state: "OR",
    subarea: "West Hills",
    caption: "River crossing / 03",
    line: "Bridges hold two halves together.",
    note: "The West Hills, above the river and the city grid.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-03.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-03.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-03.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-03", "Portland"),
  },
  {
    id: "study-04",
    city: "New York City",
    state: "NY",
    subarea: "Tribeca",
    caption: "Harbor density / 04",
    line: "Every margin becomes a route.",
    note: "Tribeca, where former industrial blocks meet the Hudson.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-04.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-04.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-04.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-04", "New York City"),
  },
  {
    id: "study-05",
    city: "Austin",
    state: "TX",
    subarea: "West Lake Hills",
    caption: "River bend / 05",
    line: "The current interrupts the grid.",
    note: "West Lake Hills, west of the river and close to downtown.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-05.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-05.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-05.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-05", "Austin"),
  },
  {
    id: "study-06",
    city: "Chicago",
    state: "IL",
    subarea: "Gold Coast",
    caption: "Lake plane / 06",
    line: "An exact grid meets open water.",
    note: "The Gold Coast, between the lake and the city.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-06.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-06.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-06.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-06", "Chicago"),
  },
  {
    id: "study-07",
    city: "Minneapolis",
    state: "MN",
    subarea: "Lake of the Isles",
    caption: "Water interval / 07",
    line: "Lakes leave pauses in the drawing.",
    note: "Lake of the Isles, with the shoreline nearby.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-07.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-07.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-07.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-07", "Minneapolis"),
  },
  {
    id: "study-08",
    city: "Charlotte",
    state: "NC",
    subarea: "Myers Park",
    caption: "Inland orbit / 08",
    line: "Radial roads gather and release.",
    note: "Myers Park, drawn around its curving streets.",
    baseUrl: publicPath("/maps/japanese-ink-scroll/base/study-08.webp"),
    overlayUrl: publicPath("/maps/japanese-ink-scroll/study-08.active-overlay.svg"),
    metadataUrl: publicPath("/maps/japanese-ink-scroll/study-08.active.json"),
    searchUrl: resolvedMarketSearchUrl("study-08", "Charlotte"),
  },
];

const listings: Listing[] = [
  {
    id: "IK-101",
    market: "San Francisco",
    state: "CA",
    neighborhood: "Pacific Heights",
    price: 18.5,
    priceLabel: "$18,500,000",
    beds: 5,
    baths: 7,
    area: "8,410 sq ft",
    image: publicPath("/properties/residence-03.jpg"),
    imageAlt: "Bright contemporary residence with skyline views",
    note: "A full-floor home above the north slope. Bay views. Rooms large enough for art.",
  },
  {
    id: "IK-102",
    market: "San Diego",
    state: "CA",
    neighborhood: "La Jolla",
    price: 11.8,
    priceLabel: "$11,800,000",
    beds: 6,
    baths: 8,
    area: "7,920 sq ft",
    image: publicPath("/properties/residence-02.jpg"),
    imageAlt: "Contemporary pool residence with glass balconies",
    note: "A La Jolla house facing the ocean, with a pool and no shared walls.",
  },
  {
    id: "IK-103",
    market: "Portland",
    state: "OR",
    neighborhood: "West Hills",
    price: 6.4,
    priceLabel: "$6,400,000",
    beds: 4,
    baths: 5,
    area: "5,860 sq ft",
    image: publicPath("/properties/residence-01.jpg"),
    imageAlt: "Minimal dark-clad home in a private green garden",
    note: "A dark-clad house in the West Hills, set behind mature evergreens.",
  },
  {
    id: "IK-104",
    market: "New York City",
    state: "NY",
    neighborhood: "Tribeca",
    price: 24.5,
    priceLabel: "$24,500,000",
    beds: 5,
    baths: 6,
    area: "6,250 sq ft",
    image: publicPath("/properties/residence-03.jpg"),
    imageAlt: "Skyline-facing living room with tall windows",
    note: "Four exposures, a private elevator landing, and 6,250 square feet in Tribeca.",
  },
  {
    id: "IK-105",
    market: "Austin",
    state: "TX",
    neighborhood: "West Lake Hills",
    price: 9.2,
    priceLabel: "$9,200,000",
    beds: 5,
    baths: 7,
    area: "7,340 sq ft",
    image: publicPath("/properties/residence-02.jpg"),
    imageAlt: "Modern home opening to a pool and garden",
    note: "A shaded West Lake Hills home built around the pool.",
  },
  {
    id: "IK-106",
    market: "Chicago",
    state: "IL",
    neighborhood: "Gold Coast",
    price: 8.7,
    priceLabel: "$8,700,000",
    beds: 4,
    baths: 6,
    area: "6,010 sq ft",
    image: publicPath("/properties/residence-03.jpg"),
    imageAlt: "Refined high-rise interior overlooking a city skyline",
    note: "A Gold Coast residence facing the lake.",
  },
  {
    id: "IK-107",
    market: "Minneapolis",
    state: "MN",
    neighborhood: "Lake of the Isles",
    price: 4.9,
    priceLabel: "$4,900,000",
    beds: 5,
    baths: 5,
    area: "5,540 sq ft",
    image: publicPath("/properties/residence-01.jpg"),
    imageAlt: "Minimal residence beside a private garden",
    note: "A renovated house near Lake of the Isles with a private garden.",
  },
  {
    id: "IK-108",
    market: "Charlotte",
    state: "NC",
    neighborhood: "Myers Park",
    price: 5.6,
    priceLabel: "$5,600,000",
    beds: 6,
    baths: 7,
    area: "7,180 sq ft",
    image: publicPath("/properties/residence-02.jpg"),
    imageAlt: "Large contemporary residence with pool terrace",
    note: "A new Myers Park estate with 7,180 square feet and six bedrooms.",
  },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const smooth = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from));
  return x * x * (3 - 2 * x);
};

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
};

const safeLocalSvgReference = (value: string) => {
  if (/(?:javascript|vbscript|data|file|https?):|@import|expression\s*\(/i.test(value)) {
    return false;
  }

  for (const match of value.matchAll(/url\(([^)]*)\)/gi)) {
    const target = match[1].trim().replace(/^(['"])(.*)\1$/, "$2");
    if (!/^#[A-Za-z_][\w:.-]*$/.test(target)) return false;
  }

  return true;
};

const sanitizeMapSvg = (root: Element) => {
  root
    .querySelectorAll(
      "script, foreignObject, iframe, object, embed, image, audio, video, a, use, animate, animateMotion, animateTransform, set",
    )
    .forEach((node) => node.remove());

  for (const element of [root, ...root.querySelectorAll("*")]) {
    if (element.tagName.toLowerCase() === "style") {
      if (!safeLocalSvgReference(element.textContent ?? "")) element.remove();
      continue;
    }

    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const isEvent = name.startsWith("on");
      const isLink = name === "href" || name === "xlink:href" || name === "src";
      const safeLink = value.startsWith("#") && /^#[A-Za-z_][\w:.-]*$/.test(value);

      if (isEvent || (isLink && !safeLink) || !safeLocalSvgReference(value)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
};

const MapLayer = forwardRef<
  MapLayerHandle,
  {
    study: Study;
    direction: "outgoing" | "incoming";
    reducedMotion: boolean;
    mobile: boolean;
  }
>(function MapLayer(
  { study, direction, reducedMotion, mobile },
  forwardedRef,
) {
  const overlayHostRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<
    Array<{
      element: SVGGraphicsElement;
      dx: number;
      dy: number;
      delay: number;
    }>
  >([]);
  const [baseFailed, setBaseFailed] = useState(false);

  useEffect(() => setBaseFailed(false), [study.baseUrl]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      update(amount: number) {
        const normalized = clamp(amount);
        for (const piece of piecesRef.current) {
          const staggered = smooth(
            piece.delay,
            Math.min(1, piece.delay + 0.76),
            normalized,
          );
          const translated = direction === "outgoing" ? staggered : 1 - staggered;
          piece.element.style.transform = `translate(${piece.dx * translated}px, ${piece.dy * translated}px) scale(${1 - 0.18 * translated})`;
          piece.element.style.opacity = String(1 - 0.52 * translated);
        }
      },
    }),
    [direction, mobile],
  );

  useEffect(() => {
    const host = overlayHostRef.current;
    if (!host || reducedMotion) {
      piecesRef.current = [];
      host?.replaceChildren();
      return;
    }

    const controller = new AbortController();
    let disposed = false;

    Promise.all([
      fetch(study.overlayUrl, { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error("Overlay unavailable");
        return response.text();
      }),
      fetch(study.metadataUrl, { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error("Metadata unavailable");
        return response.json() as Promise<ActiveMetadata>;
      }),
    ])
      .then(([source, metadata]) => {
        if (disposed) return;
        const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
        const root = parsed.documentElement;
        if (root.nodeName.toLowerCase() !== "svg" || root.querySelector("parsererror")) {
          throw new Error("Invalid map overlay");
        }
        sanitizeMapSvg(root);
        root.setAttribute("aria-hidden", "true");
        root.setAttribute("focusable", "false");
        root.setAttribute("preserveAspectRatio", "xMidYMid slice");
        host.replaceChildren(root);

        const limit = mobile ? 88 : metadata.pieces.length;
        const sealX = 871.2 * (mobile ? 0.78 : 0.82);
        const sealY = 1159.2 * (mobile ? 0.68 : 0.72);
        piecesRef.current = metadata.pieces.slice(0, limit).flatMap((piece) => {
          const element = root.querySelector(piece.element);
          if (!(element instanceof SVGGraphicsElement)) return [];
          element.style.transformOrigin = `${piece.centroid[0]}px ${piece.centroid[1]}px`;
          return [
            {
              element,
              dx: sealX - piece.centroid[0],
              dy: sealY - piece.centroid[1],
              delay: stableHash(piece.id) * 0.22,
            },
          ];
        });
      })
      .catch(() => {
        if (!disposed) {
          piecesRef.current = [];
          host.replaceChildren();
        }
      });

    return () => {
      disposed = true;
      controller.abort();
      piecesRef.current = [];
      host.replaceChildren();
    };
  }, [mobile, reducedMotion, study.metadataUrl, study.overlayUrl]);

  return (
    <div className="map-layer">
      {!baseFailed ? (
        <img
          className="map-layer__base"
          src={study.baseUrl}
          alt=""
          decoding="async"
          onError={() => setBaseFailed(true)}
        />
      ) : (
        <div className="map-layer__fallback" aria-hidden="true">
          Map drawing unavailable
        </div>
      )}
      <div className="map-layer__overlay" ref={overlayHostRef} aria-hidden="true" />
    </div>
  );
});

function MarketStory({ reducedMotion }: { reducedMotion: boolean }) {
  const storyRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const outgoingShellRef = useRef<HTMLDivElement>(null);
  const incomingShellRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<MapLayerHandle>(null);
  const incomingRef = useRef<MapLayerHandle>(null);
  const indexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [storyNearby, setStoryNearby] = useState(false);
  const current = studies[activeIndex];
  const next = studies[Math.min(activeIndex + 1, studies.length - 1)];
  const portalStudy = studies[previewIndex ?? activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story || typeof IntersectionObserver === "undefined") {
      setStoryNearby(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setStoryNearby(true);
        observer.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(story);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !storyNearby) return;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const viewportAnchor = window.innerHeight * (mobile ? 0.54 : 0.5);
      let nextIndex = indexRef.current;
      let activeRect = chapterRefs.current[nextIndex]?.getBoundingClientRect() ?? null;
      if (!activeRect) return;

      while (nextIndex < studies.length - 1 && activeRect.bottom <= viewportAnchor - 12) {
        const candidate = chapterRefs.current[nextIndex + 1]?.getBoundingClientRect();
        if (!candidate) break;
        nextIndex += 1;
        activeRect = candidate;
      }

      while (nextIndex > 0 && activeRect.top > viewportAnchor + 12) {
        const candidate = chapterRefs.current[nextIndex - 1]?.getBoundingClientRect();
        if (!candidate) break;
        nextIndex -= 1;
        activeRect = candidate;
      }

      const local = clamp((viewportAnchor - activeRect.top) / activeRect.height);
      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        window.requestAnimationFrame(schedule);
      }

      const isLast = nextIndex === studies.length - 1;
      const gather = isLast ? 0 : smooth(0.62, 0.88, local);
      const incomingSettle = isLast ? 1 : smooth(0.6, 0.9, local);
      const outgoingOpacity = isLast ? 1 : 1 - smooth(0.76, 0.96, local);
      const incomingOpacity = isLast ? 0 : smooth(0.64, 0.94, local);
      const outgoingOverlayOpacity = isLast
        ? 0
        : smooth(0.62, 0.7, local) * (1 - smooth(0.9, 0.99, local));
      const incomingOverlayOpacity = isLast
        ? 0
        : smooth(0.64, 0.72, local) * (1 - smooth(0.86, 0.97, local));

      if (outgoingShellRef.current) {
        outgoingShellRef.current.style.opacity = String(outgoingOpacity);
        outgoingShellRef.current.style.setProperty(
          "--overlay-opacity",
          String(outgoingOverlayOpacity),
        );
      }
      if (incomingShellRef.current) {
        incomingShellRef.current.style.opacity = String(incomingOpacity);
        incomingShellRef.current.style.setProperty(
          "--overlay-opacity",
          String(incomingOverlayOpacity),
        );
      }
      outgoingRef.current?.update(gather);
      incomingRef.current?.update(incomingSettle);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const resize = () => {
      schedule();
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, [mobile, reducedMotion, storyNearby]);

  return (
    <section className="market-story" id="markets" ref={storyRef}>
      <div className="market-stage paper-stage">
        <div className="market-stage__counter" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <i />
          <span>{String(studies.length).padStart(2, "0")}</span>
        </div>
        {storyNearby && (
          <div className="map-shell map-shell--outgoing" ref={outgoingShellRef} aria-hidden="true">
            <MapLayer
              ref={outgoingRef}
              study={current}
              direction="outgoing"
              reducedMotion={reducedMotion}
              mobile={mobile}
            />
          </div>
        )}
        {storyNearby && activeIndex < studies.length - 1 && (
          <div className="map-shell map-shell--incoming" ref={incomingShellRef} aria-hidden="true">
            <MapLayer
              ref={incomingRef}
              study={next}
              direction="incoming"
              reducedMotion={reducedMotion}
              mobile={mobile}
            />
          </div>
        )}
        <a
          className="market-portal"
          href={portalStudy.searchUrl}
          aria-label={`Open the ${portalStudy.city} market search for ${portalStudy.subarea}`}
        >
          <span className="market-portal__aperture" aria-hidden="true">
            <i className="market-portal__art-slot">
              <span>Neighborhood artwork</span>
              <small>Placeholder / pending</small>
            </i>
            <i className="market-portal__wash" />
            <i className="market-portal__axis market-portal__axis--horizontal" />
            <i className="market-portal__axis market-portal__axis--vertical" />
          </span>
          <span className="market-portal__legend" aria-hidden="true">
            <small>{portalStudy.city} / {portalStudy.state}</small>
            <strong>{portalStudy.subarea}</strong>
            <span>Hover to trace ↗</span>
          </span>
        </a>
        <div className="ink-seal" aria-hidden="true"><span>χ</span></div>
        <div className="market-stage__label" aria-hidden="true">
          Eight markets <span>/</span> one point of view
        </div>
      </div>

      <div className="market-story__timeline">
        {studies.map((study, index) => (
          <section
            className="market-chapter"
            id={marketAnchor(study.city)}
            key={study.id}
            ref={(chapter) => {
              chapterRefs.current[index] = chapter;
            }}
          >
            <div className="market-chapter__copy">
              <p className="eyebrow">{study.caption}</p>
              <h2>{study.city}</h2>
              <p className="market-chapter__line">{study.line}</p>
              <p className="market-chapter__note">{study.note}</p>
              <a
                href={study.searchUrl}
                aria-label={`Open the ${study.city} market search`}
                aria-current={activeIndex === index ? "location" : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setPreviewIndex(index);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") setPreviewIndex(null);
                }}
                onFocus={() => setPreviewIndex(index)}
                onBlur={() => setPreviewIndex(null)}
              >
                Explore this market <span>↗</span>
              </a>
            </div>
            <span className="market-chapter__index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          </section>
        ))}
      </div>
    </section>
  );
}

const WORDMARK_SOURCES = responsiveSources("brand/ark-and-text-source.png");
const HERO_SOURCES = responsiveSources("maps/japanese-ink-scroll/base/study-01.webp");

function HeroMap() {
  // The hero ink map is the LCP visual: eager, high priority, never lazy, with
  // responsive derivatives so a phone fetches ~49 KB AVIF instead of the 324 KB
  // 1200px master. Width/height set to prevent layout shift.
  const alt = "San Francisco street network rendered as a Japanese ink drawing";
  if (!HERO_SOURCES) {
    return (
      <img
        className="hero__map"
        src={publicPath("/maps/japanese-ink-scroll/base/study-01.webp")}
        alt={alt}
        decoding="async"
        fetchPriority="high"
      />
    );
  }
  return (
    <picture>
      <source type="image/avif" srcSet={HERO_SOURCES.avifSrcSet} sizes="100vw" />
      <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes="100vw" />
      <img
        className="hero__map"
        src={HERO_SOURCES.fallbackSrc}
        alt={alt}
        decoding="async"
        fetchPriority="high"
        width={HERO_SOURCES.masterWidth ?? undefined}
        height={HERO_SOURCES.masterHeight ?? undefined}
      />
    </picture>
  );
}

function BrandName() {
  // The wordmark sits in the header and is on the critical path (near-LCP), so
  // it is eager + high priority. Responsive derivatives replace the 1.77 MB PNG
  // master with a few-KB AVIF/WebP; the master remains a preservation asset.
  if (!WORDMARK_SOURCES) {
    return (
      <span className="wordmark__art" aria-hidden="true">
        <img src={publicPath("/brand/ark-and-text-source.png")} alt="" fetchPriority="high" />
      </span>
    );
  }
  return (
    <span className="wordmark__art" aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={WORDMARK_SOURCES.avifSrcSet} sizes="(max-width: 640px) 200px, 260px" />
        <source type="image/webp" srcSet={WORDMARK_SOURCES.webpSrcSet} sizes="(max-width: 640px) 200px, 260px" />
        <img
          src={WORDMARK_SOURCES.fallbackSrc}
          alt=""
          fetchPriority="high"
          decoding="async"
          width={WORDMARK_SOURCES.masterWidth ?? undefined}
          height={WORDMARK_SOURCES.masterHeight ?? undefined}
        />
      </picture>
    </span>
  );
}

export function InkEstates() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState("All markets");
  const [budgetFilter, setBudgetFilter] = useState("Any budget");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    const requestedMarkets = new URLSearchParams(window.location.search).getAll("market");
    if (
      requestedMarkets.length === 1 &&
      studies.some((study) => study.city === requestedMarkets[0])
    ) {
      setMarketFilter(requestedMarkets[0]);
    }
    try {
      const saved = window.localStorage.getItem("ark-and-text-favorites");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        const knownIds = new Set(listings.map((listing) => listing.id));
        if (Array.isArray(parsed)) {
          setFavorites(
            new Set(
              parsed.filter(
                (value): value is string =>
                  typeof value === "string" && knownIds.has(value),
              ),
            ),
          );
        }
      }
    } catch {
      // Invalid or unavailable local storage must not interrupt page setup.
    } finally {
      setFavoritesHydrated(true);
    }
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!favoritesHydrated) return;

    try {
      window.localStorage.setItem(
        "ark-and-text-favorites",
        JSON.stringify(Array.from(favorites)),
      );
    } catch {
      // Favorites still work for this visit when persistence is unavailable.
    }
  }, [favorites, favoritesHydrated]);

  const filteredListings = useMemo(() => {
    const maximum = budgetFilter === "Any budget" ? Infinity : Number(budgetFilter);
    return listings.filter(
      (listing) =>
        (marketFilter === "All markets" || listing.market === marketFilter) &&
        listing.price <= maximum,
    );
  }, [budgetFilter, marketFilter]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openListing = (listing: Listing) => {
    setSelectedListing(listing);
    window.requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Ark and Text home">
          <BrandName />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="site-navigation" className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
          <a href="#properties" onClick={closeMenu}>Properties</a>
          <a href="#markets" onClick={closeMenu}>Markets</a>
          <a href="#approach" onClick={closeMenu}>Approach</a>
          <a className="nav-contact" href="#contact" onClick={closeMenu}>Private inquiry</a>
        </nav>
      </header>

      <section className="hero paper-stage" id="top">
        <HeroMap />
        <div className="hero__wash" />
        <div className="hero__content">
          <p className="eyebrow">Private real estate / eight American markets</p>
          <h1>Be <em>drawn</em> to where you live.</h1>
          <p className="hero__lede">
            The house matters. So does the life outside it.
          </p>
        </div>
        <form
          className="property-search"
          aria-label="Search the representative property collection"
          onSubmit={(event) => {
            event.preventDefault();
            document.getElementById("properties")?.scrollIntoView({
              behavior: reducedMotion ? "auto" : "smooth",
            });
          }}
        >
          <label>
            <span>Market</span>
            <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}>
              <option>All markets</option>
              {studies.map((study) => <option key={study.id}>{study.city}</option>)}
            </select>
          </label>
          <label>
            <span>Up to</span>
            <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
              <option>Any budget</option>
              <option value="5">$5M</option>
              <option value="10">$10M</option>
              <option value="15">$15M</option>
              <option value="20">$20M</option>
            </select>
          </label>
          <button type="submit">View collection <span>↗</span></button>
        </form>
        <a className="scroll-cue" href="#properties">
          <span>Discover</span><i />
        </a>
        <div className="hero__seal ink-seal"><span>χ</span></div>
      </section>

      <section className="properties" id="properties">
        <div className="section-heading">
          <p className="eyebrow">The private collection</p>
          <h2>The right house, in the right part of town.</h2>
          <p>
            These homes are examples. Live listings will replace them when the
            property feed is connected.
          </p>
        </div>

        <div className="filter-line" aria-label="Property filters">
          <img className="freehand-icon filter-line__icon" src={publicPath("/icons/freehand-filter.png")} alt="" />
          <label>
            <span>Showing</span>
            <select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}>
              <option>All markets</option>
              {studies.map((study) => <option key={study.id}>{study.city}</option>)}
            </select>
          </label>
          <label>
            <span>Budget</span>
            <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)}>
              <option>Any budget</option>
              <option value="5">Up to $5M</option>
              <option value="10">Up to $10M</option>
              <option value="15">Up to $15M</option>
              <option value="20">Up to $20M</option>
            </select>
          </label>
          <span className="filter-line__count" aria-live="polite">
            {filteredListings.length} residence{filteredListings.length === 1 ? "" : "s"}
          </span>
        </div>

        {filteredListings.length > 0 ? (
          <div className="property-grid">
            {filteredListings.map((listing, index) => (
              <article className="property-card" key={listing.id}>
                <button
                  type="button"
                  className="property-card__image"
                  onClick={() => openListing(listing)}
                  aria-label={`View ${listing.neighborhood} residence details`}
                >
                  <img
                    src={listing.image}
                    alt={listing.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="property-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="property-card__view">View residence ↗</span>
                </button>
                <div className="property-card__body">
                  <div>
                    <p>{listing.market}, {listing.state}</p>
                    <h3>{listing.neighborhood}</h3>
                  </div>
                  <button
                    type="button"
                    className="save-button"
                    aria-pressed={favorites.has(listing.id)}
                    onClick={() => toggleFavorite(listing.id)}
                  >
                    {favorites.has(listing.id) ? "Saved" : "Save"}
                  </button>
                  <dl>
                    <div><dt>Price</dt><dd>{listing.priceLabel}</dd></div>
                    <div><dt>Beds</dt><dd>{listing.beds}</dd></div>
                    <div><dt>Baths</dt><dd>{listing.baths}</dd></div>
                    <div><dt>Interior</dt><dd>{listing.area}</dd></div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <p>No concept residences match this combination.</p>
            <button type="button" onClick={() => { setMarketFilter("All markets"); setBudgetFilter("Any budget"); }}>
              Reset filters
            </button>
          </div>
        )}
      </section>

      <section className="markets-intro markets-intro--atlas">
        <AtlasRail />
        <div className="markets-intro__copy">
          <p className="eyebrow">A place-first practice</p>
          <h2>A map tells you what a listing cannot.</h2>
          <p>
            Scroll eight real street networks. Each city gathers at the same
            point. Then the next map takes over.
          </p>
        </div>
      </section>

      <MarketStory reducedMotion={reducedMotion} />

      <section className="approach" id="approach">
        <div className="approach__statement">
          <p className="eyebrow">The Arχ &amp; Teχt approach</p>
          <h2>Know what to show. Know when to stay quiet.</h2>
        </div>
        <div className="approach__steps">
          <article>
            <img className="freehand-icon" src={publicPath("/icons/freehand-key.png")} alt="" />
            <span>一 / Listen</span>
            <h3>Start with Tuesday.</h3>
            <p>Tell us how you spend a normal week. We’ll work backward to the house and the neighborhood.</p>
          </article>
          <article>
            <img className="freehand-icon" src={publicPath("/icons/freehand-filter.png")} alt="" />
            <span>二 / Edit</span>
            <h3>See fewer homes. See the right ones.</h3>
            <p>We search the public market and the quieter one. You see only the homes worth your time.</p>
          </article>
          <article>
            <img className="freehand-icon" src={publicPath("/icons/freehand-calendar.png")} alt="" />
            <span>三 / Steward</span>
            <h3>Make every decision quietly informed.</h3>
            <p>We stay close from the first tour to closing. You always know what happens next.</p>
          </article>
        </div>
      </section>

      <section className="contact paper-stage" id="contact">
        <img
          src={publicPath("/maps/japanese-ink-scroll/base/study-08.webp")}
          alt="Charlotte street network rendered as a Japanese ink drawing"
          loading="lazy"
          decoding="async"
        />
        <div className="contact__copy">
          <img className="freehand-icon contact__icon" src={publicPath("/icons/freehand-calendar.png")} alt="" />
          <p className="eyebrow">Begin discreetly</p>
          <h2>Tell us what you’re looking forward to.</h2>
          <p>A person will reply.</p>
        </div>
        <LeadInterview />
      </section>

      <footer className="site-footer">
        <a className="wordmark" href="#top" aria-label="Ark and Text home">
          <BrandName />
        </a>
        <p>Be drawn to where you live.</p>
        <div className="site-footer__meta">
          <span>Concept brokerage experience · not live inventory</span>
          <span>Map data © OpenStreetMap contributors</span>
          <span>
            Property imagery via Pexels: Max Vakhtbovych, Wiki15 Canton, KAILAS PRASAD
          </span>
          <span>
            Freehand icons by <a href="https://www.streamlinehq.com/icons/freehand-free">Streamline</a>, licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
          </span>
        </div>
        <a className="back-to-top" href="#top">Back to top ↑</a>
      </footer>

      <dialog
        className="property-dialog"
        ref={dialogRef}
        onClose={() => setSelectedListing(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        {selectedListing && (
          <div className="property-dialog__inner">
            <button className="dialog-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Close property details">Close</button>
            <img src={selectedListing.image} alt={selectedListing.imageAlt} />
            <div className="property-dialog__copy">
              <p className="eyebrow">Representative residence / {selectedListing.id}</p>
              <h2>{selectedListing.neighborhood}</h2>
              <p className="property-dialog__market">{selectedListing.market}, {selectedListing.state}</p>
              <p>{selectedListing.note}</p>
              <dl>
                <div><dt>Price</dt><dd>{selectedListing.priceLabel}</dd></div>
                <div><dt>Bedrooms</dt><dd>{selectedListing.beds}</dd></div>
                <div><dt>Bathrooms</dt><dd>{selectedListing.baths}</dd></div>
                <div><dt>Interior</dt><dd>{selectedListing.area}</dd></div>
              </dl>
              <a href="#contact" onClick={() => dialogRef.current?.close()}>Request a private viewing <span>↗</span></a>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
