import {
  COLLIDER_SCHEMAS,
  normalizeColliderLifecycle,
  normalizeColliderLifecycleCommand
} from "../../collider-contracts.js";

export { normalizeColliderLifecycle, normalizeColliderLifecycleCommand };

export function colliderLifecycleContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.lifecycle,
    states: Object.freeze(["enabled", "disabled"]),
    exactOnceMutationOwnedByRegistry: true,
    providerLifecycleForbidden: true
  });
}
