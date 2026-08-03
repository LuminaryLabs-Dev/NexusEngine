import { createDomainKit } from "../../../../../domain-kit.js";
import { createWaterSurfaceServices } from "./services.js";
import { createWaterSurfaceState } from "./state.js";

export { normalizeWaterSurface, queryWaterSurface } from "./contracts.js";

export function createWaterSurfaceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "water-surface-kit",
    id: config.id ?? "water-surface-kit",
    domain: "water-surface",
    domainPath: "n:world:water-surface",
    parentDomainPath: "n:world",
    apiName: "waterSurface",
    requires: ["n:world"],
    provides: ["n:world:water-surface", "world:water-surface", "world:water-query"],
    config,
    initialState: createWaterSurfaceState(config),
    createApi({ baseApi }) {
      return createWaterSurfaceServices(baseApi);
    },
    install({ engine }) {
      if (config.autoAdvance === false) return;
      engine.scheduler.addSystem("simulate", (world) => {
        const tick = world.__nexusTickContext;
        if (!tick) return;
        engine.n.waterSurface.advance({ operationId: `water-tick:${tick.revision}`, delta: tick.delta });
      });
    },
    metadata: { rendererAgnostic: true, deterministic: true, historicalSource: "src/water-surface-kit.js@a9adca5" }
  });
}

export default createWaterSurfaceKit;
