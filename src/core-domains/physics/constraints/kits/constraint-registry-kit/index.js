import { createDomainKit } from "../../../../domain-kit.js";
import {
  CONSTRAINT_BREAK_RECORD_SCHEMA,
  CONSTRAINT_TYPES,
  assertConstraintSnapshotIdentity,
  canonicalConstraintValue,
  requireConstraintObject,
  requireConstraintText,
  sameConstraintValue
} from "../../constraints-contracts.js";
import {
  constraintRegistryContract,
  normalizeConstraintBreakCommand,
  normalizeConstraintDefinitionCommand,
  normalizeConstraintRecord,
  normalizeConstraintRegistrySnapshot,
  normalizeConstraintRemovalCommand,
  normalizeConstraintReplacementCommand,
  normalizeConstraintStatusCommand
} from "./contracts.js";

const TYPE_APIS = Object.freeze({
  "ball-socket": ["physicsBallSocketConstraint", "physics:ball-socket-constraint"],
  "cone-twist": ["physicsConeTwistConstraint", "physics:cone-twist-constraint"],
  distance: ["physicsDistanceConstraint", "physics:distance-constraint"],
  drive: ["physicsDriveConstraint", "physics:drive-constraint"],
  fixed: ["physicsFixedConstraint", "physics:fixed-constraint"],
  hinge: ["physicsHingeConstraint", "physics:hinge-constraint"],
  limit: ["physicsLimitConstraint", "physics:limit-constraint"],
  motor: ["physicsMotorConstraint", "physics:motor-constraint"],
  slider: ["physicsSliderConstraint", "physics:slider-constraint"],
  spring: ["physicsSpringConstraint", "physics:spring-constraint"]
});

const REQUIRES = Object.freeze([
  "n:physics",
  "physics:state-schema",
  "physics:command-schema",
  "physics:event-schema",
  "physics:body-registry",
  "physics:ball-socket-constraint",
  "physics:cone-twist-constraint",
  "physics:distance-constraint",
  "physics:drive-constraint",
  "physics:fixed-constraint",
  "physics:hinge-constraint",
  "physics:limit-constraint",
  "physics:motor-constraint",
  "physics:slider-constraint",
  "physics:spring-constraint",
  "physics:constraint-break"
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
    throw new Error(`Physics constraint registry requires ${capability}${methodLabel}.`);
  }
  return api;
}

