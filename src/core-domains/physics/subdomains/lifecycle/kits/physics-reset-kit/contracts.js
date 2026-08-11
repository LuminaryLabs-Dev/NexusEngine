import {
  canonicalPortable,
  normalizeLifecycleState,
  normalizeOperationCommand
} from "../../lifecycle-contracts.js";

export const PHYSICS_RESET_SCHEMA = "nexusengine.physics-reset/1";

export function resetContract() {
  return Object.freeze({
    schema: PHYSICS_RESET_SCHEMA,
    operations: Object.freeze(["resetPhysics"]),
    resetOrder: Object.freeze(["startup", "step", "shutdown", "installation"]),
    rollbackRequired: true
  });
}

export function normalizePhysicsResetCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["reason", "preserveInstallation", "metadata"],
    "physics reset command"
  );
  if (normalized.reason !== undefined && (typeof normalized.reason !== "string" || !normalized.reason.trim())) {
    throw new TypeError("physics reset command.reason must be a non-empty string when provided.");
  }
  normalized.reason = normalized.reason?.trim() ?? "requested";
  if (normalized.preserveInstallation !== undefined && typeof normalized.preserveInstallation !== "boolean") {
    throw new TypeError("physics reset command.preserveInstallation must be boolean.");
  }
  normalized.preserveInstallation = normalized.preserveInstallation ?? true;
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics reset command.metadata");
  return normalized;
}

export function normalizeResetSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-reset",
    fields: ["lastReset"],
    label: "physics reset snapshot"
  });
}
