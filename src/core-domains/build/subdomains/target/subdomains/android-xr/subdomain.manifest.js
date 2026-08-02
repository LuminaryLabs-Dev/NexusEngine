import { defineBuildSubdomainManifest } from "../../../../manifest-input.js";

export const subdomainManifest = defineBuildSubdomainManifest({
  id: "target-android-xr-build-domain",
  domainPath: "n:build:target:android-xr",
  parentDomainPath: "n:build:target",
  label: "Android XR Target",
  responsibility: "Own Android ARM64 OpenXR host, package, and validation planning.",
  owns: ["Own Android ARM64 OpenXR host, package, and validation planning."],
  forbiddenResponsibilities: ["application runtime ownership", "project source mutation", "authored product behavior"],
  requires: ["n:build:target"],
  provides: ["n:build:target:android-xr"],
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default subdomainManifest;
