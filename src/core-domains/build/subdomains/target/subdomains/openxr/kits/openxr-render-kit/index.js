import { createBuildAtomicKit } from "../../../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createOpenXrRenderService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createOpenXrRenderKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createOpenXrRenderService, config);
}

export default createOpenXrRenderKit;
