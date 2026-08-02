import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createBuildRequestService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicBuildRequestService(config = {}, context = {}) {
  return createBuildRequestService({
    targetSet: config.targetSet ?? context.engine?.n?.targetSet
  });
}

export function createBuildRequestKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicBuildRequestService, config);
}

export default createBuildRequestKit;
