import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  optionalText,
  requirePhase,
  requireObject,
  rejectUnknownFields,
  requireText
} from "../../lifecycle-contracts.js";

export const RENDER_INSTALLATION_SCHEMA = "nexusengine.render-installation/1";
export const RENDER_INSTALLATION_PHASES = Object.freeze([
  "uninstalled",
  "installed",
  "starting",
  "ready",
  "stopping",
  "recovering",
  "failed"
]);

export function installationContract() {
  return Object.freeze({
    schema: RENDER_INSTALLATION_SCHEMA,
    domainPath: "n:render:lifecycle",
    phases: RENDER_INSTALLATION_PHASES,
    operations: Object.freeze([
      "install",
      "uninstall",
      "beginStartup",
      "completeStartup",
      "beginShutdown",
      "completeShutdown",
      "beginRecovery",
      "completeRecovery",
      "fail"
    ]),
    phaseOwner: "render-installation-kit",
    providerExecutionOwnedExternally: true
  });
}

export function normalizeInstallCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["installationId", "providerId", "providerVersion", "configuration", "metadata"],
    "render install command"
  );
  normalized.schema = normalized.schema ?? "nexusengine.render-install-command/1";
  if (normalized.schema !== "nexusengine.render-install-command/1") {
    throw new TypeError("render install command schema is unsupported.");
  }
  normalized.providerId = requireText(normalized.providerId, "render install command.providerId");
  normalized.providerVersion = optionalText(normalized.providerVersion, "render install command.providerVersion");
  normalized.installationId = optionalText(
    normalized.installationId,
    "render install command.installationId",
    `render:${normalized.providerId}`
  );
  normalized.configuration = canonicalPortable(normalized.configuration ?? {}, "render install command.configuration");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render install command.metadata");
  return normalized;
}

export function normalizeInstallationRecord(value) {
  requireObject(value, "render installation record");
  rejectUnknownFields(
    value,
    ["schema", "installationId", "providerId", "providerVersion", "configuration", "metadata"],
    "render installation record"
  );
  const normalized = canonicalPortable(value, "render installation record");
  if (normalized.schema !== "nexusengine.render-installation-record/1") {
    throw new TypeError("render installation record.schema is unsupported.");
  }
  normalized.installationId = requireText(normalized.installationId, "render installation record.installationId");
  normalized.providerId = requireText(normalized.providerId, "render installation record.providerId");
  normalized.providerVersion = optionalText(normalized.providerVersion, "render installation record.providerVersion");
  normalized.configuration = canonicalPortable(normalized.configuration ?? {}, "render installation record.configuration");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render installation record.metadata");
  return normalized;
}

export function normalizeSimpleInstallationCommand(command, label) {
  const normalized = normalizeOperationCommand(command, ["metadata"], label);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, `${label}.metadata`);
  return normalized;
}

export function normalizeReadyCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "render startup completion command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: true });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render startup completion command.metadata");
  return normalized;
}

export function normalizeRecoveryCompletionCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["providerReceipt", "metadata"],
    "render recovery completion command"
  );
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render recovery completion command.metadata");
  return normalized;
}

export function normalizeFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "render lifecycle failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "render lifecycle failure command.metadata");
  return normalized;
}

export function normalizeInstallationSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "render-installation",
    fields: ["phase", "installation", "failure", "lifecycleRevision"],
    label: "render installation snapshot",
    validate(value) {
      requirePhase(value.phase, RENDER_INSTALLATION_PHASES, "render installation snapshot.phase");
      if (!Number.isInteger(value.lifecycleRevision) || value.lifecycleRevision < 0) {
        throw new TypeError("render installation snapshot.lifecycleRevision must be a nonnegative integer.");
      }
      if (value.phase === "uninstalled" && value.installation !== null) {
        throw new TypeError("An uninstalled Render lifecycle cannot retain an installation record.");
      }
      if (value.phase !== "uninstalled" && !value.installation) {
        throw new TypeError("An installed Render lifecycle requires an installation record.");
      }
      if (value.installation) {
        normalizeInstallationRecord(value.installation);
      }
      if (["failed", "recovering"].includes(value.phase) && !value.failure) {
        throw new TypeError(`A ${value.phase} Render installation snapshot requires failure state.`);
      }
      if (value.failure !== null) {
        normalizeFailure(value.failure);
      }
      if (["uninstalled", "installed", "starting", "ready"].includes(value.phase) && value.failure !== null) {
        throw new TypeError(`A ${value.phase} Render installation snapshot cannot retain failure state.`);
      }
    }
  });
}
