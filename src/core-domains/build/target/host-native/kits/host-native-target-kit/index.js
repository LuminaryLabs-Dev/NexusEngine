import { createBuildAtomicKit } from "../../../../atomic-kit.js";
import kitManifest from "./kit.manifest.js";
import { createHostNativeTargetProvider } from "./services.js";
export * from "./services.js";
export { default as kitManifest } from "./kit.manifest.js";
function createInstalledProvider(config, context) {
  const installed = context.engine?.n ?? {};
  return createHostNativeTargetProvider({
    ...config,
    processExecution: config.processExecution ?? installed.processExecution,
    rustLowering: config.rustLowering ?? installed.rustLowering,
    runtimeAbi: config.runtimeAbi ?? installed.runtimeAbi,
    toolchainDiscovery:
      config.toolchainDiscovery ?? installed.toolchainDiscovery,
  });
}
export function createHostNativeTargetKit(config = {}) {
  return createBuildAtomicKit(kitManifest, createInstalledProvider, config);
}
export default createHostNativeTargetKit;
