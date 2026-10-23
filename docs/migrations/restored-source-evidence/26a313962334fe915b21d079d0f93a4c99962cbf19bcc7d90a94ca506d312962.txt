import { defineRuntimeKit } from "./runtime-kit.js";
import {
  CommonGameComponents,
  CommonGameEvents,
  CommonGameResources,
  commonGameDefinitions
} from "./common-game-definitions.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashString(value) {
  const input = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed = "nexus") {
  let state = hashString(seed) || 1;
  return {
    next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return ((state >>> 0) / 4294967296);
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    pick(items, fallback = null) {
      if (!items?.length) return fallback;
      return items[Math.floor(this.next() * items.length) % items.length];
    }
  };
}

function algorithm(kind, params = {}) {
  return Object.freeze({
    kind,
    id: params.id ?? kind,
    params: Object.freeze({ ...params })
  });
}

export const proceduralAlgorithms = Object.freeze({
  seededNoise: (config = {}) => algorithm("seededNoise", config),
  cellular: (config = {}) => algorithm("cellular", config),
  roomGraph: (config = {}) => algorithm("roomGraph", config),
  corridors: (config = {}) => algorithm("corridors", config),
  biomes: (config = {}) => algorithm("biomes", config),
  scatter: (config = {}) => algorithm("scatter", config),
  spawnTable: (config = {}) => algorithm("spawnTable", config),
  routeMarkers: (config = {}) => algorithm("routeMarkers", config)
});

function normalizeConfig(config = {}) {
  const size = config.size ?? {};
  return {
    id: config.id ?? "procedural-space",
    seed: String(config.seed ?? "nexus-procedural"),
    width: Math.max(12, Math.floor(number(size.width ?? config.width, 36))),
    height: Math.max(12, Math.floor(number(size.height ?? config.height, 26))),
    cellSize: Math.max(0.25, number(config.cellSize, 2)),
    roomCount: Math.max(2, Math.floor(number(config.roomCount, 8))),
    roomSize: {
      min: Math.max(3, Math.floor(number(config.roomSize?.min, 4))),
      max: Math.max(4, Math.floor(number(config.roomSize?.max, 8)))
    },
    obstacleDensity: clamp(number(config.obstacleDensity, 0.08), 0, 0.55),
    obstacleCount: config.obstacleCount === undefined ? null : Math.max(0, Math.floor(number(config.obstacleCount, 0))),
    spawnCount: Math.max(0, Math.floor(number(config.spawnCount, 16))),
    biomeCount: Math.max(1, Math.floor(number(config.biomeCount, 4))),
    biomes: (config.biomes?.length ? config.biomes : ["stone", "moss", "sand", "crystal"]).slice(),
    algorithms: (config.algorithms?.length
      ? config.algorithms
      : [
        proceduralAlgorithms.roomGraph(),
        proceduralAlgorithms.corridors(),
        proceduralAlgorithms.cellular({ obstacleDensity: config.obstacleDensity ?? 0.08 }),
        proceduralAlgorithms.biomes(),
        proceduralAlgorithms.scatter(),
        proceduralAlgorithms.spawnTable(),
        proceduralAlgorithms.routeMarkers()
      ])
  };
}

function keyOf(x, y) {
  return `${x},${y}`;
}

function makeCell(config, x, y) {
  const originX = -config.width * config.cellSize * 0.5;
  const originZ = -config.height * config.cellSize * 0.5;
  return {
    x,
    y,
    key: keyOf(x, y),
    walkable: false,
    cost: Infinity,
    biome: null,
    material: "void",
    regionId: null,
    world: {
      x: originX + (x + 0.5) * config.cellSize,
      y: 0,
      z: originZ + (y + 0.5) * config.cellSize
    }
  };
}

function gridIndex(config, x, y) {
  return y * config.width + x;
}

function getCell(cells, config, x, y) {
  if (x < 0 || y < 0 || x >= config.width || y >= config.height) return null;
  return cells[gridIndex(config, x, y)];
}

