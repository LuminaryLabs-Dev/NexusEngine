import {
  canonicalPortable,
  normalizeLifecycleState,
  normalizeOperationCommand,
  optionalText,
  rejectUnknownFields,
  requireObject,
  requirePhase,
  requireText
} from "../../lifecycle-contracts.js";

export const RENDER_RESET_SCHEMA = "nexusengine.render-reset/1";

export function resetContract() {
  return Object.freeze({
    schema: RENDER_RESET_SCHEMA,
    operations: Object.freeze(["resetRender"]),
    resetOrder: Object.freeze(["recovery", "startup", "shutdown", "installation"]),
    rollbackRequired: true
  });
}

export function normalizeRenderResetCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["reason", "preserveInstallation", "metadata"],
    "render reset command"
  );
  if (normalized.reason !== undefined && (typeof normalized.reason !== "string" || !normalized.reason.trim())) {
    throw new TypeError("render reset command.reason must be a non-empty string when provided.");
  }
  normalized.reason = normalized.reason?.trim() ?? "requested";
  if (normalized.preserveInstallation !== undefined && typeof normalized.preserveInstallation !== "boolean") {
    throw new TypeError("render reset command.preserveInstallation must be boolean.");
  }
  normalized.preserveInstallation = normalized.preserveInstallation ?? true;
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render reset command.metadata");
  return normalized;
}

export function normalizeResetSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-reset",
    fields: ["lastReset"],
    label: "render reset snapshot",
    validate(value) {
      if (value.lastReset === null) return;
      requireObject(value.lastReset, "render reset snapshot.lastReset");
      rejectUnknownFields(
        value.lastReset,
        ["schema", "reason", "preserveInstallation", "phase", "installationId", "installationResult"],
        "render reset snapshot.lastReset"
      );
      if (value.lastReset.schema !== "nexusengine.render-reset-result/1") {
        throw new TypeError("render reset snapshot.lastReset.schema is unsupported.");
      }
      requireText(value.lastReset.reason, "render reset snapshot.lastReset.reason");
      if (typeof value.lastReset.preserveInstallation !== "boolean") {
        throw new TypeError("render reset snapshot.lastReset.preserveInstallation must be boolean.");
      }
      requirePhase(value.lastReset.phase, ["uninstalled", "installed"], "render reset snapshot.lastReset.phase");
      optionalText(value.lastReset.installationId, "render reset snapshot.lastReset.installationId");
      requireObject(value.lastReset.installationResult, "render reset snapshot.lastReset.installationResult");
    }
  });
}
