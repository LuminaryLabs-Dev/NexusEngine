import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createToolchainSourceService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createToolchainSourceKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createToolchainSourceService, config);
}

export default createToolchainSourceKit;
