import { clonePortableValue, inspectPortableValue } from "../../portable.js";
import { createWorldFoundationCellProvider } from "../../subdomains/world-foundation-domain/kits/foundation-cell-resolution-kit/index.js";

const TERRAIN_CAPABILITIES = Object.freeze([
  "world-foundation",
  "terrain-height",
  "terrain-normal",
  "terrain-material",
  "terrain-descriptor"
]);

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
    patchDescriptor,
    foundationDomainPath: "n:world:foundation"
  };
}

function normalizeTerrainResult(terrain, command, result, previous = null) {
  const version = Number(previous?.version ?? 0) + 1;
  const candidateDescriptor = result?.descriptor ?? result?.effectDescriptor;
  const descriptor = candidateDescriptor && inspectPortableValue(candidateDescriptor).portable
    ? clonePortableValue(candidateDescriptor, "terrain-effect-descriptor")
    : legacyCellDescriptor(terrain, command.world, command.cell, command.surface, version);
  return {
    descriptor,
    runtimeHandle: result?.runtimeHandle ?? result?.handle ?? (candidateDescriptor ? null : result)
  };
}

export function createTerrainProviderAdapter({ terrain, id = "terrain-provider", critical = true } = {}) {
  if (!terrain) throw new TypeError("Terrain adapter requires a terrain kit or terrain API.");

  return createWorldFoundationCellProvider({
    id,
    kind: "terrain",
    critical,
    capabilities: TERRAIN_CAPABILITIES,
    prepareCell(command, previous) {
      const build = terrain.prepareCell ?? terrain.buildCell;
      const result = typeof build === "function"
        ? build.call(terrain, {
          worldId: command.world.id,
          cell: command.cell,
          surface: command.surface,
          seed: `${command.cell.seed}:terrain`,
          previous: previous?.runtimeHandle ?? null
        })
        : null;
      if (result && typeof result.then === "function") return result;
      return normalizeTerrainResult(terrain, command, result, previous);
    },
    updateCell(command, previous) {
      const update = terrain.updateCell;
      if (typeof update !== "function") {
        const build = terrain.prepareCell ?? terrain.buildCell;
        const result = typeof build === "function"
          ? build.call(terrain, {
            worldId: command.world.id,
            cell: command.cell,
            surface: command.surface,
            seed: `${command.cell.seed}:terrain`,
            previous: previous?.runtimeHandle ?? null
          })
          : null;
        if (result && typeof result.then === "function") return result;
        return normalizeTerrainResult(terrain, command, result, previous);
      }
      const result = update.call(terrain, {
        worldId: command.world.id,
        cell: command.cell,
        previousCell: command.previousCell,
        changes: command.changes,
        surface: command.surface,
        seed: `${command.cell.seed}:terrain`,
        previous: previous?.runtimeHandle ?? null
      });
      if (result && typeof result.then === "function") return result;
      if (result == null && previous) return { descriptor: previous.descriptor, runtimeHandle: previous.runtimeHandle };
      return normalizeTerrainResult(terrain, command, result, previous);
    },
    releaseCell(command, previous) {
      terrain.releaseCell?.call(terrain, command.cell.id, previous?.runtimeHandle ?? null, command);
    },
    snapshot() {
      return { terrain: terrainMetadata(terrain) };
    },
    restoreSnapshot(snapshot = {}) {
      terrain.restoreSnapshot?.(snapshot.terrain ?? snapshot);
    },
    reset() {
      terrain.resetCells?.();
    }
  });
}

export const createWorldFoundationTerrainProviderAdapter = createTerrainProviderAdapter;
