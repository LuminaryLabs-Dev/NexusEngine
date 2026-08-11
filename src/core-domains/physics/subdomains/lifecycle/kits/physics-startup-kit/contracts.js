import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  requirePhase
} from "../../lifecycle-contracts.js";

export const PHYSICS_STARTUP_SCHEMA = "nexusengine.physics-startup/1";
export const PHYSICS_STARTUP_STATES = Object.freeze(["idle", "starting", "ready", "failed"]);

export function startupContract() {
  return Object.freeze({
    schema: PHYSICS_STARTUP_SCHEMA,
    states: PHYSICS_STARTUP_STATES,
    operations: Object.freeze(["begin", "complete", "fail", "markStopped"]),
    providerExecutionOwnedExternally: true
  });
}

export function normalizeStartupBeginCommand(command) {
  const normalized = normalizeOperationCommand(command, ["configuration", "metadata"], "physics startup begin command");
  normalized.configuration = canonicalPortable(normalized.configuration ?? {}, "physics startup begin command.configuration");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics startup begin command.metadata");
  return normalized;
}

export function normalizeStartupCompleteCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "physics startup complete command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: true });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics startup complete command.metadata");
  return normalized;
}

export function normalizeStartupFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "physics startup failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics startup failure command.metadata");
  return normalized;
}

export function normalizeStartupStoppedCommand(command) {
  const normalized = normalizeOperationCommand(command, ["metadata"], "physics startup stopped command");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics startup stopped command.metadata");
  return normalized;
}

export function normalizeStartupSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-startup",
    fields: ["status", "request", "providerReceipt", "failure"],
    label: "physics startup snapshot",
    validate(value) {
      requirePhase(value.status, PHYSICS_STARTUP_STATES, "physics startup snapshot.status");
      if (value.status === "idle" && (value.request !== null || value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("An idle Physics startup snapshot cannot retain active request, provider, or failure state.");
      }
      if (value.status === "starting" && !value.request) {
        throw new TypeError("A starting Physics startup snapshot requires a request.");
      }
      if (value.status === "ready" && !value.providerReceipt) {
        throw new TypeError("A ready Physics startup snapshot requires a provider receipt.");
      }
      if (value.status === "failed" && !value.failure) {
        throw new TypeError("A failed Physics startup snapshot requires failure state.");
      }
    }
  });
}
