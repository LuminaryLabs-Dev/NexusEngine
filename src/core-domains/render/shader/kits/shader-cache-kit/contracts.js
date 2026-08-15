import {
  RENDER_SHADER_CACHE_SCHEMA,
  normalizeShaderCacheEntry,
  normalizeShaderOperation,
  normalizeShaderRegistrationCommand,
  normalizeShaderRegistrySnapshot,
  requireShaderInteger,
  requireShaderText,
  shaderRegistryContract
} from "../../shader-contracts.js";

export { normalizeShaderCacheEntry };

export const shaderCacheContract = () => shaderRegistryContract({
  schema: RENDER_SHADER_CACHE_SCHEMA,
  record: "semantic link from completed compile to resident Render Resource",
  providerOwned: ["artifact bytes", "GPU program handle", "eviction execution"]
});

export const normalizeShaderCacheRegistrationCommand = (input) => normalizeShaderRegistrationCommand(input, "entry", normalizeShaderCacheEntry, "Render Shader cache registration command");

export function normalizeShaderCacheTouchCommand(input) {
  const value = normalizeShaderOperation(input, ["cacheId", "lastUsedRevision"], "Render Shader cache touch command");
  return {
    operationId: value.operationId,
    cacheId: requireShaderText(value.cacheId, "Render Shader cache touch command.cacheId"),
    lastUsedRevision: requireShaderInteger(value.lastUsedRevision, "Render Shader cache touch command.lastUsedRevision")
  };
}

export function normalizeShaderCacheRemovalCommand(input) {
  const value = normalizeShaderOperation(input, ["cacheId"], "Render Shader cache removal command");
  return { operationId: value.operationId, cacheId: requireShaderText(value.cacheId, "Render Shader cache removal command.cacheId") };
}

export function normalizeShaderCacheSnapshot(snapshot) {
  return normalizeShaderRegistrySnapshot(snapshot, {
    domain: "render-shader-cache",
    collection: "entries",
    order: "cacheOrder",
    revision: "cacheRevision",
    normalizeRecord: normalizeShaderCacheEntry,
    idField: "cacheId",
    label: "Render Shader cache snapshot"
  });
}
