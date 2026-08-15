import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function keyFor(cell) {
  return String(cell.key ?? `${cell.x},${cell.y}`);
}

function centerFor(cell, source) {
  return cell.world ? {
    x: finite(cell.world.x, "cell.world.x"),
    y: finite(cell.world.y, "cell.world.y", 0),
    z: finite(cell.world.z, "cell.world.z")
  } : {
    x: source.origin.x + (cell.x + 0.5) * source.cellSize,
    y: finite(cell.height ?? cell.layer, "cell.height", 0),
    z: source.origin.z + (cell.y + 0.5) * source.cellSize
  };
}

export function normalizeWalkability(input = {}) {
  const source = input.walkability ?? input;
  const width = Math.floor(finite(source.width, "walkability.width"));
  const height = Math.floor(finite(source.height, "walkability.height"));
  const cellSize = finite(source.cellSize, "walkability.cellSize", 1);
  if (width < 1 || height < 1 || cellSize <= 0) {
    throw new RangeError("Walkability width, height, and cellSize must be positive.");
  }
  const origin = {
    x: finite(source.origin?.x, "walkability.origin.x", -width * cellSize * 0.5),
    z: finite(source.origin?.z, "walkability.origin.z", -height * cellSize * 0.5)
  };
  const seenKeys = new Set();
  const seenCoordinates = new Set();
  const cells = (source.cells ?? []).map((entry, index) => {
    const cell = cloneSerializableState(entry);
    const x = Math.floor(finite(cell.x, `cells[${index}].x`));
    const y = Math.floor(finite(cell.y, `cells[${index}].y`));
    if (x < 0 || y < 0 || x >= width || y >= height) throw new RangeError(`Cell ${x},${y} is outside walkability bounds.`);
    const key = keyFor({ ...cell, x, y });
    const coordinate = `${x},${y}`;
    if (seenKeys.has(key)) throw new TypeError(`Walkability contains duplicate key ${key}.`);
    if (seenCoordinates.has(coordinate)) throw new TypeError(`Walkability contains duplicate coordinate ${coordinate}.`);
    seenKeys.add(key);
    seenCoordinates.add(coordinate);
    const walkable = cell.walkable !== false;
    const cost = walkable ? finite(cell.cost, `cells[${index}].cost`, 1) : null;
    if (cost !== null && cost < 0) throw new RangeError(`Cell ${key} cost cannot be negative.`);
    return {
      ...cell,
      key,
      x,
      y,
      walkable,
      cost,
      world: centerFor({ ...cell, x, y }, { width, height, cellSize, origin })
    };
  }).sort((left, right) => left.key.localeCompare(right.key));
  return { width, height, cellSize, origin, cells };
}

function polygon(center, size) {
  const half = size * 0.5;
  return [
    { x: center.x - half, z: center.z - half },
    { x: center.x + half, z: center.z - half },
    { x: center.x + half, z: center.z + half },
    { x: center.x - half, z: center.z + half }
  ];
}

export function createNavMeshFromWalkability(input = {}, options = {}) {
  const source = normalizeWalkability(input);
  const walkable = source.cells.filter((cell) => cell.walkable);
  const byCoordinate = new Map(walkable.map((cell) => [`${cell.x},${cell.y}`, cell]));
  const meshCells = walkable.map((cell) => {
    const neighbors = [[1, 0], [0, 1], [-1, 0], [0, -1]]
      .map(([dx, dy]) => byCoordinate.get(`${cell.x + dx},${cell.y + dy}`))
      .filter(Boolean)
      .map((neighbor) => `cell-${neighbor.key}`)
      .sort();
    return {
      id: `cell-${cell.key}`,
      key: cell.key,
      x: cell.x,
      y: cell.y,
      center: cloneSerializableState(cell.world),
      polygon: polygon(cell.world, source.cellSize),
      cost: cell.cost,
      biome: cell.biome ?? null,
      material: cell.material ?? null,
      regionId: cell.regionId ?? null,
      neighbors
    };
  });
  const cellById = new Map(meshCells.map((cell) => [cell.id, cell]));
  const portals = [];
  for (const cell of meshCells) {
    for (const neighborId of cell.neighbors) {
      if (cell.id.localeCompare(neighborId) >= 0) continue;
      const neighbor = cellById.get(neighborId);
      portals.push({
        id: `portal-${cell.id}-${neighborId}`,
        from: cell.id,
        to: neighborId,
        midpoint: {
          x: (cell.center.x + neighbor.center.x) * 0.5,
          y: (cell.center.y + neighbor.center.y) * 0.5,
          z: (cell.center.z + neighbor.center.z) * 0.5
        }
      });
    }
  }
  return {
    schema: "nexusengine.navmesh-2d/1",
    id: String(options.id ?? "navmesh-2d"),
    sourceSignature: options.sourceSignature ?? input.signature ?? null,
    cellSize: source.cellSize,
    cells: meshCells,
    portals,
    blockedRegions: source.cells.filter((cell) => !cell.walkable).map((cell) => ({
      id: `blocked-${cell.key}`,
      cell: { x: cell.x, y: cell.y },
      reason: String(cell.blockedReason ?? "blocked")
    }))
  };
}