function rectsOverlap(a, b, padding = 1) {
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  );
}

function carveRoom(cells, config, room) {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      const cell = getCell(cells, config, x, y);
      if (!cell) continue;
      cell.walkable = true;
      cell.cost = 1;
      cell.regionId = room.id;
      cell.material = "floor";
    }
  }
}

function carveCorridor(cells, config, from, to, id) {
  const corridorCells = [];
  const horizontalFirst = hashString(`${config.seed}:${id}`) % 2 === 0;
  const carve = (x, y) => {
    const cell = getCell(cells, config, x, y);
    if (!cell) return;
    cell.walkable = true;
    cell.cost = Math.min(number(cell.cost, 1.15), 1.15);
    cell.regionId = cell.regionId ?? id;
    cell.material = cell.material === "void" ? "corridor" : cell.material;
    corridorCells.push(cell.key);
  };
  const carveHorizontal = (x0, x1, y) => {
    const step = x0 <= x1 ? 1 : -1;
    for (let x = x0; x !== x1 + step; x += step) carve(x, y);
  };
  const carveVertical = (y0, y1, x) => {
    const step = y0 <= y1 ? 1 : -1;
    for (let y = y0; y !== y1 + step; y += step) carve(x, y);
  };

  if (horizontalFirst) {
    carveHorizontal(from.x, to.x, from.y);
    carveVertical(from.y, to.y, to.x);
  } else {
    carveVertical(from.y, to.y, from.x);
    carveHorizontal(from.x, to.x, to.y);
  }

  return {
    id,
    from: { ...from },
    to: { ...to },
    cells: Array.from(new Set(corridorCells))
  };
}

function assignBiomes(cells, config) {
  const biomeNames = config.biomes.slice(0, config.biomeCount);
  for (const cell of cells) {
    if (!cell.walkable) continue;
    const n = Math.sin((cell.x + hashString(config.seed) * 0.001) * 0.37) +
      Math.cos((cell.y - hashString(config.seed) * 0.001) * 0.29);
    const index = Math.abs(Math.floor((n + 2) * 1.7)) % biomeNames.length;
    cell.biome = biomeNames[index];
    cell.material = cell.material === "corridor" ? "corridor" : cell.biome;
    cell.cost = Number((1 + index * 0.12).toFixed(3));
  }
}

function placeObstacles(cells, config, rooms, rng) {
  const protectedKeys = new Set();
  for (const room of rooms) {
    protectedKeys.add(keyOf(room.center.x, room.center.y));
  }
  protectedKeys.add(keyOf(rooms[0]?.center.x, rooms[0]?.center.y));
  protectedKeys.add(keyOf(rooms[rooms.length - 1]?.center.x, rooms[rooms.length - 1]?.center.y));

  const candidates = cells.filter((cell) => cell.walkable && !protectedKeys.has(cell.key));
  const target = config.obstacleCount ?? Math.floor(candidates.length * config.obstacleDensity);
  const blocked = [];
  for (let index = 0; index < target && candidates.length > 0; index += 1) {
    const candidateIndex = rng.int(0, candidates.length - 1);
    const [cell] = candidates.splice(candidateIndex, 1);
    cell.walkable = false;
    cell.cost = Infinity;
    cell.material = "blocked";
    cell.blockedReason = "obstacle";
    blocked.push({
      x: cell.x,
      y: cell.y,
      key: cell.key,
      world: cell.world,
      reason: cell.blockedReason
    });
  }
  return blocked;
}

