import { createDomainKit } from "../../../../../domain-kit.js";
import {
  normalizeReferenceAdditionCommand,
  normalizeReferenceRemovalCommand,
  normalizeResourceReference,
  normalizeResourceReferenceSnapshot,
  resourceReferenceContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource references require public capability ${name}.`);
  return api;
}

export function createResourceReferenceKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-reference-kit",
    id: config.id ?? "resource-reference-kit",
    domain: "render-resource-reference",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceReferences",
    requires: ["n:render:resource", "render:resource-identity"],
    provides: ["render:resource-reference"],
    purpose: "Own exact, portable references to Render execution-resource identities.",
    owns: ["resource reference registry", "resource reference ownership metadata", "resource reference counts"],
    doesNotOwn: ["asset references", "JavaScript object references", "GPU handles", "resource release execution"],
    initialState: { references: {}, referenceOrder: [], referenceRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      function get(referenceId) {
        return baseApi.getState().references[String(referenceId)] ?? null;
      }
      function validateState(state) {
        for (const reference of Object.values(state.references)) {
          if (!identities().has(reference.identityId)) {
            throw new TypeError(`Render resource reference ${reference.referenceId} targets unknown identity ${reference.identityId}.`);
          }
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceReferenceContract,
        normalize: normalizeResourceReference,
        add(command = {}) {
          const request = normalizeReferenceAdditionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!identities().has(request.reference.identityId)) {
              throw new TypeError(`Unknown Render resource identity ${request.reference.identityId}.`);
            }
            const existing = state.references[request.reference.referenceId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.reference)) {
              throw new TypeError(`Render resource reference ${request.reference.referenceId} already exists with different content.`);
            }
            const created = !existing;
            const references = created ? { ...state.references, [request.reference.referenceId]: request.reference } : state.references;
            const referenceRevision = created ? state.referenceRevision + 1 : state.referenceRevision;
            return {
              patch: { references, referenceOrder: Object.keys(references).sort(), referenceRevision },
              result: { reference: request.reference, created, referenceRevision }
            };
          });
        },
        remove(command = {}) {
          const request = normalizeReferenceRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const reference = state.references[request.referenceId];
            if (!reference) throw new TypeError(`Unknown Render resource reference ${request.referenceId}.`);
            const references = { ...state.references };
            delete references[request.referenceId];
            return {
              patch: { references, referenceOrder: Object.keys(references).sort(), referenceRevision: state.referenceRevision + 1 },
              result: { referenceId: request.referenceId, identityId: reference.identityId, removed: true, referenceRevision: state.referenceRevision + 1 }
            };
          });
        },
        has(referenceId) {
          return Boolean(get(referenceId));
        },
        get,
        list({ identityId = null, ownerId = null } = {}) {
          const state = baseApi.getState();
          return state.referenceOrder
            .map((referenceId) => state.references[referenceId])
            .filter((reference) => identityId === null || reference.identityId === identityId)
            .filter((reference) => ownerId === null || reference.ownerId === ownerId);
        },
        count(identityId) {
          return this.list({ identityId: String(identityId) }).length;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceReferenceSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceReferenceKit;
