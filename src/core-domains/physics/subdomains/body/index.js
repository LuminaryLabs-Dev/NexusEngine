export { createBodyIdentityKit } from "./kits/body-identity-kit/index.js";
export { createBodyTypeKit } from "./kits/body-type-kit/index.js";
export { createBodyPoseKit } from "./kits/body-pose-kit/index.js";
export { createBodyVelocityKit } from "./kits/body-velocity-kit/index.js";
export { createBodyForceKit } from "./kits/body-force-kit/index.js";
export { createBodyMassKit } from "./kits/body-mass-kit/index.js";
export { createBodyInertiaKit } from "./kits/body-inertia-kit/index.js";
export { createBodyDampingKit } from "./kits/body-damping-kit/index.js";
export { createBodySleepKit } from "./kits/body-sleep-kit/index.js";
export { createBodyWakeKit } from "./kits/body-wake-kit/index.js";
export { createBodyLifecycleKit } from "./kits/body-lifecycle-kit/index.js";
export { createBodyStateKit } from "./kits/body-state-kit/index.js";
export { createBodyRegistryKit } from "./kits/body-registry-kit/index.js";
export { PHYSICS_BODY_KIT_MANIFESTS } from "./body-manifests.js";
export { default as physicsBodySubdomainManifest } from "./subdomain.manifest.js";

import { createBodyIdentityKit } from "./kits/body-identity-kit/index.js";
import { createBodyTypeKit } from "./kits/body-type-kit/index.js";
import { createBodyPoseKit } from "./kits/body-pose-kit/index.js";
import { createBodyVelocityKit } from "./kits/body-velocity-kit/index.js";
import { createBodyForceKit } from "./kits/body-force-kit/index.js";
import { createBodyMassKit } from "./kits/body-mass-kit/index.js";
import { createBodyInertiaKit } from "./kits/body-inertia-kit/index.js";
import { createBodyDampingKit } from "./kits/body-damping-kit/index.js";
import { createBodySleepKit } from "./kits/body-sleep-kit/index.js";
import { createBodyWakeKit } from "./kits/body-wake-kit/index.js";
import { createBodyLifecycleKit } from "./kits/body-lifecycle-kit/index.js";
import { createBodyStateKit } from "./kits/body-state-kit/index.js";
import { createBodyRegistryKit } from "./kits/body-registry-kit/index.js";

export function createPhysicsBodyDomain(config = {}) {
  return [
    createBodyIdentityKit(config.identity ?? {}),
    createBodyTypeKit(config.type ?? {}),
    createBodyPoseKit(config.pose ?? {}),
    createBodyVelocityKit(config.velocity ?? {}),
    createBodyForceKit(config.force ?? {}),
    createBodyMassKit(config.mass ?? {}),
    createBodyInertiaKit(config.inertia ?? {}),
    createBodyDampingKit(config.damping ?? {}),
    createBodySleepKit(config.sleep ?? {}),
    createBodyWakeKit(config.wake ?? {}),
    createBodyLifecycleKit(config.lifecycle ?? {}),
    createBodyStateKit(config.state ?? {}),
    createBodyRegistryKit(config.registry ?? {})
  ];
}

export default createPhysicsBodyDomain;

