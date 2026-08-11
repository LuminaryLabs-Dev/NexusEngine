import {
  RENDER_RESOURCE_RELEASE_RECORD_SCHEMA,
  assertSortedResourceRecords,
  normalizeResourceFailure,
  normalizeResourceOperation,
  normalizeResourceRelease,
  normalizeResourceReleaseReceipt,
  normalizeResourceState,
  normalizeStoredResourceOperation,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceRelease, normalizeResourceReleaseReceipt };

export function normalizeReleaseRequestCommand(input) {
  const value = normalizeResourceOperation(input, ["release"], "Render resource release request command");
  return { operationId: value.operationId, release: normalizeResourceRelease(value.release) };
}

export function normalizeReleaseCompletionCommand(input) {
  const value = normalizeResourceOperation(input, ["releaseId", "providerReceipt"], "Render resource release completion command");
  return {
    operationId: value.operationId,
    releaseId: requireResourceText(value.releaseId, "Render resource release completion command.releaseId"),
    providerReceipt: normalizeResourceReleaseReceipt(value.providerReceipt)
  };
}

export function normalizeReleaseFailureCommand(input) {
  const value = normalizeResourceOperation(input, ["releaseId", "failure"], "Render resource release failure command");
  return {
    operationId: value.operationId,
    releaseId: requireResourceText(value.releaseId, "Render resource release failure command.releaseId"),
    failure: normalizeResourceFailure(value.failure)
  };
}

export function normalizeStoredRelease(input) {
  const record = normalizeStoredResourceOperation(input, {
    schema: RENDER_RESOURCE_RELEASE_RECORD_SCHEMA,
    normalizeRequest: normalizeResourceRelease,
    label: "Stored Render resource release"
  });
  return {
    ...record,
    providerReceipt: record.providerReceipt === null ? null : normalizeResourceReleaseReceipt(record.providerReceipt)
  };
}

export function normalizeResourceReleaseSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-release",
    fields: ["releases", "releaseOrder", "releaseRevision"],
    label: "Render Resource Release snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "releases",
        order: "releaseOrder",
        revision: "releaseRevision",
        normalizeRecord: normalizeStoredRelease,
        idField: "request.releaseId",
        label: "Render Resource Release snapshot"
      });
    }
  });
}

export function resourceReleaseContract() {
  return Object.freeze({
    requestAndReceiptOnly: true,
    providerExecutionOwnedExternally: true,
    zeroReferencesRequired: true,
    exactDeviceRequired: true,
    exactOnceMutations: true
  });
}
