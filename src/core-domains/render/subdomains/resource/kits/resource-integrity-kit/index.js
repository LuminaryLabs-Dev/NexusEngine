import { createDomainKit } from "../../../../../domain-kit.js";
import { expectedResourceContentId } from "../../resource-contracts.js";
import {
  normalizeIntegrityProof,
  normalizeIntegrityProofCommand,
  normalizeResourceIntegritySnapshot,
  resourceIntegrityContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render resource integrity requires public capability ${name}.`);
  return api;
}

export function createResourceIntegrityKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "resource-integrity-kit",
    id: config.id ?? "resource-integrity-kit",
    domain: "render-resource-integrity",
    domainPath: "n:render:resource",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderResourceIntegrity",
    requires: ["n:render:resource", "render:resource-identity"],
    provides: ["render:resource-integrity"],
    purpose: "Record portable integrity comparisons for exact Render resource identities.",
    owns: ["resource integrity proof registry", "expected and observed content comparison", "integrity query surface"],
    doesNotOwn: ["content fetching", "source asset storage", "byte hashing execution", "provider upload"],
    initialState: { proofs: {}, proofOrder: [], integrityRevision: 0 },
    createApi({ baseApi, engine }) {
      const identities = () => requiredApi(engine, "renderResourceIdentities");
      function get(proofId) {
        return baseApi.getState().proofs[String(proofId)] ?? null;
      }
      function validateState(state) {
        for (const proof of Object.values(state.proofs)) {
          const identity = identities().get(proof.identityId);
          if (!identity) throw new TypeError(`Render resource integrity proof ${proof.proofId} targets unknown identity ${proof.identityId}.`);
          if (proof.expected !== expectedResourceContentId(identity)) {
            throw new TypeError(`Render resource integrity proof ${proof.proofId} has a stale expected content identity.`);
          }
        }
        return state;
      }
      return {
        ...baseApi,
        getContract: resourceIntegrityContract,
        normalize: normalizeIntegrityProof,
        record(command = {}) {
          const request = normalizeIntegrityProofCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const identity = identities().get(request.proof.identityId);
            if (!identity) throw new TypeError(`Unknown Render resource identity ${request.proof.identityId}.`);
            const expected = expectedResourceContentId(identity);
            if (request.proof.expected !== undefined && request.proof.expected !== expected) {
              throw new TypeError(`Render resource integrity proof ${request.proof.proofId} expected value does not match identity ${identity.identityId}.`);
            }
            const proof = normalizeIntegrityProof({ ...request.proof, expected });
            const existing = state.proofs[proof.proofId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(proof)) {
              throw new TypeError(`Render resource integrity proof ${proof.proofId} already exists with different content.`);
            }
            const created = !existing;
            const proofs = created ? { ...state.proofs, [proof.proofId]: proof } : state.proofs;
            const integrityRevision = created ? state.integrityRevision + 1 : state.integrityRevision;
            return {
              patch: { proofs, proofOrder: Object.keys(proofs).sort(), integrityRevision },
              result: { proof, created, integrityRevision }
            };
          });
        },
        has(proofId) {
          return Boolean(get(proofId));
        },
        get,
        list(identityId = null) {
          const state = baseApi.getState();
          return state.proofOrder
            .map((proofId) => state.proofs[proofId])
            .filter((proof) => identityId === null || proof.identityId === identityId);
        },
        isVerified(identityId, contentId = null) {
          const identity = identities().get(String(identityId));
          if (!identity) return false;
          const expected = contentId ?? expectedResourceContentId(identity);
          return this.list(String(identityId)).some((proof) => proof.status === "matched" && proof.actual === expected && proof.expected === expected);
        },
        getVerifiedContentId(identityId) {
          const identity = identities().get(String(identityId));
          if (!identity) return null;
          const expected = expectedResourceContentId(identity);
          return this.isVerified(identity.identityId, expected) ? expected : null;
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeResourceIntegritySnapshot(snapshot)));
        }
      };
    }
  });
}

export default createResourceIntegrityKit;
