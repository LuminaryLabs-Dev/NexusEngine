import { createDomainKit } from "../../../domain-kit.js";

export function createNetworkKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "network-contract-kit",
    id: config.id ?? "network-contract-kit",

    domainPath: config.domainPath ?? "n:network",
    domain: "network",

    apiName: config.apiName ?? "network",
    purpose: "Session, peer, message envelope, event sync, state sync, authority, latency, reconnect, and collaboration contracts.",
    owns: ["sessions", "peers", "message envelopes", "sync policies", "authority descriptors", "reconnect state"],
    doesNotOwn: ["transport provider SDK", "backend service implementation"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
