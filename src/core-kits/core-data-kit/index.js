import { createCoreCapabilityKit } from "../core-capability-kit.js";

export * from "./snapshot.js";
export * from "./ledger.js";
export * from "./selectors.js";
export * from "./schema.js";
export * from "./migration.js";

export function createCoreDataKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-data",
    apiName: config.apiName ?? "coreData",
    purpose: "Durable state, snapshots, selectors, schemas, ledgers, and migrations.",
    owns: ["serializable state", "snapshots", "selectors", "completion ledgers", "idempotency ledgers", "data migrations"],
    doesNotOwn: ["storage targets", "renderer data", "agent decisions"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
