import { createBuildAtomicKit } from "../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createSourceMapService from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

export function createSourceMapKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createSourceMapService, config);
}

export default createSourceMapKit;
