import { defineEvent } from "../../../../../../ecs.js";
import { createDomainKit } from "../../../../../domain-kit.js";
import { createTerrainServices } from "./services.js";
import { createTerrainState } from "./state.js";

export { bakeTerrainCell, normalizeTerrainConfig, sampleTerrain, terrainLayers, terrainSplineBounds } from "./contracts.js";
export { createTerrainQuery } from "./services.js";

export const TerrainCellPrepared = defineEvent("terrain.cellPrepared");
export const TerrainCellReleased = defineEvent("terrain.cellReleased");

export function createTerrainKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "terrain-kit",
    id: config.id ?? "terrain-kit",
    domain: "terrain",
    domainPath: "n:world:terrain",
    parentDomainPath: "n:world",
    apiName: "terrain",
    requires: ["n:world"],
    provides: ["n:world:terrain", "world:terrain-sampling", "world:terrain-provider"],
    config,
    initialState: createTerrainState(config),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "terrainCellPrepared", "terrainCellReleased"],
    events: { TerrainCellPrepared, TerrainCellReleased },
    createApi({ baseApi }) {
      return createTerrainServices(baseApi);
    },
    metadata: { rendererAgnostic: true, deterministic: true, historicalSource: "src/terrain-kit.js@a9adca5", preservedCommit: "8b57b03904889c2" }
  });
}

export default createTerrainKit;
