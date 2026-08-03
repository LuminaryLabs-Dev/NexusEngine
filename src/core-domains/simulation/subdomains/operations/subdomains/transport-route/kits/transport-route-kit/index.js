import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createTransportRouteServices } from "./services.js";
import { createTransportRouteState, normalizeTransportRouteConfig } from "./contracts.js";

export { advanceTransportRoutes, createTransportRouteState, normalizeTransportRouteConfig } from "./contracts.js";

export function createTransportRouteKit(config = {}) {
  const normalized = normalizeTransportRouteConfig(config);
  return createDomainKit({ ...config, manifestId: "transport-route-kit", id: config.id ?? "transport-route-kit", domain: "transport-route", domainPath: "n:simulation:operations:transport-route", parentDomainPath: "n:simulation:operations", apiName: "transportRoutes", requires: ["n:simulation"], provides: ["n:simulation:operations:transport-route", "operations:transport-route"], config: normalized, initialState: createTransportRouteState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "arrived"], createApi({ baseApi }) { return createTransportRouteServices(baseApi); }, metadata: { rendererAgnostic: true, requestIndependent: true, historicalSource: "src/transport-route-kit.js@a9adca5" } });
}

export default createTransportRouteKit;
