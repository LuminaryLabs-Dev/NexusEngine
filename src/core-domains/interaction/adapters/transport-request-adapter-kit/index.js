import { createDomainKit } from "../../../domain-kit.js";
import { collectTransportArrivals } from "./contracts.js";
import { createTransportRequestAdapterServices } from "./services.js";
import { createTransportRequestAdapterState } from "./state.js";

export { collectTransportArrivals } from "./contracts.js";

export function createTransportRequestAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "transport-request-adapter-kit",
    id: config.id ?? "transport-request-adapter-kit",
    domain: "transport-request",
    domainPath: "n:interaction:request:queue",
    parentDomainPath: "n:interaction:request",
    apiName: "transportRequest",
    requires: ["operations:transport-route", "interaction:request-queue"],
    provides: ["interaction:transport-request-adapter"],
    initialState: createTransportRequestAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.requestQueue?.fulfill || !engine.n.requestQueue?.listOpen) throw new TypeError("Transport Request requires the public Request Queue API.");
      return createTransportRequestAdapterServices(baseApi, engine.n.requestQueue);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createTransportRequestAdapterKit;
