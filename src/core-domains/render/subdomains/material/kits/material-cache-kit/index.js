import { createMaterialRegistryKit } from "../../material-registry-kit.js";
import { normalizeMaterialCacheEntry, normalizeMaterialOperation } from "../../material-contracts.js";
import {
  materialCacheContract,
  normalizeMaterialCacheCommand,
  normalizeMaterialCacheSnapshot
} from "./contracts.js";

function validateCacheEntry(entry, requiredApi) {
  const current = requiredApi("renderMaterialValidation").inspectCurrent(entry.validationId);
  if (!current.valid) throw new TypeError(`Render Material cache ${entry.cacheId} requires current validation ${entry.validationId}.`);
  const identity = requiredApi("renderResourceIdentities").get(entry.identityId);
  if (!identity || identity.resource.kind !== "material") throw new TypeError(`Render Material cache ${entry.cacheId} requires a material Render Resource identity.`);
  if (identity.resource.descriptor?.validationId !== entry.validationId || identity.resource.descriptor?.materialHash !== current.validation.materialHash) {
    throw new TypeError(`Render Material cache ${entry.cacheId} resource does not identify validation ${entry.validationId}.`);
  }
  if (requiredApi("renderResourceLifecycle").get(entry.identityId)?.phase !== "resident") {
    throw new TypeError(`Render Material cache ${entry.cacheId} requires resident Render Resource ${entry.identityId}.`);
  }
  return entry;
}

export function createMaterialCacheKit(config = {}) {
  return createMaterialRegistryKit({
    kitConfig: config,
    manifestId: "material-cache-kit",
    id: "material-cache-kit",
    domain: "render-material-cache",
    apiName: "renderMaterialCache",
    requires: ["n:render:material", "render:material-validation", "render:resource-identity", "render:resource-lifecycle"],
    provides: ["render:material-cache"],
    purpose: "Render Material Cache",
    owns: ["validated Material-to-Resource lineage", "deterministic semantic cache selection"],
    doesNotOwn: ["GPU handles", "resource allocation", "provider eviction", "material validation"],
    collection: "entries",
    order: "cacheOrder",
    revision: "cacheRevision",
    recordField: "entry",
    idField: "cacheId",
    normalizeRecord: normalizeMaterialCacheEntry,
    normalizeCommand: normalizeMaterialCacheCommand,
    normalizeSnapshot: normalizeMaterialCacheSnapshot,
    contract: materialCacheContract,
    validateRecord(entry, { requiredApi }) {
      return validateCacheEntry(entry, requiredApi);
    },
    extendApi({ api, baseApi, context }) {
      return {
        touch(command = {}) {
          const request = normalizeMaterialOperation(command, ["cacheId", "lastUsedRevision"], "Render Material cache touch command");
          const cacheId = String(request.cacheId ?? "").trim();
          if (!cacheId) throw new TypeError("Render Material cache touch command.cacheId must be a non-empty string.");
          if (!Number.isSafeInteger(request.lastUsedRevision) || request.lastUsedRevision < 0) throw new TypeError("Render Material cache touch command.lastUsedRevision must be a nonnegative safe integer.");
          return baseApi.applyCommand({ operationId: request.operationId, cacheId, lastUsedRevision: request.lastUsedRevision }, (state) => {
            const current = state.entries[cacheId];
            if (!current) throw new TypeError(`Unknown Render Material cache ${cacheId}.`);
            if (request.lastUsedRevision < current.lastUsedRevision) throw new TypeError(`Render Material cache ${cacheId} cannot move backward.`);
            const { cacheHash: _cacheHash, ...withoutHash } = current;
            const entry = validateCacheEntry(normalizeMaterialCacheEntry({ ...withoutHash, lastUsedRevision: request.lastUsedRevision }), context.requiredApi);
            const changed = JSON.stringify(entry) !== JSON.stringify(current);
            const cacheRevision = changed ? state.cacheRevision + 1 : state.cacheRevision;
            return {
              patch: { entries: changed ? { ...state.entries, [cacheId]: entry } : state.entries, cacheRevision },
              result: { entry, changed, cacheRevision }
            };
          });
        },
        selectEviction(limit = 1) {
          if (!Number.isSafeInteger(limit) || limit < 0) throw new TypeError("Render Material cache eviction limit must be a nonnegative safe integer.");
          return api.list().sort((left, right) => left.lastUsedRevision - right.lastUsedRevision || left.cacheId.localeCompare(right.cacheId)).slice(0, limit);
        }
      };
    }
  });
}

export default createMaterialCacheKit;
