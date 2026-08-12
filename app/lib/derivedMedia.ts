import derivedManifest from "../../public/derived/manifest.json";
import { publicPath } from "./publicPath";

/**
 * Typed access to the responsive derivatives produced by
 * scripts/media/generate-derivatives.mjs. Lets components build correct
 * <picture>/srcset markup from content-hashed files without hardcoding names.
 */

type Variant = { format: "avif" | "webp"; width: number; bytes: number; path: string };
type SourceEntry = { role: string; masterWidth: number | null; masterHeight: number | null; variants: Variant[] };

const SOURCES = (derivedManifest as { sources: Record<string, SourceEntry> }).sources;

export type ResponsiveSources = {
  /** avif srcset, e.g. "/derived/x-480w-ab.avif 480w, ..." */
  avifSrcSet: string;
  /** webp srcset, same shape */
  webpSrcSet: string;
  /** Fallback <img> src: the largest webp variant. */
  fallbackSrc: string;
  masterWidth: number | null;
  masterHeight: number | null;
};

function srcSetFor(variants: Variant[], format: "avif" | "webp"): string {
  return variants
    .filter((v) => v.format === format)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${publicPath(v.path)} ${v.width}w`)
    .join(", ");
}

/**
 * Look up responsive sources for a master image by its public-relative path
 * (the same key used in SOURCES in the generator), e.g.
 * "brand/ark-and-text-source.png". Returns null if the source was not
 * processed, so callers can fall back to the original.
 */
export function responsiveSources(sourceKey: string): ResponsiveSources | null {
  const entry = SOURCES[sourceKey];
  if (!entry) return null;
  const webp = entry.variants.filter((v) => v.format === "webp").sort((a, b) => b.width - a.width);
  const fallback = webp[0];
  if (!fallback) return null;
  return {
    avifSrcSet: srcSetFor(entry.variants, "avif"),
    webpSrcSet: srcSetFor(entry.variants, "webp"),
    fallbackSrc: publicPath(fallback.path),
    masterWidth: entry.masterWidth,
    masterHeight: entry.masterHeight,
  };
}
