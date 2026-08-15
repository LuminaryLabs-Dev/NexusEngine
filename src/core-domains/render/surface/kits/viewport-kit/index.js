import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createViewportKit(config = {}) {
  return createSurfaceRegistryKit("viewport-kit", config);
}

export { inspectViewport, normalizeViewport, viewportContract } from "./contracts.js";
export default createViewportKit;
