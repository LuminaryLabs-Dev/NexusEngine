import { createDomainKit } from "../../../../../domain-kit.js";
import { createRouteFieldServices } from "./services.js";
import { createRouteFieldState } from "./state.js";

export { normalizeRouteField, queryNearestRouteMarker } from "./contracts.js";

export function createRouteFieldKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "route-field-kit",
    id: config.id ?? "route-field-kit",
    domain: "route-field",
    domainPath: "n:world:navigation:route-field",
    parentDomainPath: "n:world:navigation",
    apiName: "routeField",
    requires: ["n:world"],
    provides: ["n:world:navigation:route-field", "navigation:route-field"],
    config,
    initialState: createRouteFieldState(config),
    createApi({ baseApi }) {
      return createRouteFieldServices(baseApi);
    },
    metadata: { rendererAgnostic: true, historicalSource: "src/route-field-kit.js@a9adca5" }
  });
}

export default createRouteFieldKit;
