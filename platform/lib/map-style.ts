import type { StyleSpecification } from "maplibre-gl";
import { siteConfig } from "./config";

export type Perspective = "ink" | "blueprint" | "today";

export const perspectives: { id: Perspective; label: string; description: string }[] = [
  { id: "ink", label: "Ink", description: "Archive-inspired ink on paper" },
  { id: "blueprint", label: "Blueprint", description: "Blueprint interpretation" },
  { id: "today", label: "Today", description: "Present-day reading" },
];

const palettes = {
  ink: {
    paper: "#fffefd", water: "#e5edf3", land: "#f4f6f7", park: "#dde7ed",
    ink: "#172833", muted: "#405563", road: "#405563", casing: "#fffefd",
    building: "#d9e3e9", rule: "#81949a", halo: "#fffefd",
  },
  blueprint: {
    paper: "#063a64", water: "#042e50", land: "#0a4877", park: "#0a5f97",
    ink: "#eef5f3", muted: "#a2c9cf", road: "#a9d1d7", casing: "#254c60",
    building: "#487986", rule: "#76a9b5", halo: "#063a64",
  },
  today: {
    paper: "#f5f7f5", water: "#c5dde3", land: "#e5e9df", park: "#cbdccb",
    ink: "#172833", muted: "#57717d", road: "#496d7b", casing: "#ffffff",
    building: "#cdd9db", rule: "#7d9ca7", halo: "#f5f7f5",
  },
} satisfies Record<Perspective, Record<string, string>>;

export function paperColor(perspective: Perspective): string {
  return palettes[perspective].paper;
}

/**
 * Original cartography over the OpenMapTiles schema served by OpenFreeMap.
 * Layer ids are identical across perspectives, so MapLibre's style diff only
 * swaps paint values when the perspective changes.
 */
export function createMapStyle(perspective: Perspective): StyleSpecification {
  const p = palettes[perspective];
  const majorRoads = ["motorway", "trunk", "primary", "secondary", "tertiary"];
  return {
    version: 8,
    name: `Arχ & Teχt / ${perspective}`,
    glyphs: siteConfig.mapGlyphs,
    sources: {
      openmaptiles: {
        type: "vector",
        url: siteConfig.mapTileJson,
        attribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      },
    },
    layers: [
      { id: "paper", type: "background", paint: { "background-color": p.paper } },
      { id: "land-wash", type: "fill", source: "openmaptiles", "source-layer": "landuse",
        paint: { "fill-color": p.land, "fill-opacity": 0.6 } },
      { id: "park-wash", type: "fill", source: "openmaptiles", "source-layer": "park",
        paint: { "fill-color": p.park, "fill-opacity": 0.5 } },
      { id: "water", type: "fill", source: "openmaptiles", "source-layer": "water",
        paint: { "fill-color": p.water } },
      { id: "waterway", type: "line", source: "openmaptiles", "source-layer": "waterway",
        paint: { "line-color": p.muted, "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 14, 1.5], "line-opacity": 0.65 } },
      { id: "state-rules", type: "line", source: "openmaptiles", "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 4],
        paint: { "line-color": p.rule, "line-width": 0.8, "line-dasharray": [3, 3], "line-opacity": 0.7 } },
      { id: "building-wash", type: "fill", source: "openmaptiles", "source-layer": "building", minzoom: 13,
        paint: { "fill-color": p.building, "fill-outline-color": p.muted, "fill-opacity": perspective === "blueprint" ? 0.45 : 0.65 } },
      { id: "road-casing", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 5,
        filter: ["in", ["get", "class"], ["literal", majorRoads]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": p.casing, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.3, 12, 3.6, 17, 8], "line-opacity": 0.75 } },
      { id: "road-major", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 5,
        filter: ["in", ["get", "class"], ["literal", majorRoads]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": p.road, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 12, 1.4, 17, 4], "line-opacity": 0.9 } },
      { id: "road-local", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 10,
        filter: ["in", ["get", "class"], ["literal", ["minor", "service", "track", "path"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": p.road, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.35, 15, 0.85, 18, 2], "line-opacity": 0.55 } },
      { id: "rail", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 9,
        filter: ["==", ["get", "class"], "rail"],
        paint: { "line-color": p.muted, "line-width": 0.8, "line-dasharray": [2, 2], "line-opacity": 0.6 } },
      { id: "place-label", type: "symbol", source: "openmaptiles", "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["city", "town", "suburb", "neighbourhood"]]],
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 10, 13, 14, 16],
          "text-max-width": 8, "text-padding": 8,
        },
        paint: { "text-color": p.ink, "text-halo-color": p.halo, "text-halo-width": 1.5 } },
      { id: "street-label", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", minzoom: 14,
        layout: {
          "symbol-placement": "line",
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"], "text-size": 11, "text-padding": 8,
        },
        paint: { "text-color": p.ink, "text-halo-color": p.halo, "text-halo-width": 1 } },
    ],
  };
}
