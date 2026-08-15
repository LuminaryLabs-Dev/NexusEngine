import {
  DEVICE_DIAGNOSTICS_SCHEMA,
  normalizeDeviceState,
  rejectDeviceFields,
  requireDeviceObject,
  requireDeviceText
} from "../../device-contracts.js";

export function normalizeDiagnosticsQuery(input = {}) {
  requireDeviceObject(input, "Render device diagnostics query");
  rejectDeviceFields(input, ["capabilityId"], "Render device diagnostics query");
  return { capabilityId: input.capabilityId === undefined ? null : requireDeviceText(input.capabilityId, "Render device diagnostics query.capabilityId") };
}

export function normalizeDiagnosticsSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-diagnostics",
    fields: [],
    label: "Render Device Diagnostics snapshot"
  });
}

export function deviceDiagnosticsContract() {
  return Object.freeze({
    schema: DEVICE_DIAGNOSTICS_SCHEMA,
    reportsAreReadOnly: true,
    reportsAreNotRetained: true,
    providerDiagnosticsOwnedExternally: true
  });
}
