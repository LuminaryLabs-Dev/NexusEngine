import { defineBuildAtomicKitManifest } from "../../../../../../manifest-input.js";

export const kitManifest = defineBuildAtomicKitManifest({
  id: "pcvr-target-kit",
  responsibility: "Own Windows x64 host, OpenXR loader, executable package, and runtime validation stages.",
  domainPath: "n:build:target:pcvr",
  apiName: "pcvrTarget",
  requires: ["n:build:target:openxr", "build:openxr-input", "build:openxr-render", "n:build:compile", "n:build:toolchain"],
  provides: ["n:build:target:pcvr", "build:pcvr-target"],
  module: "./src/core-domains/build/subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/index.js",
  exportName: "createPcvrTargetKit",
  publicSubpath: "./domains/build/target/pcvr/pcvr-target",
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default kitManifest;
