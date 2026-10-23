import { defineRuntimeKit } from "./runtime-kit.js";
import {
  CommonGameComponents,
  CommonGameEvents,
  CommonGameResources
} from "./common-game-definitions.js";
import {
  create3DNavigationGraph,
  createNavMeshFromWalkability
} from "./navmesh-kit.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function distance2(a = {}, b = {}) {
  return Math.hypot(number(a.x) - number(b.x), number(a.y ?? a.z) - number(b.y ?? b.z));
}

function distance3(a = {}, b = {}) {
  return Math.hypot(
    number(a.x) - number(b.x),
    number(a.y) - number(b.y),
    number(a.z) - number(b.z)
  );
}

function cellKey(x, y) {
  return `${x},${y}`;
}

function normalizeWalkability(input = {}) {
  const source = input.walkability ?? input;
  const width = Math.max(1, Math.floor(number(source.width, input.width ?? 1)));
  const height = Math.max(1, Math.floor(number(source.height, input.height ?? 1)));
  const cellSize = Math.max(0.25, number(source.cellSize, input.cellSize ?? 1));
  const origin = source.origin ?? {
    x: -width * cellSize * 0.5,
    z: -height * cellSize * 0.5
  };
  const cells = Array.isArray(source.cells)
    ? source.cells
    : [];
  const byKey = new Map(cells.map((cell) => [cell.key ?? cellKey(cell.x, cell.y), cell]));
  return { width, height, cellSize, origin, cells, byKey };
}

export const navigationHeuristics = Object.freeze({
  manhattan(a = {}, b = {}) {
    return Math.abs(number(a.x) - number(b.x)) + Math.abs(number(a.y ?? a.z) - number(b.y ?? b.z));
  },
  euclidean(a = {}, b = {}) {
    return distance2(a, b);
  },
  octile(a = {}, b = {}) {
    const dx = Math.abs(number(a.x) - number(b.x));
    const dy = Math.abs(number(a.y ?? a.z) - number(b.y ?? b.z));
    const f = Math.SQRT2 - 1;
    return dx < dy ? f * dx + dy : f * dy + dx;
  }
});

function lowestOpen(open) {
  let bestKey = null;
  let best = null;
  for (const [key, record] of open.entries()) {
    if (!best || record.f < best.f || (record.f === best.f && (record.h < best.h || key < bestKey))) {
      best = record;
      bestKey = key;
    }
  }
  return [bestKey, best];
}

function reconstruct(cameFrom, currentKey, nodeByKey) {
  const keys = [currentKey];
  while (cameFrom.has(currentKey)) {
    currentKey = cameFrom.get(currentKey);
    keys.push(currentKey);
  }
  keys.reverse();
  return keys.map((key) => nodeByKey.get(key)).filter(Boolean);
}

