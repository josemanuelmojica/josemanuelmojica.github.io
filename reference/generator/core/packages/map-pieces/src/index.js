const GEOMETRY_TAGS = new Set(["path", "polygon", "polyline", "line", "rect"]);

function number(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of source.matchAll(pattern)) attributes[match[1]] = match[2] ?? match[3];
  return attributes;
}

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function serializeAttributes(attributes) {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
    .join(" ");
}

function pointsFromList(value = "") {
  const values = value.match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
  const points = [];
  for (let index = 0; index + 1 < values.length; index += 2) points.push([values[index], values[index + 1]]);
  return points;
}

function pathPoints(d = "") {
  // V1 samples command endpoints and control points. This is sufficient for spatial
  // ordering and conservative bounds; the source geometry itself is never rewritten.
  return pointsFromList(d.replace(/[a-z]/gi, " "));
}

function geometryPoints(tag, attributes) {
  if (tag === "line") return [[number(attributes.x1), number(attributes.y1)], [number(attributes.x2), number(attributes.y2)]];
  if (tag === "rect") {
    const x = number(attributes.x), y = number(attributes.y);
    const width = number(attributes.width), height = number(attributes.height);
    return [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
  }
  if (tag === "path") return pathPoints(attributes.d);
  return pointsFromList(attributes.points);
}

function metrics(points) {
  if (!points.length) return { centroid: [0, 0], bbox: [0, 0, 0, 0], length: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, length = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x, y] = points[index];
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    if (index) length += Math.hypot(x - points[index - 1][0], y - points[index - 1][1]);
  }
  return {
    centroid: [(minX + maxX) / 2, (minY + maxY) / 2],
    bbox: [minX, minY, maxX - minX, maxY - minY],
    length,
  };
}

function stableId(existing, used, ordinal) {
  const safe = existing && /^[A-Za-z_][\w:.-]*$/.test(existing) && !used.has(existing);
  let candidate = safe ? existing : `piece-${String(ordinal).padStart(5, "0")}`;
  let suffix = 2;
  while (used.has(candidate)) candidate = `piece-${String(ordinal).padStart(5, "0")}-${suffix++}`;
  used.add(candidate);
  return candidate;
}

function splitLinearPath(attributes, threshold, minimumSegments) {
  if (!attributes.d || /[cqsatvhz]/i.test(attributes.d)) return null;
  const points = pathPoints(attributes.d);
  const measured = metrics(points);
  if (points.length < minimumSegments + 1 || measured.length <= threshold) return null;
  return points.slice(0, -1).map((point, index) => ({
    ...attributes,
    d: `M ${point[0]} ${point[1]} L ${points[index + 1][0]} ${points[index + 1][1]}`,
  }));
}

function nearestNeighborsGrid(pieces, count) {
  if (pieces.length < 2) return;
  const xs = pieces.map((piece) => piece.centroid[0]);
  const ys = pieces.map((piece) => piece.centroid[1]);
  const width = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const height = Math.max(1, Math.max(...ys) - Math.min(...ys));
  const cellSize = Math.max(1, Math.sqrt((width * height) / pieces.length) * 1.8);
  const originX = Math.min(...xs), originY = Math.min(...ys);
  const cells = new Map();
  const coordinate = (piece) => [
    Math.floor((piece.centroid[0] - originX) / cellSize),
    Math.floor((piece.centroid[1] - originY) / cellSize),
  ];
  const key = (x, y) => `${x}:${y}`;
  for (const piece of pieces) {
    const [x, y] = coordinate(piece);
    const bucket = cells.get(key(x, y)) ?? [];
    bucket.push(piece);
    cells.set(key(x, y), bucket);
  }
  const maximumRing = Math.ceil(Math.max(width, height) / cellSize) + 1;
  for (const piece of pieces) {
    const [cellX, cellY] = coordinate(piece);
    const candidates = [];
    const seen = new Set([piece.id]);
    for (let ring = 0; ring <= maximumRing && candidates.length < count * 4; ring += 1) {
      for (let x = cellX - ring; x <= cellX + ring; x += 1) {
        for (let y = cellY - ring; y <= cellY + ring; y += 1) {
          if (ring && x !== cellX - ring && x !== cellX + ring && y !== cellY - ring && y !== cellY + ring) continue;
          for (const candidate of cells.get(key(x, y)) ?? []) {
            if (!seen.has(candidate.id)) { seen.add(candidate.id); candidates.push(candidate); }
          }
        }
      }
    }
    piece.neighbors = candidates
      .map((candidate) => ({
        id: candidate.id,
        distance: Math.hypot(candidate.centroid[0] - piece.centroid[0], candidate.centroid[1] - piece.centroid[1]),
      }))
      .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
      .slice(0, count)
      .map(({ id }) => id);
  }
}

