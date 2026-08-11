import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  requirePhase
} from "../../lifecycle-contracts.js";

export const RENDER_STARTUP_SCHEMA = "nexusengine.render-startup/1";
export const RENDER_STARTUP_STATES = Object.freeze(["idle", "starting", "ready", "failed"]);

export function startupContract() {
  return Object.freeze({
    schema: RENDER_STARTUP_SCHEMA,
    states: RENDER_STARTUP_STATES,
    operations: Object.freeze(["begin", "complete", "fail", "markStopped", "adoptRecovery"]),
    providerExecutionOwnedExternally: true
  });
}

export function normalizeStartupBeginCommand(command) {
  const normalized = normalizeOperationCommand(command, ["configuration", "metadata"], "render startup begin command");
  normalized.configuration = canonicalPortable(normalized.configuration ?? {}, "render startup begin command.configuration");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render startup begin command.metadata");
  return normalized;
}

export function normalizeStartupCompleteCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "render startup complete command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: true });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render startup complete command.metadata");
  return normalized;
}

export function normalizeStartupFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "render startup failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render startup failure command.metadata");
  return normalized;
}

export function normalizeStartupStoppedCommand(command) {
  const normalized = normalizeOperationCommand(command, ["metadata"], "render startup stopped command");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render startup stopped command.metadata");
  return normalized;
}

export function normalizeRecoveryAdoptionCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["providerReceipt", "metadata"],
    "render recovery adoption command"
  );
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: true });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render recovery adoption command.metadata");
  return normalized;
}

export function normalizeStartupSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-startup",
    fields: ["status", "request", "providerReceipt", "failure"],
    label: "render startup snapshot",
    validate(value) {
      requirePhase(value.status, RENDER_STARTUP_STATES, "render startup snapshot.status");
      if (value.status === "idle" && (value.request !== null || value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("An idle Render startup snapshot cannot retain active request, provider, or failure state.");
      }
      if (value.status === "starting" && !value.request) {
        throw new TypeError("A starting Render startup snapshot requires a request.");
      }
      if (["starting", "failed"].includes(value.status) || (value.status === "ready" && value.request !== null)) {
        normalizeStartupBeginCommand(value.request);
      }
      if (value.status === "starting" && (value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("A starting Render startup snapshot cannot retain provider or failure state.");
      }
      if (value.status === "ready" && !value.providerReceipt) {
        throw new TypeError("A ready Render startup snapshot requires a provider receipt.");
      }
      if (value.status === "ready") {
        normalizeProviderReceipt(value.providerReceipt, { ready: true });
        if (value.failure !== null) throw new TypeError("A ready Render startup snapshot cannot retain failure state.");
      }
      if (value.status === "failed" && !value.failure) {
        throw new TypeError("A failed Render startup snapshot requires failure state.");
      }
      if (value.status === "failed") {
        normalizeFailure(value.failure);
        if (value.providerReceipt !== null) {
          throw new TypeError("A failed Render startup snapshot cannot retain a provider receipt.");
        }
      }
    }
  });
}
