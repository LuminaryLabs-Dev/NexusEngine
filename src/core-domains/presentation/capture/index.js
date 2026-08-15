import { createCaptureKit } from "./kits/capture-kit/index.js";

export * from "./kits/capture-kit/index.js";

export function createCaptureDomain(config = {}) {
  return [createCaptureKit(config.root ?? config)];
}

export default createCaptureDomain;
