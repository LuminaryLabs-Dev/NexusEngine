import { defineRuntimeKit } from "./runtime-kit.js";
import {
  CommonGameEvents,
  CommonGameResources
} from "./common-game-definitions.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
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

  return { width, height, cellSize, origin, cells };
}

function cellCenter(cell, walkability) {
  return cell.world ?? {
    x: walkability.origin.x + (number(cell.x) + 0.5) * walkability.cellSize,
    y: number(cell.height ?? cell.layer, 0),
    z: walkability.origin.z + (number(cell.y) + 0.5) * walkability.cellSize
  };
}

function makeCellPolygon(center, cellSize) {
  const h = cellSize * 0.5;
  return [
    { x: center.x - h, z: center.z - h },
    { x: center.x + h, z: center.z - h },
    { x: center.x + h, z: center.z + h },
    { x: center.x - h, z: center.z + h }
  ];
}

export function createNavMeshFromWalkability(input = {}, options = {}) {
  const walkability = normalizeWalkability(input);
  const walkableCells = walkability.cells.filter((cell) => cell.walkable !== false);
  const byKey = new Map(walkableCells.map((cell) => [cell.key ?? cellKey(cell.x, cell.y), cell]));
  const meshCells = [];
  const portals = [];
  const dirs = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 }
  ];

  for (const sourceCell of walkableCells) {
    const key = sourceCell.key ?? cellKey(sourceCell.x, sourceCell.y);
    const center = cellCenter(sourceCell, walkability);
    const neighbors = [];
    for (const dir of dirs) {
      const nextKey = cellKey(number(sourceCell.x) + dir.x, number(sourceCell.y) + dir.y);
      if (byKey.has(nextKey)) {
        neighbors.push(`cell-${nextKey}`);
        if (dir.x >= 0 && dir.y >= 0) {
          portals.push({
            id: `portal-${key}-${nextKey}`,
            from: `cell-${key}`,
            to: `cell-${nextKey}`,
            midpoint: {
              x: (center.x + cellCenter(byKey.get(nextKey), walkability).x) * 0.5,
              y: (center.y + cellCenter(byKey.get(nextKey), walkability).y) * 0.5,
              z: (center.z + cellCenter(byKey.get(nextKey), walkability).z) * 0.5
            }
          });
        }
      }
    }
    meshCells.push({
      id: `cell-${key}`,
      key,
      x: sourceCell.x,
      y: sourceCell.y,
      center,
      polygon: makeCellPolygon(center, walkability.cellSize),
      cost: number(sourceCell.cost, 1),
      biome: sourceCell.biome,
      material: sourceCell.material,
      regionId: sourceCell.regionId,
      neighbors
    });
  }

  return {
    id: options.id ?? "navmesh-2d",
    mode: "navmesh2d",
    sourceSignature: input.signature ?? options.sourceSignature ?? null,
    cellSize: walkability.cellSize,
    cells: meshCells,
    portals,
    blockedRegions: walkability.cells
      .filter((cell) => cell.walkable === false)
      .map((cell) => ({
        id: `blocked-${cell.key ?? cellKey(cell.x, cell.y)}`,
        cell: { x: cell.x, y: cell.y },
        reason: cell.blockedReason ?? "blocked"
      }))
  };
}

function nearestCellId(navmesh, point = {}) {
  let best = null;
  let bestDistance = Infinity;
  for (const cell of navmesh.cells ?? []) {
    const dx = number(point.x) - number(cell.center?.x);
    const dz = number(point.z ?? point.y) - number(cell.center?.z);
    const distance = dx * dx + dz * dz;
    if (distance < bestDistance) {
      best = cell.id;
      bestDistance = distance;
    }
  }
  return best;
}

