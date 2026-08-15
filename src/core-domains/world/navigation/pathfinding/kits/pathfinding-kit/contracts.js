import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function distance2(left = {}, right = {}) {
  return Math.hypot(finite(left.x, "point.x", 0) - finite(right.x, "point.x", 0), finite(left.y ?? left.z, "point.y", 0) - finite(right.y ?? right.z, "point.y", 0));
}

function distance3(left = {}, right = {}) {
  return Math.hypot(finite(left.x, "point.x", 0) - finite(right.x, "point.x", 0), finite(left.y, "point.y", 0) - finite(right.y, "point.y", 0), finite(left.z, "point.z", 0) - finite(right.z, "point.z", 0));
}

export const navigationHeuristics = Object.freeze({
  manhattan(left = {}, right = {}) {
    return Math.abs(finite(left.x, "left.x", 0) - finite(right.x, "right.x", 0)) + Math.abs(finite(left.y ?? left.z, "left.y", 0) - finite(right.y ?? right.z, "right.y", 0));
  },
  euclidean: distance2,
  octile(left = {}, right = {}) {
    const dx = Math.abs(finite(left.x, "left.x", 0) - finite(right.x, "right.x", 0));
    const dy = Math.abs(finite(left.y ?? left.z, "left.y", 0) - finite(right.y ?? right.z, "right.y", 0));
    return dx < dy ? (Math.SQRT2 - 1) * dx + dy : (Math.SQRT2 - 1) * dy + dx;
  }
});

function bestOpen(open) {
  return [...open.entries()].sort(([leftKey, left], [rightKey, right]) => left.f - right.f || left.h - right.h || leftKey.localeCompare(rightKey))[0] ?? [null, null];
}

function reconstruct(cameFrom, key, nodes) {
  const keys = [key];
  while (cameFrom.has(key)) {
    key = cameFrom.get(key);
    keys.push(key);
  }
  return keys.reverse().map((entry) => nodes.get(entry));
}

export function createAStarPathfinder({ adapter, heuristic = adapter?.heuristic ?? navigationHeuristics.euclidean } = {}) {
  if (!adapter || typeof adapter.key !== "function" || typeof adapter.neighbors !== "function") {
    throw new TypeError("A* requires an adapter with key() and neighbors().");
  }
  return Object.freeze({
    findPath(request = {}) {
      const start = adapter.nodeFromPoint ? adapter.nodeFromPoint(cloneSerializableState(request.start ?? {})) : cloneSerializableState(request.start);
      const goal = adapter.nodeFromPoint ? adapter.nodeFromPoint(cloneSerializableState(request.goal ?? {})) : cloneSerializableState(request.goal);
      if (!start || !goal || adapter.walkable?.(start) === false || adapter.walkable?.(goal) === false) {
        return { status: "failed", reason: "unreachable-endpoint", mode: adapter.mode ?? "astar", points: [], nodes: [], visited: 0, cost: null };
      }
      const startKey = String(adapter.key(start));
      const goalKey = String(adapter.key(goal));
      const open = new Map();
      const closed = new Set();
      const cameFrom = new Map();
      const scores = new Map([[startKey, 0]]);
      const nodes = new Map([[startKey, start], [goalKey, goal]]);
      const initialH = finite(heuristic(start, goal), "heuristic");
      if (initialH < 0) throw new RangeError("Heuristics cannot be negative.");
      open.set(startKey, { node: start, h: initialH, f: initialH });
      while (open.size) {
        const [currentKey, current] = bestOpen(open);
        if (currentKey === goalKey || adapter.equals?.(current.node, goal) === true) {
          const pathNodes = reconstruct(cameFrom, currentKey, nodes);
          const points = pathNodes.map((node) => adapter.point ? adapter.point(node) : node);
          return cloneSerializableState({ status: "resolved", mode: adapter.mode ?? "astar", points, nodes: pathNodes, visited: closed.size + 1, cost: scores.get(currentKey) ?? 0, pathLength: Math.max(0, points.length - 1) });
        }
        open.delete(currentKey);
        closed.add(currentKey);
        const neighbors = [...(adapter.neighbors(current.node) ?? [])].sort((left, right) => String(adapter.key(left)).localeCompare(String(adapter.key(right))));
        for (const neighbor of neighbors) {
          if (!neighbor || adapter.walkable?.(neighbor) === false) continue;
          const neighborKey = String(adapter.key(neighbor));
          if (closed.has(neighborKey)) continue;
          const stepCost = finite(adapter.cost?.(current.node, neighbor), `cost ${currentKey}->${neighborKey}`, 1);
          if (stepCost < 0) throw new RangeError(`Path cost ${currentKey}->${neighborKey} cannot be negative.`);
          const nextScore = (scores.get(currentKey) ?? 0) + stepCost;
          if (nextScore >= (scores.get(neighborKey) ?? Number.POSITIVE_INFINITY)) continue;
          const h = finite(heuristic(neighbor, goal), `heuristic ${neighborKey}`);
          if (h < 0) throw new RangeError(`Heuristic ${neighborKey} cannot be negative.`);
          cameFrom.set(neighborKey, currentKey);
          scores.set(neighborKey, nextScore);
          nodes.set(neighborKey, neighbor);
          open.set(neighborKey, { node: neighbor, h, f: nextScore + h });
        }
      }
      return { status: "failed", reason: "no-path", mode: adapter.mode ?? "astar", points: [], nodes: [], visited: closed.size, cost: null };
    }
  });
}

