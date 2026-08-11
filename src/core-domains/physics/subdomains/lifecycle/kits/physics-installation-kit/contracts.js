import {
  canonicalPortable,
  normalizeFailure,
  normalizeLifecycleState,
  normalizeOperationCommand,
  normalizeProviderReceipt,
  optionalText,
  requirePhase,
  requireText
} from "../../lifecycle-contracts.js";

export const PHYSICS_INSTALLATION_SCHEMA = "nexusengine.physics-installation/2";
export const PHYSICS_INSTALLATION_PHASES = Object.freeze([
  "uninstalled",
  "installed",
  "starting",
  "ready",
  "stopping",
  "failed"
]);

export function installationContract() {
  return Object.freeze({
    schema: PHYSICS_INSTALLATION_SCHEMA,
    domainPath: "n:physics:lifecycle",
    phases: PHYSICS_INSTALLATION_PHASES,
    operations: Object.freeze([
      "install",
      "uninstall",
      "beginStartup",
      "completeStartup",
      "beginShutdown",
      "completeShutdown",
      "fail"
    ]),
    phaseOwner: "physics-installation-kit",
    providerExecutionOwnedExternally: true
  });
}

export function normalizeInstallCommand(command) {
  const normalized = normalizeOperationCommand(
    command,
    ["installationId", "providerId", "providerVersion", "configuration", "metadata"],
    "physics install command"
  );
  normalized.schema = normalized.schema ?? "nexusengine.physics-install-command/1";
  if (normalized.schema !== "nexusengine.physics-install-command/1") {
    throw new TypeError("physics install command schema is unsupported.");
  }
  normalized.providerId = requireText(normalized.providerId, "physics install command.providerId");
  normalized.providerVersion = optionalText(normalized.providerVersion, "physics install command.providerVersion");
  normalized.installationId = optionalText(
    normalized.installationId,
    "physics install command.installationId",
    `physics:${normalized.providerId}`
  );
  normalized.configuration = canonicalPortable(normalized.configuration ?? {}, "physics install command.configuration");
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics install command.metadata");
  return normalized;
}

export function normalizeSimpleInstallationCommand(command, label) {
  const normalized = normalizeOperationCommand(command, ["metadata"], label);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, `${label}.metadata`);
  return normalized;
}

export function normalizeReadyCommand(command) {
  const normalized = normalizeOperationCommand(command, ["providerReceipt", "metadata"], "physics startup completion command");
  normalized.providerReceipt = normalizeProviderReceipt(normalized.providerReceipt, { ready: true });
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics startup completion command.metadata");
  return normalized;
}

export function normalizeFailureCommand(command) {
  const normalized = normalizeOperationCommand(command, ["failure", "metadata"], "physics lifecycle failure command");
  normalized.failure = normalizeFailure(normalized.failure);
  normalized.metadata = canonicalPortable(normalized.metadata ?? {}, "physics lifecycle failure command.metadata");
  return normalized;
}

export function normalizeInstallationSnapshot(snapshot) {
  return normalizeLifecycleState(snapshot, {
    domain: "physics-installation",
    fields: ["phase", "installation", "failure", "lifecycleRevision"],
    label: "physics installation snapshot",
    validate(value) {
      requirePhase(value.phase, PHYSICS_INSTALLATION_PHASES, "physics installation snapshot.phase");
      if (!Number.isInteger(value.lifecycleRevision) || value.lifecycleRevision < 0) {
        throw new TypeError("physics installation snapshot.lifecycleRevision must be a nonnegative integer.");
      }
      if (value.phase === "uninstalled" && value.installation !== null) {
        throw new TypeError("An uninstalled Physics lifecycle cannot retain an installation record.");
      }
      if (value.phase !== "uninstalled" && !value.installation) {
        throw new TypeError("An installed Physics lifecycle requires an installation record.");
      }
      if (value.installation) {
        requireText(value.installation.installationId, "physics installation snapshot.installation.installationId");
        requireText(value.installation.providerId, "physics installation snapshot.installation.providerId");
      }
    }
  });
}

export function assertProviderMatches(installation, providerReceipt) {
  if (installation?.providerId !== providerReceipt.providerId) {
    throw new TypeError(
      `Provider receipt ${providerReceipt.providerId} does not match installed provider ${installation?.providerId ?? "none"}.`
    );
  }
}
