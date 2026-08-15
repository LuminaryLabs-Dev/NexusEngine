import { createDomainKit } from "../../../../domain-kit.js";
import { expectedResourceContentId } from "../../resource-contracts.js";
import {
  normalizeCachePinCommand,
  normalizeCachePutCommand,
  normalizeCacheRemovalCommand,
  normalizeCacheTouchCommand,
  normalizeResourceCacheEntry,
  normalizeResourceCacheSnapshot,
  resourceCacheContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource cache requires public capability ${name}.`);
  return api;
}

export function createResourceCacheKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-cache-kit",
    id: config.id ?? "resource-cache-kit",
    domain: "render-resource-cache",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceCache",
    requires: ["n:render:resource", "render:resource-identity", "render:resource-integrity"],
    provides: ["render:resource-cache"],
    purpose: "Index reusable provider resources by exact portable content identity and deterministic access order.",
    owns: ["semantic provider-resource cache entries", "access order", "pin state", "deterministic eviction candidates"],
    doesNotOwn: ["asset content cache", "GPU handles", "storage", "resource eviction execution", "device allocation"],
    initialState: { entries: {}, entryOrder: [], accessSequence: 0, cacheRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      const integrity = () => requiredApi(engine, "renderResourceIntegrity");
      function get(cacheKey) {
        return baseApi.getState().entries[String(cacheKey)] ?? null;
      }
      function validateEntry(entry) {
        const identity = identities().get(entry.identityId);
        if (!identity) throw new TypeError(`Render resource cache entry ${entry.cacheKey} targets unknown identity ${entry.identityId}.`);
        const expected = expectedResourceContentId(identity);
        if (entry.contentId !== expected) throw new TypeError(`Render resource cache entry ${entry.cacheKey} content does not match identity ${entry.identityId}.`);
        if (identity.resource.integrity && !integrity().isVerified(identity.identityId, expected)) {
          throw new TypeError(`Render resource cache entry ${entry.cacheKey} requires matched integrity proof for ${identity.identityId}.`);
        }
        return entry;
      }
      function validateState(state) {
        Object.values(state.entries).forEach(validateEntry);
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceCacheContract,
        normalize: normalizeResourceCacheEntry,
        put(command = {}) {
          const request = normalizeCachePutCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateEntry(request.entry);
            const existing = state.entries[request.entry.cacheKey];
            if (existing) {
              const comparable = { ...request.entry, lastAccessSequence: existing.lastAccessSequence };
              if (JSON.stringify(existing) !== JSON.stringify(comparable)) {
                throw new TypeError(`Render resource cache key ${request.entry.cacheKey} already exists with different content.`);
              }
              return { patch: {}, result: { entry: existing, created: false, cacheRevision: state.cacheRevision } };
            }
            const accessSequence = state.accessSequence + 1;
            const entry = { ...request.entry, lastAccessSequence: accessSequence };
            const entries = { ...state.entries, [entry.cacheKey]: entry };
            return {
              patch: { entries, entryOrder: Object.keys(entries).sort(), accessSequence, cacheRevision: state.cacheRevision + 1 },
              result: { entry, created: true, cacheRevision: state.cacheRevision + 1 }
            };
          });
        },
        touch(command = {}) {
          const request = normalizeCacheTouchCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const entry = state.entries[request.cacheKey];
            if (!entry) throw new TypeError(`Unknown Render resource cache key ${request.cacheKey}.`);
            const accessSequence = state.accessSequence + 1;
            const updated = { ...entry, lastAccessSequence: accessSequence };
            return {
              patch: { entries: { ...state.entries, [request.cacheKey]: updated }, accessSequence, cacheRevision: state.cacheRevision + 1 },
              result: { entry: updated, cacheRevision: state.cacheRevision + 1 }
            };
          });
        },
        pin(command = {}) {
          const request = normalizeCachePinCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const entry = state.entries[request.cacheKey];
            if (!entry) throw new TypeError(`Unknown Render resource cache key ${request.cacheKey}.`);
            const changed = entry.pinned !== request.pinned;
            const updated = changed ? { ...entry, pinned: request.pinned } : entry;
            const cacheRevision = changed ? state.cacheRevision + 1 : state.cacheRevision;
            return {
              patch: changed ? { entries: { ...state.entries, [request.cacheKey]: updated }, cacheRevision } : {},
              result: { entry: updated, changed, cacheRevision }
            };
          });
        },
        remove(command = {}) {
          const request = normalizeCacheRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const entry = state.entries[request.cacheKey];
            if (!entry) throw new TypeError(`Unknown Render resource cache key ${request.cacheKey}.`);
            if (entry.pinned) throw new TypeError(`Pinned Render resource cache key ${request.cacheKey} cannot be removed.`);
            const entries = { ...state.entries };
            delete entries[request.cacheKey];
            return {
              patch: { entries, entryOrder: Object.keys(entries).sort(), cacheRevision: state.cacheRevision + 1 },
              result: { cacheKey: request.cacheKey, removed: true, cacheRevision: state.cacheRevision + 1 }
            };
          });
        },
        has(cacheKey) {
          return Boolean(get(cacheKey));
        },
        get,
        list() {
          const state = baseApi.getState();
          return state.entryOrder.map((cacheKey) => state.entries[cacheKey]);
        },
        selectEviction({ limit = null } = {}) {
          if (limit !== null && (!Number.isSafeInteger(limit) || limit < 0)) throw new TypeError("Render resource cache eviction limit must be a nonnegative safe integer or null.");
          const candidates = this.list()
            .filter((entry) => !entry.pinned)
            .sort((left, right) => left.lastAccessSequence - right.lastAccessSequence || left.cacheKey.localeCompare(right.cacheKey));
          return limit === null ? candidates : candidates.slice(0, limit);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceCacheSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceCacheKit;
