import {
  RENDER_TEXTURE_STREAM_SCHEMA,
  assertSortedTextureRecords,
  normalizeStoredTextureStream,
  normalizeTextureFailure,
  normalizeTextureOperation,
  normalizeTextureState,
  normalizeTextureStream,
  normalizeTextureStreamReceipt
} from "../../texture-contracts.js";

export { normalizeTextureStream, normalizeTextureStreamReceipt };

export function normalizeTextureStreamRequestCommand(input) {
  const value = normalizeTextureOperation(input, ["stream"], "Render Texture stream request command");
  return { operationId: value.operationId, stream: normalizeTextureStream(value.stream) };
}

export function normalizeTextureStreamCompletionCommand(input) {
  const value = normalizeTextureOperation(input, ["streamId", "providerReceipt"], "Render Texture stream completion command");
  return {
    operationId: value.operationId,
    streamId: String(value.streamId ?? "").trim(),
    providerReceipt: normalizeTextureStreamReceipt(value.providerReceipt)
  };
}

export function normalizeTextureStreamFailureCommand(input) {
  const value = normalizeTextureOperation(input, ["streamId", "failure"], "Render Texture stream failure command");
  return {
    operationId: value.operationId,
    streamId: String(value.streamId ?? "").trim(),
    failure: normalizeTextureFailure(value.failure)
  };
}

export function normalizeTextureStreamSnapshot(snapshot) {
  return normalizeTextureState(snapshot, {
    domain: "render-texture-stream",
    fields: ["streams", "streamOrder", "streamRevision"],
    label: "Render Texture stream snapshot",
    validate(state) {
      assertSortedTextureRecords(state, {
        collection: "streams",
        order: "streamOrder",
        revision: "streamRevision",
        normalizeRecord: normalizeStoredTextureStream,
        idField: "request.streamId",
        label: "Render Texture stream snapshot"
      });
    }
  });
}

export function textureStreamContract() {
  return Object.freeze({
    schema: RENDER_TEXTURE_STREAM_SCHEMA,
    exactMipmapPlanRequired: true,
    queueSubmissionRequired: true,
    providerReceiptRequiredForCompletion: true,
    transportAndUploadOwnedExternally: true
  });
}
