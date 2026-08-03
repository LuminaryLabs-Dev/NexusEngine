import { createDomainKit } from "../../../domain-kit.js";
import { collectRequestEconomyTransfers } from "./contracts.js";
import { createRequestEconomyAdapterServices } from "./services.js";
import { createRequestEconomyAdapterState } from "./state.js";

export { collectRequestEconomyTransfers } from "./contracts.js";

export function createRequestEconomyAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "request-economy-adapter-kit",
    id: config.id ?? "request-economy-adapter-kit",
    domain: "request-economy",
    domainPath: "n:interaction:request:queue",
    parentDomainPath: "n:interaction:request",
    apiName: "requestEconomy",
    requires: ["interaction:request-queue", "economy:transaction"],
    provides: ["interaction:request-economy-adapter"],
    initialState: createRequestEconomyAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.economy?.transact) throw new TypeError("Request Economy requires the public Economy transaction API.");
      return createRequestEconomyAdapterServices(baseApi, engine.n.economy);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createRequestEconomyAdapterKit;
