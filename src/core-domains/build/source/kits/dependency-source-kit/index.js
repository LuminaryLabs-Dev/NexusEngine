import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createDependencySourceService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createDependencySourceKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createDependencySourceService, config);
}

export default createDependencySourceKit;
