import {
  createWorldEffectReference,
  defineWorldEffectProvider
} from "../../kits/world-effect-provider-kit/index.js";
import { clonePortableValue, inspectPortableValue } from "../../portable.js";

function terrainMetadata(terrain = {}) {
  const config = terrain.config ?? terrain.getConfig?.() ?? {};
  return {
    id: String(config.id ?? terrain.id ?? "terrain"),
    preset: config.preset ?? null,
    chunkSize: Number(config.chunks?.size ?? config.chunkSize ?? 0),
    layers: (config.layers ?? []).map((layer) => String(layer.kind ?? layer.id ?? layer)).slice(0, 32)
  };
}

function legacyCellDescriptor(terrain, world, cell, surface, version) {
  const bounds = cell.bounds ?? {};
  const width = Number(bounds.maxX) - Number(bounds.minX);
  const depth = Number(bounds.maxZ) - Number(bounds.minZ);
  const gridCoordinates = cell.coordinates?.length === 2 ? cell.coordinates : null;
  let patchDescriptor = null;
  if (gridCoordinates && typeof terrain.getPatchDescriptor === "function") {
    patchDescriptor = terrain.getPatchDescriptor(gridCoordinates[0], gridCoordinates[1], Math.max(width, depth));
    if (!inspectPortableValue(patchDescriptor).portable) patchDescriptor = null;
  }
  return {
    terrain: terrainMetadata(terrain),
    cellId: cell.id,
    seed: `${cell.seed}:terrain`,
    version,
    bounds: clonePortableValue(bounds, "terrain-cell-bounds"),
    lod: cell.lod,
    level: cell.level,
    surfaceId: surface?.id ?? null,
    partitionId: cell.partitionId,
    queryCapabilityId: `${world.id}:terrain-query`,
    patchDescriptor
  };
}

export function createTerrainProviderAdapter({ terrain, id = "terrain-provider", critical = true } = {}) {
  if (!terrain) throw new TypeError("Terrain adapter requires a terrain kit or terrain API.");
  const cells = new Map();

  function buildRuntimeState(command, previous = null) {
    const { world, cell, surface } = command;
    const version = Number(previous?.version ?? 0) + 1;
    const build = terrain.prepareCell ?? terrain.buildCell;
    let result = null;
    if (typeof build === "function") {
      result = build.call(terrain, {
        worldId: world.id,
        cell,
        surface,
        seed: `${cell.seed}:terrain`,
        previous: previous?.runtimeHandle ?? null
      });
      if (result && typeof result.then === "function") return result;
    }
    const candidateDescriptor = result?.descriptor ?? result?.effectDescriptor;
    const descriptor = candidateDescriptor && inspectPortableValue(candidateDescriptor).portable
      ? clonePortableValue(candidateDescriptor, "terrain-effect-descriptor")
      : legacyCellDescriptor(terrain, world, cell, surface, version);
    const runtimeState = {
      cellId: cell.id,
      version,
      descriptor,
      runtimeHandle: result?.runtimeHandle ?? result?.handle ?? (candidateDescriptor ? null : result)
    };
    cells.set(cell.id, runtimeState);
    return runtimeState;
  }

  const provider = defineWorldEffectProvider({
    id,
    kind: "terrain",
    phase: "foundation",
    critical,
    provides: ["terrain-height", "terrain-normal", "terrain-material", "terrain-descriptor"],
    prepareCell(command) {
      const state = buildRuntimeState(command);
      if (state && typeof state.then === "function") return state;
      return createWorldEffectReference({
        id: `${command.cell.id}:terrain`,
        providerId: id,
        worldId: command.world.id,
        cellId: command.cell.id,
        kind: "terrain",
        version: state.version,
        capabilities: ["terrain-height", "terrain-normal", "terrain-material", "terrain-descriptor"],
        descriptor: state.descriptor
      });
    },
    updateCell(command) {
      const existing = cells.get(command.cell.id) ?? null;
      const update = terrain.updateCell;
      if (typeof update === "function") {
        const result = update.call(terrain, {
          worldId: command.world.id,
          cell: command.cell,
          previousCell: command.previousCell,
          changes: command.changes,
          surface: command.surface,
          seed: `${command.cell.seed}:terrain`,
          previous: existing?.runtimeHandle ?? null
        });
        if (result && typeof result.then === "function") return result;
        if (result != null) {
          const version = Number(existing?.version ?? 0) + 1;
          const descriptor = result?.descriptor && inspectPortableValue(result.descriptor).portable
            ? clonePortableValue(result.descriptor, "terrain-effect-descriptor")
            : legacyCellDescriptor(terrain, command.world, command.cell, command.surface, version);
          cells.set(command.cell.id, {
            cellId: command.cell.id,
            version,
            descriptor,
            runtimeHandle: result.runtimeHandle ?? result.handle ?? result
          });
        } else buildRuntimeState(command, existing);
      } else buildRuntimeState(command, existing);
      return provider.getEffectDescriptor(command.cell.id, command);
    },
    releaseCell(command) {
      const existing = cells.get(command.cell.id);
      if (typeof terrain.releaseCell === "function") terrain.releaseCell.call(terrain, command.cell.id, existing?.runtimeHandle ?? null, command);
      cells.delete(command.cell.id);
    },
    getEffectDescriptor(cellId, command = {}) {
      const state = cells.get(cellId);
      if (!state) return null;
      return createWorldEffectReference({
        id: `${cellId}:terrain`,
        providerId: id,
        worldId: command.world?.id ?? command.effect?.worldId ?? "world",
        cellId,
        kind: "terrain",
        version: state.version,
        capabilities: ["terrain-height", "terrain-normal", "terrain-material", "terrain-descriptor"],
        descriptor: state.descriptor
      });
    },
    snapshot() {
      return {
        terrain: terrainMetadata(terrain),
        cells: [...cells.values()]
          .map(({ cellId, version, descriptor }) => ({ cellId, version, descriptor }))
          .sort((a, b) => a.cellId.localeCompare(b.cellId))
      };
    },
    restoreSnapshot(snapshot = {}) {
      cells.clear();
      for (const entry of snapshot.cells ?? []) {
        cells.set(entry.cellId, {
          cellId: entry.cellId,
          version: Number(entry.version ?? 1),
          descriptor: clonePortableValue(entry.descriptor ?? {}, "terrain-restored-descriptor"),
          runtimeHandle: null
        });
      }
    },
    reset() {
      cells.clear();
      terrain.resetCells?.();
    }
  });

  return Object.freeze({
    ...provider,
    getCellState(cellId) { return cells.get(cellId) ?? null; },
    listCellDescriptors() {
      return [...cells.values()].map(({ cellId, version, descriptor }) => ({ cellId, version, descriptor: clonePortableValue(descriptor) }));
    }
  });
}
