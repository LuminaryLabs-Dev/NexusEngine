export { createRenderDeviceContractKit } from "./kits/render-device-contract-kit/index.js";
export { createDeviceFeatureKit } from "./kits/device-feature-kit/index.js";
export { createDeviceLimitKit } from "./kits/device-limit-kit/index.js";
export { createDeviceCapabilityKit } from "./kits/device-capability-kit/index.js";
export { createDeviceMemoryKit } from "./kits/device-memory-kit/index.js";
export { createDeviceQueueKit } from "./kits/device-queue-kit/index.js";
export { createDeviceLifecycleKit } from "./kits/device-lifecycle-kit/index.js";
export { createDeviceLossKit } from "./kits/device-loss-kit/index.js";
export { createDeviceDiagnosticsKit } from "./kits/device-diagnostics-kit/index.js";
export { RENDER_DEVICE_KIT_MANIFESTS } from "./device-manifests.js";
export { default as renderDeviceSubdomainManifest } from "./subdomain.manifest.js";

import { createRenderDeviceContractKit } from "./kits/render-device-contract-kit/index.js";
import { createDeviceFeatureKit } from "./kits/device-feature-kit/index.js";
import { createDeviceLimitKit } from "./kits/device-limit-kit/index.js";
import { createDeviceCapabilityKit } from "./kits/device-capability-kit/index.js";
import { createDeviceMemoryKit } from "./kits/device-memory-kit/index.js";
import { createDeviceQueueKit } from "./kits/device-queue-kit/index.js";
import { createDeviceLifecycleKit } from "./kits/device-lifecycle-kit/index.js";
import { createDeviceLossKit } from "./kits/device-loss-kit/index.js";
import { createDeviceDiagnosticsKit } from "./kits/device-diagnostics-kit/index.js";

export function createRenderDeviceDomain(config = {}) {
  return [
    createRenderDeviceContractKit(config.contract ?? {}),
    createDeviceFeatureKit(config.feature ?? {}),
    createDeviceLimitKit(config.limit ?? {}),
    createDeviceCapabilityKit(config.capability ?? {}),
    createDeviceMemoryKit(config.memory ?? {}),
    createDeviceQueueKit(config.queue ?? {}),
    createDeviceLifecycleKit(config.lifecycle ?? {}),
    createDeviceLossKit(config.loss ?? {}),
    createDeviceDiagnosticsKit(config.diagnostics ?? {})
  ];
}

export default createRenderDeviceDomain;
