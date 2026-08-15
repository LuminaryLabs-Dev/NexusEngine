import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import createWebStaticTargetProvider from "./services.js";

export * from "./services.js";
export { kitManifest } from "./kit.manifest.js";

function createAtomicWebStaticTarget(config = {}, context = {}) {
  return createWebStaticTargetProvider({
    ...config,
    linker: config.linker ?? context.engine?.n?.webModuleLinker
  });
}

export function createWebStaticTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createAtomicWebStaticTarget, config);
}

export default createWebStaticTargetKit;
