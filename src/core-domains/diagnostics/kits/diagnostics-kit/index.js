import { createDomainKit } from "../../../domain-kit.js";

export function createDiagnosticsKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "diagnostics-kit",
    id: config.id ?? "diagnostics-kit",

    domainPath: config.domainPath ?? "n:diagnostics",
    domain: "diagnostics",

    apiName: config.apiName ?? "diagnostics",
    purpose: "Telemetry, runtime snapshots, replay fixtures, determinism guards, performance counters, kit health, and promotion evidence.",
    owns: ["telemetry", "runtime snapshots", "replay fixtures", "determinism guards", "performance counters", "kit health reports"],
    doesNotOwn: ["external observability vendor integration"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
