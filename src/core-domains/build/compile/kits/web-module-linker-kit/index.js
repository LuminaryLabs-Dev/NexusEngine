import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createWebModuleLinkerService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicWebModuleLinkerService(config = {}, context = {}) {
  return createWebModuleLinkerService({
    ...config,
    processExecution: config.processExecution ?? context.engine?.n?.processExecution
  });
}

export function createWebModuleLinkerKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicWebModuleLinkerService, config);
}

export default createWebModuleLinkerKit;
