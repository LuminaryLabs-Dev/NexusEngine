import { createDomainKit } from "../../../../domain-kit.js";

export function createPersistenceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "persistence-contract-kit",
    id: config.id ?? "persistence-contract-kit",
    domain: "persistence",
    domainPath: config.domainPath ?? "n:runtime:persistence",
    parentDomainPath: config.parentDomainPath ?? "n:runtime",
    apiName: config.apiName ?? "persistence",
    purpose: "Save/load targets, persistence adapters, save slots, recovery saves, and migration records.",
    owns: ["save slots", "persistence adapters", "snapshot persistence", "migration records"],
    doesNotOwn: ["state schema ownership", "cloud provider SDK specifics"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
