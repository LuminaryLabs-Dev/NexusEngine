export { createColliderIdentityKit } from "./kits/collider-identity-kit/index.js";
export { createColliderAttachmentKit } from "./kits/collider-attachment-kit/index.js";
export { createColliderPoseKit } from "./kits/collider-pose-kit/index.js";
export { createColliderMaterialKit } from "./kits/collider-material-kit/index.js";
export { createCollisionLayerKit } from "./kits/collision-layer-kit/index.js";
export { createCollisionMaskKit } from "./kits/collision-mask-kit/index.js";
export { createCollisionGroupKit } from "./kits/collision-group-kit/index.js";
export { createColliderFilterKit } from "./kits/collider-filter-kit/index.js";
export { createSensorColliderKit } from "./kits/sensor-collider-kit/index.js";
export { createTriggerColliderKit } from "./kits/trigger-collider-kit/index.js";
export { createColliderLifecycleKit } from "./kits/collider-lifecycle-kit/index.js";
export { createColliderRegistryKit } from "./kits/collider-registry-kit/index.js";
export { PHYSICS_COLLIDER_KIT_MANIFESTS } from "./collider-manifests.js";
export { default as physicsColliderSubdomainManifest } from "./subdomain.manifest.js";
export * from "./collider-contracts.js";

import { createColliderIdentityKit } from "./kits/collider-identity-kit/index.js";
import { createColliderAttachmentKit } from "./kits/collider-attachment-kit/index.js";
import { createColliderPoseKit } from "./kits/collider-pose-kit/index.js";
import { createColliderMaterialKit } from "./kits/collider-material-kit/index.js";
import { createCollisionLayerKit } from "./kits/collision-layer-kit/index.js";
import { createCollisionMaskKit } from "./kits/collision-mask-kit/index.js";
import { createCollisionGroupKit } from "./kits/collision-group-kit/index.js";
import { createColliderFilterKit } from "./kits/collider-filter-kit/index.js";
import { createSensorColliderKit } from "./kits/sensor-collider-kit/index.js";
import { createTriggerColliderKit } from "./kits/trigger-collider-kit/index.js";
import { createColliderLifecycleKit } from "./kits/collider-lifecycle-kit/index.js";
import { createColliderRegistryKit } from "./kits/collider-registry-kit/index.js";

export function createPhysicsColliderDomain(config = {}) {
  return [
    createColliderIdentityKit(config.identity ?? {}),
    createColliderAttachmentKit(config.attachment ?? {}),
    createColliderPoseKit(config.pose ?? {}),
    createColliderMaterialKit(config.material ?? {}),
    createCollisionLayerKit(config.layer ?? {}),
    createCollisionMaskKit(config.mask ?? {}),
    createCollisionGroupKit(config.group ?? {}),
    createColliderFilterKit(config.filter ?? {}),
    createSensorColliderKit(config.sensor ?? {}),
    createTriggerColliderKit(config.trigger ?? {}),
    createColliderLifecycleKit(config.lifecycle ?? {}),
    createColliderRegistryKit(config.registry ?? {})
  ];
}

export default createPhysicsColliderDomain;
