import { defineBuildAtomicKitManifest } from "../../../../../../manifest-input.js";

export const kitManifest = defineBuildAtomicKitManifest({
  id: "openxr-runtime-kit",
  responsibility: "Own OpenXR loader, session, spaces, frame timing, and lifecycle contracts.",
  domainPath: "n:build:target:openxr",
  apiName: "openxrRuntime",
  requires: ["n:build:target"],
  provides: ["n:build:target:openxr", "build:openxr-runtime"],
  module: "./src/core-domains/build/subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/index.js",
  exportName: "createOpenXrRuntimeKit",
  publicSubpath: "./domains/build/target/openxr/openxr-runtime",
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default kitManifest;
