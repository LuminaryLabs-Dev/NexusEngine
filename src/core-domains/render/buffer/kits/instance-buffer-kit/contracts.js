import {
  RENDER_INSTANCE_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeInstanceBuffer
} from "../../buffer-contracts.js";

export { normalizeInstanceBuffer };

export function normalizeInstanceBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "instanceBuffer", normalizeInstanceBuffer, "Render Instance Buffer registration command");
}

export function normalizeInstanceBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-instance-buffer",
    collection: "instanceBuffers",
    order: "instanceBufferOrder",
    revision: "instanceBufferRevision",
    normalizeRecord: normalizeInstanceBuffer,
    idField: "instanceBufferId",
    label: "Render Instance Buffer snapshot"
  });
}

export function instanceBufferContract() {
  return Object.freeze({
    schema: RENDER_INSTANCE_BUFFER_SCHEMA,
    exactResourceIdentityRequired: true,
    instanceLayoutRequired: true,
    objectOwnershipExternal: true,
    drawSubmissionOwnedExternally: true
  });
}
