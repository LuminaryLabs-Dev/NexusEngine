import { createDomainKit } from "../../../domain-kit.js";
import { collectFacilityEconomyTransfers } from "./contracts.js";
import { createFacilityEconomyAdapterServices } from "./services.js";
import { createFacilityEconomyAdapterState } from "./state.js";

export { collectFacilityEconomyTransfers } from "./contracts.js";

export function createFacilityEconomyAdapterKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "facility-economy-adapter-kit",
    id: config.id ?? "facility-economy-adapter-kit",
    domain: "facility-economy",
    domainPath: "n:simulation:operations:facility",
    parentDomainPath: "n:simulation:operations",
    apiName: "facilityEconomy",
    requires: ["operations:facility", "economy:transaction"],
    provides: ["operations:facility-economy-adapter"],
    initialState: createFacilityEconomyAdapterState(),
    createApi({ baseApi, engine }) {
      if (!engine.n.economy?.transact) throw new TypeError("Facility Economy requires the public Economy transaction API.");
      return createFacilityEconomyAdapterServices(baseApi, engine.n.economy);
    },
    metadata: { adapter: true, ownsSourceState: false, exactOnceEffects: true }
  });
}

export default createFacilityEconomyAdapterKit;
