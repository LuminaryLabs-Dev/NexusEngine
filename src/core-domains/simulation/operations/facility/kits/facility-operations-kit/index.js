import { createDomainKit } from "../../../../../domain-kit.js";
import { createFacilityOperationsServices } from "./services.js";
import { createFacilityOperationsState, normalizeFacilityOperationsConfig } from "./contracts.js";

export { advanceFacilities, createFacilityOperationsState, normalizeFacility, normalizeFacilityOperationsConfig } from "./contracts.js";

export function createFacilityOperationsKit(config = {}) {
  const normalized = normalizeFacilityOperationsConfig(config);
  return createDomainKit({ ...config, manifestId: "facility-operations-kit", id: config.id ?? "facility-operations-kit", domain: "facility-operations", domainPath: "n:simulation:operations:facility", parentDomainPath: "n:simulation:operations", apiName: "facilityOperations", requires: ["n:simulation"], provides: ["n:simulation:operations:facility", "operations:facility"], config: normalized, initialState: createFacilityOperationsState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "outputproduced"], createApi({ baseApi }) { return createFacilityOperationsServices(baseApi); }, metadata: { rendererAgnostic: true, economyIndependent: true, historicalSource: "src/facility-operations-kit.js@a9adca5" } });
}

export default createFacilityOperationsKit;
