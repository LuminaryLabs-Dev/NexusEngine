import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createResizeKit(config = {}) {
  return createSurfaceRegistryKit("resize-kit", config);
}

export { inspectResizeIntent, normalizeResizeIntent, resizeIntentContract } from "./contracts.js";
export default createResizeKit;
