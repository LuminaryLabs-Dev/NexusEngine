import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createTypeAnalysisService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createTypeAnalysisKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createTypeAnalysisService, config);
}

export default createTypeAnalysisKit;