function createRooms(config, rng) {
  const rooms = [];
  const attempts = config.roomCount * 18;
  for (let attempt = 0; attempt < attempts && rooms.length < config.roomCount; attempt += 1) {
    const width = rng.int(config.roomSize.min, config.roomSize.max);
    const height = rng.int(config.roomSize.min, config.roomSize.max);
    const x = rng.int(1, Math.max(1, config.width - width - 2));
    const y = rng.int(1, Math.max(1, config.height - height - 2));
    const room = {
      id: `room-${rooms.length + 1}`,
      type: "room",
      x,
      y,
      width,
      height,
      bounds: { x, y, width, height },
      center: {
        x: x + Math.floor(width * 0.5),
        y: y + Math.floor(height * 0.5)
      },
      layer: rooms.length % 3
    };
    if (rooms.every((existing) => !rectsOverlap(room, existing, 1))) {
      rooms.push(room);
    }
  }

  if (rooms.length < 2) {
    rooms.push(
      { id: "room-1", type: "room", x: 2, y: 2, width: 6, height: 6, bounds: { x: 2, y: 2, width: 6, height: 6 }, center: { x: 5, y: 5 }, layer: 0 },
      { id: "room-2", type: "room", x: config.width - 8, y: config.height - 8, width: 6, height: 6, bounds: { x: config.width - 8, y: config.height - 8, width: 6, height: 6 }, center: { x: config.width - 5, y: config.height - 5 }, layer: 1 }
    );
  }

  rooms.sort((a, b) => (a.center.x + a.center.y) - (b.center.x + b.center.y));
  return rooms.map((room, index) => ({
    ...room,
    id: `room-${index + 1}`,
    layer: index % 3
  }));
}

function makeSpawnPoints(cells, config, rng) {
  const walkable = cells.filter((cell) => cell.walkable);
  const points = [];
  const types = ["pickup", "hazard", "npc", "resource"];
  for (let index = 0; index < config.spawnCount && walkable.length > 0; index += 1) {
    const cell = rng.pick(walkable);
    points.push({
      id: `spawn-${index + 1}`,
      kind: rng.pick(types, "pickup"),
      cell: { x: cell.x, y: cell.y },
      position: { ...cell.world },
      biome: cell.biome,
      tags: ["procedural", cell.biome].filter(Boolean)
    });
  }
  return points;
}

function makeRenderDescriptors(rooms, corridors, blockedCells, spawnPoints) {
  return [
    ...rooms.map((room) => ({
      id: room.id,
      kind: "region",
      shape: "rect",
      bounds: room.bounds,
      biome: room.biome,
      layer: room.layer
    })),
    ...corridors.map((corridor) => ({
      id: corridor.id,
      kind: "corridor",
      cells: corridor.cells
    })),
    ...blockedCells.map((cell) => ({
      id: `blocked-${cell.key}`,
      kind: "obstacle",
      cell: { x: cell.x, y: cell.y },
      position: cell.world
    })),
    ...spawnPoints.map((spawn) => ({
      id: spawn.id,
      kind: "spawn",
      spawnKind: spawn.kind,
      position: spawn.position
    }))
  ];
}

