import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  requirePhase
} from "../../lifecycle-contracts.js";

export const PHYSICS_SHUTDOWN_SCHEMA = "nexusengine.physics-shutdown/1";
export const PHYSICS_SHUTDOWN_STATES = Object.freeze(["idle", "stopping", "complete", "failed"]);

export function shutdownContract() {
  return Object.freeze({
    schema: PHYSICS_SHUTDOWN_SCHEMA,
    states: PHYSICS_SHUTDOWN_STATES,
    operations: Object.freeze(["begin", "complete", "fail"]),
    providerExecutionOwnedExternally: true
  });
}

export function normalizeShutdownBeginCommand(command) {
  const normalized = normalizeOperationCommand(command, ["metadata"], "physics shutdown begin command");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics shutdown begin command.metadata");
  return normalized;
}

export function normalizeShutdownCompleteCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "physics shutdown complete command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: false });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics shutdown complete command.metadata");
  return normalized;
}

export function normalizeShutdownFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "physics shutdown failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics shutdown failure command.metadata");
  return normalized;
}

export function normalizeShutdownSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-shutdown",
    fields: ["status", "request", "providerReceipt", "failure"],
    label: "physics shutdown snapshot",
    validate(value) {
      requirePhase(value.status, PHYSICS_SHUTDOWN_STATES, "physics shutdown snapshot.status");
    }
  });
}
