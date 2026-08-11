import {
  DEVICE_LIFECYCLE_SCHEMA,
  assertDeviceReceiptMatches,
  normalizeDeviceFailure,
  normalizeDeviceReadinessReceipt,
  normalizeDeviceReleaseReceipt,
  normalizeDeviceState,
  normalizeOperationCommand,
  normalizeRenderDevice,
  requireDeviceText
} from "../../device-contracts.js";

const PHASES = Object.freeze(["unacquired", "acquired", "ready", "lost", "failed", "releasing", "released"]);

export function normalizeDeviceAcquisitionCommand(input) {
  const value = normalizeOperationCommand(input, ["device", "capabilityId", "providerReceipt"], "Render device acquisition command");
  const device = normalizeRenderDevice(value.device);
  const providerReceipt = normalizeDeviceReadinessReceipt(value.providerReceipt, { ready: false });
  assertDeviceReceiptMatches(device, providerReceipt);
  return {
    operationId: value.operationId,
    device,
    capabilityId: requireDeviceText(value.capabilityId, "Render device acquisition command.capabilityId"),
    providerReceipt
  };
}

export function normalizeDeviceReadyCommand(input) {
  const value = normalizeOperationCommand(input, ["providerReceipt"], "Render device ready command");
  return { operationId: value.operationId, providerReceipt: normalizeDeviceReadinessReceipt(value.providerReceipt, { ready: true }) };
}

export function normalizeDeviceRecoveryCommand(input) {
  const value = normalizeOperationCommand(input, ["providerReceipt"], "Render device recovery command");
  return { operationId: value.operationId, providerReceipt: normalizeDeviceReadinessReceipt(value.providerReceipt) };
}

export function normalizeDeviceLossCommand(input) {
  const value = normalizeOperationCommand(input, ["lossId", "reason"], "Render device lost command");
  return {
    operationId: value.operationId,
    lossId: requireDeviceText(value.lossId, "Render device lost command.lossId"),
    reason: requireDeviceText(value.reason, "Render device lost command.reason")
  };
}

export function normalizeDeviceReleaseBeginCommand(input) {
  return normalizeOperationCommand(input, [], "Render device release begin command");
}

export function normalizeDeviceReleaseCompletionCommand(input) {
  const value = normalizeOperationCommand(input, ["providerReceipt"], "Render device release completion command");
  return { operationId: value.operationId, providerReceipt: normalizeDeviceReleaseReceipt(value.providerReceipt) };
}

export function normalizeDeviceFailureCommand(input) {
  const value = normalizeOperationCommand(input, ["failure"], "Render device failure command");
  return { operationId: value.operationId, failure: normalizeDeviceFailure(value.failure) };
}

export function normalizeDeviceLifecycleSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-lifecycle",
    fields: ["phase", "device", "capabilityId", "providerReceipt", "loss", "failure", "lifecycleRevision"],
    label: "Render Device Lifecycle snapshot",
    validate(state) {
      if (!PHASES.includes(state.phase)) throw new TypeError(`Render Device Lifecycle snapshot.phase must be one of ${PHASES.join(", ")}.`);
      if (!Number.isInteger(state.lifecycleRevision) || state.lifecycleRevision < 0) {
        throw new TypeError("Render Device Lifecycle snapshot.lifecycleRevision must be a nonnegative integer.");
      }
      const empty = state.phase === "unacquired" || state.phase === "released";
      if (empty) {
        if (state.device !== null || state.capabilityId !== null || state.providerReceipt !== null || state.loss !== null || state.failure !== null) {
          throw new TypeError(`${state.phase} Render Device Lifecycle state cannot retain active device data.`);
        }
        return;
      }
      state.device = normalizeRenderDevice(state.device);
      state.capabilityId = requireDeviceText(state.capabilityId, "Render Device Lifecycle snapshot.capabilityId");
      const expectedReady = state.phase === "ready" ? true : state.phase === "acquired" ? false : undefined;
      state.providerReceipt = normalizeDeviceReadinessReceipt(state.providerReceipt, { ready: expectedReady });
      assertDeviceReceiptMatches(state.device, state.providerReceipt);
      if (state.phase === "lost") {
        if (!state.loss || typeof state.loss !== "object") throw new TypeError("Lost Render Device Lifecycle state requires loss data.");
        state.loss = {
          lossId: requireDeviceText(state.loss.lossId, "Render Device Lifecycle snapshot.loss.lossId"),
          reason: requireDeviceText(state.loss.reason, "Render Device Lifecycle snapshot.loss.reason")
        };
      } else if (state.loss !== null) {
        throw new TypeError(`${state.phase} Render Device Lifecycle state cannot retain loss data.`);
      }
      if (state.phase === "failed") state.failure = normalizeDeviceFailure(state.failure);
      else if (state.failure !== null) throw new TypeError(`${state.phase} Render Device Lifecycle state cannot retain failure data.`);
    }
  });
}

export function deviceLifecycleContract() {
  return Object.freeze({
    schema: DEVICE_LIFECYCLE_SCHEMA,
    phases: PHASES,
    providerResultsAreExplicitInputs: true,
    providerExecutionOwnedExternally: true,
    renderCompositionLifecycleOwnedSeparately: true
  });
}
