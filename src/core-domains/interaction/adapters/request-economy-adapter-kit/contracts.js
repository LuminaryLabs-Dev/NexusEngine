import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function finite(value, label) {
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function collectRequestEconomyTransfers(requestReceipt = {}) {
  const result = requestReceipt.result ?? requestReceipt;
  const outcomes = result.outcomes ?? (result.type ? [result] : []);
  return cloneSerializableState(outcomes.filter((outcome) => outcome.effect).map((outcome) => ({
    id: `request:${outcome.request.id}:${outcome.type}`,
    requestId: String(outcome.request.id),
    outcome: String(outcome.type),
    account: String(outcome.effect.account ?? "cash"),
    amount: finite(outcome.effect.amount, `${outcome.request.id}.effect.amount`),
    metadata: { requestId: outcome.request.id, outcome: outcome.type, ...(outcome.effect.metadata ?? {}) }
  })));
}
