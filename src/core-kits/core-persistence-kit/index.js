import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCorePersistenceKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-persistence",
    apiName: config.apiName ?? "corePersistence",
    purpose: "Save/load targets, persistence adapters, save slots, recovery saves, and migration records.",
    owns: ["save slots", "persistence adapters", "snapshot persistence", "migration records"],
    doesNotOwn: ["state schema ownership", "cloud provider SDK specifics"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
