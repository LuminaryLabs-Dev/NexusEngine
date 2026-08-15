import {
  RENDER_INDIRECT_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeIndirectBuffer
} from "../../buffer-contracts.js";

export { normalizeIndirectBuffer };

export function normalizeIndirectBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "indirectBuffer", normalizeIndirectBuffer, "Render Indirect Buffer registration command");
}

export function normalizeIndirectBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-indirect-buffer",
    collection: "indirectBuffers",
    order: "indirectBufferOrder",
    revision: "indirectBufferRevision",
    normalizeRecord: normalizeIndirectBuffer,
    idField: "indirectBufferId",
    label: "Render Indirect Buffer snapshot"
  });
}

export function indirectBufferContract() {
  return Object.freeze({
    schema: RENDER_INDIRECT_BUFFER_SCHEMA,
    commandTypes: Object.freeze(["draw", "draw-indexed", "dispatch"]),
    exactResourceIdentityRequired: true,
    commandBytesOwnedExternally: true,
    commandExecutionOwnedByProvider: true
  });
}