export function createAStarPathfinder(config = {}) {
  const adapter = config.adapter;
  if (!adapter || typeof adapter.key !== "function" || typeof adapter.neighbors !== "function") {
    throw new TypeError("createAStarPathfinder expects an adapter with key() and neighbors().");
  }
  const heuristic = config.heuristic ?? adapter.heuristic ?? navigationHeuristics.euclidean;

  return {
    findPath(request = {}) {
      const start = adapter.nodeFromPoint ? adapter.nodeFromPoint(request.start) : request.start;
      const goal = adapter.nodeFromPoint ? adapter.nodeFromPoint(request.goal) : request.goal;
      if (!start || !goal || adapter.walkable?.(start) === false || adapter.walkable?.(goal) === false) {
        return {
          status: "failed",
          reason: "unreachable-endpoint",
          mode: adapter.mode ?? "astar",
          points: [],
          nodes: [],
          visited: 0,
          cost: Infinity
        };
      }

      const startKey = adapter.key(start);
      const goalKey = adapter.key(goal);
      const open = new Map();
      const closed = new Set();
      const cameFrom = new Map();
      const gScore = new Map([[startKey, 0]]);
      const nodeByKey = new Map([[startKey, start], [goalKey, goal]]);
      open.set(startKey, {
        node: start,
        g: 0,
        h: heuristic(start, goal),
        f: heuristic(start, goal)
      });

      while (open.size > 0) {
        const [currentKey, current] = lowestOpen(open);
        if (currentKey === goalKey || adapter.equals?.(current.node, goal) === true) {
          const nodes = reconstruct(cameFrom, currentKey, nodeByKey);
          const points = nodes.map((node) => adapter.point ? adapter.point(node) : node);
          return {
            status: "resolved",
            mode: adapter.mode ?? "astar",
            points,
            nodes,
            visited: closed.size + 1,
            cost: gScore.get(currentKey) ?? 0,
            pathLength: Math.max(0, points.length - 1)
          };
        }

        open.delete(currentKey);
        closed.add(currentKey);

        for (const neighbor of adapter.neighbors(current.node)) {
          if (!neighbor || adapter.walkable?.(neighbor) === false) continue;
          const neighborKey = adapter.key(neighbor);
          if (closed.has(neighborKey)) continue;
          nodeByKey.set(neighborKey, neighbor);
          const nextG = (gScore.get(currentKey) ?? Infinity) + number(adapter.cost?.(current.node, neighbor), 1);
          if (nextG >= (gScore.get(neighborKey) ?? Infinity)) continue;
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, nextG);
          const h = heuristic(neighbor, goal);
          open.set(neighborKey, {
            node: neighbor,
            g: nextG,
            h,
            f: nextG + h
          });
        }
      }

      return {
        status: "failed",
        reason: "no-path",
        mode: adapter.mode ?? "astar",
        points: [],
        nodes: [],
        visited: closed.size,
        cost: Infinity
      };
    }
  };
}

function gridPointToNode(point = {}, walkability) {
  if (Number.isFinite(point.x) && Number.isFinite(point.y) && !Number.isFinite(point.z)) {
    return { x: Math.floor(number(point.x)), y: Math.floor(number(point.y)) };
  }
  return {
    x: Math.floor((number(point.x) - walkability.origin.x) / walkability.cellSize),
    y: Math.floor((number(point.z ?? point.y) - walkability.origin.z) / walkability.cellSize)
  };
}

