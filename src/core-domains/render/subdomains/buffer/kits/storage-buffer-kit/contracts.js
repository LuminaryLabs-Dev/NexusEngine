import {
  RENDER_STORAGE_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeStorageBuffer
} from "../../buffer-contracts.js";

export { normalizeStorageBuffer };

export function normalizeStorageBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "storageBuffer", normalizeStorageBuffer, "Render Storage Buffer registration command");
}

export function normalizeStorageBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-storage-buffer",
    collection: "storageBuffers",
    order: "storageBufferOrder",
    revision: "storageBufferRevision",
    normalizeRecord: normalizeStorageBuffer,
    idField: "storageBufferId",
    label: "Render Storage Buffer snapshot"
  });
}

export function storageBufferContract() {
  return Object.freeze({
    schema: RENDER_STORAGE_BUFFER_SCHEMA,
    access: Object.freeze(["read-only", "read-write"]),
    exactResourceIdentityRequired: true,
    explicitLayoutRequired: true,
    shaderBindingOwnedByPipeline: true,
    synchronizationOwnedByProvider: true
  });
}
