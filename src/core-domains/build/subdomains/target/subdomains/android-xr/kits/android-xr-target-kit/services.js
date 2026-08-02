import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import { executeNativeTarget, nativeTargetPlan } from "../../../../native-target-helpers.js";

export function createAndroidXrTargetProvider(config = {}) {
  return defineBuildTargetProvider({
    id: "android-xr",
    label: "Android XR",
    environments: ["android-arm64", "node-build", "openxr"],
    capabilities: ["apk", "openxr-loader", "openxr-stereo"],
    sourceRecords: config.sourceRecords ?? [],
    plan(context) {
      return nativeTargetPlan(context, {
        id: "android-xr",
        commands: ["cargo", "java", "rustc"],
        environment: ["ANDROID_SDK_ROOT", "ANDROID_NDK_HOME"],
        hostBuilder: config.hostBuilder
      });
    },
    execute(context) {
      return executeNativeTarget(context, config.hostBuilder);
    }
  });
}

export default createAndroidXrTargetProvider;
