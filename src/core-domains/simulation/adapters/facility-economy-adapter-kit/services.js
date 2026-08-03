import { collectFacilityEconomyTransfers } from "./contracts.js";

export function createFacilityEconomyAdapterServices(baseApi, economy) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const transfers = collectFacilityEconomyTransfers(request.facilityReceipt);
        const transactions = transfers.map((transfer) => economy.transact({
          operationId: `facility-economy:${transfer.id}`,
          transactionId: transfer.id,
          account: transfer.account,
          amount: transfer.amount,
          source: transfer.source,
          metadata: transfer.metadata
        }));
        const result = { transfers, transactions };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
