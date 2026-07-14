import { createCoreCaptureKit } from "../../core-kits/core-capture-kit/index.js";

export * from "../../core-kits/core-capture-kit/index.js";

export function createCoreCaptureDomain(config = {}) {
  return [createCoreCaptureKit(config.root ?? config)];
}

export default createCoreCaptureDomain;
