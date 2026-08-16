import { createComputeKit } from "./kits/compute-kit/index.js";

export { computeDomainManifest } from "./domain.manifest.js";
export * from "./kits/compute-kit/index.js";
export * from "./graph/index.js";
export * from "./resource/index.js";
export * from "./dispatch/index.js";
export * from "./host/index.js";
export * from "./host/execution/gpu/webgpu/index.js";
export * from "./host/execution/gpu/vulkan/index.js";
export * from "./host/execution/gpu/opengl/index.js";
export * from "./host/execution/cpu/javascript/index.js";
export * from "./host/execution/cpu/wasm/index.js";
export * from "./host/execution/cpu/native/index.js";
export { createModelKit } from "./model/kits/model-kit/index.js";

export function createComputeDomain(config = {}) {
  return [createComputeKit(config.root ?? config)];
}

export default createComputeDomain;
