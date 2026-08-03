import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function occupantsFromReceipt(receipt = {}) {
  const result = receipt.result ?? receipt;
  if (result.occupant) return [result.occupant];
  return result.spawned ?? [];
}

export function createOccupantRequests(occupantReceipt = {}, defaults = {}) {
  return cloneSerializableState(occupantsFromReceipt(occupantReceipt).filter((occupant) => occupant?.need).map((occupant) => ({
    id: `occupant:${occupant.id}:${occupant.need}`,
    subjectId: String(occupant.id),
    kind: String(occupant.need),
    destination: occupant.destination ?? null,
    patience: occupant.patience,
    ...(defaults.reward === undefined ? {} : { reward: defaults.reward }),
    ...(defaults.penalty === undefined ? {} : { penalty: defaults.penalty }),
    metadata: { source: "occupant-flow", location: occupant.location ?? null, ...(occupant.metadata ?? {}) }
  })));
}
