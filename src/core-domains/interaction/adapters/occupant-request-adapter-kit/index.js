import { createDomainKit } from "../../../domain-kit.js";
import { createOccupantRequests } from "./contracts.js";
import { createOccupantRequestAdapterServices } from "./services.js";
import { createOccupantRequestAdapterState } from "./state.js";

export { createOccupantRequests } from "./contracts.js";

export function createOccupantRequestAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "occupant-request-adapter-kit",
    id: config.id ?? "occupant-request-adapter-kit",
    domain: "occupant-request",
    domainPath: "n:interaction:request:queue",
    parentDomainPath: "n:interaction:request",
    apiName: "occupantRequest",
    requires: ["operations:occupant-flow", "interaction:request-queue"],
    provides: ["interaction:occupant-request-adapter"],
    initialState: createOccupantRequestAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.requestQueue?.add) throw new TypeError("Occupant Request requires the public Request Queue API.");
      return createOccupantRequestAdapterServices(baseApi, engine.n.requestQueue);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createOccupantRequestAdapterKit;
