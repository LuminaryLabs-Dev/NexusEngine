import { createDomainKit } from "../../../../domain-kit.js";
import { canonicalBodyValue, sameBodyValue } from "../../body-contracts.js";
import {
  bodyRegistryContract,
  normalizeBodyDefinitionCommand,
  normalizeBodyRecord,
  normalizeBodyRegistrySnapshot,
  normalizeBodyRemovalCommand,
  normalizeBodyReplacementCommand
} from "./contracts.js";

const REQUIRES = Object.freeze([
  "n:physics",
  "physics:state-schema",
  "physics:command-schema",
  "physics:event-schema",
  "physics:body-state",
  "physics:body-sleep",
  "physics:body-wake",
  "physics:body-lifecycle"
]);

function assertRevision(record, expectedRevision, label) {
  if (expectedRevision !== undefined && record.revision !== expectedRevision) {
    throw new TypeError(`${label} expected revision ${expectedRevision}, received ${record.revision}.`);
  }
}

function nextRecord(record, body) {
  return normalizeBodyRecord({ body, revision: record.revision + 1 });
}

export function createBodyRegistryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "body-registry-kit",
    id: config.id ?? "body-registry-kit",
    domain: "physics-body-registry",
    domainPath: "n:physics:body",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsBodyRegistry",
    requires: REQUIRES,
    provides: ["n:physics:body", "physics:body", "physics:body-registry"],
    purpose: "Own portable Physics body records and exact-once lifecycle transitions without executing a solver.",
    owns: ["body registry", "body record revisions", "exact-once body state transitions"],
    doesNotOwn: ["solver integration", "colliders", "contacts", "provider body objects", "gameplay actors"],
    initialState: { bodies: {}, order: [], bodyRevision: 0 },
    createApi({ baseApi, engine }) {
      const normalizeBody = (input) => engine.n.physicsBodyState.normalize(input);
      const readRecord = (bodyId) => baseApi.getState().bodies[String(bodyId)] ?? null;

      const commitRecord = (state, bodyId, record, changed) => {
        const bodies = changed ? { ...state.bodies, [bodyId]: record } : state.bodies;
        return {
          patch: {
            bodies,
            order: Object.keys(bodies).sort(),
            bodyRevision: changed ? state.bodyRevision + 1 : state.bodyRevision
          },
          result: {
            record,
            changed,
            bodyRevision: changed ? state.bodyRevision + 1 : state.bodyRevision
          }
        };
      };

      return {
        ...baseApi,
        getContract: bodyRegistryContract,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeBodyRegistrySnapshot(snapshot, normalizeBody));
        },
        defineBody(command = {}) {
          const request = normalizeBodyDefinitionCommand(command, normalizeBody);
          const bodyId = request.body.identity.id;
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[bodyId];
            if (existing && !sameBodyValue(existing.body, request.body)) {
              throw new TypeError(`Physics body ${bodyId} already exists with different content.`);
            }
            if (existing) {
              const outcome = commitRecord(state, bodyId, existing, false);
              outcome.result.created = false;
              return outcome;
            }
            const record = normalizeBodyRecord({ body: request.body, revision: 1 }, normalizeBody);
            const outcome = commitRecord(state, bodyId, record, true);
            outcome.result.created = true;
            return outcome;
          });
        },
        replaceBody(command = {}) {
          const request = normalizeBodyReplacementCommand(command, normalizeBody);
          const bodyId = request.body.identity.id;
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[bodyId];
            if (!existing) throw new TypeError(`Unknown Physics body ${bodyId}.`);
            assertRevision(existing, request.expectedRevision, `Physics body ${bodyId}`);
            const changed = !sameBodyValue(existing.body, request.body);
            return commitRecord(state, bodyId, changed ? nextRecord(existing, request.body) : existing, changed);
          });
        },
        removeBody(command = {}) {
          const request = normalizeBodyRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[request.bodyId];
            if (!existing) throw new TypeError(`Unknown Physics body ${request.bodyId}.`);
            assertRevision(existing, request.expectedRevision, `Physics body ${request.bodyId}`);
            const bodies = { ...state.bodies };
            delete bodies[request.bodyId];
            return {
              patch: {
                bodies,
                order: Object.keys(bodies).sort(),
                bodyRevision: state.bodyRevision + 1
              },
              result: { record: existing, removed: true, bodyRevision: state.bodyRevision + 1 }
            };
          });
        },
        sleepBody(command = {}) {
          const request = engine.n.physicsBodySleep.normalizeCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[request.bodyId];
            if (!existing) throw new TypeError(`Unknown Physics body ${request.bodyId}.`);
            assertRevision(existing, request.expectedRevision, `Physics body ${request.bodyId}`);
            const body = existing.body;
            if (body.type.kind !== "dynamic") throw new TypeError(`Physics ${body.type.kind} body ${request.bodyId} cannot enter dynamic sleep.`);
            if (body.lifecycle.status !== "active") throw new TypeError(`Disabled Physics body ${request.bodyId} cannot enter sleep.`);
            if (!body.sleep.allowSleep) throw new TypeError(`Physics body ${request.bodyId} does not allow sleep.`);
            const changed = !body.sleep.sleeping;
            const nextBody = changed ? normalizeBody({
              ...body,
              velocity: { linear: [0, 0, 0], angular: [0, 0, 0] },
              force: { force: [0, 0, 0], torque: [0, 0, 0], linearImpulse: [0, 0, 0], angularImpulse: [0, 0, 0] },
              sleep: { ...body.sleep, sleeping: true }
            }) : body;
            return commitRecord(state, request.bodyId, changed ? nextRecord(existing, nextBody) : existing, changed);
          });
        },
        wakeBody(command = {}) {
          const request = engine.n.physicsBodyWake.normalize(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[request.bodyId];
            if (!existing) throw new TypeError(`Unknown Physics body ${request.bodyId}.`);
            assertRevision(existing, request.expectedRevision, `Physics body ${request.bodyId}`);
            const body = existing.body;
            if (body.type.kind !== "dynamic") throw new TypeError(`Physics ${body.type.kind} body ${request.bodyId} cannot receive a dynamic wake command.`);
            if (body.lifecycle.status !== "active") throw new TypeError(`Disabled Physics body ${request.bodyId} cannot wake.`);
            const changed = body.sleep.sleeping || body.sleep.idleSeconds !== 0;
            const nextBody = changed ? normalizeBody({ ...body, sleep: { ...body.sleep, sleeping: false, idleSeconds: 0 } }) : body;
            return commitRecord(state, request.bodyId, changed ? nextRecord(existing, nextBody) : existing, changed);
          });
        },
        transitionBody(command = {}) {
          const request = engine.n.physicsBodyLifecycle.normalizeCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.bodies[request.bodyId];
            if (!existing) throw new TypeError(`Unknown Physics body ${request.bodyId}.`);
            assertRevision(existing, request.expectedRevision, `Physics body ${request.bodyId}`);
            const changed = existing.body.lifecycle.status !== request.status;
            const nextBody = changed
              ? normalizeBody({ ...existing.body, lifecycle: { status: request.status } })
              : existing.body;
            return commitRecord(state, request.bodyId, changed ? nextRecord(existing, nextBody) : existing, changed);
          });
        },
        hasBody(bodyId) {
          return readRecord(bodyId) !== null;
        },
        getBody(bodyId) {
          return readRecord(bodyId)?.body ?? null;
        },
        getRecord(bodyId) {
          return readRecord(bodyId);
        },
        listBodies() {
          const state = baseApi.getState();
          return state.order.map((id) => state.bodies[id].body);
        },
        listRecords() {
          const state = baseApi.getState();
          return state.order.map((id) => state.bodies[id]);
        },
        inspectRegistry() {
          const state = baseApi.getState();
          return canonicalBodyValue({ bodyCount: state.order.length, bodyRevision: state.bodyRevision }, "Physics body registry inspection");
        }
      };
    }
  });
}

export default createBodyRegistryKit;