export function create3DNavigationGraph(navmesh = {}, options = {}) {
  const cells = new Map((navmesh.cells ?? []).map((cell) => [cell.id, cloneSerializableState(cell)]));
  const waypoints = [...cells.values()].map((cell) => ({
    id: `wp-${cell.id}`,
    cellId: cell.id,
    position: { x: cell.center.x, y: cell.center.y + finite(options.heightOffset, "heightOffset", 0), z: cell.center.z },
    regionId: cell.regionId ?? null
  }));
  const waypointByCell = new Map(waypoints.map((waypoint) => [waypoint.cellId, waypoint]));
  const links = [];
  const seenIds = new Set();
  for (const cell of cells.values()) {
    const from = waypointByCell.get(cell.id);
    for (const neighborId of cell.neighbors ?? []) {
      const to = waypointByCell.get(neighborId);
      if (!to) continue;
      const id = `link-${from.id}-${to.id}`;
      seenIds.add(id);
      links.push({ id, from: from.id, to: to.id, kind: "walk", cost: Math.hypot(from.position.x - to.position.x, from.position.y - to.position.y, from.position.z - to.position.z) });
    }
  }
  for (const [index, record] of (options.links3d ?? []).entries()) {
    const from = waypoints.find((waypoint) => waypoint.id === record.from || waypoint.regionId === record.from);
    const to = waypoints.find((waypoint) => waypoint.id === record.to || waypoint.regionId === record.to);
    if (!from || !to) throw new TypeError(`links3d[${index}] references an unknown waypoint or region.`);
    const id = String(record.id ?? `link-${from.id}-${to.id}`);
    if (seenIds.has(id)) throw new TypeError(`Navigation graph contains duplicate link ${id}.`);
    seenIds.add(id);
    const baseCost = Math.hypot(from.position.x - to.position.x, from.position.y - to.position.y, from.position.z - to.position.z);
    const multiplier = finite(record.costMultiplier, `links3d[${index}].costMultiplier`, 1);
    if (multiplier < 0) throw new RangeError(`links3d[${index}] costMultiplier cannot be negative.`);
    links.push({ id, from: from.id, to: to.id, kind: String(record.kind ?? "vertical"), cost: baseCost * multiplier });
  }
  return { schema: "nexusengine.navigation-graph-3d/1", id: String(options.id ?? "navmesh-3d"), sourceSignature: navmesh.sourceSignature ?? null, waypoints, links: links.sort((a, b) => a.id.localeCompare(b.id)) };
}

export function nearestNavigationWaypoint(graph = {}, point = {}) {
  const target = { x: finite(point.x, "point.x", 0), y: finite(point.y, "point.y", 0), z: finite(point.z, "point.z", 0) };
  const result = (graph.waypoints ?? []).map((waypoint) => ({
    waypoint,
    distance: Math.hypot(waypoint.position.x - target.x, waypoint.position.y - target.y, waypoint.position.z - target.z)
  })).sort((left, right) => left.distance - right.distance || left.waypoint.id.localeCompare(right.waypoint.id))[0] ?? null;
  return result ? cloneSerializableState(result) : null;
}
