/**
 * FeaturedAtlas — a curated plate index of the national ink-atlas corpus.
 *
 * Independent of InfiniteAtlasCanvas: these are seven static Ink × Indigo
 * Full renders shown as drawing plates, not the ambient scrolling field.
 * Each plate reads as a numbered sheet pulled from the atlas — registration
 * corners, a plate number, a coordinate stamp — rather than a property card.
 *
 * Reuses the existing architectural primitive vocabulary (RegistrationMarks,
 * CoordinateStamp) instead of introducing new chrome.
 */

import { RegistrationMarks, CoordinateStamp } from "./primitives";
import { publicPath } from "../../lib/publicPath";

type AtlasStudy = {
  city: string;
  state: string;
  file: string;
  latitude: number;
  longitude: number;
  subtitle: string;
};

const STUDIES: AtlasStudy[] = [
  {
    city: "San Francisco",
    state: "CA",
    file: "US-CA-san-francisco-2048.webp",
    latitude: 37.7749,
    longitude: -122.4194,
    subtitle: "Peninsula grid, water on three sides",
  },
  {
    city: "Los Angeles",
    state: "CA",
    file: "US-CA-los-angeles-2048.webp",
    latitude: 34.0522,
    longitude: -118.2437,
    subtitle: "Basin sprawl, freeway convergence",
  },
  {
    city: "Chicago",
    state: "IL",
    file: "US-IL-chicago-2048.webp",
    latitude: 41.8781,
    longitude: -87.6298,
    subtitle: "Lakefront grid, due-north streets",
  },
  {
    city: "New York",
    state: "NY",
    file: "US-NY-new-york-2048.webp",
    latitude: 40.7128,
    longitude: -74.006,
    subtitle: "Island density, river-bound edges",
  },
  {
    city: "Seattle",
    state: "WA",
    file: "US-WA-seattle-2048.webp",
    latitude: 47.6062,
    longitude: -122.3321,
    subtitle: "Isthmus city, two waters",
  },
  {
    city: "Portland",
    state: "OR",
    file: "US-OR-portland-2048.webp",
    latitude: 45.5152,
    longitude: -122.6784,
    subtitle: "River split, west-hill terrain",
  },
  {
    city: "Salt Lake City",
    state: "UT",
    file: "US-UT-salt-lake-city-2048.webp",
    latitude: 40.7608,
    longitude: -111.891,
    subtitle: "Valley grid against the Wasatch",
  },
];

export function FeaturedAtlas() {
  return (
    <section className="featured-atlas" id="atlas" aria-labelledby="featured-atlas-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Field index / Ink × Indigo</p>
          <h2 id="featured-atlas-heading">Seven studies from the national atlas.</h2>
        </div>
        <p>
          A working plate index, not a listings grid. Each sheet is drawn from the same
          street-and-terrain survey that moves quietly behind the rest of the site.
        </p>
      </div>

      <ol className="featured-atlas__grid">
        {STUDIES.map((study, index) => (
          <li className="featured-atlas__plate" key={study.file}>
            <RegistrationMarks inset={10} size={12} />
            <span className="featured-atlas__plate-number">{String(index + 1).padStart(2, "0")}</span>
            <img
              className="featured-atlas__image"
              src={publicPath(`/maps/featured-atlas/${study.file}`)}
              alt={`Ink × Indigo blueprint study of ${study.city}, ${study.state}`}
              loading="lazy"
              decoding="async"
            />
            <div className="featured-atlas__caption">
              <p className="featured-atlas__city">
                {study.city} <span>{study.state}</span>
              </p>
              <p className="featured-atlas__subtitle">{study.subtitle}</p>
              <CoordinateStamp
                className="featured-atlas__coordinates"
                latitude={study.latitude}
                longitude={study.longitude}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
