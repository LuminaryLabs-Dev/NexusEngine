import { createDomainKit } from "../../../../../domain-kit.js";
import {
  normalizeShaderCacheEntry,
  normalizeShaderCacheRegistrationCommand,
  normalizeShaderCacheRemovalCommand,
  normalizeShaderCacheSnapshot,
  normalizeShaderCacheTouchCommand,
  shaderCacheContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Shader Cache requires public capability ${name}.`);
  return api;
}

export function createShaderCacheKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "shader-cache-kit",
    id: config.id ?? "shader-cache-kit",
    domain: "render-shader-cache",
    domainPath: "n:render:shader",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderShaderCache",
    requires: ["n:render:shader", "render:shader-compile", "render:shader-reflection", "render:resource-identity", "render:resource-lifecycle"],
    provides: ["render:shader-cache"],
    purpose: "Own semantic links from completed Shader compiles to resident Render Resources.",
    owns: ["Shader cache identity", "compile-to-resource lineage", "deterministic eviction candidates"],
    doesNotOwn: ["artifact bytes", "GPU program handles", "resource allocation", "provider eviction execution"],
    initialState: { entries: {}, cacheOrder: [], cacheRevision: 0 },
    createApi({ baseApi, engine }) {
      const compiles = () => requiredApi(engine, "renderShaderCompiles");
      const reflections = () => requiredApi(engine, "renderShaderReflections");
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const lifecycle = () => requiredApi(engine, "renderResourceLifecycle");
      function get(cacheId) {
        return baseApi.getState().entries[String(cacheId)] ?? null;
      }
      function validateEntry(entry) {
        const compile = compiles().get(entry.compileId);
        if (!compile || compile.status !== "completed") throw new TypeError(`Render Shader cache ${entry.cacheId} requires completed compile ${entry.compileId}.`);
        const identity = identities().get(entry.identityId);
        if (!identity || identity.resource.kind !== "shader-program") throw new TypeError(`Render Shader cache ${entry.cacheId} requires a shader-program Render Resource identity.`);
        if (identity.resource.descriptor?.compileId !== entry.compileId) throw new TypeError(`Render Shader cache ${entry.cacheId} resource does not identify compile ${entry.compileId}.`);
        const resource = lifecycle().get(entry.identityId);
        if (!resource || resource.phase !== "resident") throw new TypeError(`Render Shader cache ${entry.cacheId} requires resident Render Resource ${entry.identityId}.`);
        if (entry.reflectionId !== null) {
          const reflection = reflections().get(entry.reflectionId);
          if (!reflection || reflection.compileId !== entry.compileId) throw new TypeError(`Render Shader cache ${entry.cacheId} has invalid reflection ${entry.reflectionId}.`);
        }
        return entry;
      }
      return {
        ...baseApi,
        getContract: shaderCacheContract,
        normalize: normalizeShaderCacheEntry,
        register(command = {}) {
          const input = normalizeShaderCacheRegistrationCommand(command);
          return baseApi.applyCommand(input, (state) => {
            const entry = validateEntry(input.entry);
            const existing = state.entries[entry.cacheId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(entry)) throw new TypeError(`Render Shader cache ${entry.cacheId} already exists with different content.`);
            const created = !existing;
            const entries = created ? { ...state.entries, [entry.cacheId]: entry } : state.entries;
            const cacheRevision = created ? state.cacheRevision + 1 : state.cacheRevision;
            return { patch: { entries, cacheOrder: Object.keys(entries).sort(), cacheRevision }, result: { entry: existing ?? entry, created, cacheRevision } };
          });
        },
        touch(command = {}) {
          const input = normalizeShaderCacheTouchCommand(command);
          return baseApi.applyCommand(input, (state) => {
            const current = state.entries[input.cacheId];
            if (!current) throw new TypeError(`Unknown Render Shader cache ${input.cacheId}.`);
            if (input.lastUsedRevision < current.lastUsedRevision) throw new TypeError(`Render Shader cache ${input.cacheId} cannot move backward.`);
            const entry = normalizeShaderCacheEntry({ ...current, lastUsedRevision: input.lastUsedRevision });
            const changed = JSON.stringify(entry) !== JSON.stringify(current);
            const cacheRevision = changed ? state.cacheRevision + 1 : state.cacheRevision;
            return { patch: { entries: changed ? { ...state.entries, [input.cacheId]: entry } : state.entries, cacheRevision }, result: { entry, changed, cacheRevision } };
          });
        },
        remove(command = {}) {
          const input = normalizeShaderCacheRemovalCommand(command);
          return baseApi.applyCommand(input, (state) => {
            if (!state.entries[input.cacheId]) throw new TypeError(`Unknown Render Shader cache ${input.cacheId}.`);
            const entries = { ...state.entries };
            delete entries[input.cacheId];
            return { patch: { entries, cacheOrder: Object.keys(entries).sort(), cacheRevision: state.cacheRevision + 1 }, result: { cacheId: input.cacheId, removed: true, cacheRevision: state.cacheRevision + 1 } };
          });
        },
        get,
        list() {
          const state = baseApi.getState();
          return state.cacheOrder.map((cacheId) => state.entries[cacheId]);
        },
        selectEviction(limit = 1) {
          if (!Number.isSafeInteger(limit) || limit < 0) throw new TypeError("Render Shader cache eviction limit must be a nonnegative safe integer.");
          return this.list().sort((left, right) => left.lastUsedRevision - right.lastUsedRevision || left.cacheId.localeCompare(right.cacheId)).slice(0, limit);
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeShaderCacheSnapshot(snapshot);
          Object.values(normalized.entries).forEach(validateEntry);
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createShaderCacheKit;
