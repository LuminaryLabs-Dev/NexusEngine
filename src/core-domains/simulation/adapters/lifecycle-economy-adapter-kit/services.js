import { collectLifecycleEconomyTransfers } from "./contracts.js";

export function createLifecycleEconomyAdapterServices(baseApi, economy) {
  return {
    apply(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const transfers = collectLifecycleEconomyTransfers(request.lifecycleReceipt);
        const transactions = transfers.map((transfer, index) => economy.transact({
          operationId: `lifecycle-economy:${request.operationId}:${index + 1}`,
          transactionId: transfer.id,
          account: transfer.account,
          amount: transfer.amount,
          allowNegative: transfer.allowNegative,
          source: transfer.source,
          metadata: transfer.metadata
        }));
        const result = { transfers, transactions };
        return { patch: { applications: state.applications + 1, lastResult: result }, result };
      });
    }
  };
}