export function createConstraintRegistryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "constraint-registry-kit",
    id: config.id ?? "constraint-registry-kit",
    domain: "physics-constraint-registry",
    domainPath: "n:physics:constraints",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsConstraintRegistry",
    requires: REQUIRES,
    provides: ["n:physics:constraints", "physics:constraint", "physics:constraint-registry"],
    purpose: "Own portable Physics constraint records, terminal break state, revisions, and exact-once mutations.",
    owns: [
      "constraint registry",
      "constraint record status and revisions",
      "exact-once constraint mutations",
      "constraint body-reference validation",
      "terminal constraint break records"
    ],
    doesNotOwn: ["body records", "body deletion", "solver execution", "provider constraints", "contact impulses", "gameplay effects"],
    initialState: { constraints: {}, order: [], constraintRevision: 0 },
    createApi({ baseApi, engine }) {
      const bodyRegistry = () => requireApi(engine, "physicsBodyRegistry", "physics:body-registry", "hasBody");
      const breakApi = () => requireApi(engine, "physicsConstraintBreak", "physics:constraint-break", "evaluate");

      function normalizeConstraint(input) {
        requireConstraintObject(input, "Physics constraint");
        const value = canonicalConstraintValue(input, "Physics constraint");
        const type = requireConstraintText(value.type, "Physics constraint.type");
        if (!CONSTRAINT_TYPES.includes(type)) {
          throw new TypeError(`Physics constraint.type must be one of ${CONSTRAINT_TYPES.join(", ")}.`);
        }
        const [apiName, capability] = TYPE_APIS[type];
        return requireApi(engine, apiName, capability, "normalize").normalize(value);
      }

      function validateReferences(constraint) {
        const bodies = bodyRegistry();
        for (const bodyId of [constraint.bodyA, constraint.bodyB]) {
          if (!bodies.hasBody(bodyId)) throw new TypeError(`Unknown Physics body ${bodyId}.`);
        }
      }

      function readRecord(constraintId) {
        return baseApi.getState().constraints[String(constraintId)] ?? null;
      }

      function commitRecord(state, constraintId, record, changed) {
        const constraints = changed ? { ...state.constraints, [constraintId]: record } : state.constraints;
        const constraintRevision = changed ? state.constraintRevision + 1 : state.constraintRevision;
        return {
          patch: { constraints, order: Object.keys(constraints).sort(), constraintRevision },
          result: { record, changed, constraintRevision }
        };
      }

      function createRecord(constraint, status, revision, breakRecord = null) {
        return normalizeConstraintRecord({ constraint, status, revision, breakRecord }, normalizeConstraint);
      }

      function recordsForBody(bodyId) {
        const normalizedBodyId = requireConstraintText(bodyId, "Physics constraint bodyId");
        const state = baseApi.getState();
        return state.order
          .map((id) => state.constraints[id])
          .filter((record) => record.constraint.bodyA === normalizedBodyId || record.constraint.bodyB === normalizedBodyId);
      }

      return {
        ...baseApi,
        getContract: constraintRegistryContract,
        normalize: normalizeConstraint,
        loadSnapshot(snapshot) {
          const normalized = normalizeConstraintRegistrySnapshot(snapshot, normalizeConstraint);
          assertConstraintSnapshotIdentity(normalized, baseApi.getState(), baseApi.descriptor.id);
          for (const constraintId of normalized.order) validateReferences(normalized.constraints[constraintId].constraint);
          return baseApi.loadSnapshot(normalized);
        },
        defineConstraint(command = {}) {
          const request = normalizeConstraintDefinitionCommand(command, normalizeConstraint);
          const constraintId = request.constraint.id;
          return baseApi.applyCommand(request, (state) => {
            validateReferences(request.constraint);
            const existing = state.constraints[constraintId];
            if (existing) {
              const same = sameConstraintValue(existing.constraint, request.constraint)
                && existing.status === request.status
                && existing.breakRecord === null;
              if (!same) throw new TypeError(`Physics constraint ${constraintId} already exists with different content.`);
              const outcome = commitRecord(state, constraintId, existing, false);
              outcome.result.created = false;
              return outcome;
            }
            const record = createRecord(request.constraint, request.status, 1);
            const outcome = commitRecord(state, constraintId, record, true);
            outcome.result.created = true;
            return outcome;
          });
        },
        replaceConstraint(command = {}) {
          const request = normalizeConstraintReplacementCommand(command, normalizeConstraint);
          const constraintId = request.constraint.id;
          return baseApi.applyCommand(request, (state) => {
            const existing = state.constraints[constraintId];
            if (!existing) throw new TypeError(`Unknown Physics constraint ${constraintId}.`);
            assertRevision(existing, request.expectedRevision, `Physics constraint ${constraintId}`);
            if (existing.status === "broken") throw new TypeError(`Broken Physics constraint ${constraintId} cannot be replaced.`);
            validateReferences(request.constraint);
            const changed = !sameConstraintValue(existing.constraint, request.constraint);
            const record = changed
              ? createRecord(request.constraint, existing.status, existing.revision + 1)
              : existing;
            return commitRecord(state, constraintId, record, changed);
          });
        },
        removeConstraint(command = {}) {
          const request = normalizeConstraintRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.constraints[request.constraintId];
            if (!existing) throw new TypeError(`Unknown Physics constraint ${request.constraintId}.`);
            assertRevision(existing, request.expectedRevision, `Physics constraint ${request.constraintId}`);
            const constraints = { ...state.constraints };
            delete constraints[request.constraintId];
            const constraintRevision = state.constraintRevision + 1;
            return {
              patch: { constraints, order: Object.keys(constraints).sort(), constraintRevision },
              result: { record: existing, removed: true, constraintRevision }
            };
          });
        },
        transitionConstraint(command = {}) {
          const request = normalizeConstraintStatusCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.constraints[request.constraintId];
            if (!existing) throw new TypeError(`Unknown Physics constraint ${request.constraintId}.`);
            assertRevision(existing, request.expectedRevision, `Physics constraint ${request.constraintId}`);
            if (existing.status === "broken") throw new TypeError(`Broken Physics constraint ${request.constraintId} has terminal status.`);
            const changed = existing.status !== request.status;
            const record = changed
              ? createRecord(existing.constraint, request.status, existing.revision + 1)
              : existing;
            return commitRecord(state, request.constraintId, record, changed);
          });
        },
        breakConstraint(command = {}) {
          const request = normalizeConstraintBreakCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.constraints[request.constraintId];
            if (!existing) throw new TypeError(`Unknown Physics constraint ${request.constraintId}.`);
            assertRevision(existing, request.expectedRevision, `Physics constraint ${request.constraintId}`);
            if (existing.status === "broken") throw new TypeError(`Physics constraint ${request.constraintId} is already broken.`);
            if (existing.status !== "enabled") throw new TypeError(`Disabled Physics constraint ${request.constraintId} cannot break.`);
            const evaluation = breakApi().evaluate(existing.constraint.breakPolicy, request.measurement);
            if (!evaluation.shouldBreak) throw new TypeError(`Physics constraint ${request.constraintId} break thresholds were not exceeded.`);
            const breakRecord = {
              schema: CONSTRAINT_BREAK_RECORD_SCHEMA,
              measurement: evaluation.measurement,
              forceExceeded: evaluation.forceExceeded,
              torqueExceeded: evaluation.torqueExceeded
            };
            const record = createRecord(existing.constraint, "broken", existing.revision + 1, breakRecord);
            return commitRecord(state, request.constraintId, record, true);
          });
        },
        hasConstraint(constraintId) {
          return readRecord(constraintId) !== null;
        },
        getConstraint(constraintId) {
          return readRecord(constraintId)?.constraint ?? null;
        },
        getRecord(constraintId) {
          return readRecord(constraintId);
        },
        listConstraints() {
          const state = baseApi.getState();
          return state.order.map((id) => state.constraints[id].constraint);
        },
        listRecords() {
          const state = baseApi.getState();
          return state.order.map((id) => state.constraints[id]);
        },
        listConstraintIdsForBody(bodyId) {
          return recordsForBody(bodyId).map((record) => record.constraint.id);
        },
        assertBodyDetachable(bodyId) {
          const normalizedBodyId = requireConstraintText(bodyId, "Physics constraint bodyId");
          const ids = recordsForBody(normalizedBodyId).map((record) => record.constraint.id);
          if (ids.length) {
            throw new TypeError(`Physics body ${normalizedBodyId} remains referenced by constraints: ${ids.join(", ")}.`);
          }
          return true;
        },
        validateReferences() {
          const state = baseApi.getState();
          const missing = [];
          const bodies = bodyRegistry();
          for (const id of state.order) {
            const constraint = state.constraints[id].constraint;
            for (const bodyId of [constraint.bodyA, constraint.bodyB]) {
              if (!bodies.hasBody(bodyId)) missing.push({ constraintId: id, bodyId });
            }
          }
          return canonicalConstraintValue({ valid: missing.length === 0, missing }, "Physics constraint reference validation");
        },
        inspectRegistry() {
          const state = baseApi.getState();
          return canonicalConstraintValue({
            constraintCount: state.order.length,
            constraintRevision: state.constraintRevision,
            brokenCount: state.order.filter((id) => state.constraints[id].status === "broken").length
          }, "Physics constraint registry inspection");
        }
      };
    }
  });
}

export default createConstraintRegistryKit;
