export { createRenderInstallationKit } from "./kits/render-installation-kit/index.js";
export { createRenderStartupKit } from "./kits/render-startup-kit/index.js";
export { createRenderShutdownKit } from "./kits/render-shutdown-kit/index.js";
export { createRenderResetKit } from "./kits/render-reset-kit/index.js";
export { createRenderSnapshotKit } from "./kits/render-snapshot-kit/index.js";
export { createRenderRecoveryKit } from "./kits/render-recovery-kit/index.js";
export { RENDER_LIFECYCLE_KIT_MANIFESTS } from "./lifecycle-manifests.js";
export { default as renderLifecycleSubdomainManifest } from "./subdomain.manifest.js";

import { createRenderInstallationKit } from "./kits/render-installation-kit/index.js";
import { createRenderStartupKit } from "./kits/render-startup-kit/index.js";
import { createRenderShutdownKit } from "./kits/render-shutdown-kit/index.js";
import { createRenderResetKit } from "./kits/render-reset-kit/index.js";
import { createRenderSnapshotKit } from "./kits/render-snapshot-kit/index.js";
import { createRenderRecoveryKit } from "./kits/render-recovery-kit/index.js";

export function createRenderLifecycleDomain(config = {}) {
  return [
    createRenderInstallationKit(config.installation ?? {}),
    createRenderStartupKit(config.startup ?? {}),
    createRenderShutdownKit(config.shutdown ?? {}),
    createRenderRecoveryKit(config.recovery ?? {}),
    createRenderResetKit(config.reset ?? {}),
    createRenderSnapshotKit(config.snapshot ?? {})
  ];
}

export default createRenderLifecycleDomain;
