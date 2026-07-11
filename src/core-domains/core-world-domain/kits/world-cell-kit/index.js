function stableHash(value) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
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
  return Object.freeze({
    id,
    worldId: input.worldId,
    partitionId: input.partitionId,
    coordinates,
    level: Number(input.level ?? 0),
    bounds: Object.freeze({ ...(input.bounds ?? {}) }),
    seed: input.seed ?? createWorldCellSeed(input.worldSeed, id),
    lod: Number(input.lod ?? 0),
    priority: Number(input.priority ?? 0)
  });
}

export function validateWorldCell(cell) {
  const issues = [];
  if (!cell?.id) issues.push("missing-id");
  if (!cell?.worldId) issues.push("missing-world-id");
  if (!cell?.partitionId) issues.push("missing-partition-id");
  if (!Array.isArray(cell?.coordinates)) issues.push("invalid-coordinates");
  return { valid: issues.length === 0, issues };
}
