import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const proof = ["tests/core-domain-kits-smoke.mjs"];

export const networkDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({ id: "network-domain", domainPath: "n:network", label: "Network", responsibility: "Own session, peer, message, synchronization, authority, latency, reconnect, and collaboration contracts.", owns: ["session descriptors", "peer descriptors", "message envelopes", "authority contracts", "sync contracts"], forbiddenResponsibilities: ["socket implementation", "HTTP transport", "platform authentication", "matchmaking service"], provides: ["n:network", "network:session", "network:message", "network:sync-contract"], proofReferences: proof }),
  publicEntry: { subpath: "./domains/network", module: "./src/core-domains/network/index.js" },
  publicKits: [atomicKit({ id: "network-contract-kit", responsibility: "Describe network sessions, messages, authority, and synchronization without owning transport.", domainPath: "n:network", apiName: "network", provides: ["n:network", "network:session", "network:message", "network:sync-contract"], module: "./src/core-domains/network/kits/network-kit/index.js", exportName: "createNetworkKit", publicSubpath: "./domains/network/contracts", proofReferences: proof })]
}));

export default networkDomainManifest;
