import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";

function finite(value, label, fallback) {
  if (value === undefined && fallback !== undefined) return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function normalizeEconomyAccountConfig(config = {}) {
  const source = config.economyDataset ?? config;
  const accounts = {};
  for (const [id, value] of Object.entries(source.accounts ?? { cash: 0 })) {
    const key = String(id).trim();
    if (!key) throw new TypeError("Economy account IDs cannot be empty.");
    accounts[key] = finite(value, `accounts.${key}`);
  }
  const ledgerLimit = Math.floor(finite(source.ledgerLimit, "ledgerLimit", 120));
  if (ledgerLimit < 0) throw new RangeError("ledgerLimit cannot be negative.");
  return { id: String(source.id ?? "economy"), accounts, ledgerLimit };
}

export function createEconomyAccountState(config = {}) {
  const normalized = normalizeEconomyAccountConfig(config);
  return { economyId: normalized.id, accounts: normalized.accounts, ledgerLimit: normalized.ledgerLimit, ledger: [], transactionSequence: 0 };
}

export function calculateEconomyTransaction(state = {}, command = {}) {
  const operationId = String(command.operationId ?? "").trim();
  if (!operationId) throw new TypeError("Economy transaction requires operationId.");
  const account = String(command.account ?? "cash").trim();
  if (!account) throw new TypeError("Economy transaction account is required.");
  const amount = finite(command.amount, "amount", 0);
  const before = finite(state.accounts?.[account], `accounts.${account}`, 0);
  const after = before + amount;
  if (!Number.isFinite(after)) throw new RangeError("Economy transaction result must be finite.");
  const accepted = command.allowNegative === true || after >= 0;
  const transaction = cloneSerializableState({
    id: String(command.transactionId ?? operationId),
    operationId,
    account,
    amount,
    before,
    after,
    source: String(command.source ?? "system"),
    status: accepted ? "completed" : "rejected",
    reason: accepted ? null : "insufficient-funds",
    metadata: command.metadata ?? {}
  });
  return transaction;
}
