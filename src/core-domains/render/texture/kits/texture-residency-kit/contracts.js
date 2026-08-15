import {
  RENDER_TEXTURE_RESIDENCY_SCHEMA,
  assertSortedTextureRecords,
  normalizeTextureOperation,
  normalizeTextureResidency,
  normalizeTextureState,
  normalizeTextureSubresources,
  requireTextureText
} from "../../texture-contracts.js";

export { normalizeTextureResidency };

export function normalizeTextureResidencyDeclareCommand(input) {
  const value = normalizeTextureOperation(input, ["identityId", "desired", "metadata"], "Render Texture residency declaration command");
  return {
    operationId: value.operationId,
    residency: normalizeTextureResidency({
      identityId: requireTextureText(value.identityId, "Render Texture residency declaration command.identityId"),
      desired: value.desired,
      resident: [],
      appliedStreamIds: [],
      residencyRevision: 0,
      lastStreamId: null,
      metadata: value.metadata ?? {}
    })
  };
}

export function normalizeTextureResidencyApplyCommand(input) {
  const value = normalizeTextureOperation(input, ["streamId"], "Render Texture residency apply command");
  return { operationId: value.operationId, streamId: requireTextureText(value.streamId, "Render Texture residency apply command.streamId") };
}

export function normalizeTextureResidencyEvictCommand(input) {
  const value = normalizeTextureOperation(input, ["identityId", "subresources"], "Render Texture residency eviction command");
  return {
    operationId: value.operationId,
    identityId: requireTextureText(value.identityId, "Render Texture residency eviction command.identityId"),
    subresources: normalizeTextureSubresources(value.subresources, "Render Texture residency eviction command.subresources")
  };
}

export function normalizeTextureResidencySnapshot(snapshot) {
  return normalizeTextureState(snapshot, {
    domain: "render-texture-residency",
    fields: ["residencies", "residencyOrder", "residencyRevision"],
    label: "Render Texture residency snapshot",
    validate(state) {
      assertSortedTextureRecords(state, {
        collection: "residencies",
        order: "residencyOrder",
        revision: "residencyRevision",
        normalizeRecord: normalizeTextureResidency,
        idField: "identityId",
        label: "Render Texture residency snapshot"
      });
    }
  });
}

export function textureResidencyContract() {
  return Object.freeze({
    schema: RENDER_TEXTURE_RESIDENCY_SCHEMA,
    exactSubresourcesRequired: true,
    completedStreamRequiredForAdmission: true,
    wholeResourceLifecycleOwnedExternally: true,
    providerEvictionOwnedExternally: true
  });
}