export const navigationAdapters = Object.freeze({
  grid(input = {}, options = {}) {
    const walkability = normalizeWalkability(input);
    const diagonal = options.diagonal ?? false;
    const dirs = diagonal
      ? [
        { x: 1, y: 0, cost: 1 }, { x: 0, y: 1, cost: 1 },
        { x: -1, y: 0, cost: 1 }, { x: 0, y: -1, cost: 1 },
        { x: 1, y: 1, cost: Math.SQRT2 }, { x: -1, y: 1, cost: Math.SQRT2 },
        { x: 1, y: -1, cost: Math.SQRT2 }, { x: -1, y: -1, cost: Math.SQRT2 }
      ]
      : [
        { x: 1, y: 0, cost: 1 }, { x: 0, y: 1, cost: 1 },
        { x: -1, y: 0, cost: 1 }, { x: 0, y: -1, cost: 1 }
      ];

    function cellAt(node) {
      return walkability.byKey.get(cellKey(node.x, node.y));
    }

    return {
      mode: "grid",
      key: (node) => cellKey(node.x, node.y),
      nodeFromPoint: (point) => gridPointToNode(point, walkability),
      equals: (a, b) => a.x === b.x && a.y === b.y,
      walkable(node) {
        const cell = cellAt(node);
        return Boolean(cell && cell.walkable !== false);
      },
      neighbors(node) {
        return dirs
          .map((dir) => ({ x: node.x + dir.x, y: node.y + dir.y, stepCost: dir.cost }))
          .filter((next) => next.x >= 0 && next.y >= 0 && next.x < walkability.width && next.y < walkability.height);
      },
      cost(_from, to) {
        const cell = cellAt(to);
        return number(to.stepCost, 1) * number(cell?.cost, 1);
      },
      heuristic: diagonal ? navigationHeuristics.octile : navigationHeuristics.manhattan,
      point(node) {
        const cell = cellAt(node);
        return cell?.world ?? {
          x: walkability.origin.x + (node.x + 0.5) * walkability.cellSize,
          y: 0,
          z: walkability.origin.z + (node.y + 0.5) * walkability.cellSize
        };
      }
    };
  },

  navmesh2d(input = {}, options = {}) {
    const navmesh = input.navmesh ?? input.navmesh2d ?? createNavMeshFromWalkability(input, options);
    const cells = new Map((navmesh.cells ?? []).map((cell) => [cell.id, cell]));

    function nearest(point = {}) {
      let best = null;
      let bestDistance = Infinity;
      for (const cell of cells.values()) {
        const dx = number(point.x) - number(cell.center?.x);
        const dz = number(point.z ?? point.y) - number(cell.center?.z);
        const distance = dx * dx + dz * dz;
        if (distance < bestDistance) {
          best = cell;
          bestDistance = distance;
        }
      }
      return best;
    }

    return {
      mode: "navmesh2d",
      key: (node) => node.id,
      nodeFromPoint: nearest,
      equals: (a, b) => a.id === b.id,
      walkable: (node) => cells.has(node.id),
      neighbors(node) {
        return (node.neighbors ?? []).map((id) => cells.get(id)).filter(Boolean);
      },
      cost(from, to) {
        return distance2(from.center, to.center) * number(to.cost, 1);
      },
      heuristic: (a, b) => distance2(a.center, b.center),
      point(node) {
        return node.center;
      }
    };
  },

  navmesh3d(input = {}, options = {}) {
    const graph = input.graph3d ?? create3DNavigationGraph(input.navmesh ?? input.navmesh2d ?? createNavMeshFromWalkability(input, options), options);
    const waypoints = new Map((graph.waypoints ?? []).map((waypoint) => [waypoint.id, waypoint]));
    const linksByFrom = new Map();
    for (const link of graph.links ?? []) {
      if (!linksByFrom.has(link.from)) linksByFrom.set(link.from, []);
      linksByFrom.get(link.from).push(link);
    }

    function nearest(point = {}) {
      let best = null;
      let bestDistance = Infinity;
      for (const waypoint of waypoints.values()) {
        const distance = distance3(point, waypoint.position);
        if (distance < bestDistance) {
          best = waypoint;
          bestDistance = distance;
        }
      }
      return best;
    }

    return {
      mode: "navmesh3d",
      key: (node) => node.id,
      nodeFromPoint: nearest,
      equals: (a, b) => a.id === b.id,
      walkable: (node) => waypoints.has(node.id),
      neighbors(node) {
        return (linksByFrom.get(node.id) ?? []).map((link) => {
          const waypoint = waypoints.get(link.to);
          return waypoint ? { ...waypoint, __linkCost: link.cost } : null;
        }).filter(Boolean);
      },
      cost(from, to) {
        return number(to.__linkCost, distance3(from.position, to.position));
      },
      heuristic: (a, b) => distance3(a.position, b.position),
      point(node) {
        return node.position;
      }
    };
  }
});

function resolveAdapter(mode, proceduralSnapshot, navigationSnapshot, options) {
  if (mode === "navmesh2d") {
    return navigationAdapters.navmesh2d({
      navmesh: navigationSnapshot?.navmesh2d,
      ...(proceduralSnapshot ?? {})
    }, options.navmesh2d ?? {});
  }
  if (mode === "navmesh3d") {
    return navigationAdapters.navmesh3d({
      graph3d: navigationSnapshot?.graph3d,
      navmesh: navigationSnapshot?.navmesh2d,
      ...(proceduralSnapshot ?? {})
    }, options.navmesh3d ?? {});
  }
  return navigationAdapters.grid(proceduralSnapshot ?? {}, options.grid ?? {});
}

function safeGetComponent(world, entity, component) {
  try {
    return world.getComponent(entity, component);
  } catch {
    return null;
  }
}

function safeHasComponent(world, entity, component) {
  try {
    return world.hasComponent(entity, component);
  } catch {
    return false;
  }
}

