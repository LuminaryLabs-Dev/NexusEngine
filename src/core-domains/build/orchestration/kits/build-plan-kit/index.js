import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createBuildPlanService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createBuildPlanKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createBuildPlanService, config);
}

export default createBuildPlanKit;