export function create3DNavigationGraph(navmesh = {}, options = {}) {
  const waypoints = (navmesh.cells ?? []).map((cell) => ({
    id: `wp-${cell.id}`,
    cellId: cell.id,
    position: {
      x: number(cell.center?.x),
      y: number(cell.center?.y, number(cell.y, 0)) + number(options.heightOffset, 0),
      z: number(cell.center?.z)
    },
    regionId: cell.regionId,
    links: []
  }));
  const waypointByCell = new Map(waypoints.map((waypoint) => [waypoint.cellId, waypoint]));
  const waypointById = new Map(waypoints.map((waypoint) => [waypoint.id, waypoint]));
  const links = [];

  for (const cell of navmesh.cells ?? []) {
    const from = waypointByCell.get(cell.id);
    if (!from) continue;
    for (const neighborId of cell.neighbors ?? []) {
      const to = waypointByCell.get(neighborId);
      if (!to) continue;
      const dx = from.position.x - to.position.x;
      const dy = from.position.y - to.position.y;
      const dz = from.position.z - to.position.z;
      const cost = Math.hypot(dx, dy, dz);
      const link = {
        id: `link-${from.id}-${to.id}`,
        from: from.id,
        to: to.id,
        kind: "walk",
        cost
      };
      from.links.push(link);
      links.push(link);
    }
  }

  for (const sourceLink of options.links3d ?? []) {
    const fromRegion = sourceLink.from;
    const toRegion = sourceLink.to;
    const fromCell = (navmesh.cells ?? []).find((cell) => cell.regionId === fromRegion) ?? null;
    const toCell = (navmesh.cells ?? []).find((cell) => cell.regionId === toRegion) ?? null;
    const from = fromCell ? waypointByCell.get(fromCell.id) : waypointById.get(sourceLink.from);
    const to = toCell ? waypointByCell.get(toCell.id) : waypointById.get(sourceLink.to);
    if (!from || !to) continue;
    const dx = from.position.x - to.position.x;
    const dy = from.position.y - to.position.y + number(sourceLink.verticalCost, 1.5);
    const dz = from.position.z - to.position.z;
    const cost = Math.hypot(dx, dy, dz) * number(sourceLink.costMultiplier, 1.25);
    const link = {
      id: sourceLink.id ?? `link-${from.id}-${to.id}`,
      from: from.id,
      to: to.id,
      kind: sourceLink.kind ?? "vertical",
      cost
    };
    from.links.push(link);
    links.push(link);
  }

  return {
    id: options.id ?? "navmesh-3d",
    mode: "navmesh3d",
    sourceSignature: navmesh.sourceSignature ?? null,
    waypoints,
    links,
    nearest(point) {
      const cellId = nearestCellId(navmesh, point);
      return cellId ? waypointByCell.get(cellId)?.id ?? null : null;
    }
  };
}

export function createNavMeshKit(options = {}) {
  const proceduralSnapshotResource = options.proceduralSnapshotResource ?? CommonGameResources.ProceduralSnapshot;
  const navigationSnapshotResource = options.navigationSnapshotResource ?? CommonGameResources.NavigationSnapshot;

  const kit = defineRuntimeKit({
    id: options.id ?? "navmesh-kit",
    resources: {
      ProceduralSnapshot: proceduralSnapshotResource,
      NavigationSnapshot: navigationSnapshotResource
    },
    events: {
      ProceduralGenerated: CommonGameEvents.ProceduralGenerated
    },
    requires: options.requires ?? ["procedural"],
    provides: ["navmesh", "navigation-graph"],
    bindings: {
      navmesh: {
        navigationSnapshotResource,
        proceduralSnapshotResource
      }
    },
    systems: [
      {
        phase: "resolve",
        name: "NavMeshBuildSystem",
        system(world) {
          const procedural = world.getResource(proceduralSnapshotResource);
          if (!procedural?.walkability) return;
          const current = world.getResource(navigationSnapshotResource) ?? {};
          if (current.navmeshSourceSignature === procedural.signature && current.navmesh2d && current.graph3d) {
            return;
          }
          const navmesh2d = createNavMeshFromWalkability(procedural, {
            sourceSignature: procedural.signature
          });
          const graph3d = create3DNavigationGraph(navmesh2d, {
            links3d: procedural.links3d ?? []
          });
          world.setResource(navigationSnapshotResource, {
            ...current,
            navmeshSourceSignature: procedural.signature,
            navmesh2d,
            graph3d,
            debug: {
              ...(current.debug ?? {}),
              navmeshCells: navmesh2d.cells.length,
              portals: navmesh2d.portals.length,
              blockedRegions: navmesh2d.blockedRegions.length,
              graph3dLinks: graph3d.links.length
            }
          });
        }
      }
    ],
    initWorld({ world }) {
      if (!world.hasResource(navigationSnapshotResource)) {
        world.setResource(navigationSnapshotResource, {
          navmesh2d: null,
          graph3d: null,
          navmeshSourceSignature: null,
          debug: {}
        });
      }
    },
    install({ engine, world }) {
      engine.navmesh = {
        snapshot() {
          return world.getResource(navigationSnapshotResource);
        },
        rebuild() {
          const procedural = world.getResource(proceduralSnapshotResource);
          if (!procedural?.walkability) return null;
          const navmesh2d = createNavMeshFromWalkability(procedural, {
            sourceSignature: procedural.signature
          });
          const graph3d = create3DNavigationGraph(navmesh2d, {
            links3d: procedural.links3d ?? []
          });
          const current = world.getResource(navigationSnapshotResource) ?? {};
          world.setResource(navigationSnapshotResource, {
            ...current,
            navmeshSourceSignature: procedural.signature,
            navmesh2d,
            graph3d
          });
          return world.getResource(navigationSnapshotResource);
        }
      };
    },
    metadata: {
      navmesh: true,
      variants: ["navmesh2d", "navmesh3d"]
    }
  });

  return {
    ...kit,
    bindings: {
      ...kit.bindings,
      navigation() {
        return {
          __nexusNavMeshBinding: true,
          navigationSnapshotResource
        };
      }
    }
  };
}
