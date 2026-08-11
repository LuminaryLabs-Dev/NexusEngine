import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createOffscreenSurfaceKit(config = {}) {
  return createSurfaceRegistryKit("offscreen-surface-kit", config);
}

export { inspectOffscreenSurface, normalizeOffscreenSurface, offscreenSurfaceContract } from "./contracts.js";
export default createOffscreenSurfaceKit;