export function createProceduralSnapshot(configInput = {}) {
  const config = normalizeConfig(configInput);
  const rng = createSeededRandom(config.seed);
  const cells = [];
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      cells.push(makeCell(config, x, y));
    }
  }

  const rooms = createRooms(config, rng);
  for (const room of rooms) {
    carveRoom(cells, config, room);
  }

  const corridors = [];
  for (let index = 1; index < rooms.length; index += 1) {
    corridors.push(carveCorridor(
      cells,
      config,
      rooms[index - 1].center,
      rooms[index].center,
      `corridor-${index}`
    ));
  }

  assignBiomes(cells, config);
  const blockedCells = placeObstacles(cells, config, rooms, rng);
  const spawnPoints = makeSpawnPoints(cells, config, rng);
  const startCell = getCell(cells, config, rooms[0].center.x, rooms[0].center.y);
  const exitCell = getCell(cells, config, rooms[rooms.length - 1].center.x, rooms[rooms.length - 1].center.y);
  if (startCell) {
    startCell.walkable = true;
    startCell.cost = 1;
  }
  if (exitCell) {
    exitCell.walkable = true;
    exitCell.cost = 1;
  }

  const regions = rooms.map((room) => {
    const cell = getCell(cells, config, room.center.x, room.center.y);
    return {
      id: room.id,
      type: "room",
      bounds: room.bounds,
      center: cell?.world ?? { x: room.center.x, y: 0, z: room.center.y },
      cell: { ...room.center },
      biome: cell?.biome ?? "stone",
      material: cell?.material ?? "floor",
      layer: room.layer
    };
  });
  const graphNodes = regions.map((region) => ({
    id: region.id,
    cell: region.cell,
    position: region.center,
    layer: region.layer
  }));
  const graphEdges = corridors.map((corridor, index) => ({
    id: `edge-${index + 1}`,
    from: rooms[index].id,
    to: rooms[index + 1].id,
    cells: corridor.cells
  }));
  const objectiveMarkers = [
    { id: "start", kind: "start", cell: startCell ? { x: startCell.x, y: startCell.y } : { x: 0, y: 0 }, position: startCell?.world ?? { x: 0, y: 0, z: 0 } },
    { id: "exit", kind: "exit", cell: exitCell ? { x: exitCell.x, y: exitCell.y } : { x: config.width - 1, y: config.height - 1 }, position: exitCell?.world ?? { x: 0, y: 0, z: 0 } }
  ];
  const walkabilityCells = cells.map((cell) => ({
    x: cell.x,
    y: cell.y,
    key: cell.key,
    walkable: cell.walkable,
    cost: Number.isFinite(cell.cost) ? cell.cost : Infinity,
    biome: cell.biome,
    material: cell.material,
    regionId: cell.regionId,
    world: cell.world
  }));
  const snapshot = {
    id: config.id,
    seed: config.seed,
    version: 1,
    width: config.width,
    height: config.height,
    cellSize: config.cellSize,
    algorithms: config.algorithms.map((entry) => ({ kind: entry.kind, id: entry.id, params: entry.params })),
    regions,
    rooms: regions,
    corridors,
    cells: walkabilityCells,
    blockedCells,
    spawnPoints,
    objectiveMarkers,
    renderDescriptors: makeRenderDescriptors(regions, corridors, blockedCells, spawnPoints),
    walkability: {
      width: config.width,
      height: config.height,
      cellSize: config.cellSize,
      origin: {
        x: -config.width * config.cellSize * 0.5,
        z: -config.height * config.cellSize * 0.5
      },
      cells: walkabilityCells
    },
    graph: {
      nodes: graphNodes,
      edges: graphEdges
    },
    links3d: graphEdges
      .filter((edge, index) => index % 2 === 0)
      .map((edge, index) => ({
        id: `vertical-link-${index + 1}`,
        from: edge.from,
        to: edge.to,
        kind: index % 3 === 0 ? "ramp" : "jump",
        costMultiplier: index % 3 === 0 ? 1.2 : 1.6
      }))
  };
  snapshot.signature = hashString(stableStringify({
    seed: snapshot.seed,
    rooms: snapshot.rooms.map((room) => ({ id: room.id, cell: room.cell, bounds: room.bounds })),
    corridors: snapshot.corridors.map((corridor) => corridor.cells),
    blocked: snapshot.blockedCells.map((cell) => cell.key),
    spawn: snapshot.spawnPoints.map((spawn) => ({ kind: spawn.kind, key: `${spawn.cell.x},${spawn.cell.y}` }))
  })).toString(16);
  return snapshot;
}

export function createProceduralQuery(world, kit = {}) {
  const resource = kit.resources?.ProceduralSnapshot ?? kit.definitions?.resources?.ProceduralSnapshot ?? CommonGameResources.ProceduralSnapshot;
  const current = () => world.getResource(resource);
  return {
    snapshot: current,
    get signature() {
      return current()?.signature ?? null;
    },
    cellAt(x, y) {
      const snapshot = current();
      if (!snapshot) return null;
      return snapshot.cells?.find((cell) => cell.x === x && cell.y === y) ?? null;
    },
    worldToCell(point = {}) {
      const snapshot = current();
      if (!snapshot) return null;
      const origin = snapshot.walkability?.origin ?? { x: 0, z: 0 };
      return {
        x: Math.floor((number(point.x) - origin.x) / snapshot.cellSize),
        y: Math.floor((number(point.z ?? point.y) - origin.z) / snapshot.cellSize)
      };
    },
    cellToWorld(cell = {}) {
      const snapshot = current();
      if (!snapshot) return { x: 0, y: 0, z: 0 };
      const origin = snapshot.walkability?.origin ?? { x: 0, z: 0 };
      return {
        x: origin.x + (number(cell.x) + 0.5) * snapshot.cellSize,
        y: 0,
        z: origin.z + (number(cell.y) + 0.5) * snapshot.cellSize
      };
    },
    walkableAt(x, y) {
      return this.cellAt(x, y)?.walkable === true;
    }
  };
}

