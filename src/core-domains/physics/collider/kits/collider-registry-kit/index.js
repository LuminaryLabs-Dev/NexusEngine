import { createDomainKit } from "../../../../domain-kit.js";
import {
  canonicalColliderValue,
  normalizeCollider as normalizeColliderContract,
  sameColliderValue
} from "../../collider-contracts.js";
import {
  colliderRegistryContract,
  normalizeColliderDefinitionCommand,
  normalizeColliderRecord,
  normalizeColliderRegistrySnapshot,
  normalizeColliderRemovalCommand,
  normalizeColliderReplacementCommand
} from "./contracts.js";

const REQUIRES = Object.freeze([
  "n:physics",
  "physics:state-schema",
  "physics:command-schema",
  "physics:event-schema",
  "physics:body-registry",
  "physics:shape-registry",
  "physics:material-registry",
  "physics:collider-identity",
  "physics:collider-attachment",
  "physics:collider-pose",
  "physics:collider-material",
  "physics:collider-filter",
  "physics:sensor-collider",
  "physics:trigger-collider",
  "physics:collider-lifecycle"
]);

function assertRevision(record, expectedRevision, label) {
  if (expectedRevision !== undefined && record.revision !== expectedRevision) {
    throw new TypeError(`${label} expected revision ${expectedRevision}, received ${record.revision}.`);
  }
}

function requireApi(engine, apiName, capability, method) {
  const api = engine.n?.[apiName];
  if (!api || (method && typeof api[method] !== "function")) {
    const methodLabel = method ? ` with ${method}()` : "";
    throw new Error(`Physics collider registry requires ${capability}${methodLabel}.`);
  }
  return api;
}

