import {
  RENDER_UNIFORM_BUFFER_SCHEMA,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot,
  normalizeUniformBuffer
} from "../../buffer-contracts.js";

export { normalizeUniformBuffer };

export function normalizeUniformBufferRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "uniformBuffer", normalizeUniformBuffer, "Render Uniform Buffer registration command");
}

export function normalizeUniformBufferSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-uniform-buffer",
    collection: "uniformBuffers",
    order: "uniformBufferOrder",
    revision: "uniformBufferRevision",
    normalizeRecord: normalizeUniformBuffer,
    idField: "uniformBufferId",
    label: "Render Uniform Buffer snapshot"
  });
}

export function uniformBufferContract() {
  return Object.freeze({
    schema: RENDER_UNIFORM_BUFFER_SCHEMA,
    exactResourceIdentityRequired: true,
    explicitLayoutRequired: true,
    dynamicAlignmentExplicit: true,
    shaderBindingOwnedByPipeline: true,
    providerAllocationOwnedExternally: true
  });
}
