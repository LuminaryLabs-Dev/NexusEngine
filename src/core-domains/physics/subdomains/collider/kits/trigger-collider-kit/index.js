import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { triggerColliderContract, normalizeTriggerCollider } from "./contracts.js";

export function createTriggerColliderKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "trigger-collider-kit",
    domain: "physics-trigger-collider",
    apiName: "physicsTriggerCollider",
    requires: ["n:physics", "physics:sensor-collider"],
    provides: ["physics:trigger-collider"],
    purpose: "Normalize the event-selection semantics of a sensor-backed trigger collider.",
    owns: ["trigger enabled descriptor", "canonical trigger event selection"],
    doesNotOwn: ["overlap detection", "event dispatch", "solver behavior", "gameplay consequences"],
    schema: COLLIDER_SCHEMAS.trigger,
    contract: triggerColliderContract,
    normalize: normalizeTriggerCollider
  });
}

export default createTriggerColliderKit;
