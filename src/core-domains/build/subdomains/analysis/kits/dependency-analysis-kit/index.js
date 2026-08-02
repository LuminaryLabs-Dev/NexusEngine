import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createDependencyAnalysisService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createDependencyAnalysisKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createDependencyAnalysisService, config);
}

export default createDependencyAnalysisKit;
