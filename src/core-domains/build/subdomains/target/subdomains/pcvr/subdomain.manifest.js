import { defineBuildSubdomainManifest } from "../../../../manifest-input.js";

export const subdomainManifest = defineBuildSubdomainManifest({
  id: "target-pcvr-build-domain",
  domainPath: "n:build:target:pcvr",
  parentDomainPath: "n:build:target",
  label: "PCVR Target",
  responsibility: "Own Windows x64 OpenXR host, package, and validation planning.",
  owns: ["Own Windows x64 OpenXR host, package, and validation planning."],
  forbiddenResponsibilities: ["application runtime ownership", "project source mutation", "authored product behavior"],
  requires: ["n:build:target"],
  provides: ["n:build:target:pcvr"],
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default subdomainManifest;
