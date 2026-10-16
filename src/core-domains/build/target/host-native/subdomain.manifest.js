import { defineBuildSubdomainManifest } from "../../manifest-input.js";
export default defineBuildSubdomainManifest({
  id: "target-host-native-build-domain",
  domainPath: "n:build:target:host-native",
  parentDomainPath: "n:build:target",
  label: "Native Host",
  responsibility:
    "Own local native and embedded Node contract proof on the build host.",
  owns: ["host contract proof"],
  forbiddenResponsibilities: [
    "application runtime ownership",
    "project source mutation",
    "authored product behavior",
  ],
  requires: ["n:build:target"],
  provides: ["n:build:target:host-native"],
  proofReferences: ["src/core-domains/build/tests/host-native.mjs"],
});
