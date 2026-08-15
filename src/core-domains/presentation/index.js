import { createPresentationKit } from "./kits/presentation-kit/index.js";
import { createPresentationOutputKit } from "./output/kits/output-kit/index.js";
import { createUIScaleKit } from "./ui/kits/ui-scale-kit/index.js";
import { createCameraFramingKit } from "./camera/kits/framing-kit/index.js";

export * from "./contracts.js";
export { presentationDomainManifest } from "./domain.manifest.js";
export { createPresentationKit } from "./kits/presentation-kit/index.js";
export { createPresentationOutputKit } from "./output/kits/output-kit/index.js";
export { createUIScaleKit } from "./ui/kits/ui-scale-kit/index.js";
export { createCameraFramingKit } from "./camera/kits/framing-kit/index.js";
export { createThirdPersonCameraKit } from "./camera/third-person/kits/third-person-camera-kit/index.js";
export { createCameraWorldOcclusionAdapterKit } from "./adapters/camera-world-occlusion-adapter-kit/index.js";

export function createPresentationDomain(config = {}) {
  return [
    createPresentationKit(config.root ?? {}),
    createPresentationOutputKit(config.output ?? {}),
    createUIScaleKit(config.ui ?? {}),
    createCameraFramingKit(config.framing ?? {})
  ];
}