export function createColliderRegistryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "collider-registry-kit",
    id: config.id ?? "collider-registry-kit",
    domain: "physics-collider-registry",
    domainPath: "n:physics:collider",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsColliderRegistry",
    requires: REQUIRES,
    provides: ["n:physics:collider", "physics:collider", "physics:collider-registry"],
    purpose: "Own portable Physics collider records, revisions, and exact-once lifecycle commands without executing collision behavior.",
    owns: ["collider registry", "collider record revisions", "exact-once collider mutations", "collider reference validation"],
    doesNotOwn: ["collision detection", "contact generation", "solver execution", "provider collider objects", "gameplay triggers"],
    initialState: { colliders: {}, order: [], colliderRevision: 0 },
    createApi({ baseApi, engine }) {
      const parts = {
        identity: (value) => requireApi(engine, "physicsColliderIdentity", "physics:collider-identity", "normalize").normalize(value),
        attachment: (value) => requireApi(engine, "physicsColliderAttachment", "physics:collider-attachment", "normalize").normalize(value),
        pose: (value) => requireApi(engine, "physicsColliderPose", "physics:collider-pose", "normalize").normalize(value),
        material: (value) => requireApi(engine, "physicsColliderMaterial", "physics:collider-material", "normalize").normalize(value),
        filter: (value) => requireApi(engine, "physicsColliderFilter", "physics:collider-filter", "normalize").normalize(value),
        sensor: (value) => requireApi(engine, "physicsSensorCollider", "physics:sensor-collider", "normalize").normalize(value),
        trigger: (value) => requireApi(engine, "physicsTriggerCollider", "physics:trigger-collider", "normalize").normalize(value),
        lifecycle: (value) => requireApi(engine, "physicsColliderLifecycle", "physics:collider-lifecycle", "normalize").normalize(value)
      };
      const normalizeCollider = (input) => normalizeColliderContract(input, parts);
      const bodyRegistry = () => requireApi(engine, "physicsBodyRegistry", "physics:body-registry", "getRecord");
      const shapeRegistry = () => requireApi(engine, "shapeRegistry", "physics:shape-registry", "hasShape");
      const materialRegistry = () => requireApi(engine, "physicsMaterial", "physics:material-registry", "hasMaterial");

      function validateReferences(collider) {
        const body = bodyRegistry().getRecord(collider.attachment.bodyId);
        if (!body) throw new TypeError(`Unknown Physics body ${collider.attachment.bodyId}.`);
        if (collider.attachment.bodyRevision !== undefined && body.revision !== collider.attachment.bodyRevision) {
          throw new TypeError(`Physics body ${collider.attachment.bodyId} expected revision ${collider.attachment.bodyRevision}, received ${body.revision}.`);
        }
        const shapeApi = shapeRegistry();
        if (!shapeApi.hasShape(collider.attachment.shapeId)) {
          throw new TypeError(`Unknown Physics shape ${collider.attachment.shapeId}.`);
        }
        if (!materialRegistry().hasMaterial(collider.material.materialId)) {
          throw new TypeError(`Unknown Physics material ${collider.material.materialId}.`);
        }
      }

      function commitRecord(state, colliderId, record, changed) {
        const colliders = changed ? { ...state.colliders, [colliderId]: record } : state.colliders;
        const colliderRevision = changed ? state.colliderRevision + 1 : state.colliderRevision;
        return {
          patch: { colliders, order: Object.keys(colliders).sort(), colliderRevision },
          result: { record, changed, colliderRevision }
        };
      }

      function readRecord(colliderId) {
        return baseApi.getState().colliders[String(colliderId)] ?? null;
      }

      return {
        ...baseApi,
        getContract: colliderRegistryContract,
        normalize: normalizeCollider,
        loadSnapshot(snapshot) {
          const normalized = normalizeColliderRegistrySnapshot(snapshot, normalizeCollider);
          for (const colliderId of normalized.order) validateReferences(normalized.colliders[colliderId].collider);
          return baseApi.loadSnapshot(normalized);
        },
        defineCollider(command = {}) {
          const request = normalizeColliderDefinitionCommand(command, normalizeCollider);
          const colliderId = request.collider.identity.id;
          return baseApi.applyCommand(request, (state) => {
            validateReferences(request.collider);
            const existing = state.colliders[colliderId];
            if (existing && !sameColliderValue(existing.collider, request.collider)) {
              throw new TypeError(`Physics collider ${colliderId} already exists with different content.`);
            }
            if (existing) {
              const outcome = commitRecord(state, colliderId, existing, false);
              outcome.result.created = false;
              return outcome;
            }
            const record = normalizeColliderRecord({ collider: request.collider, revision: 1 }, normalizeCollider);
            const outcome = commitRecord(state, colliderId, record, true);
            outcome.result.created = true;
            return outcome;
          });
        },
        replaceCollider(command = {}) {
          const request = normalizeColliderReplacementCommand(command, normalizeCollider);
          const colliderId = request.collider.identity.id;
          return baseApi.applyCommand(request, (state) => {
            const existing = state.colliders[colliderId];
            if (!existing) throw new TypeError(`Unknown Physics collider ${colliderId}.`);
            assertRevision(existing, request.expectedRevision, `Physics collider ${colliderId}`);
            validateReferences(request.collider);
            const changed = !sameColliderValue(existing.collider, request.collider);
            const record = changed
              ? normalizeColliderRecord({ collider: request.collider, revision: existing.revision + 1 }, normalizeCollider)
              : existing;
            return commitRecord(state, colliderId, record, changed);
          });
        },
        removeCollider(command = {}) {
          const request = normalizeColliderRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.colliders[request.colliderId];
            if (!existing) throw new TypeError(`Unknown Physics collider ${request.colliderId}.`);
            assertRevision(existing, request.expectedRevision, `Physics collider ${request.colliderId}`);
            const colliders = { ...state.colliders };
            delete colliders[request.colliderId];
            const colliderRevision = state.colliderRevision + 1;
            return {
              patch: { colliders, order: Object.keys(colliders).sort(), colliderRevision },
              result: { record: existing, removed: true, colliderRevision }
            };
          });
        },
        transitionCollider(command = {}) {
          const request = requireApi(engine, "physicsColliderLifecycle", "physics:collider-lifecycle", "normalizeCommand").normalizeCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.colliders[request.colliderId];
            if (!existing) throw new TypeError(`Unknown Physics collider ${request.colliderId}.`);
            assertRevision(existing, request.expectedRevision, `Physics collider ${request.colliderId}`);
            const changed = existing.collider.lifecycle.status !== request.status;
            const collider = changed
              ? normalizeCollider({ ...existing.collider, lifecycle: { status: request.status } })
              : existing.collider;
            const record = changed
              ? normalizeColliderRecord({ collider, revision: existing.revision + 1 }, normalizeCollider)
              : existing;
            return commitRecord(state, request.colliderId, record, changed);
          });
        },
        hasCollider(colliderId) {
          return readRecord(colliderId) !== null;
        },
        getCollider(colliderId) {
          return readRecord(colliderId)?.collider ?? null;
        },
        getRecord(colliderId) {
          return readRecord(colliderId);
        },
        listColliders() {
          const state = baseApi.getState();
          return state.order.map((id) => state.colliders[id].collider);
        },
        listRecords() {
          const state = baseApi.getState();
          return state.order.map((id) => state.colliders[id]);
        },
        inspectRegistry() {
          const state = baseApi.getState();
          return canonicalColliderValue({ colliderCount: state.order.length, colliderRevision: state.colliderRevision }, "Physics collider registry inspection");
        }
      };
    }
  });
}

export default createColliderRegistryKit;
