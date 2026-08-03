import { createDomainKit } from "../../../domain-kit.js";
import { collectLifecycleEconomyTransfers } from "./contracts.js";
import { createLifecycleEconomyAdapterServices } from "./services.js";
import { createLifecycleEconomyAdapterState } from "./state.js";

export { collectLifecycleEconomyTransfers } from "./contracts.js";

export function createLifecycleEconomyAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "lifecycle-economy-adapter-kit",
    id: config.id ?? "lifecycle-economy-adapter-kit",
    domain: "lifecycle-economy",
    domainPath: "n:simulation:progression:lifecycle",
    parentDomainPath: "n:simulation:progression",
    apiName: "lifecycleEconomy",
    requires: ["progression:lifecycle", "economy:transaction"],
    provides: ["progression:lifecycle-economy-adapter"],
    initialState: createLifecycleEconomyAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.economy?.transact) throw new TypeError("Lifecycle Economy requires the public Economy transaction API.");
      return createLifecycleEconomyAdapterServices(baseApi, engine.n.economy);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createLifecycleEconomyAdapterKit;
