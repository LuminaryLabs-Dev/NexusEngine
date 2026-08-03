import { collectRequestEconomyTransfers } from "./contracts.js";

export function createRequestEconomyAdapterServices(baseApi, economy) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const transfers = collectRequestEconomyTransfers(request.requestReceipt);
        const transactions = transfers.map((transfer) => economy.transact({
          operationId: `request-economy:${transfer.requestId}:${transfer.outcome}`,
          transactionId: transfer.id,
          account: transfer.account,
          amount: transfer.amount,
          source: "request-outcome",
          metadata: transfer.metadata
        }));
        const result = { transfers, transactions };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
