import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const proof = ["tests/core-domain-kits-smoke.mjs"];

export const hostDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({ id: "host-domain", domainPath: "n:host", label: "Host", responsibility: "Own host capability descriptors and fallback contracts without platform implementation.", owns: ["host capability descriptors", "host requirement contracts", "fallback selection contracts"], forbiddenResponsibilities: ["browser implementation", "Node process lifecycle", "native host implementation", "renderer implementation", "storage implementation"], provides: ["n:host", "host:capability-contract", "host:fallback-contract"], proofReferences: proof }),
  publicEntry: { subpath: "./domains/host", module: "./src/core-domains/host/index.js" },
  publicKits: [atomicKit({ id: "host-capability-kit", responsibility: "Describe available host capabilities and select declarative fallback modes.", domainPath: "n:host", apiName: "host", provides: ["n:host", "host:capability-contract", "host:fallback-contract"], module: "./src/core-domains/host/kits/host-capability-kit/index.js", exportName: "createHostCapabilityKit", publicSubpath: "./domains/host/capabilities", proofReferences: proof })]
}));

export default hostDomainManifest;
