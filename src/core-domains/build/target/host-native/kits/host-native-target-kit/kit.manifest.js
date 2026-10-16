import { defineBuildAtomicKitManifest } from "../../../../manifest-input.js";
export default defineBuildAtomicKitManifest({
  id: "host-native-target-kit",
  responsibility:
    "Compile Rust and embedded Node contract bindings for local host proof; no redistributable package claim.",
  domainPath: "n:build:target:host-native",
  apiName: "hostNativeTarget",
  requires: [
    "n:build:target",
    "build:rust-lowering",
    "build:runtime-abi",
    "build:process-execution",
    "build:toolchain-discovery",
  ],
  provides: ["n:build:target:host-native", "build:host-native-target"],
  module:
    "./src/core-domains/build/target/host-native/kits/host-native-target-kit/index.js",
  exportName: "createHostNativeTargetKit",
  publicSubpath: "./domains/build/target/host-native/host-native-target",
  proofReferences: ["src/core-domains/build/tests/host-native.mjs"],
});
