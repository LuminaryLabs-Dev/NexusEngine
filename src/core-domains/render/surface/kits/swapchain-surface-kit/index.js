import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createSwapchainSurfaceKit(config = {}) {
  return createSurfaceRegistryKit("swapchain-surface-kit", config);
}

export { inspectSwapchainSurface, normalizeSwapchainSurface, swapchainSurfaceContract } from "./contracts.js";
export default createSwapchainSurfaceKit;
