import { createDomainKit } from "../../../../../domain-kit.js";
import { createRequestFulfillmentServices } from "./services.js";
import { createRequestFulfillmentState, normalizeRequestFulfillmentConfig } from "./contracts.js";

export { createRequestFulfillmentState, normalizeFulfillmentRequest, normalizeRequestFulfillmentConfig, queryNearestOpenRequest } from "./contracts.js";

export function createRequestFulfillmentKit(config = {}) {
  const normalized = normalizeRequestFulfillmentConfig(config);
  return createDomainKit({ ...config, manifestId: "request-fulfillment-kit", id: config.id ?? "request-fulfillment-kit", domain: "request-fulfillment", domainPath: "n:interaction:request:fulfillment", parentDomainPath: "n:interaction:request", apiName: "requestFulfillment", requires: ["n:interaction"], provides: ["n:interaction:request:fulfillment", "interaction:request-fulfillment"], config: normalized, initialState: createRequestFulfillmentState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "created", "completed", "expired"], createApi({ baseApi }) { return createRequestFulfillmentServices(baseApi); }, metadata: { rendererAgnostic: true, effectIndependent: true, historicalSource: "src/request-fulfillment-kit.js@a9adca5" } });
}

export default createRequestFulfillmentKit;
