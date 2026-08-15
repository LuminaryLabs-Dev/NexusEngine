import { createDomainKit } from "../../../../../domain-kit.js";
import { createNavMeshState } from "./state.js";
import { createNavMeshServices } from "./services.js";

export { create3DNavigationGraph, createNavMeshFromWalkability, nearestNavigationWaypoint, normalizeWalkability } from "./contracts.js";

export function createNavMeshKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "navmesh-kit",
    id: config.id ?? "navmesh-kit",
    domain: "navmesh",
    domainPath: "n:world:navigation:navmesh",
    parentDomainPath: "n:world:navigation",
    apiName: "navmesh",
    requires: ["navigation:walkability-source"],
    provides: ["n:world:navigation:navmesh", "navigation:navmesh", "navigation:graph"],
    config,
    initialState: createNavMeshState(config),
    createApi({ baseApi }) {
      return createNavMeshServices(baseApi);
    },
    metadata: { rendererAgnostic: true, historicalSource: "src/navmesh-kit.js@a9adca5" }
  });
}

export default createNavMeshKit;
