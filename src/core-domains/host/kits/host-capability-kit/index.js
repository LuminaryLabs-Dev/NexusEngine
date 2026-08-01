import { createDomainKit } from "../../../domain-kit.js";

export function createHostCapabilityKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "host-capability-kit",
    id: config.id ?? "host-capability-kit",

    domainPath: config.domainPath ?? "n:host",
    domain: "host",

    apiName: config.apiName ?? "host",
    purpose: "Host capability detection and fallback mode selection.",
    owns: ["host capability descriptors", "device class", "permission descriptors", "fallback mode selection"],
    doesNotOwn: ["renderer implementation", "device-specific game logic"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
