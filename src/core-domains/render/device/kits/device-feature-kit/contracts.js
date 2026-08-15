import {
  DEVICE_FEATURE_SCHEMA,
  assertSortedRecordState,
  normalizeDeviceFeature,
  normalizeDeviceIdList,
  normalizeDeviceState,
  normalizeOperationCommand,
  rejectDeviceFields,
  requireDeviceObject,
  requireDeviceText
} from "../../device-contracts.js";

export { normalizeDeviceFeature };

export function normalizeFeatureDefinitionCommand(input) {
  const value = normalizeOperationCommand(input, ["feature"], "Render device feature definition command");
  return { operationId: value.operationId, feature: normalizeDeviceFeature(value.feature) };
}

export function normalizeFeatureRemovalCommand(input) {
  const value = normalizeOperationCommand(input, ["featureId"], "Render device feature removal command");
  return { operationId: value.operationId, featureId: requireDeviceText(value.featureId, "Render device feature removal command.featureId") };
}

export function normalizeFeatureNegotiation(input = {}) {
  requireDeviceObject(input, "Render device feature negotiation");
  rejectDeviceFields(input, ["requiredFeatureIds", "optionalFeatureIds", "availableFeatureIds"], "Render device feature negotiation");
  const requiredFeatureIds = normalizeDeviceIdList(input.requiredFeatureIds, "Render device feature negotiation.requiredFeatureIds");
  const optionalFeatureIds = normalizeDeviceIdList(input.optionalFeatureIds, "Render device feature negotiation.optionalFeatureIds");
  const availableFeatureIds = normalizeDeviceIdList(input.availableFeatureIds, "Render device feature negotiation.availableFeatureIds");
  const overlap = requiredFeatureIds.filter((id) => optionalFeatureIds.includes(id));
  if (overlap.length) throw new TypeError(`Render device feature negotiation cannot mark features both required and optional: ${overlap.join(", ")}.`);
  return { requiredFeatureIds, optionalFeatureIds, availableFeatureIds };
}

export function normalizeFeatureSnapshot(snapshot) {
  return normalizeDeviceState(snapshot, {
    domain: "render-device-feature",
    fields: ["features", "order", "featureRevision"],
    label: "Render Device Feature snapshot",
    validate(state) {
      assertSortedRecordState(state, {
        collection: "features",
        order: "order",
        revision: "featureRevision",
        normalizeRecord: normalizeDeviceFeature,
        idField: "featureId",
        label: "Render Device Feature snapshot"
      });
    }
  });
}

export function deviceFeatureContract() {
  return Object.freeze({
    schema: DEVICE_FEATURE_SCHEMA,
    negotiationMutatesState: false,
    deterministicOrdering: true,
    providerFeatureDiscoveryOwnedExternally: true
  });
}