function moveAgents(world, definitions) {
  const { NavigationAgent, Position } = definitions.components;
  const events = definitions.events;
  const dt = Math.min(world.__nexusClock?.delta ?? 1 / 60, 0.05);
  for (const entity of world.query(NavigationAgent, Position)) {
    const agent = world.getComponent(entity, NavigationAgent);
    const position = world.getComponent(entity, Position);
    const path = agent.path ?? [];
    if (!path.length || agent.arrived) continue;
    const index = Math.min(agent.pathIndex ?? 0, path.length - 1);
    const target = path[index];
    const dx = number(target.x) - number(position.x);
    const dz = number(target.z ?? target.y) - number(position.z ?? position.y);
    const distance = Math.hypot(dx, dz);
    const speed = number(agent.speed, 8);
    if (distance <= Math.max(0.05, speed * dt)) {
      position.x = number(target.x);
      if (position.z !== undefined || target.z !== undefined) position.z = number(target.z ?? target.y);
      else position.y = number(target.y ?? target.z);
      agent.pathIndex = index + 1;
      if (agent.pathIndex >= path.length) {
        agent.arrived = true;
        world.emit(events.AgentArrived, {
          entity,
          point: { ...position }
        });
      }
      continue;
    }
    position.x += (dx / distance) * speed * dt;
    if (position.z !== undefined || target.z !== undefined) {
      position.z = number(position.z) + (dz / distance) * speed * dt;
    } else {
      position.y = number(position.y) + (dz / distance) * speed * dt;
    }
  }
}

export function createNavigationQuery(world, kit = {}) {
  const snapshotResource = kit.resources?.NavigationSnapshot ?? kit.definitions?.resources?.NavigationSnapshot ?? CommonGameResources.NavigationSnapshot;
  const stateResource = kit.resources?.NavigationState ?? kit.definitions?.resources?.NavigationState ?? CommonGameResources.NavigationState;
  return {
    snapshot() {
      return world.getResource(snapshotResource);
    },
    state() {
      return world.getResource(stateResource);
    },
    lastPath() {
      return world.getResource(snapshotResource)?.lastPath ?? null;
    }
  };
}

