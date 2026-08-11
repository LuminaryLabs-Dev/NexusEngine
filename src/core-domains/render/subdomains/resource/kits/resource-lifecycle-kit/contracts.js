import {
  assertSortedResourceRecords,
  canonicalResourceValue,
  normalizeResourceFailure,
  normalizeResourceOperation,
  normalizeResourceState,
  normalizeResourceStateRecord,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceStateRecord };

export function normalizeLifecycleDeclareCommand(input) {
  const value = normalizeResourceOperation(input, ["identityId", "metadata"], "Render resource lifecycle declare command");
  return {
    operationId: value.operationId,
    identityId: requireResourceText(value.identityId, "Render resource lifecycle declare command.identityId"),
    metadata: canonicalResourceValue(value.metadata ?? {}, "Render resource lifecycle declare command.metadata")
  };
}

function normalizeLifecycleOperationCommand(input, field, label) {
  const value = normalizeResourceOperation(input, ["identityId", field], label);
  return {
    operationId: value.operationId,
    identityId: requireResourceText(value.identityId, `${label}.identityId`),
    [field]: requireResourceText(value[field], `${label}.${field}`)
  };
}

export function normalizeLifecycleStageCommand(input) {
  return normalizeLifecycleOperationCommand(input, "uploadId", "Render resource lifecycle stage command");
}

export function normalizeLifecycleResidentCommand(input) {
  return normalizeLifecycleOperationCommand(input, "uploadId", "Render resource lifecycle resident command");
}

export function normalizeLifecycleReleaseBeginCommand(input) {
  return normalizeLifecycleOperationCommand(input, "releaseId", "Render resource lifecycle release begin command");
}

export function normalizeLifecycleReleaseCompletionCommand(input) {
  return normalizeLifecycleOperationCommand(input, "releaseId", "Render resource lifecycle release completion command");
}

export function normalizeLifecycleFailureCommand(input) {
  const value = normalizeResourceOperation(input, ["identityId", "failure"], "Render resource lifecycle failure command");
  return {
    operationId: value.operationId,
    identityId: requireResourceText(value.identityId, "Render resource lifecycle failure command.identityId"),
    failure: normalizeResourceFailure(value.failure)
  };
}

export function normalizeResourceLifecycleSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-lifecycle",
    fields: ["resources", "resourceOrder", "lifecycleRevision"],
    label: "Render Resource Lifecycle snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "resources",
        order: "resourceOrder",
        revision: "lifecycleRevision",
        normalizeRecord: normalizeResourceStateRecord,
        idField: "identityId",
        label: "Render Resource Lifecycle snapshot"
      });
    }
  });
}

export function resourceLifecycleContract() {
  return Object.freeze({
    stateRegistryOwner: true,
    providerOperationsAreExplicitInputs: true,
    referencesBlockRelease: true,
    terminalReleasedState: true,
    exactOnceMutations: true
  });
}