export function createProceduralKit(options = {}) {
  const config = normalizeConfig(options);
  const definitions = commonGameDefinitions;
  const stateResource = CommonGameResources.ProceduralState;
  const snapshotResource = CommonGameResources.ProceduralSnapshot;

  const kit = defineRuntimeKit({
    id: options.id ?? "procedural-kit",
    components: {
      GeneratedFeature: CommonGameComponents.GeneratedFeature,
      ProceduralRegion: CommonGameComponents.ProceduralRegion
    },
    resources: {
      ProceduralState: stateResource,
      ProceduralSnapshot: snapshotResource
    },
    events: {
      ProceduralGenerated: CommonGameEvents.ProceduralGenerated,
      ProceduralInvalidated: CommonGameEvents.ProceduralInvalidated
    },
    provides: ["procedural", "walkability-source"],
    bindings: {
      procedural: {
        snapshotResource,
        stateResource
      },
      walkability: {
        snapshotResource
      }
    },
    systems: [
      {
        phase: "simulate",
        name: "ProceduralGenerationSystem",
        system(world) {
          const state = world.getResource(stateResource);
          const previous = world.getResource(snapshotResource);
          if (!state) return;
          if (previous?.signature && state.dirty !== true && previous.seed === state.seed) return;

          const snapshot = createProceduralSnapshot({
            ...state.config,
            seed: state.seed
          });
          state.dirty = false;
          state.version = (state.version ?? 0) + 1;
          state.lastSignature = snapshot.signature;
          world.setResource(stateResource, state);
          world.setResource(snapshotResource, snapshot);
          world.emit(CommonGameEvents.ProceduralGenerated, {
            seed: snapshot.seed,
            signature: snapshot.signature,
            roomCount: snapshot.rooms.length,
            corridorCount: snapshot.corridors.length,
            walkableCount: snapshot.cells.filter((cell) => cell.walkable).length
          });
        }
      }
    ],
    initWorld({ world }) {
      world.setResource(stateResource, {
        id: config.id,
        seed: config.seed,
        config,
        dirty: true,
        version: 0
      });
      world.setResource(snapshotResource, null);
    },
    install({ engine, world }) {
      engine.procedural = {
        regenerate(next = {}) {
          const state = world.getResource(stateResource) ?? { config };
          const nextConfig = typeof next === "string" ? { seed: next } : next;
          state.seed = String(nextConfig.seed ?? state.seed ?? config.seed);
          state.config = {
            ...(state.config ?? config),
            ...nextConfig,
            seed: state.seed
          };
          state.dirty = true;
          world.setResource(stateResource, state);
          world.emit(CommonGameEvents.ProceduralInvalidated, {
            seed: state.seed
          });
          return state;
        },
        snapshot() {
          return world.getResource(snapshotResource);
        },
        query() {
          return createProceduralQuery(world, kit);
        }
      };
    },
    metadata: {
      procedural: true,
      deterministic: true,
      algorithms: config.algorithms.map((entry) => entry.kind)
    }
  });

  return {
    ...kit,
    definitions,
    config,
    bindings: {
      ...kit.bindings,
      navigation() {
        return {
          __nexusProceduralNavigationBinding: true,
          snapshotResource,
          stateResource,
          walkabilityResource: snapshotResource
        };
      }
    }
  };
}
