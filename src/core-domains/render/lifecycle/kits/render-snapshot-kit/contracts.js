import {
  assertProviderReceiptMatchesInstallation,
  canonicalPortable,
  normalizeLifecycleState,
  normalizeOperationCommand,
  optionalText,
  rejectUnknownFields,
  requireObject,
  requireText
} from "../../lifecycle-contracts.js";
import { normalizeInstallationSnapshot } from "../render-installation-kit/contracts.js";
import { normalizeRecoverySnapshot } from "../render-recovery-kit/contracts.js";
import { normalizeResetSnapshot } from "../render-reset-kit/contracts.js";
import { normalizeShutdownSnapshot } from "../render-shutdown-kit/contracts.js";
import { normalizeStartupSnapshot } from "../render-startup-kit/contracts.js";

export const RENDER_LIFECYCLE_SNAPSHOT_SCHEMA = "nexusengine.render-lifecycle-snapshot/1";
export const RENDER_LIFECYCLE_COMPONENTS = Object.freeze([
  "installation",
  "recovery",
  "reset",
  "shutdown",
  "startup"
]);

const COMPONENT_NORMALIZERS = Object.freeze({
  installation: normalizeInstallationSnapshot,
  recovery: normalizeRecoverySnapshot,
  reset: normalizeResetSnapshot,
  shutdown: normalizeShutdownSnapshot,
  startup: normalizeStartupSnapshot
});

function requireStatus(actual, expected, label) {
  if (actual !== expected) {
    throw new TypeError(`${label} must be ${expected}, received ${actual}.`);
  }
}

function validateLifecycleCoherence(components) {
  const { installation, recovery, shutdown, startup } = components;
  const phase = installation.phase;

  if (phase === "uninstalled") {
    requireStatus(startup.status, "idle", "Uninstalled Render Startup status");
    requireStatus(shutdown.status, "idle", "Uninstalled Render Shutdown status");
    requireStatus(recovery.status, "idle", "Uninstalled Render Recovery status");
  } else if (phase === "installed") {
    requireStatus(startup.status, "idle", "Installed Render Startup status");
  } else if (phase === "starting") {
    requireStatus(startup.status, "starting", "Starting Render Startup status");
  } else if (phase === "ready") {
    requireStatus(startup.status, "ready", "Ready Render Startup status");
  } else if (phase === "stopping") {
    requireStatus(shutdown.status, "stopping", "Stopping Render Shutdown status");
  } else if (phase === "recovering") {
    requireStatus(startup.status, "idle", "Recovering Render Startup status");
    requireStatus(recovery.status, "recovering", "Recovering Render Recovery status");
  }

  if (startup.status === "starting" && phase !== "starting") {
    throw new TypeError("A starting Render Startup snapshot requires Installation phase starting.");
  }
  if (startup.status === "ready" && !["ready", "failed"].includes(phase)) {
    throw new TypeError("A ready Render Startup snapshot requires Installation phase ready or failed.");
  }
  if (shutdown.status === "stopping" && phase !== "stopping") {
    throw new TypeError("A stopping Render Shutdown snapshot requires Installation phase stopping.");
  }
  if (recovery.status === "recovering" && phase !== "recovering") {
    throw new TypeError("A recovering Render Recovery snapshot requires Installation phase recovering.");
  }

  const installed = installation.installation;
  if (installed) {
    for (const receipt of [startup.providerReceipt, shutdown.providerReceipt, recovery.providerReceipt]) {
      if (receipt) assertProviderReceiptMatchesInstallation(installed, receipt);
    }
  }
}

export function snapshotContract() {
  return Object.freeze({
    schema: "nexusengine.render-snapshot/1",
    snapshotSchema: RENDER_LIFECYCLE_SNAPSHOT_SCHEMA,
    components: RENDER_LIFECYCLE_COMPONENTS,
    operations: Object.freeze(["capture", "restore"]),
    rollbackRequired: true
  });
}

export function normalizeCaptureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["snapshotId", "label", "metadata"], "render snapshot capture command");
  normalized.snapshotId = requireText(normalized.snapshotId ?? normalized.operationId, "render snapshot capture command.snapshotId");
  if (normalized.label !== undefined && (typeof normalized.label !== "string" || !normalized.label.trim())) {
    throw new TypeError("render snapshot capture command.label must be a non-empty string when provided.");
  }
  normalized.label = normalized.label?.trim() ?? null;
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render snapshot capture command.metadata");
  return normalized;
}

export function normalizeLifecycleBundle(snapshot) {
  requireObject(snapshot, "render lifecycle snapshot");
  rejectUnknownFields(snapshot, ["schema", "snapshotId", "label", "components", "metadata"], "render lifecycle snapshot");
  const normalized = canonicalPortable(snapshot, "render lifecycle snapshot");
  if (normalized.schema !== RENDER_LIFECYCLE_SNAPSHOT_SCHEMA) {
    throw new TypeError(`render lifecycle snapshot.schema must equal ${RENDER_LIFECYCLE_SNAPSHOT_SCHEMA}.`);
  }
  normalized.snapshotId = requireText(normalized.snapshotId, "render lifecycle snapshot.snapshotId");
  if (normalized.label !== null && normalized.label !== undefined) {
    normalized.label = requireText(normalized.label, "render lifecycle snapshot.label");
  } else {
    normalized.label = null;
  }
  requireObject(normalized.components, "render lifecycle snapshot.components");
  rejectUnknownFields(normalized.components, RENDER_LIFECYCLE_COMPONENTS, "render lifecycle snapshot.components");
  for (const component of RENDER_LIFECYCLE_COMPONENTS) {
    requireObject(normalized.components[component], `render lifecycle snapshot.components.${component}`);
    normalized.components[component] = COMPONENT_NORMALIZERS[component](normalized.components[component]);
  }
  validateLifecycleCoherence(normalized.components);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render lifecycle snapshot.metadata");
  return normalized;
}

export function normalizeRestoreCommand(command) {
  const normalized = normalizeOperationCommand(command, ["snapshot", "metadata"], "render snapshot restore command");
  normalized.snapshot = normalizeLifecycleBundle(normalized.snapshot);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render snapshot restore command.metadata");
  return normalized;
}

export function normalizeSnapshotKitState(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-snapshot",
    fields: ["captures", "lastRestored"],
    label: "render snapshot Kit state",
    validate(value) {
      requireObject(value.captures, "render snapshot Kit state.captures");
      for (const [snapshotId, capture] of Object.entries(value.captures)) {
        const normalizedCapture = normalizeLifecycleBundle(capture);
        if (normalizedCapture.snapshotId !== snapshotId) {
          throw new TypeError(
            `Render snapshot capture key ${snapshotId} does not match snapshotId ${normalizedCapture.snapshotId}.`
          );
        }
        value.captures[snapshotId] = normalizedCapture;
      }
      optionalText(value.lastRestored, "render snapshot Kit state.lastRestored");
    }
  });
}
