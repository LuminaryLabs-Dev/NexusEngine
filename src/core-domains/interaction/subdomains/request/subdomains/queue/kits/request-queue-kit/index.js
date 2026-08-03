import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createRequestQueueServices } from "./services.js";
import { createRequestQueueState, normalizeRequestQueueConfig } from "./contracts.js";

export { advanceRequestQueue, createRequestQueueState, normalizeQueuedRequest, normalizeRequestQueueConfig } from "./contracts.js";

export function createRequestQueueKit(config = {}) {
  const normalized = normalizeRequestQueueConfig(config);
  return createDomainKit({ ...config, manifestId: "request-queue-kit", id: config.id ?? "request-queue-kit", domain: "request-queue", domainPath: "n:interaction:request:queue", parentDomainPath: "n:interaction:request", apiName: "requestQueue", requires: ["n:interaction"], provides: ["n:interaction:request:queue", "interaction:request-queue"], config: normalized, initialState: createRequestQueueState(normalized), eventNames: ["configured", "updated", "reset", "snapshotLoaded", "added", "fulfilled", "expired"], createApi({ baseApi }) { return createRequestQueueServices(baseApi); }, metadata: { rendererAgnostic: true, effectIndependent: true, historicalSource: "src/request-queue-kit.js@a9adca5" } });
}

export default createRequestQueueKit;
