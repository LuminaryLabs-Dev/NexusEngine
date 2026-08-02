import { defineBuildSubdomainManifest } from "../../../../manifest-input.js";

export const subdomainManifest = defineBuildSubdomainManifest({
  id: "target-openxr-build-domain",
  domainPath: "n:build:target:openxr",
  parentDomainPath: "n:build:target",
  label: "OpenXR Target",
  responsibility: "Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts.",
  owns: ["Own shared native OpenXR session, input, frame, view, swapchain, and submission contracts."],
  forbiddenResponsibilities: ["application runtime ownership", "project source mutation", "authored product behavior"],
  requires: ["n:build:target"],
  provides: ["n:build:target:openxr"],
  proofReferences: ["src/core-domains/build/tests/domain-tree.mjs","src/core-domains/build/tests/full-build-loop.mjs"]
});

export default subdomainManifest;
