import { chooseSeeded, createSeededRandom } from "../../../../../foundation/seeded-random.js";
import { cloneSerializableState } from "../../../../../foundation/serializable-state.js";
import { sha256Integrity } from "../../../../../foundation/sha256.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function integer(value, label, fallback, minimum) {
  const next = Math.floor(finite(value, label, fallback));
  if (next < minimum) throw new RangeError(`${label} must be at least ${minimum}.`);
  return next;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function descriptor(kind, params = {}) {
  return Object.freeze({ kind, id: String(params.id ?? kind), params: Object.freeze(cloneSerializableState(params)) });
}

export const proceduralAlgorithms = Object.freeze({
  seededNoise: (config = {}) => descriptor("seeded-noise", config),
  cellular: (config = {}) => descriptor("cellular", config),
  regionGraph: (config = {}) => descriptor("region-graph", config),
  corridors: (config = {}) => descriptor("corridors", config),
  categories: (config = {}) => descriptor("categories", config),
  scatter: (config = {}) => descriptor("scatter", config)
});

export function normalizeProceduralConfig(input = {}) {
  const size = input.size ?? {};
  const width = integer(size.width ?? input.width, "width", 36, 4);
  const height = integer(size.height ?? input.height, "height", 26, 4);
  const cellSize = finite(input.cellSize, "cellSize", 2);
  if (cellSize <= 0) throw new RangeError("cellSize must be positive.");
  const roomSize = {
    min: integer(input.roomSize?.min, "roomSize.min", 4, 2),
    max: integer(input.roomSize?.max, "roomSize.max", 8, 2)
  };
  if (roomSize.max < roomSize.min) throw new RangeError("roomSize.max must be greater than or equal to roomSize.min.");
  const obstacleDensity = finite(input.obstacleDensity, "obstacleDensity", 0.08);
  if (obstacleDensity < 0 || obstacleDensity > 1) throw new RangeError("obstacleDensity must be between 0 and 1.");
  const categories = (input.categories ?? ["default"]).map(String);
  if (!categories.length || new Set(categories).size !== categories.length) throw new TypeError("categories must contain unique values.");
  const algorithms = cloneSerializableState(input.algorithms ?? [
    proceduralAlgorithms.regionGraph(),
    proceduralAlgorithms.corridors(),
    proceduralAlgorithms.cellular({ obstacleDensity }),
    proceduralAlgorithms.categories(),
    proceduralAlgorithms.scatter()
  ]);
  const algorithmIds = algorithms.map((entry) => String(entry.id ?? entry.kind));
  if (new Set(algorithmIds).size !== algorithmIds.length) throw new TypeError("Procedural algorithm ids must be unique.");
  return {
    schema: "nexusengine.procedural-config/1",
    id: String(input.id ?? "procedural-space"),
    seed: String(input.seed ?? "nexus-procedural"),
    width,
    height,
    cellSize,
    regionCount: integer(input.regionCount ?? input.roomCount, "regionCount", 8, 2),
    roomSize,
    obstacleDensity,
    pointCount: integer(input.pointCount ?? input.spawnCount, "pointCount", 0, 0),
    categories,
    algorithms
  };
}

function key(x, y) {
  return `${x},${y}`;
}

function overlap(left, right) {
  return !(left.x + left.width + 1 <= right.x || right.x + right.width + 1 <= left.x || left.y + left.height + 1 <= right.y || right.y + right.height + 1 <= left.y);
}

function createRegions(config, rng) {
  const regions = [];
  for (let attempt = 0; attempt < config.regionCount * 24 && regions.length < config.regionCount; attempt += 1) {
    const width = config.roomSize.min + Math.floor(rng.next() * (config.roomSize.max - config.roomSize.min + 1));
    const height = config.roomSize.min + Math.floor(rng.next() * (config.roomSize.max - config.roomSize.min + 1));
    if (width >= config.width - 2 || height >= config.height - 2) continue;
    const x = 1 + Math.floor(rng.next() * Math.max(1, config.width - width - 2));
    const y = 1 + Math.floor(rng.next() * Math.max(1, config.height - height - 2));
    const region = { x, y, width, height, center: { x: x + Math.floor(width / 2), y: y + Math.floor(height / 2) } };
    if (regions.every((entry) => !overlap(entry, region))) regions.push(region);
  }
  if (regions.length < 2) {
    const size = Math.max(2, Math.min(4, config.width - 2, config.height - 2));
    regions.splice(0, regions.length,
      { x: 1, y: 1, width: size, height: size, center: { x: 1 + Math.floor(size / 2), y: 1 + Math.floor(size / 2) } },
      { x: config.width - size - 1, y: config.height - size - 1, width: size, height: size, center: { x: config.width - 1 - Math.ceil(size / 2), y: config.height - 1 - Math.ceil(size / 2) } }
    );
  }
  return regions.sort((left, right) => left.center.x + left.center.y - right.center.x - right.center.y)
    .map((region, index) => ({ ...region, id: `region-${index + 1}`, category: config.categories[index % config.categories.length] }));
}

