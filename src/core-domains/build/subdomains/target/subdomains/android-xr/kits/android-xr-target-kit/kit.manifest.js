import { defineBuildAtomicKitManifest } from "../../../../../../manifest-input.js";

export const kitManifest = defineBuildAtomicKitManifest({
  id: "android-xr-target-kit",
  responsibility: "Own Android ARM64 lifecycle, SDK/NDK, Gradle, APK, and OpenXR binding stages.",
  domainPath: "n:build:target:android-xr",
  apiName: "androidXrTarget",
  requires: ["n:build:target:openxr", "build:openxr-input", "build:openxr-render", "n:build:compile", "n:build:toolchain"],
  provides: ["n:build:target:android-xr", "build:android-xr-target"],
  module: "./src/core-domains/build/subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/index.js",
  exportName: "createAndroidXrTargetKit",
  publicSubpath: "./domains/build/target/android-xr/android-xr-target",
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default kitManifest;
