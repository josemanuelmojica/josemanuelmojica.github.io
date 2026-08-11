#!/usr/bin/env python3
"""Generate the deterministic 50-state Quiet Watersheds art corpus.

The script consumes two pinned Natural Earth GeoJSON files, clips recorded river
and lake-centerline geometry to each state, then emits one SVG master and one
compact WebP derivative per state. No network access is used during generation.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Iterator, Sequence

from PIL import Image, ImageDraw, ImageFont
from shapely import make_valid
from shapely.geometry import GeometryCollection, LineString, MultiLineString, MultiPolygon, Polygon, shape
from shapely.geometry.base import BaseGeometry
from shapely.ops import transform as geometry_transform
from shapely.strtree import STRtree


ROOT = Path(__file__).resolve().parents[2]
WIDTH = 1200
HEIGHT = 900
RASTER_SCALE = 2
MARGIN = 108
CORPUS_VERSION = "2026-08-10.1"
NATURAL_EARTH_COMMIT = "ca96624a56bd078437bca8184e78163e5039ad19"

STATE_FIPS = {
    "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
    "CO": "08", "CT": "09", "DE": "10", "FL": "12", "GA": "13",
    "HI": "15", "ID": "16", "IL": "17", "IN": "18", "IA": "19",
    "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24",
    "MA": "25", "MI": "26", "MN": "27", "MS": "28", "MO": "29",
    "MT": "30", "NE": "31", "NV": "32", "NH": "33", "NJ": "34",
    "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
    "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45",
    "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VT": "50",
    "VA": "51", "WA": "53", "WV": "54", "WI": "55", "WY": "56",
}

EXPECTED_SOURCE_HASHES = {
    "ne_10m_admin_1_states_provinces.geojson":
        "22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5",
    "ne_10m_rivers_lake_centerlines.geojson":
        "bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a",
}

PAPER = "#fffefd"
PAPER_EDGE = "#f8f7f3"
INK = "#173246"
BLUE = "#0068b5"
BLUE_LIGHT = "#79b8e3"
GRID_MINOR = "#dceaf5"
GRID_MAJOR = "#bfd7ea"


@dataclass(frozen=True)
class StateSource:
    iso_id: str
    name: str
    postal_code: str
    fips: str
    geometry: BaseGeometry


@dataclass(frozen=True)
class RiverSource:
    scale_rank: float
    feature_class: str
    geometry: BaseGeometry


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_seed(value: str) -> int:
    return int(hashlib.sha256(value.encode("utf-8")).hexdigest()[:16], 16)


def clean_geometry(geometry: BaseGeometry) -> BaseGeometry:
    if geometry.is_valid:
        return geometry
    return make_valid(geometry)


def load_sources(states_path: Path, rivers_path: Path) -> tuple[list[StateSource], list[RiverSource]]:
    for source_path in (states_path, rivers_path):
        expected = EXPECTED_SOURCE_HASHES.get(source_path.name)
        if expected is None or sha256_file(source_path) != expected:
            raise RuntimeError(f"Pinned source hash mismatch: {source_path}")

    state_data = json.loads(states_path.read_text(encoding="utf-8"))
    river_data = json.loads(rivers_path.read_text(encoding="utf-8"))

    states: list[StateSource] = []
    for feature in state_data["features"]:
        properties = feature["properties"]
        postal = properties.get("postal")
        if properties.get("adm0_a3") != "USA" or postal not in STATE_FIPS:
            continue
        fips = str(properties.get("fips", ""))[-2:]
        if fips != STATE_FIPS[postal]:
            raise RuntimeError(f"Unexpected FIPS code for {postal}: {fips}")
        geometry = clean_geometry(shape(feature["geometry"]))
        if postal == "HI" and isinstance(geometry, MultiPolygon):
            # Frame the inhabited/main Hawaiian Islands instead of allowing the
            # remote Northwestern chain to make the recognisable islands tiny.
            geometry = MultiPolygon(
                [polygon for polygon in geometry.geoms if polygon.representative_point().x > -161.5]
            )
        states.append(
            StateSource(
                iso_id=f"US-{postal}",
                name=properties["name"],
                postal_code=postal,
                fips=fips,
                geometry=geometry,
            )
        )

    if {state.postal_code for state in states} != set(STATE_FIPS):
        missing = sorted(set(STATE_FIPS) - {state.postal_code for state in states})
        raise RuntimeError(f"Source does not contain the expected 50 states; missing {missing}")

    rivers = [
        RiverSource(
            scale_rank=float(feature["properties"].get("scalerank", 10)),
            feature_class=str(feature["properties"].get("featurecla", "River")),
            geometry=clean_geometry(shape(feature["geometry"])),
        )
        for feature in river_data["features"]
    ]
    return sorted(states, key=lambda state: state.iso_id), rivers


def iter_polygons(geometry: BaseGeometry) -> Iterator[Polygon]:
    if isinstance(geometry, Polygon):
        yield geometry
    elif isinstance(geometry, MultiPolygon):
        yield from geometry.geoms
    elif isinstance(geometry, GeometryCollection):
        for part in geometry.geoms:
            yield from iter_polygons(part)


def iter_lines(geometry: BaseGeometry) -> Iterator[LineString]:
    if isinstance(geometry, LineString):
        yield geometry
    elif isinstance(geometry, MultiLineString):
        yield from geometry.geoms
    elif isinstance(geometry, GeometryCollection):
        for part in geometry.geoms:
            yield from iter_lines(part)


def transform_function(
    point_function: Callable[[float, float], tuple[float, float]],
) -> Callable[..., tuple[Sequence[float] | float, Sequence[float] | float]]:
    def apply(x: Sequence[float] | float, y: Sequence[float] | float, z=None):
        if hasattr(x, "__iter__"):
            points = [point_function(float(px), float(py)) for px, py in zip(x, y)]
            return [point[0] for point in points], [point[1] for point in points]
        return point_function(float(x), float(y))

    return apply


def geometry_projection(state_geometry: BaseGeometry) -> tuple[BaseGeometry, Callable[..., tuple]]:
    min_lon, min_lat, max_lon, max_lat = state_geometry.bounds
    unwrap_antimeridian = max_lon - min_lon > 180
    mean_latitude = (min_lat + max_lat) / 2
    longitude_scale = max(math.cos(math.radians(mean_latitude)), 0.22)

    def project_point(longitude: float, latitude: float) -> tuple[float, float]:
        if unwrap_antimeridian and longitude > 0:
            longitude -= 360
        return longitude * longitude_scale, latitude

    projection = transform_function(project_point)
    return geometry_transform(projection, state_geometry), projection


def canvas_transform(projected_state: BaseGeometry) -> Callable[..., tuple]:
    min_x, min_y, max_x, max_y = projected_state.bounds
    source_width = max(max_x - min_x, 1e-9)
    source_height = max(max_y - min_y, 1e-9)
    scale = min((WIDTH - 2 * MARGIN) / source_width, (HEIGHT - 2 * MARGIN) / source_height)
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2

    return transform_function(
        lambda x, y: (
            WIDTH / 2 + (x - center_x) * scale,
            HEIGHT / 2 - (y - center_y) * scale,
        )
    )


def clip_rivers(
    state: StateSource,
    rivers: list[RiverSource],
    river_tree: STRtree,
) -> list[RiverSource]:
    clipped: list[RiverSource] = []
    for raw_index in river_tree.query(state.geometry, predicate="intersects"):
        river = rivers[int(raw_index)]
        intersection = state.geometry.intersection(river.geometry)
        if intersection.is_empty:
            continue
        if any(True for _ in iter_lines(intersection)):
            clipped.append(
                RiverSource(
                    scale_rank=river.scale_rank,
                    feature_class=river.feature_class,
                    geometry=intersection,
                )
            )
    return sorted(clipped, key=lambda river: river.scale_rank, reverse=True)


def project_art(
    state: StateSource,
    rivers: list[RiverSource],
) -> tuple[BaseGeometry, list[RiverSource]]:
    projected_state, projection = geometry_projection(state.geometry)
    to_canvas = canvas_transform(projected_state)
    canvas_state = geometry_transform(to_canvas, projected_state).simplify(
        0.45,
        preserve_topology=True,
    )
    canvas_rivers = [
        RiverSource(
            river.scale_rank,
            river.feature_class,
            geometry_transform(to_canvas, geometry_transform(projection, river.geometry)).simplify(
                0.35,
                preserve_topology=True,
            ),
        )
        for river in rivers
    ]
    return canvas_state, canvas_rivers


def number(value: float) -> str:
    return f"{value:.2f}".rstrip("0").rstrip(".")


def ring_svg_path(coords: Iterable[tuple[float, float]]) -> str:
    points = list(coords)
    if not points:
        return ""
    return "M " + " L ".join(f"{number(x)} {number(y)}" for x, y in points) + " Z"


def polygon_svg_path(geometry: BaseGeometry) -> str:
    paths: list[str] = []
    for polygon in iter_polygons(geometry):
        paths.append(ring_svg_path(polygon.exterior.coords))
        paths.extend(ring_svg_path(interior.coords) for interior in polygon.interiors)
    return " ".join(path for path in paths if path)


def line_svg_path(geometry: BaseGeometry) -> str:
    paths: list[str] = []
    for line in iter_lines(geometry):
        coords = list(line.coords)
        if len(coords) > 1:
            paths.append("M " + " L ".join(f"{number(x)} {number(y)}" for x, y in coords))
    return " ".join(paths)


def registration_svg() -> str:
    marks = []
    for x, y in ((48, 48), (WIDTH - 48, 48), (48, HEIGHT - 48), (WIDTH - 48, HEIGHT - 48)):
        marks.append(
            f'<path d="M {x - 13} {y} H {x + 13} M {x} {y - 13} V {y + 13}" '
            f'stroke="{INK}" stroke-width="0.8" opacity="0.32"/>'
        )
        marks.append(
            f'<circle cx="{x}" cy="{y}" r="4" fill="none" stroke="{INK}" '
            'stroke-width="0.7" opacity="0.26"/>'
        )
    return "".join(marks)


def paper_fibers_svg(state: StateSource) -> str:
    rng = random.Random(stable_seed(state.iso_id))
    fibers: list[str] = []
    for _ in range(72):
        x = rng.uniform(24, WIDTH - 24)
        y = rng.uniform(24, HEIGHT - 24)
        length = rng.uniform(8, 44)
        rise = rng.uniform(-1.8, 1.8)
        fibers.append(
            f'<path d="M {number(x)} {number(y)} l {number(length)} {number(rise)}" '
            f'stroke="{INK}" stroke-width="0.45" opacity="{number(rng.uniform(0.025, 0.065))}"/>'
        )
    return "".join(fibers)


def render_svg(state: StateSource, geometry: BaseGeometry, rivers: list[RiverSource]) -> str:
    state_path = polygon_svg_path(geometry)
    datum = geometry.representative_point()
    river_washes: list[str] = []
    river_inks: list[str] = []
    for river in rivers:
        path = line_svg_path(river.geometry)
        if not path:
            continue
        core_width = max(1.05, 4.6 - river.scale_rank * 0.34)
        wash_width = core_width + 5.0
        river_washes.append(
            f'<path d="{path}" fill="none" stroke="{BLUE_LIGHT}" stroke-width="{number(wash_width)}" '
            'stroke-linecap="round" stroke-linejoin="round" opacity="0.26"/>'
        )
        river_inks.append(
            f'<path d="{path}" fill="none" stroke="{BLUE}" stroke-width="{number(core_width)}" '
            'stroke-linecap="round" stroke-linejoin="round" opacity="0.88"/>'
        )

    return "".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" ',
            f'width="{WIDTH}" height="{HEIGHT}" role="img" aria-labelledby="title desc">',
            f'<title id="title">Blueprint study of {state.name}</title>',
            '<desc id="desc">A warm white paper study of the state silhouette with recorded major rivers in blueprint blue.</desc>',
            '<defs>',
            '<pattern id="minor-grid" width="24" height="24" patternUnits="userSpaceOnUse">',
            f'<path d="M 24 0 H 0 V 24" fill="none" stroke="{GRID_MINOR}" stroke-width="0.75"/>',
            '</pattern>',
            '<pattern id="major-grid" width="120" height="120" patternUnits="userSpaceOnUse">',
            f'<rect width="120" height="120" fill="url(#minor-grid)"/>',
            f'<path d="M 120 0 H 0 V 120" fill="none" stroke="{GRID_MAJOR}" stroke-width="1.15"/>',
            '</pattern>',
            '</defs>',
            f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER_EDGE}"/>',
            f'<rect width="{WIDTH}" height="{HEIGHT}" fill="url(#major-grid)" opacity="0.72"/>',
            paper_fibers_svg(state),
            f'<path d="{state_path}" fill="{PAPER}" fill-opacity="0.93" fill-rule="evenodd"/>',
            *river_washes,
            *river_inks,
            f'<path d="{state_path}" fill="none" fill-rule="evenodd" stroke="{INK}" stroke-width="2.15" ',
            'stroke-linejoin="round" opacity="0.92"/>',
            f'<circle cx="{number(datum.x)}" cy="{number(datum.y)}" r="8" fill="{PAPER}" ',
            f'stroke="{BLUE}" stroke-width="1.4" opacity="0.8"/>',
            f'<path d="M {number(datum.x - 18)} {number(datum.y)} H {number(datum.x + 18)} ',
            f'M {number(datum.x)} {number(datum.y - 18)} V {number(datum.x)} {number(datum.y + 18)}" ',
            f'stroke="{BLUE}" stroke-width="0.8" opacity="0.52"/>',
            registration_svg(),
            '</svg>',
        ]
    )


def scaled_ring(coords: Iterable[tuple[float, float]], scale: int) -> list[tuple[int, int]]:
    return [(round(x * scale), round(y * scale)) for x, y in coords]


def draw_graph_paper(draw: ImageDraw.ImageDraw, scale: int) -> None:
    width = WIDTH * scale
    height = HEIGHT * scale
    for x in range(0, width + 1, 24 * scale):
        color = GRID_MAJOR if x % (120 * scale) == 0 else GRID_MINOR
        line_width = 2 if x % (120 * scale) == 0 else 1
        draw.line((x, 0, x, height), fill=color, width=line_width)
    for y in range(0, height + 1, 24 * scale):
        color = GRID_MAJOR if y % (120 * scale) == 0 else GRID_MINOR
        line_width = 2 if y % (120 * scale) == 0 else 1
        draw.line((0, y, width, y), fill=color, width=line_width)


def draw_raster(state: StateSource, geometry: BaseGeometry, rivers: list[RiverSource], output: Path) -> None:
    scale = RASTER_SCALE
    image = Image.new("RGB", (WIDTH * scale, HEIGHT * scale), PAPER_EDGE)
    draw = ImageDraw.Draw(image)
    draw_graph_paper(draw, scale)

    rng = random.Random(stable_seed(state.iso_id))
    for _ in range(110):
        x = rng.randrange(20 * scale, (WIDTH - 20) * scale)
        y = rng.randrange(20 * scale, (HEIGHT - 20) * scale)
        length = rng.randrange(8 * scale, 44 * scale)
        draw.line((x, y, x + length, y + rng.randrange(-2 * scale, 2 * scale + 1)), fill="#edf0ef", width=1)

    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    for polygon in iter_polygons(geometry):
        mask_draw.polygon(scaled_ring(polygon.exterior.coords, scale), fill=238)
        for interior in polygon.interiors:
            mask_draw.polygon(scaled_ring(interior.coords, scale), fill=0)
    paper_layer = Image.new("RGB", image.size, PAPER)
    image.paste(paper_layer, mask=mask)
    draw = ImageDraw.Draw(image)

    for river in rivers:
        core_width = max(1.05, 4.6 - river.scale_rank * 0.34) * scale
        for line in iter_lines(river.geometry):
            points = scaled_ring(line.coords, scale)
            if len(points) < 2:
                continue
            draw.line(points, fill=BLUE_LIGHT, width=max(1, round(core_width + 5 * scale)), joint="curve")
            draw.line(points, fill=BLUE, width=max(1, round(core_width)), joint="curve")

    for polygon in iter_polygons(geometry):
        draw.line(scaled_ring(polygon.exterior.coords, scale), fill=INK, width=4, joint="curve")
        for interior in polygon.interiors:
            draw.line(scaled_ring(interior.coords, scale), fill=INK, width=2, joint="curve")

    datum = geometry.representative_point()
    dx, dy = round(datum.x * scale), round(datum.y * scale)
    draw.ellipse((dx - 8 * scale, dy - 8 * scale, dx + 8 * scale, dy + 8 * scale), fill=PAPER, outline=BLUE, width=2)
    draw.line((dx - 18 * scale, dy, dx + 18 * scale, dy), fill=BLUE, width=1)
    draw.line((dx, dy - 18 * scale, dx, dy + 18 * scale), fill=BLUE, width=1)

    for x, y in ((48, 48), (WIDTH - 48, 48), (48, HEIGHT - 48), (WIDTH - 48, HEIGHT - 48)):
        sx, sy = x * scale, y * scale
        draw.line((sx - 13 * scale, sy, sx + 13 * scale, sy), fill="#8b9aa4", width=1)
        draw.line((sx, sy - 13 * scale, sx, sy + 13 * scale), fill="#8b9aa4", width=1)

    image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    image.save(output, "WEBP", quality=88, method=6)


def fallback_svg() -> str:
    return "".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}">',
            '<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">',
            f'<path d="M24 0H0V24" fill="none" stroke="{GRID_MINOR}" stroke-width="0.75"/>',
            '</pattern></defs>',
            f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{PAPER}"/>',
            f'<rect width="{WIDTH}" height="{HEIGHT}" fill="url(#g)"/>',
            f'<path d="M300 450 C390 270 810 270 900 450 C810 630 390 630 300 450Z" fill="none" ',
            f'stroke="{BLUE}" stroke-width="2" stroke-dasharray="7 12" opacity="0.42"/>',
            f'<circle cx="600" cy="450" r="9" fill="{PAPER}" stroke="{BLUE}" stroke-width="1.5"/>',
            f'<path d="M570 450H630M600 420V480" stroke="{BLUE}" stroke-width="0.8"/>',
            '</svg>',
        ]
    )


def asset_record(path: Path, manifest_directory: Path, media_type: str) -> dict:
    return {
        "path": path.relative_to(manifest_directory).as_posix(),
        "format": path.suffix.lstrip("."),
        "mediaType": media_type,
        "width": WIDTH,
        "height": HEIGHT,
        "bytes": path.stat().st_size,
        "sha256": sha256_file(path),
    }


def contact_sheet(state_entries: list[dict], runtime_directory: Path, output: Path) -> None:
    columns = 5
    tile_width = 300
    image_height = 225
    label_height = 34
    rows = math.ceil(len(state_entries) / columns)
    sheet = Image.new("RGB", (columns * tile_width, rows * (image_height + label_height)), PAPER)
    draw = ImageDraw.Draw(sheet)
    font_path = ROOT / "reference/generator/core/fonts/Roboto-Bold.ttf"
    try:
        font = ImageFont.truetype(str(font_path), 18)
    except OSError:
        font = ImageFont.load_default()

    for index, entry in enumerate(sorted(state_entries, key=lambda item: item["name"])):
        column = index % columns
        row = index // columns
        x = column * tile_width
        y = row * (image_height + label_height)
        webp_asset = next(asset for asset in entry["assets"] if asset["format"] == "webp")
        with Image.open(runtime_directory / webp_asset["path"]) as state_image:
            thumbnail = state_image.convert("RGB").resize((tile_width, image_height), Image.Resampling.LANCZOS)
        sheet.paste(thumbnail, (x, y))
        draw.rectangle((x, y + image_height, x + tile_width, y + image_height + label_height), fill="#f7f8f7")
        draw.text((x + 12, y + image_height + 7), f'{entry["name"]} / {entry["postalCode"]}', fill=INK, font=font)

    sheet.save(output, "WEBP", quality=84, method=6)


def write_provenance(
    output: Path,
    states_path: Path,
    rivers_path: Path,
    manifest_path: Path,
    contact_sheet_path: Path,
) -> None:
    philosophy_path = ROOT / "docs/art/STATE_INK_ALGORITHMIC_PHILOSOPHY.md"
    script_path = Path(__file__).resolve()
    payload = {
        "schemaVersion": 1,
        "corpusVersion": CORPUS_VERSION,
        "name": "Quiet Watersheds",
        "generatedDate": "2026-08-10",
        "generator": {
            "path": script_path.relative_to(ROOT).as_posix(),
            "sha256": sha256_file(script_path),
            "requirements": "scripts/state-ink/requirements.txt",
            "deterministic": True,
            "canvas": {"width": WIDTH, "height": HEIGHT},
            "projection": "state-local equirectangular fit with latitude correction and Alaska antimeridian unwrap",
        },
        "philosophy": {
            "path": philosophy_path.relative_to(ROOT).as_posix(),
            "sha256": sha256_file(philosophy_path),
        },
        "sources": [
            {
                "name": states_path.name,
                "path": states_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(states_path),
                "upstreamCommit": NATURAL_EARTH_COMMIT,
                "license": "Natural Earth public domain",
                "retrieved": "2026-08-10",
            },
            {
                "name": rivers_path.name,
                "path": rivers_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(rivers_path),
                "upstreamCommit": NATURAL_EARTH_COMMIT,
                "license": "Natural Earth public domain",
                "retrieved": "2026-08-10",
            },
        ],
        "outputs": {
            "manifest": {
                "path": manifest_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(manifest_path),
            },
            "contactSheet": {
                "path": contact_sheet_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(contact_sheet_path),
            },
        },
        "limitations": [
            "Editorial state-level art, not a legal, parcel, navigation, or availability map.",
            "Natural Earth 1:10m centerlines omit smaller waterways; no missing rivers are fabricated.",
            "State artwork contains no city, county, or property-level precision.",
            "Hawaii is framed to its main islands; the distant Northwestern Hawaiian Islands are omitted from the editorial plate.",
        ],
    }
    output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def verify_manifest(manifest_path: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    state_entries = manifest.get("states", [])
    ids = {entry.get("id") for entry in state_entries}
    expected_ids = {f"US-{postal}" for postal in STATE_FIPS}
    if len(state_entries) != 50 or ids != expected_ids:
        raise RuntimeError("State art manifest does not contain the exact 50-state set")
    for entry in state_entries:
        for asset in entry["assets"]:
            path = manifest_path.parent / asset["path"]
            if not path.is_file() or sha256_file(path) != asset["sha256"]:
                raise RuntimeError(f"Missing or changed state art asset: {path}")
    fallback = manifest_path.parent / manifest["fallbackAsset"]
    if not fallback.is_file():
        raise RuntimeError(f"Missing fallback art: {fallback}")


def generate(args: argparse.Namespace) -> None:
    states, rivers = load_sources(args.states, args.rivers)
    river_tree = STRtree([river.geometry for river in rivers])
    runtime_directory = args.output
    states_directory = runtime_directory / "states"
    fallback_directory = runtime_directory / "fallback"
    reference_directory = args.reference_output
    states_directory.mkdir(parents=True, exist_ok=True)
    fallback_directory.mkdir(parents=True, exist_ok=True)
    reference_directory.mkdir(parents=True, exist_ok=True)

    entries: list[dict] = []
    for state in states:
        clipped = clip_rivers(state, rivers, river_tree)
        state_geometry, state_rivers = project_art(state, clipped)
        svg_path = states_directory / f"{state.iso_id}.svg"
        webp_path = states_directory / f"{state.iso_id}.webp"
        svg_path.write_text(render_svg(state, state_geometry, state_rivers), encoding="utf-8")
        draw_raster(state, state_geometry, state_rivers, webp_path)
        entries.append(
            {
                "id": state.iso_id,
                "name": state.name,
                "postalCode": state.postal_code,
                "fips": state.fips,
                "accessibleLabel": f"Blueprint study of the state of {state.name}",
                "aspectRatio": "4:3",
                "reviewStatus": "generated",
                "safeForPublicSite": True,
                "recordedWaterFeatures": len(state_rivers),
                "assets": [
                    asset_record(svg_path, runtime_directory, "image/svg+xml"),
                    asset_record(webp_path, runtime_directory, "image/webp"),
                ],
            }
        )
        print(f"{state.iso_id} {state.name}: {len(state_rivers)} recorded water features")

    fallback_path = fallback_directory / "unresolved.svg"
    fallback_path.write_text(fallback_svg(), encoding="utf-8")
    manifest = {
        "schemaVersion": 1,
        "corpusVersion": CORPUS_VERSION,
        "name": "Quiet Watersheds",
        "visualScope": "state",
        "assetBase": ".",
        "fallbackAsset": fallback_path.relative_to(runtime_directory).as_posix(),
        "source": {
            "dataset": "Natural Earth 1:10m admin-1 states/provinces and rivers/lake centerlines",
            "commit": NATURAL_EARTH_COMMIT,
            "license": "public domain",
        },
        "states": entries,
    }
    manifest_path = runtime_directory / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    contact_sheet_path = reference_directory / "contact-sheet.webp"
    contact_sheet(entries, runtime_directory, contact_sheet_path)
    shutil.copy2(ROOT / "docs/art/STATE_INK_ALGORITHMIC_PHILOSOPHY.md", reference_directory / "ALGORITHMIC_PHILOSOPHY.md")
    write_provenance(
        reference_directory / "PROVENANCE.json",
        args.states,
        args.rivers,
        manifest_path,
        contact_sheet_path,
    )
    verify_manifest(manifest_path)
    print(f"Generated {len(entries)} state studies in {runtime_directory}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--states",
        type=Path,
        default=ROOT / "reference/geodata/natural-earth/ne_10m_admin_1_states_provinces.geojson",
    )
    parser.add_argument(
        "--rivers",
        type=Path,
        default=ROOT / "reference/geodata/natural-earth/ne_10m_rivers_lake_centerlines.geojson",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "public/maps/us-state-studies/v1",
    )
    parser.add_argument(
        "--reference-output",
        type=Path,
        default=ROOT / "reference/state-art-corpus/v1",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify the existing manifest and asset hashes without regenerating files.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.check:
            verify_manifest(args.output / "manifest.json")
            print("State art manifest and hashes verified")
        else:
            generate(args)
    except Exception as error:
        print(f"state-ink: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
