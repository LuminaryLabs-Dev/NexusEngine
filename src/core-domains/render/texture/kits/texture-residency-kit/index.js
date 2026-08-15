import { createDomainKit } from "../../../../domain-kit.js";
import {
  assertTextureSubresourceRange,
  normalizeTextureResidency,
  normalizeTextureSubresources,
  textureSubresourcesForRange
} from "../../texture-contracts.js";
import {
  normalizeTextureResidencyApplyCommand,
  normalizeTextureResidencyDeclareCommand,
  normalizeTextureResidencyEvictCommand,
  normalizeTextureResidencySnapshot,
  textureResidencyContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render Texture Residency requires public capability ${name}.`);
  return api;
}

function subresourceKey(entry) {
  return `${entry.mipLevel}:${entry.arrayLayer}`;
}

export function createTextureResidencyKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "texture-residency-kit",
    id: config.id ?? "texture-residency-kit",
    domain: "render-texture-residency",
    domainPath: "n:render:texture",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderTextureResidency",
    requires: ["n:render:texture", "render:texture-resource", "render:texture-stream", "render:resource-lifecycle"],
    provides: ["render:texture-residency"],
    purpose: "Own desired and proven resident Texture subresources derived from completed stream receipts.",
    owns: ["desired Texture subresources", "proven resident subresources", "residency revisions", "last admitted stream identity"],
    doesNotOwn: ["whole-resource residency", "memory budgets", "provider allocation", "transport", "GPU eviction"],
    initialState: { residencies: {}, residencyOrder: [], residencyRevision: 0 },
    createApi({ baseApi, engine }) {
      const textures = () => requiredApi(engine, "renderTextures");
      const streams = () => requiredApi(engine, "renderTextureStreams");
      const lifecycle = () => requiredApi(engine, "renderResourceLifecycle");

      function get(identityId) {
        return baseApi.getState().residencies[String(identityId)] ?? null;
      }

      function assertSubresources(identityId, subresources, label) {
        const texture = textures().get(identityId);
        if (!texture) throw new TypeError(`${label} targets unknown Texture identity ${identityId}.`);
        for (const subresource of subresources) {
          assertTextureSubresourceRange(texture, {
            baseMipLevel: subresource.mipLevel,
            mipLevelCount: 1,
            baseArrayLayer: subresource.arrayLayer,
            arrayLayerCount: 1,
            label
          });
        }
        return texture;
      }

      function validateRecord(record) {
        assertSubresources(record.identityId, [...record.desired, ...record.resident], `Render Texture residency ${record.identityId}`);
        if (record.resident.length > 0 && lifecycle().get(record.identityId)?.phase !== "resident") {
          throw new TypeError(`Render Texture residency ${record.identityId} with resident subresources requires a resident Render Resource.`);
        }
        for (const streamId of record.appliedStreamIds) {
          const stream = streams().get(streamId);
          if (!stream || stream.status !== "completed" || stream.request.identityId !== record.identityId) {
            throw new TypeError(`Render Texture residency ${record.identityId} references invalid applied stream ${streamId}.`);
          }
        }
        if (record.lastStreamId !== (record.appliedStreamIds.at(-1) ?? null)) {
          throw new TypeError(`Render Texture residency ${record.identityId} lastStreamId must match its final applied stream.`);
        }
        const completedCoverage = new Set(record.appliedStreamIds
          .map((streamId) => streams().get(streamId))
          .flatMap((stream) => textureSubresourcesForRange(stream.request))
          .map(subresourceKey));
        if (record.resident.some((subresource) => !completedCoverage.has(subresourceKey(subresource)))) {
          throw new TypeError(`Render Texture residency ${record.identityId} contains a subresource without completed stream proof.`);
        }
        return record;
      }

      function validateState(state) {
        Object.values(state.residencies).forEach(validateRecord);
        return state;
      }

      return {
        ...baseApi,
        getContract: textureResidencyContract,
        normalize: normalizeTextureResidency,
        declare(command = {}) {
          const request = normalizeTextureResidencyDeclareCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const record = request.residency;
            assertSubresources(record.identityId, record.desired, `Render Texture residency ${record.identityId}`);
            if (lifecycle().get(record.identityId)?.phase !== "resident") throw new TypeError(`Render Texture residency ${record.identityId} requires a resident Render Resource.`);
            const existing = state.residencies[record.identityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(record)) throw new TypeError(`Render Texture residency ${record.identityId} already exists with different content.`);
            const created = !existing;
            const residencies = created ? { ...state.residencies, [record.identityId]: record } : state.residencies;
            const residencyRevision = created ? state.residencyRevision + 1 : state.residencyRevision;
            return {
              patch: { residencies, residencyOrder: Object.keys(residencies).sort(), residencyRevision },
              result: { residency: existing ?? record, created, residencyRevision }
            };
          });
        },
        applyStream(command = {}) {
          const request = normalizeTextureResidencyApplyCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const stream = streams().get(request.streamId);
            if (!stream || stream.status !== "completed") throw new TypeError(`Render Texture residency requires completed stream ${request.streamId}.`);
            const current = state.residencies[stream.request.identityId];
            if (!current) throw new TypeError(`Render Texture residency ${stream.request.identityId} has not been declared.`);
            if (current.appliedStreamIds.includes(request.streamId)) throw new TypeError(`Render Texture stream ${request.streamId} was already applied to residency.`);
            if (lifecycle().get(current.identityId)?.phase !== "resident") throw new TypeError(`Render Texture residency ${current.identityId} requires a resident Render Resource.`);
            const additions = textureSubresourcesForRange(stream.request);
            assertSubresources(current.identityId, additions, `Render Texture stream ${request.streamId}`);
            const residentByKey = new Map([...current.resident, ...additions].map((entry) => [subresourceKey(entry), entry]));
            const next = normalizeTextureResidency({
              ...current,
              resident: [...residentByKey.values()],
              appliedStreamIds: [...current.appliedStreamIds, request.streamId],
              residencyRevision: current.residencyRevision + 1,
              lastStreamId: request.streamId
            });
            return {
              patch: { residencies: { ...state.residencies, [current.identityId]: next }, residencyRevision: state.residencyRevision + 1 },
              result: { residency: next, residencyRevision: state.residencyRevision + 1 }
            };
          });
        },
        evict(command = {}) {
          const request = normalizeTextureResidencyEvictCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const current = state.residencies[request.identityId];
            if (!current) throw new TypeError(`Render Texture residency ${request.identityId} has not been declared.`);
            assertSubresources(current.identityId, request.subresources, `Render Texture residency eviction ${request.identityId}`);
            const remove = new Set(request.subresources.map(subresourceKey));
            const resident = current.resident.filter((entry) => !remove.has(subresourceKey(entry)));
            const next = normalizeTextureResidency({
              ...current,
              resident,
              residencyRevision: current.residencyRevision + 1
            });
            return {
              patch: { residencies: { ...state.residencies, [current.identityId]: next }, residencyRevision: state.residencyRevision + 1 },
              result: { residency: next, residencyRevision: state.residencyRevision + 1 }
            };
          });
        },
        get,
        list() {
          const state = baseApi.getState();
          return state.residencyOrder.map((identityId) => state.residencies[identityId]);
        },
        isResident(identityId, mipLevel, arrayLayer = 0) {
          const record = get(identityId);
          if (!record) return false;
          const key = `${mipLevel}:${arrayLayer}`;
          return record.resident.some((entry) => subresourceKey(entry) === key);
        },
        listMissing(identityId) {
          const record = get(identityId);
          if (!record) return [];
          const resident = new Set(record.resident.map(subresourceKey));
          return normalizeTextureSubresources(record.desired.filter((entry) => !resident.has(subresourceKey(entry))));
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeTextureResidencySnapshot(snapshot)));
        }
      };
    }
  });
}

export default createTextureResidencyKit;
