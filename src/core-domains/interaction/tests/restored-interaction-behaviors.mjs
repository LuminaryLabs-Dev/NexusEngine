import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createInteractionKit } from "../kits/interaction-kit/index.js";
import { createAssistanceTargetKit } from "../subdomains/assistance-target/kits/assistance-target-kit/index.js";
import { createEnvironmentalAffordanceKit } from "../subdomains/environmental-affordance/kits/environmental-affordance-kit/index.js";
import { createRequestQueueKit } from "../subdomains/request/subdomains/queue/kits/request-queue-kit/index.js";
import { createRequestFulfillmentKit } from "../subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/index.js";
import { createTransferZoneKit } from "../subdomains/transfer-zone/kits/transfer-zone-kit/index.js";

const engine = createEngine({ kits: [
  createInteractionKit(),
  createAssistanceTargetKit({ targets: [{ id: "done", completed: true }, { id: "lost", lost: true }, { id: "b", x: 1, y: 0 }, { id: "a", x: -1, y: 0 }] }),
  createEnvironmentalAffordanceKit({ affordances: [{ id: "done", completed: true }, { id: "switch", x: 0, y: 0, target: 2, metadata: { nested: true } }] }),
  createRequestQueueKit({ defaultReward: { account: "cash", amount: 7 }, requests: [{ id: "existing", patience: 10 }] }),
  createRequestFulfillmentKit({ requests: [{ id: "existing", x: 1, y: 0, metadata: { nested: true } }] }),
  createTransferZoneKit({ zones: [{ id: "dock", x: 0, y: 0, radius: 5, accepts: ["cargo"], dwellSeconds: 2, capacity: 1 }] })
] });

assert.equal(engine.n.assistanceTargets.getState().completedCount, 1);
assert.equal(engine.n.assistanceTargets.getState().lostCount, 1);
assert.equal(engine.n.assistanceTargets.nearest({ x: 0, y: 0 }).target.id, "a");
assert.throws(() => engine.n.assistanceTargets.complete({ operationId: "assist:lost", targetId: "lost" }), /terminal/);
engine.n.assistanceTargets.advance({ operationId: "assist:advance", delta: 1000 });
assert.throws(() => engine.n.assistanceTargets.attach({ operationId: "assist:attach", targetId: "a", carrierId: "carrier" }), /terminal/);

assert.equal(engine.n.environmentalAffordances.getState().completedCount, 1);
const affordanceBefore = engine.n.environmentalAffordances.getSnapshot();
const nearby = engine.n.environmentalAffordances.nearby({ x: 0, y: 0 });
nearby[0].affordance.metadata.changed = true;
assert.deepEqual(engine.n.environmentalAffordances.getSnapshot(), affordanceBefore);
assert.throws(() => engine.n.environmentalAffordances.activate({ operationId: "affordance:missing", affordanceId: "missing" }), /Unknown/);
assert.deepEqual(engine.n.environmentalAffordances.getSnapshot(), affordanceBefore);

const frameBefore = engine.n.realtime.getClock().frame;
const queued = engine.n.requestQueue.add({ operationId: "queue:add", request: { id: "new", patience: 3 } });
assert.equal(engine.n.realtime.getClock().frame, frameBefore, "Request Queue cannot tick the engine internally");
assert.equal(queued.result.request.reward.amount, 7);
const fulfilled = engine.n.requestQueue.fulfill({ operationId: "queue:fulfill", requestId: "new" });
assert.equal(fulfilled.result.effect.amount, 7);
assert.equal(engine.n.economy, undefined, "Request Queue reward remains a descriptor without an adapter");

const nearestBefore = engine.n.requestFulfillment.getSnapshot();
const nearest = engine.n.requestFulfillment.nearestOpen({ x: 0, y: 0 });
nearest.request.metadata.changed = true;
assert.deepEqual(engine.n.requestFulfillment.getSnapshot(), nearestBefore);
assert.throws(() => engine.n.requestFulfillment.create({ operationId: "existing", request: {} }), /already exists/);
assert.deepEqual(engine.n.requestFulfillment.getSnapshot(), nearestBefore);
const completed = engine.n.requestFulfillment.complete({ operationId: "fulfillment:complete", requestId: "existing" });
assert.deepEqual(engine.n.requestFulfillment.complete({ operationId: "fulfillment:complete", requestId: "existing" }), completed);

assert.throws(() => engine.n.transferZones.transfer({ operationId: "transfer:type", zoneId: "dock", subjectId: "x", subjectType: "person", point: { x: 0, y: 0 }, dwellSeconds: 2 }), /does not accept/);
assert.throws(() => engine.n.transferZones.transfer({ operationId: "transfer:dwell", zoneId: "dock", subjectId: "x", subjectType: "cargo", point: { x: 0, y: 0 }, dwellSeconds: 1 }), /requires 2/);
engine.n.transferZones.begin({ operationId: "transfer:begin", zoneId: "dock", subjectId: "x", subjectType: "cargo", point: { x: 0, y: 0 } });
assert.throws(() => engine.n.transferZones.begin({ operationId: "transfer:capacity", zoneId: "dock", subjectId: "y", subjectType: "cargo", point: { x: 0, y: 0 } }), /capacity/);
const transfer = engine.n.transferZones.advance({ operationId: "transfer:advance", delta: 2 });
assert.equal(transfer.result.completions.length, 1);
assert.equal(engine.n.transferZones.getState().completedCount, 1);

console.log("restored Interaction behaviors: ok");
