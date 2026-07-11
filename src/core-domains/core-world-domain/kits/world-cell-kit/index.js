import { clonePortableValue, inspectPortableValue } from "../../portable.js";

function stableHash(value) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableObject(value[key])]));
  }
  return value;
}

export function createWorldCellId({ worldId, partitionId, level = 0, coordinates = [] }) {
  return `${worldId}:${partitionId}:${level}:${coordinates.join(":")}`;
}

export function createWorldCellSeed(worldSeed, cellId) {
  return stableHash([worldSeed ?? "world", cellId]);
}

export function createWorldCell(input = {}) {
  const coordinates = Object.freeze([...(input.coordinates ?? [])]);
  const id = input.id ?? createWorldCellId({ ...input, coordinates });
  const metadata = clonePortableValue(input.metadata ?? {}, "world-cell-metadata");
  return Object.freeze({
    id,
    worldId: input.worldId,
    partitionId: input.partitionId,
    coordinates,
    level: Number(input.level ?? 0),
    bounds: Object.freeze(clonePortableValue(input.bounds ?? {}, "world-cell-bounds")),
    seed: input.seed ?? createWorldCellSeed(input.worldSeed, id),
    lod: Number(input.lod ?? 0),
    priority: Number(input.priority ?? 0),
    metadata: Object.freeze(metadata)
  });
}

export function createWorldCellDescriptorSignature(cell = {}) {
  return JSON.stringify(stableObject({
    id: cell.id,
    coordinates: cell.coordinates,
    level: cell.level,
    bounds: cell.bounds,
    lod: cell.lod,
    priority: cell.priority,
    metadata: cell.metadata ?? {}
  }));
}

export function diffWorldCellDescriptors(previous = {}, next = {}) {
  const changes = [];
  for (const key of ["coordinates", "level", "bounds", "lod", "priority", "metadata"]) {
    if (JSON.stringify(stableObject(previous?.[key])) !== JSON.stringify(stableObject(next?.[key]))) changes.push(key);
  }
  return changes;
}

export function validateWorldCell(cell) {
  const issues = [];
  if (!cell?.id || typeof cell.id !== "string") issues.push("missing-id");
  if (!cell?.worldId || typeof cell.worldId !== "string") issues.push("missing-world-id");
  if (!cell?.partitionId || typeof cell.partitionId !== "string") issues.push("missing-partition-id");
  if (!Array.isArray(cell?.coordinates)) issues.push("invalid-coordinates");
  else if (cell.coordinates.some((entry) => !((typeof entry === "number" && Number.isFinite(entry)) || (typeof entry === "string" && entry.length > 0)))) issues.push("invalid-coordinate-value");
  for (const field of ["level", "lod", "priority"]) {
    if (!Number.isFinite(Number(cell?.[field]))) issues.push(`invalid-${field}`);
  }
  const bounds = cell?.bounds;
  if (!bounds || typeof bounds !== "object") issues.push("invalid-bounds");
  else {
    for (const field of ["minX", "minZ", "maxX", "maxZ"]) if (!Number.isFinite(Number(bounds[field]))) issues.push(`invalid-bounds-${field}`);
    if (Number(bounds.minX) > Number(bounds.maxX)) issues.push("invalid-bounds-x-order");
    if (Number(bounds.minZ) > Number(bounds.maxZ)) issues.push("invalid-bounds-z-order");
    for (const field of ["minY", "maxY"]) if (field in bounds && !Number.isFinite(Number(bounds[field]))) issues.push(`invalid-bounds-${field}`);
    if ("minY" in bounds && "maxY" in bounds && Number(bounds.minY) > Number(bounds.maxY)) issues.push("invalid-bounds-y-order");
  }
  if (!cell?.seed || typeof cell.seed !== "string") issues.push("invalid-seed");
  const portable = inspectPortableValue(cell?.metadata ?? {}, { path: "cell.metadata" });
  issues.push(...portable.issues);
  return { valid: issues.length === 0, issues };
}
