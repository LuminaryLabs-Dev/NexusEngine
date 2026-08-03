import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function finite(value, label) {
  const next = Number(value);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

export function collectFacilityEconomyTransfers(facilityReceipt = {}) {
  const outputs = facilityReceipt.result?.outputs ?? facilityReceipt.outputs ?? [];
  const transfers = [];
  for (const output of outputs) {
    if (output.output) transfers.push({ id: `${output.id}:output`, account: String(output.output.account ?? "cash"), amount: finite(output.output.amount, `${output.id}.output.amount`), source: "facility-output", metadata: { facilityId: output.facilityId, cycle: output.cycle, ...(output.output.metadata ?? {}) } });
    if (output.upkeep) transfers.push({ id: `${output.id}:upkeep`, account: String(output.upkeep.account ?? "cash"), amount: -Math.abs(finite(output.upkeep.amount, `${output.id}.upkeep.amount`)), source: "facility-upkeep", metadata: { facilityId: output.facilityId, cycle: output.cycle, ...(output.upkeep.metadata ?? {}) } });
  }
  return cloneSerializableState(transfers);
}