function groupRange(svg, groupId) {
  const opening = new RegExp(`<g\\b[^>]*\\bid=["']${groupId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i").exec(svg);
  if (!opening) return null;
  const start = opening.index;
  const contentStart = start + opening[0].length;
  const tokens = /<g\b[^>]*>|<\/g\s*>/gi;
  tokens.lastIndex = contentStart;
  let depth = 1;
  for (let token = tokens.exec(svg); token; token = tokens.exec(svg)) {
    depth += /^<\/g/i.test(token[0]) ? -1 : 1;
    if (!depth) return { start, contentStart, contentEnd: token.index, end: token.index + token[0].length };
  }
  return null;
}

function removeGroup(svg, groupId) {
  const range = groupRange(svg, groupId);
  return range ? `${svg.slice(0, range.start)}${svg.slice(range.end)}` : svg;
}

function spatialCandidateIndexes(paths, limit) {
  if (paths.length <= limit) return new Set(paths.map((_, index) => index));
  const valid = paths.map((path, index) => ({ index, ...metrics(geometryPoints("path", path.attributes)) }))
    .filter((path) => path.length > 0 && Number.isFinite(path.centroid[0]) && Number.isFinite(path.centroid[1]));
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const path of valid) {
    minX = Math.min(minX, path.centroid[0]);
    maxX = Math.max(maxX, path.centroid[0]);
    minY = Math.min(minY, path.centroid[1]);
    maxY = Math.max(maxY, path.centroid[1]);
  }
  const columns = Math.max(1, Math.ceil(Math.sqrt(limit * ((maxX - minX || 1) / (maxY - minY || 1)))));
  const rows = Math.max(1, Math.ceil(limit / columns));
  const bins = new Map();
  for (const path of valid) {
    const x = Math.min(columns - 1, Math.floor(((path.centroid[0] - minX) / (maxX - minX || 1)) * columns));
    const y = Math.min(rows - 1, Math.floor(((path.centroid[1] - minY) / (maxY - minY || 1)) * rows));
    const bucket = bins.get(`${x}:${y}`) ?? [];
    bucket.push(path);
    bins.set(`${x}:${y}`, bucket);
  }
  for (const bucket of bins.values()) bucket.sort((a, b) => b.length - a.length || a.index - b.index);
  const selected = new Set();
  const orderedBins = [...bins.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, bucket]) => bucket);
  for (let round = 0; selected.size < limit; round += 1) {
    let added = false;
    for (const bucket of orderedBins) {
      if (bucket[round]) { selected.add(bucket[round].index); added = true; if (selected.size === limit) break; }
    }
    if (!added) break;
  }
  return selected;
}

/** Prepare a Matplotlib poster SVG as a text-free, bounded motion asset. */
export function prepareMotionSvg(svgSource, {
  roadGroupId = "LineCollection_1",
  candidateLimit = 3000,
  removeGroupIds = ["text_1", "text_2", "text_3", "text_4", "line2d_1"],
} = {}) {
  if (typeof svgSource !== "string" || !/<svg\b/i.test(svgSource)) throw new TypeError("prepareMotionSvg expects an SVG string");
  let prepared = svgSource;
  for (const groupId of removeGroupIds) prepared = removeGroup(prepared, groupId);
  prepared = prepared.replace(/<image\b[^>]*(?:\/>|>[\s\S]*?<\/image\s*>)/gi, "");
  const range = groupRange(prepared, roadGroupId);
  if (!range) throw new Error(`Road group '${roadGroupId}' was not found`);
  const content = prepared.slice(range.contentStart, range.contentEnd);
  const pathPattern = /<path\b([^>]*?)\/?\s*>/gi;
  const paths = [...content.matchAll(pathPattern)].map((match) => ({ source: match[0], attributes: parseAttributes(match[1]) }));
  const selected = spatialCandidateIndexes(paths, Math.max(1, Math.min(candidateLimit, paths.length)));
  let pathIndex = 0;
  const markedContent = content.replace(pathPattern, (source) => {
    const selectedPath = selected.has(pathIndex++);
    return selectedPath ? source.replace(/<path\b/i, '<path data-motion-candidate="true"') : source;
  });
  prepared = `${prepared.slice(0, range.contentStart)}${markedContent}${prepared.slice(range.contentEnd)}`;
  return {
    svg: prepared,
    metadata: {
      roadGroupId,
      roadGeometryCount: paths.length,
      candidateCount: selected.size,
      removedGroupIds: removeGroupIds,
      removedRasterImages: !/<image\b/i.test(prepared),
    },
  };
}

/**
 * Turn SVG geometry into independently transformable wrapper groups.
 * @param {string} svgSource
 * @param {{neighborCount?: number, splitLongPaths?: boolean, longPathThreshold?: number, minimumSplitSegments?: number, candidateAttribute?: string}} options
 */
export function processMap(svgSource, options = {}) {
  if (typeof svgSource !== "string" || !/<svg\b/i.test(svgSource)) throw new TypeError("processMap expects an SVG string");
  const settings = {
    neighborCount: options.neighborCount ?? 5,
    splitLongPaths: options.splitLongPaths ?? true,
    longPathThreshold: options.longPathThreshold ?? 240,
    minimumSplitSegments: options.minimumSplitSegments ?? 4,
    candidateAttribute: options.candidateAttribute ?? null,
  };
  const used = new Set();
  const pieces = [];
  const splitSources = [];
  let ordinal = 1;

  const processedSvg = svgSource.replace(/<(path|polygon|polyline|line|rect)\b([^>]*?)(\/?)>/gi, (source, rawTag, rawAttributes) => {
    const tag = rawTag.toLowerCase();
    if (!GEOMETRY_TAGS.has(tag) || /data-map-piece\s*=/.test(rawAttributes)) return source;
    const attributes = parseAttributes(rawAttributes);
    if (settings.candidateAttribute && !(settings.candidateAttribute in attributes)) return source;
    // Background rectangles are visual scaffolding, not map pieces.
    if (tag === "rect" && !attributes.id && number(attributes.width) > 500) return source;
    const candidates = tag === "path" && settings.splitLongPaths
      ? splitLinearPath(attributes, settings.longPathThreshold, settings.minimumSplitSegments)
      : null;
    const geometries = candidates ?? [attributes];
    if (candidates) splitSources.push(attributes.id ?? `source-${ordinal}`);

    return geometries.map((geometryAttributes, splitIndex) => {
      const sourceId = attributes.id;
      const requestedId = candidates ? (sourceId ? `${sourceId}-segment-${splitIndex + 1}` : null) : sourceId;
      const id = stableId(requestedId, used, ordinal++);
      const originalTransform = geometryAttributes.transform ?? "";
      const values = metrics(geometryPoints(tag, geometryAttributes));
      const childAttributes = { ...geometryAttributes, id: `${id}--geometry` };
      const type = geometryAttributes.class?.split(/\s+/).find((value) => value !== "road") ?? tag;
      pieces.push({
        id,
        element: `#${id}`,
        geometryElement: `#${id}--geometry`,
        type,
        centroid: values.centroid,
        bbox: values.bbox,
        originalTransform,
        originalPosition: { x: values.centroid[0], y: values.centroid[1] },
        sourceId: sourceId ?? null,
        length: values.length,
        neighbors: [],
      });
      return `<g id="${id}" data-map-piece="true"><${tag} ${serializeAttributes(childAttributes)} /></g>`;
    }).join("");
  });

  const effectiveNeighborCount = Math.max(0, Math.min(settings.neighborCount, pieces.length - 1));
  nearestNeighborsGrid(pieces, effectiveNeighborCount);
  return {
    processedSvg,
    pieces,
    metadata: {
      pieceCount: pieces.length,
      sourceGeometryCount: ordinal - 1 - splitSources.reduce((count, sourceId) => {
        return count + Math.max(0, pieces.filter((piece) => piece.sourceId === sourceId).length - 1);
      }, 0),
      splitSourceCount: splitSources.length,
      splitSources,
      neighborCount: effectiveNeighborCount,
      neighborMethod: "spatial-grid",
      processing: settings,
    },
  };
}