function carve(cells, config, from, to, connectorId) {
  const carved = [];
  const write = (x, y) => {
    const cell = cells.get(key(x, y));
    if (!cell) return;
    cell.walkable = true;
    cell.cost = Math.min(cell.cost ?? 1.15, 1.15);
    cell.regionId ??= connectorId;
    carved.push(cell.key);
  };
  const horizontalFirst = Number.parseInt(sha256Integrity(`${config.seed}:${connectorId}`).slice(-1), 16) % 2 === 0;
  const horizontal = (x0, x1, y) => { const step = x0 <= x1 ? 1 : -1; for (let x = x0; x !== x1 + step; x += step) write(x, y); };
  const vertical = (y0, y1, x) => { const step = y0 <= y1 ? 1 : -1; for (let y = y0; y !== y1 + step; y += step) write(x, y); };
  if (horizontalFirst) { horizontal(from.x, to.x, from.y); vertical(from.y, to.y, to.x); }
  else { vertical(from.y, to.y, from.x); horizontal(from.x, to.x, to.y); }
  return { id: connectorId, from: cloneSerializableState(from), to: cloneSerializableState(to), cells: [...new Set(carved)] };
}

export function createProceduralSnapshot(input = {}) {
  const config = normalizeProceduralConfig(input);
  const rng = createSeededRandom(config.seed);
  const origin = { x: -config.width * config.cellSize * 0.5, z: -config.height * config.cellSize * 0.5 };
  const cells = new Map();
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      cells.set(key(x, y), { x, y, key: key(x, y), walkable: false, cost: null, category: null, regionId: null, world: { x: origin.x + (x + 0.5) * config.cellSize, y: 0, z: origin.z + (y + 0.5) * config.cellSize } });
    }
  }
  const regions = createRegions(config, rng);
  for (const region of regions) {
    for (let y = region.y; y < region.y + region.height; y += 1) {
      for (let x = region.x; x < region.x + region.width; x += 1) {
        const cell = cells.get(key(x, y));
        cell.walkable = true;
        cell.cost = 1;
        cell.category = region.category;
        cell.regionId = region.id;
      }
    }
  }
  const connectors = regions.slice(1).map((region, index) => carve(cells, config, regions[index].center, region.center, `connector-${index + 1}`));
  const protectedKeys = new Set(regions.map((region) => key(region.center.x, region.center.y)));
  const candidates = [...cells.values()].filter((cell) => cell.walkable && !protectedKeys.has(cell.key));
  const blockedCount = Math.floor(candidates.length * config.obstacleDensity);
  const blockedCells = [];
  for (let index = 0; index < blockedCount && candidates.length; index += 1) {
    const [cell] = candidates.splice(Math.floor(rng.next() * candidates.length), 1);
    cell.walkable = false;
    cell.cost = null;
    cell.blockedReason = "generated-obstacle";
    blockedCells.push({ key: cell.key, x: cell.x, y: cell.y, world: cell.world, reason: cell.blockedReason });
  }
  const walkable = [...cells.values()].filter((cell) => cell.walkable);
  const points = Array.from({ length: Math.min(config.pointCount, walkable.length) }, (_, index) => {
    const cell = chooseSeeded(rng, walkable);
    return { id: `point-${index + 1}`, cell: { x: cell.x, y: cell.y }, position: cell.world, category: cell.category };
  });
  const snapshot = {
    schema: "nexusengine.procedural-snapshot/1",
    id: config.id,
    seed: config.seed,
    version: 1,
    config,
    regions: regions.map((region) => ({ ...region, position: cells.get(key(region.center.x, region.center.y)).world })),
    connectors,
    points,
    blockedCells,
    walkability: { width: config.width, height: config.height, cellSize: config.cellSize, origin, cells: [...cells.values()] },
    graph: {
      nodes: regions.map((region) => ({ id: region.id, position: cells.get(key(region.center.x, region.center.y)).world, category: region.category })),
      edges: connectors.map((connector, index) => ({ id: `edge-${index + 1}`, from: regions[index].id, to: regions[index + 1].id, cells: connector.cells }))
    }
  };
  snapshot.signature = sha256Integrity(JSON.stringify(stable(snapshot)));
  return cloneSerializableState(snapshot);
}

export function createProceduralQuery(snapshotOrProvider) {
  const current = () => typeof snapshotOrProvider === "function" ? snapshotOrProvider() : snapshotOrProvider?.getSnapshot ? snapshotOrProvider.getSnapshot().snapshot : snapshotOrProvider;
  return Object.freeze({
    snapshot: () => cloneSerializableState(current()),
    cellAt(x, y) {
      return cloneSerializableState(current()?.walkability?.cells?.find((cell) => cell.x === x && cell.y === y) ?? null);
    },
    worldToCell(point = {}) {
      const snapshot = current();
      if (!snapshot) return null;
      return { x: Math.floor((finite(point.x, "point.x", 0) - snapshot.walkability.origin.x) / snapshot.walkability.cellSize), y: Math.floor((finite(point.z ?? point.y, "point.z", 0) - snapshot.walkability.origin.z) / snapshot.walkability.cellSize) };
    },
    cellToWorld(cell = {}) {
      const snapshot = current();
      if (!snapshot) return null;
      return { x: snapshot.walkability.origin.x + (finite(cell.x, "cell.x", 0) + 0.5) * snapshot.walkability.cellSize, y: 0, z: snapshot.walkability.origin.z + (finite(cell.y, "cell.y", 0) + 0.5) * snapshot.walkability.cellSize };
    },
    walkableAt(x, y) {
      return this.cellAt(x, y)?.walkable === true;
    }
  });
}
