import { createSurfaceRegistryKit } from "../../surface-kit.js";

export function createScissorKit(config = {}) {
  return createSurfaceRegistryKit("scissor-kit", config);
}

export { inspectScissor, normalizeScissor, scissorContract } from "./contracts.js";
export default createScissorKit;
