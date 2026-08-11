import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createSurfaceFormatKit(config = {}) {
  return createSurfaceRegistryKit("surface-format-kit", config);
}

export { inspectSurfaceFormat, normalizeSurfaceFormat, surfaceFormatContract } from "./contracts.js";
export default createSurfaceFormatKit;
