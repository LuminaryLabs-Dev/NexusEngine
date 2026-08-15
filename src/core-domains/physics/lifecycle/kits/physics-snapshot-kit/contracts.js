import {
  canonicalPortable,
  normalizeLifecycleState,
  normalizeOperationCommand,
  rejectUnknownFields,
  requireObject,
  requireText
} from "../../lifecycle-contracts.js";

export const PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA = "nexusengine.physics-lifecycle-snapshot/1";
export const PHYSICS_LIFECYCLE_COMPONENTS = Object.freeze([
  "installation",
  "reset",
  "shutdown",
  "startup",
  "step"
]);

export function snapshotContract() {
  return Object.freeze({
    schema: "nexusengine.physics-snapshot/1",
    snapshotSchema: PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA,
    components: PHYSICS_LIFECYCLE_COMPONENTS,
    operations: Object.freeze(["capture", "restore"]),
    rollbackRequired: true
  });
}

export function normalizeCaptureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["snapshotId", "label", "metadata"], "physics snapshot capture command");
  normalized.snapshotId = requireText(normalized.snapshotId ?? normalized.operationId, "physics snapshot capture command.snapshotId");
  if (normalized.label !== undefined && (typeof normalized.label !== "string" || !normalized.label.trim())) {
    throw new TypeError("physics snapshot capture command.label must be a non-empty string when provided.");
  }
  normalized.label = normalized.label?.trim() ?? null;
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics snapshot capture command.metadata");
  return normalized;
}

export function normalizeLifecycleBundle(snapshot) {
  requireObject(snapshot, "physics lifecycle snapshot");
  rejectUnknownFields(snapshot, ["schema", "snapshotId", "label", "components", "metadata"], "physics lifecycle snapshot");
  const normalized = canonicalPortable(snapshot, "physics lifecycle snapshot");
  if (normalized.schema !== PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA) {
    throw new TypeError(`physics lifecycle snapshot.schema must equal ${PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA}.`);
  }
  normalized.snapshotId = requireText(normalized.snapshotId, "physics lifecycle snapshot.snapshotId");
  if (normalized.label !== null && normalized.label !== undefined) {
    normalized.label = requireText(normalized.label, "physics lifecycle snapshot.label");
  } else {
    normalized.label = null;
  }
  requireObject(normalized.components, "physics lifecycle snapshot.components");
  rejectUnknownFields(normalized.components, PHYSICS_LIFECYCLE_COMPONENTS, "physics lifecycle snapshot.components");
  for (const component of PHYSICS_LIFECYCLE_COMPONENTS) {
    requireObject(normalized.components[component], `physics lifecycle snapshot.components.${component}`);
  }
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics lifecycle snapshot.metadata");
  return normalized;
}

export function normalizeRestoreCommand(command) {
  const normalized = normalizeOperationCommand(command, ["snapshot", "metadata"], "physics snapshot restore command");
  normalized.snapshot = normalizeLifecycleBundle(normalized.snapshot);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics snapshot restore command.metadata");
  return normalized;
}

export function normalizeSnapshotKitState(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-snapshot",
    fields: ["captures", "lastRestored"],
    label: "physics snapshot Kit state",
    validate(value) {
      requireObject(value.captures, "physics snapshot Kit state.captures");
      for (const capture of Object.values(value.captures)) normalizeLifecycleBundle(capture);
    }
  });
}
