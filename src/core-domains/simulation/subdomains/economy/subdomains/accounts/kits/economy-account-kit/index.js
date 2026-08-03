import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createEconomyAccountServices } from "./services.js";
import { createEconomyAccountState, normalizeEconomyAccountConfig } from "./contracts.js";

export { calculateEconomyTransaction, createEconomyAccountState, normalizeEconomyAccountConfig } from "./contracts.js";

export function createEconomyAccountKit(config = {}) {
  const normalized = normalizeEconomyAccountConfig(config);
  return createDomainKit({
    ...config,
    manifestId: "economy-account-kit",
    id: config.id ?? "economy-account-kit",
    domain: "economy-account",
    domainPath: "n:simulation:economy:accounts",
    parentDomainPath: "n:simulation:economy",
    apiName: "economy",
    requires: ["n:simulation", "transaction:idempotency"],
    provides: ["n:simulation:economy:accounts", "economy:accounts", "economy:transaction"],
    config: normalized,
    initialState: createEconomyAccountState(normalized),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "completed", "rejected"],
    createApi({ baseApi, engine }) {
      if (!engine.n.transaction?.record) throw new TypeError("Economy Accounts requires the public Runtime Transaction ledger.");
      return createEconomyAccountServices(baseApi, engine.n.transaction);
    },
    metadata: { rendererAgnostic: true, historicalSource: "src/economy-kit.js@a9adca5" }
  });
}

export default createEconomyAccountKit;