function nearest(records, point, position) {
  return [...records].map((record) => ({ record, distance: distance3(position(record), point) }))
    .sort((left, right) => left.distance - right.distance || String(left.record.id).localeCompare(String(right.record.id)))[0]?.record ?? null;
}

export const navigationAdapters = Object.freeze({
  grid(input = {}, options = {}) {
    const source = input.walkability ?? input;
    const width = Math.floor(finite(source.width, "grid.width"));
    const height = Math.floor(finite(source.height, "grid.height"));
    const cellSize = finite(source.cellSize, "grid.cellSize", 1);
    if (width < 1 || height < 1 || cellSize <= 0) throw new RangeError("Grid dimensions must be positive.");
    const origin = { x: finite(source.origin?.x, "grid.origin.x", 0), z: finite(source.origin?.z, "grid.origin.z", 0) };
    const cells = new Map();
    for (const [index, cell] of (source.cells ?? []).entries()) {
      const key = `${Math.floor(finite(cell.x, `cells[${index}].x`))},${Math.floor(finite(cell.y, `cells[${index}].y`))}`;
      if (cells.has(key)) throw new TypeError(`Grid contains duplicate coordinate ${key}.`);
      cells.set(key, cloneSerializableState({ ...cell, key }));
    }
    const diagonal = options.diagonal === true;
    const directions = diagonal ? [[1, 0, 1], [0, 1, 1], [-1, 0, 1], [0, -1, 1], [1, 1, Math.SQRT2], [-1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, -1, Math.SQRT2]] : [[1, 0, 1], [0, 1, 1], [-1, 0, 1], [0, -1, 1]];
    const at = (node) => cells.get(`${node.x},${node.y}`);
    return {
      mode: "grid",
      key: (node) => `${node.x},${node.y}`,
      nodeFromPoint(point = {}) {
        if (Number.isFinite(point.x) && Number.isFinite(point.y) && point.z === undefined) return { x: Math.floor(point.x), y: Math.floor(point.y) };
        return { x: Math.floor((finite(point.x, "point.x", 0) - origin.x) / cellSize), y: Math.floor((finite(point.z ?? point.y, "point.z", 0) - origin.z) / cellSize) };
      },
      equals: (left, right) => left.x === right.x && left.y === right.y,
      walkable: (node) => at(node)?.walkable !== false && Boolean(at(node)),
      neighbors(node) {
        return directions.map(([dx, dy, stepCost]) => ({ x: node.x + dx, y: node.y + dy, stepCost })).filter((entry) => entry.x >= 0 && entry.y >= 0 && entry.x < width && entry.y < height);
      },
      cost(_from, to) {
        const cost = finite(at(to)?.cost, "grid cell cost", 1);
        return finite(to.stepCost, "grid step cost", 1) * cost;
      },
      heuristic: diagonal ? navigationHeuristics.octile : navigationHeuristics.manhattan,
      point(node) {
        return at(node)?.world ?? { x: origin.x + (node.x + 0.5) * cellSize, y: 0, z: origin.z + (node.y + 0.5) * cellSize };
      }
    };
  },
  navmesh2d(navmesh = {}) {
    const cells = new Map((navmesh.cells ?? []).map((cell) => [cell.id, cloneSerializableState(cell)]));
    return {
      mode: "navmesh2d",
      key: (node) => node.id,
      nodeFromPoint: (point) => nearest(cells.values(), point, (cell) => cell.center),
      equals: (left, right) => left.id === right.id,
      walkable: (node) => cells.has(node.id),
      neighbors: (node) => (node.neighbors ?? []).map((id) => cells.get(id)).filter(Boolean),
      cost: (from, to) => distance2(from.center, to.center) * finite(to.cost, "navmesh cost", 1),
      heuristic: (left, right) => distance2(left.center, right.center),
      point: (node) => node.center
    };
  },
  navmesh3d(graph = {}) {
    const waypoints = new Map((graph.waypoints ?? []).map((waypoint) => [waypoint.id, cloneSerializableState(waypoint)]));
    const links = new Map();
    for (const link of graph.links ?? []) {
      if (!links.has(link.from)) links.set(link.from, []);
      links.get(link.from).push(cloneSerializableState(link));
    }
    return {
      mode: "navmesh3d",
      key: (node) => node.id,
      nodeFromPoint: (point) => nearest(waypoints.values(), point, (waypoint) => waypoint.position),
      equals: (left, right) => left.id === right.id,
      walkable: (node) => waypoints.has(node.id),
      neighbors: (node) => (links.get(node.id) ?? []).map((link) => ({ ...waypoints.get(link.to), __linkCost: link.cost })).filter((entry) => entry.id),
      cost: (from, to) => finite(to.__linkCost, "navigation link cost", distance3(from.position, to.position)),
      heuristic: (left, right) => distance3(left.position, right.position),
      point: (node) => node.position
    };
  }
});

export function resolveNavigationAdapter(mode, sources = {}, options = {}) {
  if (mode === "navmesh2d") return navigationAdapters.navmesh2d(sources.navmesh2d ?? sources.navmesh ?? {});
  if (mode === "navmesh3d") return navigationAdapters.navmesh3d(sources.graph3d ?? sources.graph ?? {});
  return navigationAdapters.grid(sources.walkability ?? sources, options.grid ?? options);
}
