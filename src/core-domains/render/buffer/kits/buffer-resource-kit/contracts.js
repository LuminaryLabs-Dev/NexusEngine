import {
  RENDER_BUFFER_CONTENT_SCHEMA,
  RENDER_BUFFER_DESCRIPTOR_SCHEMA,
  RENDER_BUFFER_RECORD_SCHEMA,
  RENDER_BUFFER_UPDATE_RECEIPT_SCHEMA,
  RENDER_BUFFER_UPDATE_RECORD_SCHEMA,
  RENDER_BUFFER_UPDATE_SCHEMA,
  assertSortedBufferRecords,
  normalizeBufferContentState,
  normalizeBufferDescriptor,
  normalizeBufferFailure,
  normalizeBufferOperation,
  normalizeBufferRecord,
  normalizeBufferState,
  normalizeBufferUpdate,
  normalizeBufferUpdateReceipt,
  normalizeStoredBufferUpdate,
  requireBufferText
} from "../../buffer-contracts.js";

export { normalizeBufferDescriptor, normalizeBufferRecord, normalizeBufferUpdate, normalizeBufferUpdateReceipt };

export function normalizeBufferRegistrationCommand(input) {
  const value = normalizeBufferOperation(input, ["identityId"], "Render Buffer registration command");
  return {
    operationId: value.operationId,
    identityId: requireBufferText(value.identityId, "Render Buffer registration command.identityId")
  };
}

export function normalizeBufferUpdateRequestCommand(input) {
  const value = normalizeBufferOperation(input, ["update"], "Render Buffer update request command");
  return { operationId: value.operationId, update: normalizeBufferUpdate(value.update) };
}

export function normalizeBufferUpdateCompletionCommand(input) {
  const value = normalizeBufferOperation(input, ["updateId", "providerReceipt"], "Render Buffer update completion command");
  return {
    operationId: value.operationId,
    updateId: requireBufferText(value.updateId, "Render Buffer update completion command.updateId"),
    providerReceipt: normalizeBufferUpdateReceipt(value.providerReceipt)
  };
}

export function normalizeBufferUpdateFailureCommand(input) {
  const value = normalizeBufferOperation(input, ["updateId", "failure"], "Render Buffer update failure command");
  return {
    operationId: value.operationId,
    updateId: requireBufferText(value.updateId, "Render Buffer update failure command.updateId"),
    failure: normalizeBufferFailure(value.failure)
  };
}

export function normalizeBufferResourceSnapshot(snapshot) {
  return normalizeBufferState(snapshot, {
    domain: "render-buffer-resource",
    fields: [
      "buffers",
      "bufferOrder",
      "bufferRevision",
      "contents",
      "contentOrder",
      "contentStateRevision",
      "updates",
      "updateOrder",
      "updateRevision"
    ],
    label: "Render Buffer Resource snapshot",
    validate(state) {
      assertSortedBufferRecords(state, {
        collection: "buffers",
        order: "bufferOrder",
        revision: "bufferRevision",
        normalizeRecord: normalizeBufferRecord,
        idField: "identityId",
        label: "Render Buffer Resource snapshot"
      });
      assertSortedBufferRecords(state, {
        collection: "contents",
        order: "contentOrder",
        revision: "contentStateRevision",
        normalizeRecord: normalizeBufferContentState,
        idField: "identityId",
        label: "Render Buffer Resource snapshot"
      });
      assertSortedBufferRecords(state, {
        collection: "updates",
        order: "updateOrder",
        revision: "updateRevision",
        normalizeRecord: normalizeStoredBufferUpdate,
        idField: "request.updateId",
        label: "Render Buffer Resource snapshot"
      });
      for (const identityId of state.bufferOrder) {
        if (!state.contents[identityId]) throw new TypeError(`Render Buffer ${identityId} has no content state.`);
      }
      for (const identityId of state.contentOrder) {
        if (!state.buffers[identityId]) throw new TypeError(`Render Buffer content state targets unknown identity ${identityId}.`);
      }
      for (const update of Object.values(state.updates)) {
        if (!state.buffers[update.request.identityId]) throw new TypeError(`Render Buffer update ${update.request.updateId} targets unknown identity.`);
      }
    }
  });
}

export function bufferResourceContract() {
  return Object.freeze({
    descriptorSchema: RENDER_BUFFER_DESCRIPTOR_SCHEMA,
    recordSchema: RENDER_BUFFER_RECORD_SCHEMA,
    contentSchema: RENDER_BUFFER_CONTENT_SCHEMA,
    updateSchema: RENDER_BUFFER_UPDATE_SCHEMA,
    updateRecordSchema: RENDER_BUFFER_UPDATE_RECORD_SCHEMA,
    updateReceiptSchema: RENDER_BUFFER_UPDATE_RECEIPT_SCHEMA,
    exactResourceIdentityRequired: true,
    portableStateOnly: true,
    rawBytesOwnedByAsset: true,
    providerHandlesAllowed: false,
    providerExecutionOwnedExternally: true
  });
}
