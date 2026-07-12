import { createCorePresentationKit } from "../../core-kits/core-presentation-kit/index.js";
import { createCorePresentationOutputKit } from "../../core-kits/core-presentation-output-kit/index.js";
import { createCoreUIScaleKit } from "../../core-kits/core-ui-scale-kit/index.js";
import { createCoreCameraFramingKit } from "../../core-kits/core-camera-framing-kit/index.js";

export * from "./contracts.js";
export { createCorePresentationKit } from "../../core-kits/core-presentation-kit/index.js";
export { createCorePresentationOutputKit } from "../../core-kits/core-presentation-output-kit/index.js";
export { createCoreUIScaleKit } from "../../core-kits/core-ui-scale-kit/index.js";
export { createCoreCameraFramingKit } from "../../core-kits/core-camera-framing-kit/index.js";

export function createCorePresentationDomain(config = {}) {
  return [
    createCorePresentationKit(config.root ?? {}),
    createCorePresentationOutputKit(config.output ?? {}),
    createCoreUIScaleKit(config.ui ?? {}),
    createCoreCameraFramingKit(config.framing ?? {})
  ];
}
