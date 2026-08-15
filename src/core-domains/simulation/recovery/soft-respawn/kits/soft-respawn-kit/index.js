import { createDomainKit } from "../../../../../domain-kit.js";
import { createSoftRespawnServices } from "./services.js";
import { createSoftRespawnState, normalizeSoftRespawnConfig } from "./contracts.js";

export { createSoftRespawnResult, createSoftRespawnState, normalizeSoftRespawnConfig } from "./contracts.js";

export function createSoftRespawnKit(config = {}) {
  const normalized = normalizeSoftRespawnConfig(config);
  return createDomainKit({
    ...config,
    manifestId: "soft-respawn-kit",
    id: config.id ?? "soft-respawn-kit",
    domain: "soft-respawn",
    domainPath: "n:simulation:recovery:soft-respawn",
    parentDomainPath: "n:simulation:recovery",
    apiName: "softRespawn",
    requires: ["n:simulation"],
    provides: ["n:simulation:recovery:soft-respawn", "simulation:soft-respawn"],
    config: normalized,
    initialState: createSoftRespawnState(normalized),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "recovered"],
    createApi({ baseApi }) { return createSoftRespawnServices(baseApi); },
    metadata: { rendererAgnostic: true, historicalSource: "src/world-physics-kit.js@a9adca5" }
  });
}

export default createSoftRespawnKit;
