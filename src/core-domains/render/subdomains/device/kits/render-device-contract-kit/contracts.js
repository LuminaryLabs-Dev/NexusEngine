import {
  RENDER_DEVICE_SCHEMA,
  normalizeDeviceState,
  normalizeRenderDevice,
  renderDeviceEnums
} from "../../device-contracts.js";

export { normalizeRenderDevice };

export function normalizeRenderDeviceContractSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-contract",
    fields: [],
    label: "Render Device Contract snapshot"
  });
}

export function renderDeviceContract() {
  return Object.freeze({
    schema: RENDER_DEVICE_SCHEMA,
    deviceTypes: renderDeviceEnums.deviceTypes,
    portableRecordsOnly: true,
    providerHandlesOwnedExternally: true,
    providerExecutionOwnedExternally: true
  });
}
