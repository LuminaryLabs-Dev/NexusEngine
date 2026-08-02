import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createProjectSourceService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createProjectSourceKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createProjectSourceService, config);
}

export default createProjectSourceKit;
