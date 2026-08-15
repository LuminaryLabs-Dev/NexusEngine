import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createFullscreenKit(config = {}) {
  return createSurfaceRegistryKit("fullscreen-kit", config);
}

export { fullscreenIntentContract, inspectFullscreenIntent, normalizeFullscreenIntent } from "./contracts.js";
export default createFullscreenKit;
