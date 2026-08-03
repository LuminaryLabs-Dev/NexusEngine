import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function finite(value, label) {
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function asList(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function normalizeTransfer(value, source, index) {
  if (!value || typeof value !== "object") throw new TypeError(`${source} economy effect must be an object.`);
  return cloneSerializableState({
    id: String(value.id ?? `${source}:${index + 1}`),
    account: String(value.account ?? "cash"),
    amount: finite(value.amount, `${source}.amount`),
    allowNegative: value.allowNegative === true,
    source,
    metadata: value.metadata ?? {}
  });
}

function lifecycleEffectRecords(result) {
  if (Array.isArray(result.effects)) return result.effects;
  if (result.effects && typeof result.effects === "object") return [{ itemId: result.item?.id ?? null, effects: result.effects }];
  return [];
}

export function collectLifecycleEconomyTransfers(lifecycleReceipt = {}) {
  const result = lifecycleReceipt.result ?? lifecycleReceipt;
  const transfers = [];
  if (result.cost) {
    const cost = normalizeTransfer({ ...result.cost, amount: -Math.abs(finite(result.cost.amount, "lifecycle cost amount")) }, "lifecycle-cost", transfers.length);
    transfers.push(cost);
  }
  for (const record of lifecycleEffectRecords(result)) {
    for (const effect of asList(record.effects?.economy)) {
      transfers.push(normalizeTransfer(effect, `lifecycle-effect:${record.itemId ?? "item"}`, transfers.length));
    }
  }
  return cloneSerializableState(transfers);
}
