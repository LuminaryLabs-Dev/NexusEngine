import { createDomainKit } from "../../../../domain-kit.js";
import {
  normalizeIdentityRegistrationCommand,
  normalizeResourceIdentity,
  normalizeResourceIdentitySnapshot,
  resourceIdentityContract
} from "./contracts.js";

function validateIdentityGraph(identities) {
  for (const identity of Object.values(identities)) {
    for (const dependencyId of identity.resource.dependencies) {
      if (dependencyId === identity.identityId) throw new TypeError(`Render resource identity ${identity.identityId} cannot depend on itself.`);
      if (!identities[dependencyId]) throw new TypeError(`Render resource identity ${identity.identityId} references unknown dependency ${dependencyId}.`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(identityId) {
    if (visited.has(identityId)) return;
    if (visiting.has(identityId)) throw new TypeError(`Render resource dependency cycle includes ${identityId}.`);
    visiting.add(identityId);
    for (const dependencyId of identities[identityId].resource.dependencies) visit(dependencyId);
    visiting.delete(identityId);
    visited.add(identityId);
  }
  Object.keys(identities).sort().forEach(visit);
}

export function createResourceIdentityKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-identity-kit",
    id: config.id ?? "resource-identity-kit",
    domain: "render-resource-identity",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceIdentities",
    requires: ["n:render:resource", "render:resource-schema"],
    provides: ["render:resource-identity"],
    purpose: "Own deterministic Render execution-resource identities, revisions, and dependency lineage.",
    owns: ["resource identity registry", "resource revision lineage", "exact resource dependency graph"],
    doesNotOwn: ["source asset identity", "GPU handles", "resource residency", "provider allocation"],
    initialState: { identities: {}, identityOrder: [], identityRevision: 0 },
    createApi({ baseApi }) {
      function get(identityId) {
        return baseApi.getState().identities[String(identityId)] ?? null;
      }
      function validateState(state) {
        validateIdentityGraph(state.identities);
        const highestByResource = new Map();
        for (const identityId of state.identityOrder) {
          const identity = state.identities[identityId];
          const previous = highestByResource.get(identity.resource.resourceId);
          if (previous !== undefined && identity.resource.revision === previous) {
            throw new TypeError(`Render resource ${identity.resource.resourceId} contains duplicate revision ${previous}.`);
          }
          highestByResource.set(identity.resource.resourceId, Math.max(previous ?? -1, identity.resource.revision));
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceIdentityContract,
        normalize: normalizeResourceIdentity,
        register(command = {}) {
          const request = normalizeIdentityRegistrationCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const identity = request.identity;
            const existing = state.identities[identity.identityId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(identity)) {
              throw new TypeError(`Render resource identity ${identity.identityId} already exists with different content.`);
            }
            for (const dependencyId of identity.resource.dependencies) {
              if (dependencyId === identity.identityId) throw new TypeError(`Render resource identity ${identity.identityId} cannot depend on itself.`);
              if (!state.identities[dependencyId]) throw new TypeError(`Unknown Render resource dependency ${dependencyId}.`);
            }
            const revisions = Object.values(state.identities)
              .filter((entry) => entry.resource.resourceId === identity.resource.resourceId)
              .map((entry) => entry.resource.revision);
            if (!existing && revisions.length && identity.resource.revision <= Math.max(...revisions)) {
              throw new TypeError(`Render resource ${identity.resource.resourceId} revision ${identity.resource.revision} is not newer than its current revision.`);
            }
            const created = !existing;
            const identities = created ? { ...state.identities, [identity.identityId]: identity } : state.identities;
            validateIdentityGraph(identities);
            const identityRevision = created ? state.identityRevision + 1 : state.identityRevision;
            return {
              patch: { identities, identityOrder: Object.keys(identities).sort(), identityRevision },
              result: { identity, created, identityRevision }
            };
          });
        },
        has(identityId) {
          return Boolean(get(identityId));
        },
        get,
        list(resourceId = null) {
          const state = baseApi.getState();
          return state.identityOrder
            .map((identityId) => state.identities[identityId])
            .filter((identity) => resourceId === null || identity.resource.resourceId === String(resourceId));
        },
        getCurrent(resourceId) {
          const matches = this.list(resourceId);
          return matches.sort((left, right) => right.resource.revision - left.resource.revision)[0] ?? null;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceIdentitySnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceIdentityKit;
