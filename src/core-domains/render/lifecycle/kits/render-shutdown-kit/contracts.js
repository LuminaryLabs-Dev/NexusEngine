import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  requirePhase
} from "../../lifecycle-contracts.js";

export const RENDER_SHUTDOWN_SCHEMA = "nexusengine.render-shutdown/1";
export const RENDER_SHUTDOWN_STATES = Object.freeze(["idle", "stopping", "complete", "failed"]);

export function shutdownContract() {
  return Object.freeze({
    schema: RENDER_SHUTDOWN_SCHEMA,
    states: RENDER_SHUTDOWN_STATES,
    operations: Object.freeze(["begin", "complete", "fail"]),
    providerExecutionOwnedExternally: true
  });
}

export function normalizeShutdownBeginCommand(command) {
  const normalized = normalizeOperationCommand(command, ["metadata"], "render shutdown begin command");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render shutdown begin command.metadata");
  return normalized;
}

export function normalizeShutdownCompleteCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "render shutdown complete command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: false });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render shutdown complete command.metadata");
  return normalized;
}

export function normalizeShutdownFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "render shutdown failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render shutdown failure command.metadata");
  return normalized;
}

export function normalizeShutdownSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-shutdown",
    fields: ["status", "request", "providerReceipt", "failure"],
    label: "render shutdown snapshot",
    validate(value) {
      requirePhase(value.status, RENDER_SHUTDOWN_STATES, "render shutdown snapshot.status");
      if (value.status === "idle" && (value.request !== null || value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("An idle Render shutdown snapshot cannot retain request, provider, or failure state.");
      }
      if (["stopping", "complete", "failed"].includes(value.status)) {
        normalizeShutdownBeginCommand(value.request);
      }
      if (value.status === "stopping" && (value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("A stopping Render shutdown snapshot cannot retain provider or failure state.");
      }
      if (value.status === "complete") {
        normalizeProviderReceipt(value.providerReceipt, { ready: false });
        if (value.failure !== null) throw new TypeError("A complete Render shutdown snapshot cannot retain failure state.");
      }
      if (value.status === "failed") {
        normalizeFailure(value.failure);
        if (value.providerReceipt !== null) {
          throw new TypeError("A failed Render shutdown snapshot cannot retain a provider receipt.");
        }
      }
    }
  });
}
