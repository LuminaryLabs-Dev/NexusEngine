import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createToolchainDiscoveryService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createToolchainDiscoveryKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createToolchainDiscoveryService, config);
}

export default createToolchainDiscoveryKit;
