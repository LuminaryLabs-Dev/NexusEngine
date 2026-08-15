import {
  DEVICE_LIMIT_PROFILE_SCHEMA,
  assertSortedRecordState,
  normalizeDeviceLimitProfile,
  normalizeDeviceState,
  normalizeLimitMap,
  normalizeOperationCommand,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeDeviceLimitProfile, normalizeLimitMap };

export function normalizeLimitDefinitionCommand(input) {
  const value = normalizeOperationCommand(input, ["profile"], "Render device limit definition command");
  return { operationId: value.operationId, profile: normalizeDeviceLimitProfile(value.profile) };
}

export function normalizeLimitRemovalCommand(input) {
  const value = normalizeOperationCommand(input, ["limitProfileId"], "Render device limit removal command");
  return { operationId: value.operationId, limitProfileId: requireDeviceText(value.limitProfileId, "Render device limit removal command.limitProfileId") };
}

export function normalizeLimitSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-limit",
    fields: ["profiles", "order", "limitRevision"],
    label: "Render Device Limit snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "profiles",
        order: "order",
        revision: "limitRevision",
        normalizeRecord: normalizeDeviceLimitProfile,
        idField: "limitProfileId",
        label: "Render Device Limit snapshot"
      });
    }
  });
}

export function deviceLimitContract() {
  return Object.freeze({
    schema: DEVICE_LIMIT_PROFILE_SCHEMA,
    values: "finite-nonnegative-integers",
    evaluationMutatesState: false,
    providerLimitDiscoveryOwnedExternally: true
  });
}
