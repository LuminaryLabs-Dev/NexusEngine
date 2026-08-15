import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  requirePhase
} from "../../lifecycle-contracts.js";

export const RENDER_RECOVERY_SCHEMA = "nexusengine.render-recovery/1";
export const RENDER_RECOVERY_STATES = Object.freeze(["idle", "recovering", "complete", "failed"]);

export function recoveryContract() {
  return Object.freeze({
    schema: RENDER_RECOVERY_SCHEMA,
    states: RENDER_RECOVERY_STATES,
    operations: Object.freeze(["begin", "complete", "fail"]),
    providerExecutionOwnedExternally: true,
    readyReceiptResumesRendering: true,
    nonreadyReceiptRequiresStartup: true
  });
}

export function normalizeRecoveryBeginCommand(command) {
  const normalized = normalizeOperationCommand(command, ["reason", "metadata"], "render recovery begin command");
  if (normalized.reason !== undefined && (typeof normalized.reason !== "string" || !normalized.reason.trim())) {
    throw new TypeError("render recovery begin command.reason must be a non-empty string when provided.");
  }
  normalized.reason = normalized.reason?.trim() ?? "provider-failure";
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render recovery begin command.metadata");
  return normalized;
}

export function normalizeRecoveryCompleteCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["providerReceipt", "metadata"],
    "render recovery complete command"
  );
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render recovery complete command.metadata");
  return normalized;
}

export function normalizeRecoveryFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "render recovery failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render recovery failure command.metadata");
  return normalized;
}

export function normalizeRecoverySnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-recovery",
    fields: ["status", "request", "providerReceipt", "failure"],
    label: "render recovery snapshot",
    validate(value) {
      requirePhase(value.status, RENDER_RECOVERY_STATES, "render recovery snapshot.status");
      if (value.status === "idle" && (value.request !== null || value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("An idle Render recovery snapshot cannot retain request, provider, or failure state.");
      }
      if (value.status === "recovering" && !value.request) {
        throw new TypeError("A recovering Render snapshot requires a recovery request.");
      }
      if (["recovering", "complete", "failed"].includes(value.status)) {
        normalizeRecoveryBeginCommand(value.request);
      }
      if (value.status === "recovering" && (value.providerReceipt !== null || value.failure !== null)) {
        throw new TypeError("A recovering Render snapshot cannot retain provider or failure state.");
      }
      if (value.status === "complete" && !value.providerReceipt) {
        throw new TypeError("A complete Render recovery snapshot requires a provider receipt.");
      }
      if (value.status === "complete") {
        normalizeProviderReceipt(value.providerReceipt);
        if (value.failure !== null) throw new TypeError("A complete Render recovery snapshot cannot retain failure state.");
      }
      if (value.status === "failed" && !value.failure) {
        throw new TypeError("A failed Render recovery snapshot requires failure state.");
      }
      if (value.status === "failed") {
        normalizeFailure(value.failure);
        if (value.providerReceipt !== null) {
          throw new TypeError("A failed Render recovery snapshot cannot retain a provider receipt.");
        }
      }
    }
  });
}