export function createPathfindingKit(options = {}) {
  const proceduralSnapshotResource = options.proceduralSnapshotResource ?? CommonGameResources.ProceduralSnapshot;
  const navigationStateResource = options.navigationStateResource ?? CommonGameResources.NavigationState;
  const navigationSnapshotResource = options.navigationSnapshotResource ?? CommonGameResources.NavigationSnapshot;
  const definitions = {
    components: {
      Position: CommonGameComponents.Position,
      NavigationAgent: CommonGameComponents.NavigationAgent,
      NavigationTarget: CommonGameComponents.NavigationTarget,
      NavigationObstacle: CommonGameComponents.NavigationObstacle
    },
    resources: {
      NavigationState: navigationStateResource,
      NavigationSnapshot: navigationSnapshotResource,
      ProceduralSnapshot: proceduralSnapshotResource
    },
    events: {
      PathRequested: CommonGameEvents.PathRequested,
      PathResolved: CommonGameEvents.PathResolved,
      PathFailed: CommonGameEvents.PathFailed,
      AgentArrived: CommonGameEvents.AgentArrived
    }
  };

  const kit = defineRuntimeKit({
    id: options.id ?? "pathfinding-kit",
    components: definitions.components,
    resources: definitions.resources,
    events: definitions.events,
    provides: ["pathfinding", "astar"],
    bindings: {
      navigation: {
        navigationStateResource,
        navigationSnapshotResource,
        proceduralSnapshotResource
      }
    },
    systems: [
      {
        phase: "resolve",
        name: "PathfindingSystem",
        system(world) {
          const state = world.getResource(navigationStateResource);
          if (!state) return;
          const proceduralSnapshot = world.getResource(proceduralSnapshotResource);
          const currentSnapshot = world.getResource(navigationSnapshotResource) ?? {};
          const requests = (state.requests ?? []).splice(0);
          state.requests = [];
          const resolved = [];
          const failed = [];

          for (const request of requests) {
            const mode = request.mode ?? state.mode ?? options.mode ?? "grid";
            const adapter = resolveAdapter(mode, proceduralSnapshot, currentSnapshot, options);
            const result = createAStarPathfinder({ adapter }).findPath(request);
            const payload = {
              id: request.id,
              mode,
              start: request.start,
              goal: request.goal,
              agent: request.agent ?? null,
              ...result
            };

            if (result.status === "resolved") {
              resolved.push(payload);
              if (request.agent && safeHasComponent(world, request.agent, CommonGameComponents.NavigationAgent)) {
                const agent = safeGetComponent(world, request.agent, CommonGameComponents.NavigationAgent);
                agent.path = result.points;
                agent.pathIndex = 0;
                agent.arrived = false;
                world.setComponent(request.agent, CommonGameComponents.NavigationAgent, agent);
              }
              world.emit(CommonGameEvents.PathResolved, payload);
            } else {
              failed.push(payload);
              world.emit(CommonGameEvents.PathFailed, payload);
            }
          }

          state.resolvedCount = number(state.resolvedCount) + resolved.length;
          state.failedCount = number(state.failedCount) + failed.length;
          world.setResource(navigationStateResource, state);

          if (requests.length > 0) {
            const lastPath = resolved[resolved.length - 1] ?? failed[failed.length - 1] ?? null;
            world.setResource(navigationSnapshotResource, {
              ...currentSnapshot,
              activeMode: lastPath?.mode ?? state.mode,
              lastPath,
              paths: [
                ...(currentSnapshot.paths ?? []),
                ...resolved,
                ...failed
              ].slice(-20),
              failedPathCount: number(currentSnapshot.failedPathCount) + failed.length,
              resolvedPathCount: number(currentSnapshot.resolvedPathCount) + resolved.length,
              debug: {
                ...(currentSnapshot.debug ?? {}),
                visited: lastPath?.visited ?? 0,
                pathLength: lastPath?.pathLength ?? 0,
                rawGraph: lastPath?.nodes ?? []
              }
            });
          }

          moveAgents(world, definitions);
        }
      }
    ],
    initWorld({ world }) {
      if (!world.hasResource(navigationStateResource)) {
        world.setResource(navigationStateResource, {
          mode: options.mode ?? "grid",
          requests: [],
          requestSequence: 0,
          resolvedCount: 0,
          failedCount: 0
        });
      }
      if (!world.hasResource(navigationSnapshotResource)) {
        world.setResource(navigationSnapshotResource, {
          activeMode: options.mode ?? "grid",
          lastPath: null,
          paths: [],
          resolvedPathCount: 0,
          failedPathCount: 0,
          debug: {}
        });
      }
    },
    install({ engine, world }) {
      engine.navigation = {
        setMode(mode) {
          const state = world.getResource(navigationStateResource) ?? {};
          state.mode = mode;
          world.setResource(navigationStateResource, state);
          const snapshot = world.getResource(navigationSnapshotResource) ?? {};
          world.setResource(navigationSnapshotResource, {
            ...snapshot,
            activeMode: mode
          });
          return state;
        },
        requestPath(request = {}) {
          const state = world.getResource(navigationStateResource) ?? {
            mode: options.mode ?? "grid",
            requests: [],
            requestSequence: 0
          };
          const next = {
            id: request.id ?? `path-${(state.requestSequence ?? 0) + 1}`,
            mode: request.mode ?? state.mode ?? options.mode ?? "grid",
            start: request.start,
            goal: request.goal,
            agent: request.agent ?? null
          };
          state.requestSequence = (state.requestSequence ?? 0) + 1;
          state.requests = [...(state.requests ?? []), next];
          world.setResource(navigationStateResource, state);
          world.emit(CommonGameEvents.PathRequested, next);
          return next;
        },
        snapshot() {
          return world.getResource(navigationSnapshotResource);
        },
        query() {
          return createNavigationQuery(world, kit);
        }
      };
    },
    metadata: {
      pathfinding: true,
      variants: ["grid", "navmesh2d", "navmesh3d"],
      solver: "astar"
    }
  });

  return {
    ...kit,
    definitions
  };
}
