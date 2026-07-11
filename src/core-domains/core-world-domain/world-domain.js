import { createCoreCapabilityKit } from "../../core-kits/core-capability-kit.js";
import { createWorldBuilderRuntime } from "./kits/world-builder-runtime-kit/index.js";
import { createInitialWorldState } from "./state.js";

export function createCoreWorldDomain(config = {}) {
  const runtime = createWorldBuilderRuntime();
  return createCoreCapabilityKit({
    ...config,
    domain: "core-world",
    apiName: config.apiName ?? "coreWorld",
    purpose: "Host-agnostic world identity, partitioning, cells, surfaces, effects, providers, composition, and snapshots.",
    owns: ["world identity", "world definitions", "world partitions", "world cells", "world surfaces", "world effect descriptors", "world provider contracts", "world composition", "world snapshots"],
    doesNotOwn: ["terrain generation", "foliage generation", "renderer meshes", "GPU resources", "physics resolution", "game-specific world content"],
    services: ["world-definition", "world-partition", "world-cell", "world-surface", "world-effects", "world-builder", "world-snapshot"],
    initialState: createInitialWorldState(),
    metadata: { ...(config.metadata ?? {}), piecesFirst: true, coreDomain: true, hostAgnostic: true, rendererAgnostic: true },
    createApi({ baseApi }) {
      return {
        ...baseApi,
        registerWorld: runtime.registerWorld,
        removeWorld: runtime.removeWorld,
        setFocus: runtime.setFocus,
        updateWorld: runtime.updateWorld,
        getWorld: runtime.getWorld,
        getCell: runtime.getCell,
        getActiveCells: runtime.getActiveCells,
        getEffects: runtime.getEffects,
        snapshotWorld: runtime.snapshot,
        resetWorlds: runtime.reset
      };
    }
  });
}
