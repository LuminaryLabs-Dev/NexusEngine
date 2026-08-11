export { createCameraBindingKit } from "./kits/camera-binding-kit/index.js";
export { createCameraJitterKit } from "./kits/camera-jitter-kit/index.js";
export { createCameraProjectionKit } from "./kits/camera-projection-kit/index.js";
export { createCameraReprojectionKit } from "./kits/camera-reprojection-kit/index.js";
export { createCameraViewKit } from "./kits/camera-view-kit/index.js";
export { createCameraViewportKit } from "./kits/camera-viewport-kit/index.js";
export { createMultiviewCameraKit } from "./kits/multiview-camera-kit/index.js";
export { createStereoCameraKit } from "./kits/stereo-camera-kit/index.js";
export { RENDER_CAMERA_KIT_MANIFESTS } from "./camera-manifests.js";
export { default as renderCameraSubdomainManifest } from "./subdomain.manifest.js";
export * from "./camera-contracts.js";

import { createCameraBindingKit } from "./kits/camera-binding-kit/index.js";
import { createCameraJitterKit } from "./kits/camera-jitter-kit/index.js";
import { createCameraProjectionKit } from "./kits/camera-projection-kit/index.js";
import { createCameraReprojectionKit } from "./kits/camera-reprojection-kit/index.js";
import { createCameraViewKit } from "./kits/camera-view-kit/index.js";
import { createCameraViewportKit } from "./kits/camera-viewport-kit/index.js";
import { createMultiviewCameraKit } from "./kits/multiview-camera-kit/index.js";
import { createStereoCameraKit } from "./kits/stereo-camera-kit/index.js";

export function createRenderCameraDomain(config = {}) {
  return [
    createCameraBindingKit(config.binding ?? {}),
    createCameraProjectionKit(config.projection ?? {}),
    createCameraViewKit(config.view ?? {}),
    createStereoCameraKit(config.stereo ?? {}),
    createMultiviewCameraKit(config.multiview ?? {}),
    createCameraJitterKit(config.jitter ?? {}),
    createCameraReprojectionKit(config.reprojection ?? {}),
    createCameraViewportKit(config.viewport ?? {})
  ];
}

export default createRenderCameraDomain;
