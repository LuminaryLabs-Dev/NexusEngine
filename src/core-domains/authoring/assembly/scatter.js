import {
  evaluateAuthoringMesh,
  vadd,
  vsub,
  vmul,
  vcross,
  vunit,
} from "../mesh/evaluate.js";
import {
  normalizeTransform,
  quatBetween,
  quatMultiply,
  quatAxis,
  quatRotate,
} from "../contracts/transforms.js";
import {
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
} from "../contracts/value.js";
// Stable Mulberry32 sequence, independent of process randomness and engine ticks.
export function authoringRandom(seed) {
  let state = requireInteger(seed, "seed", 0, 4294967295);
  return () => {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function scatterAuthoringInstances(assembly, get, parameters) {
  requireFields(
    parameters,
    [
      "surfaceNodeId",
      "prototypeNodeId",
      "seed",
      "count",
      "minDistance",
      "normalYMin",
      "offset",
      "scaleRange",
      "prefix",
      "densityAttribute",
      "spacingGroup",
    ],
    "scatter",
  );
  const p = parameters,
    count = requireInteger(p.count, "count", 1, 10000),
    minimum = requireNumber(p.minDistance ?? 0, "minimum distance", 0, 1e6),
    normalYMin = requireNumber(p.normalYMin ?? -1, "normal Y threshold", -1, 1),
    offset = requireNumber(p.offset ?? 0, "surface offset", -1e6, 1e6),
    range = p.scaleRange ?? [1, 1];
  if (!Array.isArray(range) || range.length !== 2)
    throw error(
      "AUTHORING_INVALID_SCATTER",
      "Scale range needs [minimum, maximum].",
    );
  requireNumber(range[0], "scale minimum", 1e-6, 1e6);
  requireNumber(range[1], "scale maximum", range[0], 1e6);
  requireText(p.prefix, "scatter prefix");
  const source = assembly.nodes.find((n) => n.id === p.surfaceNodeId),
    prototype = assembly.nodes.find((n) => n.id === p.prototypeNodeId);
  if (!source?.meshId || !prototype?.meshId)
    throw error(
      "AUTHORING_INVALID_SCATTER",
      "Surface and prototype must be mesh instances.",
    );
  if (
    prototype.rigId ||
    prototype.skinId ||
    prototype.shapeId ||
    prototype.animationIds.length
  )
    throw error(
      "AUTHORING_UNSUPPORTED_SCATTER",
      "Scatter profile supports static mesh prototypes.",
    );
  const transform = normalizeTransform(source.transform),
    s = transform.scale[0];
  if (s <= 0 || transform.scale.some((n) => Math.abs(n - s) > 1e-8))
    throw error(
      "AUTHORING_UNSUPPORTED_SCATTER",
      "Surface requires positive uniform scale; apply its scale before scattering.",
    );
  const mesh = get(source.meshId).content,
    evaluated = evaluateAuthoringMesh(mesh),
    mask = p.densityAttribute
      ? mesh.attributes.find((a) => a.id === p.densityAttribute)
      : null;
  if (
    p.densityAttribute &&
    (!mask || mask.domain !== "vertex" || mask.arity !== 1)
  )
    throw error(
      "AUTHORING_INVALID_SCATTER",
      "Density needs a scalar vertex attribute.",
    );
  if (mask)
    for (const value of Object.values(mask.values))
      requireNumber(value[0], "density", 0, 1);
  const triangles = [];
  let area = 0;
  for (let i = 0; i < evaluated.positions.length; i += 9) {
    const points = [0, 3, 6].map((j) =>
        vadd(
          transform.translation,
          quatRotate(
            transform.rotation,
            vmul(evaluated.positions.slice(i + j, i + j + 3), s),
          ),
        ),
      ),
      cross = vcross(vsub(points[1], points[0]), vsub(points[2], points[0])),
      normal = vunit(cross);
    if (normal[1] < normalYMin) continue;
    area += Math.hypot(...cross) / 2;
    triangles.push({
      points,
      normal,
      area,
      source: evaluated.sourceVertices.slice(i / 3, i / 3 + 3),
    });
  }
  if (!triangles.length || area <= 0)
    throw error("AUTHORING_EMPTY_SCATTER_SURFACE", "No eligible surface area.");
  const random = authoringRandom(p.seed ?? 0),
    nodes = [],
    grid = new Map(),
    cells = (point) =>
      point.map((n) => Math.floor(n / Math.max(minimum, 1e-12))),
    cellKey = (point) => point.join(","),
    existing = new Set(assembly.nodes.map((n) => n.id));
  if (p.spacingGroup !== undefined) {
    requireText(p.spacingGroup, "spacing group");
    for (const node of assembly.nodes)
      if (node.collection === p.spacingGroup && node.parent === source.parent) {
        const point = node.transform.translation,
          key = cellKey(cells(point));
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(point);
      }
  }
  let attempts = 0;
  while (nodes.length < count && attempts < Math.min(count * 200, 1000000)) {
    attempts++;
    const select = random() * area;
    let lo = 0,
      hi = triangles.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (triangles[mid].area < select) lo = mid + 1;
      else hi = mid;
    }
    const triangle = triangles[lo],
      u = Math.sqrt(random()),
      v = random(),
      weights = [1 - u, u * (1 - v), u * v];
    if (mask) {
      const density = weights.reduce(
        (n, w, i) => n + w * (mask.values[triangle.source[i]]?.[0] ?? 0),
        0,
      );
      if (random() > Math.max(0, Math.min(1, density))) continue;
    }
    const point = vadd(
        weights.reduce(
          (sum, w, i) => vadd(sum, vmul(triangle.points[i], w)),
          [0, 0, 0],
        ),
        vmul(triangle.normal, offset),
      ),
      cell = cells(point);
    let crowded = false;
    if (minimum > 0)
      for (let x = -1; x <= 1; x++)
        for (let y = -1; y <= 1; y++)
          for (let z = -1; z <= 1; z++)
            for (const prior of grid.get(
              cellKey([cell[0] + x, cell[1] + y, cell[2] + z]),
            ) ?? [])
              if (Math.hypot(...vsub(point, prior)) < minimum) crowded = true;
    if (crowded) continue;
    const id = `${p.prefix}:${nodes.length}`;
    if (existing.has(id))
      throw error(
        "AUTHORING_DUPLICATE_ELEMENT",
        "Scatter output ID already exists.",
      );
    const scale = range[0] + random() * (range[1] - range[0]),
      rotation = quatMultiply(
        quatBetween([0, 1, 0], triangle.normal),
        quatAxis([0, 1, 0], random() * 2 * Math.PI),
      );
    nodes.push({
      ...prototype,
      id,
      name: `${prototype.name} ${nodes.length + 1}`,
      parent: source.parent,
      collection: p.spacingGroup ?? prototype.collection,
      visible: true,
      export: true,
      transform: {
        translation: point,
        rotation: quatMultiply(rotation, prototype.transform.rotation),
        scale: prototype.transform.scale.map((n) => n * scale),
      },
    });
    const key = cellKey(cell);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(point);
  }
  if (nodes.length !== count)
    throw error(
      "AUTHORING_SCATTER_DENSITY",
      "Could not meet requested count and spacing within the attempt budget.",
      { requested: count, placed: nodes.length, attempts },
    );
  return {
    nodes,
    attempts,
    surfaceArea: area,
    algorithm: "area-weighted-mulberry32-spatial-grid/1",
  };
}
