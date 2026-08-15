import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createWindowSurfaceKit(config = {}) {
  return createSurfaceRegistryKit("window-surface-kit", config);
}

export { inspectWindowSurface, normalizeWindowSurface, windowSurfaceContract } from "./contracts.js";
export default createWindowSurfaceKit;
