export { createPhysicsInstallationKit } from "./kits/physics-installation-kit/index.js";
export { createPhysicsStartupKit } from "./kits/physics-startup-kit/index.js";
export { createPhysicsStepKit } from "./kits/physics-step-kit/index.js";
export { createPhysicsShutdownKit } from "./kits/physics-shutdown-kit/index.js";
export { createPhysicsResetKit } from "./kits/physics-reset-kit/index.js";
export { createPhysicsSnapshotKit } from "./kits/physics-snapshot-kit/index.js";
export { PHYSICS_LIFECYCLE_KIT_MANIFESTS } from "./lifecycle-manifests.js";
export { default as physicsLifecycleSubdomainManifest } from "./subdomain.manifest.js";

import { createPhysicsInstallationKit } from "./kits/physics-installation-kit/index.js";
import { createPhysicsStartupKit } from "./kits/physics-startup-kit/index.js";
import { createPhysicsStepKit } from "./kits/physics-step-kit/index.js";
import { createPhysicsShutdownKit } from "./kits/physics-shutdown-kit/index.js";
import { createPhysicsResetKit } from "./kits/physics-reset-kit/index.js";
import { createPhysicsSnapshotKit } from "./kits/physics-snapshot-kit/index.js";

export function createPhysicsLifecycleDomain(config = {}) {
  return [
    createPhysicsInstallationKit(config.installation ?? {}),
    createPhysicsStartupKit(config.startup ?? {}),
    createPhysicsStepKit(config.step ?? {}),
    createPhysicsShutdownKit(config.shutdown ?? {}),
    createPhysicsResetKit(config.reset ?? {}),
    createPhysicsSnapshotKit(config.snapshot ?? {})
  ];
}

export default createPhysicsLifecycleDomain;