export function createDebugSvg(result) {
  const palette = ["#5eead4", "#60a5fa", "#c084fc", "#f472b6", "#fbbf24", "#a3e635"];
  let debug = result.processedSvg;
  for (const [index, piece] of result.pieces.entries()) {
    const color = palette[index % palette.length];
    debug = debug.replace(
      `id="${piece.id}" data-map-piece="true"`,
      `id="${piece.id}" data-map-piece="true" data-piece-id="${piece.id}" style="color:${color}"`,
    ).replace(
      `id="${piece.id}--geometry"`,
      `id="${piece.id}--geometry" stroke="${color}"`,
    );
  }
  return debug;
}

/**
 * Extract a transparent SVG containing only the independently movable road
 * wrappers. A rasterized base map can sit underneath it on scroll-heavy pages,
 * avoiding the cost of mounting the complete source road network in the DOM.
 */
export function extractMotionOverlay(processedSvg, { roadGroupId = "LineCollection_1", pieceIds = null } = {}) {
  if (typeof processedSvg !== "string" || !/<svg\b/i.test(processedSvg)) throw new TypeError("extractMotionOverlay expects an SVG string");
  const svgOpening = processedSvg.match(/<svg\b[^>]*>/i)?.[0];
  const range = groupRange(processedSvg, roadGroupId);
  if (!svgOpening || !range) throw new Error(`Road group '${roadGroupId}' was not found`);
  const declaration = processedSvg.match(/^\s*<\?xml[^>]*\?>/i)?.[0] ?? "";
  const definitions = processedSvg.match(/<defs\b[^>]*>[\s\S]*?<\/defs\s*>/i)?.[0] ?? "";
  const groupOpening = processedSvg.slice(range.start, range.contentStart);
  const content = processedSvg.slice(range.contentStart, range.contentEnd);
  const allowed = pieceIds ? new Set(pieceIds) : null;
  const wrappers = (content.match(/<g\b[^>]*\bdata-map-piece=["']true["'][^>]*>[\s\S]*?<\/g\s*>/gi) ?? [])
    .filter((wrapper) => !allowed || allowed.has(wrapper.match(/\bid=["']([^"']+)["']/i)?.[1]));
  return `${declaration}${svgOpening}${definitions}${groupOpening}${wrappers.join("")}</g></svg>`;
}

export function metadataJson(result, spacing = 2) {
  return JSON.stringify({ metadata: result.metadata, pieces: result.pieces }, null, spacing);
}
