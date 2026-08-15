import {
  assertSortedResourceRecords,
  normalizeResourceCacheEntry,
  normalizeResourceOperation,
  normalizeResourceState,
  requireResourceBoolean,
  requireResourceObject,
  requireResourceText
} from "../../resource-contracts.js";

export { normalizeResourceCacheEntry };

export function normalizeCachePutCommand(input) {
  const value = normalizeResourceOperation(input, ["entry"], "Render resource cache put command");
  requireResourceObject(value.entry, "Render resource cache put command.entry");
  return {
    operationId: value.operationId,
    entry: normalizeResourceCacheEntry({ ...value.entry, lastAccessSequence: value.entry.lastAccessSequence ?? 0 })
  };
}

export function normalizeCacheTouchCommand(input) {
  const value = normalizeResourceOperation(input, ["cacheKey"], "Render resource cache touch command");
  return { operationId: value.operationId, cacheKey: requireResourceText(value.cacheKey, "Render resource cache touch command.cacheKey") };
}

export function normalizeCachePinCommand(input) {
  const value = normalizeResourceOperation(input, ["cacheKey", "pinned"], "Render resource cache pin command");
  return {
    operationId: value.operationId,
    cacheKey: requireResourceText(value.cacheKey, "Render resource cache pin command.cacheKey"),
    pinned: requireResourceBoolean(value.pinned, "Render resource cache pin command.pinned")
  };
}

export function normalizeCacheRemovalCommand(input) {
  const value = normalizeResourceOperation(input, ["cacheKey"], "Render resource cache removal command");
  return { operationId: value.operationId, cacheKey: requireResourceText(value.cacheKey, "Render resource cache removal command.cacheKey") };
}

export function normalizeResourceCacheSnapshot(snapshot) {
  return normalizeResourceState(snapshot, {
    domain: "render-resource-cache",
    fields: ["entries", "entryOrder", "accessSequence", "cacheRevision"],
    label: "Render Resource Cache snapshot",
    validate(state) {
      assertSortedResourceRecords(state, {
        collection: "entries",
        order: "entryOrder",
        revision: "cacheRevision",
        normalizeRecord: normalizeResourceCacheEntry,
        idField: "cacheKey",
        label: "Render Resource Cache snapshot"
      });
      if (!Number.isSafeInteger(state.accessSequence) || state.accessSequence < 0) {
        throw new TypeError("Render Resource Cache snapshot.accessSequence must be a nonnegative safe integer.");
      }
      if (Object.values(state.entries).some((entry) => entry.lastAccessSequence > state.accessSequence)) {
        throw new TypeError("Render Resource Cache entry access sequence cannot exceed the cache access sequence.");
      }
    }
  });
}

export function resourceCacheContract() {
  return Object.freeze({
    contentAddressed: true,
    semanticIndexOnly: true,
    deterministicEvictionSelection: true,
    evictionExecutionOwnedExternally: true,
    assetContentCacheOwnedExternally: true,
    exactOnceMutations: true
  });
}
