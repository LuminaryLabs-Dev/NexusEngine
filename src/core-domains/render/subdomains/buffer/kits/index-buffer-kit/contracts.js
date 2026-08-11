import {
  RENDER_INDEX_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeIndexBuffer
} from "../../buffer-contracts.js";

export { normalizeIndexBuffer };

export function normalizeIndexBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "indexBuffer", normalizeIndexBuffer, "Render Index Buffer registration command");
}

export function normalizeIndexBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-index-buffer",
    collection: "indexBuffers",
    order: "indexBufferOrder",
    revision: "indexBufferRevision",
    normalizeRecord: normalizeIndexBuffer,
    idField: "indexBufferId",
    label: "Render Index Buffer snapshot"
  });
}

export function indexBufferContract() {
  return Object.freeze({
    schema: RENDER_INDEX_BUFFER_SCHEMA,
    formats: Object.freeze(["uint16", "uint32"]),
    exactResourceIdentityRequired: true,
    indexBytesOwnedExternally: true,
    primitiveTopologyOwnedByGeometry: true
  });
}
