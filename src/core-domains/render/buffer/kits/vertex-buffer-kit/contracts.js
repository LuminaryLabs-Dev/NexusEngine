import {
  RENDER_VERTEX_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeVertexBuffer
} from "../../buffer-contracts.js";

export { normalizeVertexBuffer };

export function normalizeVertexBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "vertexBuffer", normalizeVertexBuffer, "Render Vertex Buffer registration command");
}

export function normalizeVertexBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-vertex-buffer",
    collection: "vertexBuffers",
    order: "vertexBufferOrder",
    revision: "vertexBufferRevision",
    normalizeRecord: normalizeVertexBuffer,
    idField: "vertexBufferId",
    label: "Render Vertex Buffer snapshot"
  });
}

export function vertexBufferContract() {
  return Object.freeze({
    schema: RENDER_VERTEX_BUFFER_SCHEMA,
    exactResourceIdentityRequired: true,
    explicitLayoutRequired: true,
    vertexBytesOwnedExternally: true,
    providerBindingOwnedExternally: true
  });
}
