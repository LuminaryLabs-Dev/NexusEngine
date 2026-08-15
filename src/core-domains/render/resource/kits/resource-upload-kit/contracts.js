import {
  RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA,
  assertSortedResourceRecords,
  normalizeResourceFailure,
  normalizeResourceOperation,
  normalizeResourceState,
  normalizeResourceUpload,
  normalizeResourceUploadReceipt,
  normalizeStoredResourceOperation,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceUpload, normalizeResourceUploadReceipt };

export function normalizeUploadRequestCommand(input) {
  const value = normalizeResourceOperation(input, ["upload"], "Render resource upload request command");
  return { operationId: value.operationId, upload: normalizeResourceUpload(value.upload) };
}

export function normalizeUploadCompletionCommand(input) {
  const value = normalizeResourceOperation(input, ["uploadId", "providerReceipt"], "Render resource upload completion command");
  return {
    operationId: value.operationId,
    uploadId: requireResourceText(value.uploadId, "Render resource upload completion command.uploadId"),
    providerReceipt: normalizeResourceUploadReceipt(value.providerReceipt)
  };
}

export function normalizeUploadFailureCommand(input) {
  const value = normalizeResourceOperation(input, ["uploadId", "failure"], "Render resource upload failure command");
  return {
    operationId: value.operationId,
    uploadId: requireResourceText(value.uploadId, "Render resource upload failure command.uploadId"),
    failure: normalizeResourceFailure(value.failure)
  };
}

export function normalizeStoredUpload(input) {
  const record = normalizeStoredResourceOperation(input, {
    schema: RENDER_RESOURCE_UPLOAD_RECORD_SCHEMA,
    normalizeRequest: normalizeResourceUpload,
    label: "Stored Render resource upload"
  });
  return {
    ...record,
    providerReceipt: record.providerReceipt === null ? null : normalizeResourceUploadReceipt(record.providerReceipt)
  };
}

export function normalizeResourceUploadSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-upload",
    fields: ["uploads", "uploadOrder", "uploadRevision"],
    label: "Render Resource Upload snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "uploads",
        order: "uploadOrder",
        revision: "uploadRevision",
        normalizeRecord: normalizeStoredUpload,
        idField: "request.uploadId",
        label: "Render Resource Upload snapshot"
      });
    }
  });
}

export function resourceUploadContract() {
  return Object.freeze({
    requestAndReceiptOnly: true,
    providerExecutionOwnedExternally: true,
    queueCompletionRequired: true,
    declaredIntegrityRequired: true,
    exactOnceMutations: true
  });
}
