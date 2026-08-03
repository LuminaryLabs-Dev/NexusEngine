import { calculateEconomyTransaction } from "./contracts.js";

export function createEconomyAccountServices(baseApi, transactionApi) {
  return {
    canAfford(account = "cash", amount = 0) {
      const required = Number(amount);
      if (!Number.isFinite(required) || required < 0) throw new TypeError("Affordability amount must be finite and nonnegative.");
      return Number(baseApi.getState().accounts?.[String(account)] ?? 0) >= required;
    },
    transact(command = {}) {
      const receipt = baseApi.applyCommand(command, (state, request) => {
        const transaction = calculateEconomyTransaction(state, request);
        const ledger = transaction.status === "completed"
          ? [...(state.ledger ?? []), transaction].slice(state.ledgerLimit === 0 ? state.ledger.length + 1 : -state.ledgerLimit)
          : state.ledger;
        const accounts = transaction.status === "completed"
          ? { ...state.accounts, [transaction.account]: transaction.after }
          : state.accounts;
        return {
          patch: { accounts, ledger, transactionSequence: Number(state.transactionSequence ?? 0) + (transaction.status === "completed" ? 1 : 0) },
          result: { transaction },
          events: [{ name: transaction.status, payload: { transaction } }]
        };
      });
      const ledgerId = `economy:${baseApi.getState().economyId}`;
      const existing = transactionApi.get(ledgerId, command.operationId);
      if (existing && existing.requestHash !== receipt.requestHash) throw new TypeError(`Economy operation ${command.operationId} conflicts with the Runtime Transaction ledger.`);
      if (!existing) transactionApi.record(ledgerId, command.operationId, receipt, { kitId: receipt.kitId }, command);
      return receipt;
    },
    listLedger: () => baseApi.getState().ledger
  };
}
