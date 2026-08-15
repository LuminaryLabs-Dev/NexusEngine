import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createBuildApprovalService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createBuildApprovalKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createBuildApprovalService, config);
}

export default createBuildApprovalKit;
