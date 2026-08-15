import {
  RENDER_BUFFER_FORMAT_SCHEMA,
  RENDER_BUFFER_LAYOUT_MEMBER_SCHEMA,
  RENDER_BUFFER_LAYOUT_SCHEMA,
  normalizeBufferFormat,
  normalizeBufferLayout,
  normalizeBufferLayoutMember,
  normalizeBufferRegistrationCommand,
  normalizeBufferRegistrySnapshot
} from "../../buffer-contracts.js";

export { normalizeBufferFormat, normalizeBufferLayout, normalizeBufferLayoutMember };

export function normalizeBufferLayoutRegistrationCommand(input) {
  return normalizeBufferRegistrationCommand(input, "layout", normalizeBufferLayout, "Render Buffer layout registration command");
}

export function normalizeBufferLayoutSnapshot(snapshot) {
  return normalizeBufferRegistrySnapshot(snapshot, {
    domain: "render-buffer-layout",
    collection: "layouts",
    order: "layoutOrder",
    revision: "layoutRevision",
    normalizeRecord: normalizeBufferLayout,
    idField: "layoutId",
    label: "Render Buffer Layout snapshot"
  });
}

export function bufferLayoutContract() {
  return Object.freeze({
    formatSchema: RENDER_BUFFER_FORMAT_SCHEMA,
    memberSchema: RENDER_BUFFER_LAYOUT_MEMBER_SCHEMA,
    layoutSchema: RENDER_BUFFER_LAYOUT_SCHEMA,
    explicitOffsetsRequired: true,
    overlappingMembersAllowed: false,
    providerPackingRulesAllowed: false,
    providerCapabilityValidationRequired: true
  });
}
