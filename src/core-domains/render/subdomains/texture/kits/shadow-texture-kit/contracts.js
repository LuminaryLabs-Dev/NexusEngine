import {
  RENDER_SHADOW_TEXTURE_SCHEMA,
  normalizeShadowTexture,
  normalizeTextureRegistrationCommand,
  normalizeTextureRegistrySnapshot
} from "../../texture-contracts.js";

export { normalizeShadowTexture };

export function normalizeShadowTextureRegistrationCommand(input) {
  return normalizeTextureRegistrationCommand(input, "shadowTexture", normalizeShadowTexture, "Render Shadow Texture registration command");
}

export function normalizeShadowTextureSnapshot(snapshot) {
  return normalizeTextureRegistrySnapshot(snapshot, {
    domain: "render-shadow-texture",
    collection: "shadowTextures",
    order: "shadowTextureOrder",
    revision: "shadowTextureRevision",
    normalizeRecord: normalizeShadowTexture,
    idField: "shadowTextureId",
    label: "Render Shadow Texture snapshot"
  });
}

export function shadowTextureContract() {
  return Object.freeze({ schema: RENDER_SHADOW_TEXTURE_SCHEMA, depthTextureRequired: true, sampledUsageRequired: true, authoredShadowPolicyOwnedExternally: true, comparisonSamplerOwnedExternally: true });
}
