import { createDomainKit } from "../../../../../domain-kit.js";
import { createOccupantFlowServices } from "./services.js";
import { createOccupantFlowState, normalizeOccupantFlowConfig } from "./contracts.js";

export { advanceOccupantFlow, createOccupantFlowState, normalizeOccupant, normalizeOccupantFlowConfig } from "./contracts.js";

export function createOccupantFlowKit(config = {}) {
  const normalized = normalizeOccupantFlowConfig(config);
  return createDomainKit({ ...config, manifestId: "occupant-flow-kit", id: config.id ?? "occupant-flow-kit", domain: "occupant-flow", domainPath: "n:simulation:operations:occupant-flow", parentDomainPath: "n:simulation:operations", apiName: "occupantFlow", requires: ["n:simulation"], provides: ["n:simulation:operations:occupant-flow", "operations:occupant-flow"], config: normalized, initialState: createOccupantFlowState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "spawned", "served"], createApi({ baseApi }) { return createOccupantFlowServices(baseApi); }, metadata: { rendererAgnostic: true, requestIndependent: true, historicalSource: "src/occupant-flow-kit.js@a9adca5" } });
}

export default createOccupantFlowKit;
