import {
  DEVICE_CAPABILITY_SCHEMA,
  assertSortedRecordState,
  normalizeDeviceCapability,
  normalizeDeviceIdList,
  normalizeDeviceState,
  normalizeLimitMap,
  normalizeOperationCommand,
  rejectDeviceFields,
  requireDeviceObject,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeDeviceCapability };

export function normalizeCapabilityDefinitionCommand(input) {
  const value = normalizeOperationCommand(input, ["capability"], "Render device capability definition command");
  return { operationId: value.operationId, capability: normalizeDeviceCapability(value.capability) };
}

export function normalizeCapabilityRemovalCommand(input) {
  const value = normalizeOperationCommand(input, ["capabilityId"], "Render device capability removal command");
  return { operationId: value.operationId, capabilityId: requireDeviceText(value.capabilityId, "Render device capability removal command.capabilityId") };
}

export function normalizeCapabilityRequirements(input = {}) {
  requireDeviceObject(input, "Render device capability requirements");
  rejectDeviceFields(input, ["requiredFeatureIds", "optionalFeatureIds", "limits"], "Render device capability requirements");
  return {
    requiredFeatureIds: normalizeDeviceIdList(input.requiredFeatureIds, "Render device capability requirements.requiredFeatureIds"),
    optionalFeatureIds: normalizeDeviceIdList(input.optionalFeatureIds, "Render device capability requirements.optionalFeatureIds"),
    limits: normalizeLimitMap(input.limits ?? {}, "Render device capability requirements.limits")
  };
}

export function normalizeCapabilitySnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-capability",
    fields: ["capabilities", "order", "capabilityRevision"],
    label: "Render Device Capability snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "capabilities",
        order: "order",
        revision: "capabilityRevision",
        normalizeRecord: normalizeDeviceCapability,
        idField: "capabilityId",
        label: "Render Device Capability snapshot"
      });
    }
  });
}

export function deviceCapabilityContract() {
  return Object.freeze({
    schema: DEVICE_CAPABILITY_SCHEMA,
    combines: Object.freeze(["render:device-contract", "render:device-feature", "render:device-limit"]),
    evaluationMutatesState: false,
    providerExecutionOwnedExternally: true
  });
}
