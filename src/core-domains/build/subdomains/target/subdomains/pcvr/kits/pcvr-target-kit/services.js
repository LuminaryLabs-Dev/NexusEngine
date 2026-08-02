import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import { executeNativeTarget, nativeTargetPlan } from "../../../../native-target-helpers.js";

export function createPcvrTargetProvider(config = {}) {
  return defineBuildTargetProvider({
    id: "pcvr",
    label: "PCVR",
    environments: ["node-build", "openxr", "windows-x64"],
    capabilities: ["openxr-loader", "openxr-stereo", "windows-executable"],
    sourceRecords: config.sourceRecords ?? [],
    plan(context) {
      return nativeTargetPlan(context, {
        id: "pcvr",
        platform: "win32",
        commands: ["cargo", "cmake", "rustc"],
        environment: ["OPENXR_RUNTIME_JSON"],
        hostBuilder: config.hostBuilder
      });
    },
    execute(context) {
      return executeNativeTarget(context, config.hostBuilder);
    }
  });
}

export default createPcvrTargetProvider;
