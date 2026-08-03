import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function asList(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function lifecycleEffectRecords(result) {
  if (Array.isArray(result.effects)) return result.effects;
  if (result.effects && typeof result.effects === "object") return [{ itemId: result.item?.id ?? null, effects: result.effects }];
  return [];
}

export function collectLifecycleFacilityActions(lifecycleReceipt = {}) {
  const result = lifecycleReceipt.result ?? lifecycleReceipt;
  const actions = [];
  for (const record of lifecycleEffectRecords(result)) {
    for (const effect of asList(record.effects?.facility)) {
      if (!effect || typeof effect !== "object") throw new TypeError("Lifecycle facility effect must be an object.");
      if (effect.facility) {
        actions.push({ type: "add", facility: cloneSerializableState(effect.facility), itemId: record.itemId ?? null });
        continue;
      }
      const facilityId = String(effect.facilityId ?? effect.id ?? "").trim();
      const status = String(effect.status ?? "").trim();
      if (!facilityId || !status) throw new TypeError("Lifecycle facility status effects require facilityId and status.");
      actions.push({ type: "set-status", facilityId, status, itemId: record.itemId ?? null });
    }
  }
  return cloneSerializableState(actions);
}
