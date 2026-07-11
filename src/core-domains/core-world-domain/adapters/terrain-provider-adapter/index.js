import { defineWorldEffectProvider, createWorldEffect } from "../../kits/world-effect-provider-kit/index.js";

export function createTerrainProviderAdapter({ terrain, id = "terrain-provider" } = {}) {
  if (!terrain) throw new TypeError("Terrain adapter requires a terrain kit or terrain API.");
  return defineWorldEffectProvider({
    id,
    phase: "foundation",
    provides: ["terrain-height", "terrain-normal", "terrain-material", "terrain-descriptor"],
    build({ world, cell, surface }) {
      const payload = typeof terrain.buildCell === "function"
        ? terrain.buildCell({ worldId: world.id, cell, surface, seed: `${cell.seed}:terrain` })
        : {
            heightAt: terrain.heightAt ?? terrain.getHeight,
            normalAt: terrain.normalAt ?? terrain.getNormal,
            materialAt: terrain.materialAt,
            descriptor: terrain.getPatchDescriptor?.(...cell.coordinates, cell.bounds?.maxX - cell.bounds?.minX)
          };
      return createWorldEffect({ id: `${cell.id}:terrain`, providerId: id, worldId: world.id, cellId: cell.id, kind: "terrain", payload, capabilities: ["terrain-height", "terrain-normal", "terrain-material", "terrain-descriptor"] });
    },
    release(effect) { terrain.releaseCell?.(effect.cellId); }
  });
}
