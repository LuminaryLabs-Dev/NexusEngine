import {
  DEVICE_LOSS_SCHEMA,
  assertSortedRecordState,
  canonicalDeviceValue,
  normalizeDeviceLossIncident,
  normalizeDeviceState,
  normalizeLossResolution,
  normalizeOperationCommand,
  rejectDeviceFields,
  requireDeviceObject,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeDeviceLossIncident, normalizeLossResolution };

export function normalizeLossReportCommand(input) {
  const value = normalizeOperationCommand(input, ["incident"], "Render device loss report command");
  return { operationId: value.operationId, incident: normalizeDeviceLossIncident(value.incident) };
}

export function normalizeLossResolutionCommand(input) {
  const value = normalizeOperationCommand(input, ["lossId", "resolution"], "Render device loss resolution command");
  return {
    operationId: value.operationId,
    lossId: requireDeviceText(value.lossId, "Render device loss resolution command.lossId"),
    resolution: normalizeLossResolution(value.resolution)
  };
}

export function normalizeStoredLossIncident(input) {
  requireDeviceObject(input, "Stored Render device loss incident");
  rejectDeviceFields(input, ["schema", "lossId", "deviceId", "reason", "message", "recoverable", "metadata", "status", "resolution"], "Stored Render device loss incident");
  const incident = normalizeDeviceLossIncident({
    schema: input.schema,
    lossId: input.lossId,
    deviceId: input.deviceId,
    reason: input.reason,
    message: input.message,
    recoverable: input.recoverable,
    metadata: input.metadata
  });
  if (!["active", "resolved"].includes(input.status)) throw new TypeError("Stored Render device loss incident.status must be active or resolved.");
  if (input.status === "active" && input.resolution !== null) throw new TypeError("Active Render device loss incident cannot retain a resolution.");
  if (input.status === "resolved") normalizeLossResolution(input.resolution);
  return {
    ...incident,
    status: input.status,
    resolution: input.resolution === null ? null : canonicalDeviceValue(normalizeLossResolution(input.resolution), "Stored Render device loss incident.resolution")
  };
}

export function normalizeLossSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-loss",
    fields: ["incidents", "order", "activeLossId", "lossRevision"],
    label: "Render Device Loss snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "incidents",
        order: "order",
        revision: "lossRevision",
        normalizeRecord: normalizeStoredLossIncident,
        idField: "lossId",
        label: "Render Device Loss snapshot"
      });
      if (state.activeLossId !== null) {
        state.activeLossId = requireDeviceText(state.activeLossId, "Render Device Loss snapshot.activeLossId");
        if (state.incidents[state.activeLossId]?.status !== "active") {
          throw new TypeError("Render Device Loss snapshot.activeLossId must reference one active incident.");
        }
      }
      const active = Object.values(state.incidents).filter((entry) => entry.status === "active");
      if (active.length > 1) throw new TypeError("Render Device Loss snapshot cannot contain multiple active incidents.");
      if ((active[0]?.lossId ?? null) !== state.activeLossId) throw new TypeError("Render Device Loss snapshot active incident does not match activeLossId.");
    }
  });
}

export function deviceLossContract() {
  return Object.freeze({
    schema: DEVICE_LOSS_SCHEMA,
    exactOnceMutations: true,
    recordsFactsOnly: true,
    providerRecoveryOwnedExternally: true,
    renderRecoveryCoordinationOwnedSeparately: true
  });
}
