import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createRenderSurfaceKit(config = {}) {
  return createSurfaceRegistryKit("render-surface-kit", config);
}

export { inspectRenderSurface, normalizeRenderSurface, renderSurfaceContract } from "./contracts.js";
export default createRenderSurfaceKit;
