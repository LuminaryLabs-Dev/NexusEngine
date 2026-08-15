import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createRustLoweringService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createRustLoweringKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createRustLoweringService, config);
}

export default createRustLoweringKit;
