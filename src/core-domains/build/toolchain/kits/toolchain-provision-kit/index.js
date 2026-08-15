import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createToolchainProvisionService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicToolchainProvisionService(config = {}, context = {}) {
  return createToolchainProvisionService({
    ...config,
    cache: config.cache ?? context.engine?.n?.sourceCache
  });
}

export function createToolchainProvisionKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicToolchainProvisionService, config);
}

export default createToolchainProvisionKit;
