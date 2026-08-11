import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import {
  colliderLifecycleContract,
  normalizeColliderLifecycle,
  normalizeColliderLifecycleCommand
} from "./contracts.js";

export function createColliderLifecycleKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "collider-lifecycle-kit",
    domain: "physics-collider-lifecycle",
    apiName: "physicsColliderLifecycle",
    provides: ["physics:collider-lifecycle"],
    purpose: "Normalize provider-neutral enabled and disabled collider lifecycle descriptors.",
    owns: ["collider lifecycle states", "collider lifecycle command normalization"],
    doesNotOwn: ["collider records", "provider object creation", "solver insertion", "gameplay spawning"],
    schema: COLLIDER_SCHEMAS.lifecycle,
    contract: colliderLifecycleContract,
    normalize: normalizeColliderLifecycle,
    extendApi() {
      return { normalizeCommand: normalizeColliderLifecycleCommand };
    }
  });
}

export default createColliderLifecycleKit;
