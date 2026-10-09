import { canonicalBodyValue, normalizeBodyState, normalizeBodyRecord, requireBodyNonnegativeInteger,
  requireBodyObject, rejectBodyFields, sameBodyValue } from "../../body-contracts.js";

// Provider outputs update this registry, never a second physics-body store.
export function commitBodyStep(baseApi, input) {
  requireBodyObject(input, "Physics body step");
  rejectBodyFields(input, ["stepId", "updates"], "Physics body step");
  const request = canonicalBodyValue(input, "Physics body step");
  requireBodyNonnegativeInteger(request.stepId, "Physics body step.stepId");
  if (!Array.isArray(request.updates)) throw new TypeError("Physics body step.updates must be an array.");
  const state = baseApi.getState();
  if (state.lastStep?.stepId === request.stepId) {
    if (!sameBodyValue(state.lastStep.request, request)) throw new TypeError("Conflicting Physics body step retry.");
    return structuredClone(state.lastStep.receipt);
  }
  if (request.stepId !== (state.lastStep ? state.lastStep.stepId + 1 : 0)) throw new TypeError("Out-of-order Physics body step.");
  const bodies = { ...state.bodies }, seen = new Set(), changedIds = [];
  for (const update of request.updates) {
    requireBodyObject(update, "Physics body update");
    rejectBodyFields(update, ["bodyId", "expectedRevision", "pose", "velocity", "sleeping", "idleSeconds", "consumeImpulses"], "Physics body update");
    const { bodyId } = update;
    if (typeof bodyId !== "string" || !Object.hasOwn(bodies, bodyId)) throw new TypeError(`Unknown Physics body ${bodyId}.`);
    if (seen.has(bodyId)) throw new TypeError(`Duplicate Physics body ${bodyId}.`);
    seen.add(bodyId);
    const record = bodies[bodyId];
    if (!Number.isSafeInteger(update.expectedRevision) || record.revision !== update.expectedRevision) throw new TypeError(`Stale Physics body ${bodyId} revision.`);
    if (typeof update.consumeImpulses !== "boolean" || typeof update.sleeping !== "boolean") throw new TypeError("Body step flags must be boolean.");
    if (!update.pose || !update.velocity || !Number.isFinite(update.idleSeconds) || update.idleSeconds < 0) throw new TypeError("Incomplete Physics body output.");
    const body = normalizeBodyState({ ...record.body, pose: update.pose, velocity: update.velocity,
      sleep: { ...record.body.sleep, sleeping: update.sleeping, idleSeconds: update.idleSeconds },
      force: update.consumeImpulses ? { ...record.body.force, linearImpulse: [0,0,0], angularImpulse: [0,0,0] } : record.body.force });
    if (!sameBodyValue(body, record.body)) {
      bodies[bodyId] = normalizeBodyRecord({ body, revision: record.revision + 1 });
      changedIds.push(bodyId);
    }
  }
  const receipt = { stepId: request.stepId, changedBodyIds: changedIds.sort(), bodyRevision: state.bodyRevision + (changedIds.length ? 1 : 0) };
  // All records were validated before the single write. Old streaming steps are
  // rejected, while an exact retry of the latest step returns its original receipt.
  baseApi.update({ bodies, bodyRevision: receipt.bodyRevision, lastStep: { stepId: request.stepId, request, receipt } });
  return structuredClone(receipt);
}
