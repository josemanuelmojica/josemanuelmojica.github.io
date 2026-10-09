export type PlaceId =
  | "colorado"
  | "denver"
  | "highland"
  | "washington-park"
  | "golden"
  | "boulder"
  | "littleton";

export interface Place {
  id: PlaceId;
  name: string;
  region: string;
  /** [longitude, latitude] */
  center: [number, number];
  zoom: number;
  note: string;
}

// Camera stops for the background map. Coordinates are public place centroids;
// notes describe the drawing, not market data.
export const places: Record<PlaceId, Place> = {
  colorado: {
    id: "colorado", name: "Colorado", region: "Front Range overview",
    center: [-105.2, 39.75], zoom: 7.2,
    note: "The Front Range from Fort Collins to Castle Rock.",
  },
  denver: {
    id: "denver", name: "Denver", region: "City and County of Denver",
    center: [-104.9903, 39.7392], zoom: 11.6,
    note: "A street grid that turns to meet the South Platte.",
  },
  highland: {
    id: "highland", name: "Highland", region: "Northwest Denver",
    center: [-105.011, 39.7614], zoom: 14.2,
    note: "Bluffs above the Platte, a short walk across the bridges to downtown.",
  },
  "washington-park": {
    id: "washington-park", name: "Washington Park", region: "South-central Denver",
    center: [-104.9706, 39.6995], zoom: 14,
    note: "Two lakes, a long loop path, and blocks of tree-lined streets.",
  },
  golden: {
    id: "golden", name: "Golden", region: "Jefferson County",
    center: [-105.2211, 39.7555], zoom: 13.4,
    note: "Where Clear Creek leaves the foothills and the mesas frame the town.",
  },
  boulder: {
    id: "boulder", name: "Boulder", region: "Boulder County",
    center: [-105.2705, 40.015], zoom: 12.8,
    note: "The Flatirons on one edge, open space on most of the others.",
  },
  littleton: {
    id: "littleton", name: "Littleton", region: "Arapahoe County",
    center: [-105.0166, 39.6133], zoom: 13,
    note: "A historic main street along the Platte's southern reach.",
  },
};

export const fieldNotePlaces: PlaceId[] = ["highland", "washington-park", "golden", "boulder", "littleton"];
