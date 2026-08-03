import { createPresentationKit } from "./kits/presentation-kit/index.js";
import { createPresentationOutputKit } from "./subdomains/output/kits/output-kit/index.js";
import { createUIScaleKit } from "./subdomains/ui/kits/ui-scale-kit/index.js";
import { createCameraFramingKit } from "./subdomains/camera/kits/framing-kit/index.js";

export * from "./contracts.js";
export { presentationDomainManifest } from "./domain.manifest.js";
export { createPresentationKit } from "./kits/presentation-kit/index.js";
export { createPresentationOutputKit } from "./subdomains/output/kits/output-kit/index.js";
export { createUIScaleKit } from "./subdomains/ui/kits/ui-scale-kit/index.js";
export { createCameraFramingKit } from "./subdomains/camera/kits/framing-kit/index.js";
export { createThirdPersonCameraKit } from "./subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/index.js";
export { createCameraWorldOcclusionAdapterKit } from "./adapters/camera-world-occlusion-adapter-kit/index.js";

export function createPresentationDomain(config = {}) {
  return [
    createPresentationKit(config.root ?? {}),
    createPresentationOutputKit(config.output ?? {}),
    createUIScaleKit(config.ui ?? {}),
    createCameraFramingKit(config.framing ?? {})
  ];
}
