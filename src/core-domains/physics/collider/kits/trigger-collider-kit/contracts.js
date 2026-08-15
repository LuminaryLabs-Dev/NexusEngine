import { COLLIDER_SCHEMAS, normalizeTriggerCollider } from "../../collider-contracts.js";

export { normalizeTriggerCollider };

export function triggerColliderContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.trigger,
    sensorCapabilityRequiredWhenEnabled: true,
    canonicalEvents: Object.freeze(["enter", "stay", "exit"]),
    eventSelectionSorted: true,
    detectionForbidden: true
  });
}
