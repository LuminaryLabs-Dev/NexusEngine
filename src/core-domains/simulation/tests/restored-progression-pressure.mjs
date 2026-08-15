import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createSimulationKit } from "../kits/simulation-kit/index.js";
import { createHazardFieldKit } from "../hazard-field/kits/hazard-field-kit/index.js";
import { createLifecycleProgressionKit } from "../progression/lifecycle/kits/lifecycle-progression-kit/index.js";
import { createPursuitPressureKit } from "../pursuit-pressure/kits/pursuit-pressure-kit/index.js";

const collisionEngine = createEngine({ kits: [
  createSimulationKit(),
  createHazardFieldKit({ bounds: { width: 100, height: 100 }, hazards: [{ id: "spawn-1", x: 50, y: 50 }], spawnRules: [{ id: "spawn", firstAt: 1, intervalSeconds: 1 }], maxHazards: 2 })
] });
const collisionBefore = collisionEngine.n.hazardField.getSnapshot();
assert.throws(() => collisionEngine.n.hazardField.advance({ operationId: "hazard:collision", delta: 1 }), /collides/);
assert.deepEqual(collisionEngine.n.hazardField.getSnapshot(), collisionBefore);

const engine = createEngine({ kits: [
  createSimulationKit(),
  createHazardFieldKit({ bounds: { width: 100, height: 100 }, hazards: [{ id: "hazard", x: 10, y: 10, radius: 3, metadata: { nested: true } }] }),
  createLifecycleProgressionKit({ items: [
    { id: "foundation", durationSeconds: 0 },
    { id: "upgrade", prerequisites: ["foundation"], durationSeconds: 2, cost: { account: "cash", amount: 5 }, effects: { facility: { id: "mill" } } }
  ] }),
  createPursuitPressureKit({ startDistance: 5, catchDistance: 8, dangerDistance: 20, warningDistance: 40, maxDistance: 100 })
] });

const hazardBefore = engine.n.hazardField.getSnapshot();
const hits = engine.n.hazardField.checkCircle({ x: 10, y: 10, radius: 1 });
hits[0].metadata.changed = true;
assert.deepEqual(engine.n.hazardField.getSnapshot(), hazardBefore);
assert.throws(() => engine.n.hazardField.setBounds({ operationId: "hazard:bounds", bounds: { width: 2, height: 2, padding: 0 } }), /does not fit/);

const lifecycleBefore = engine.n.lifecycleProgression.getSnapshot();
assert.throws(() => engine.n.lifecycleProgression.start({ operationId: "lifecycle:blocked", itemId: "upgrade" }), /prerequisites/);
assert.deepEqual(engine.n.lifecycleProgression.getSnapshot(), lifecycleBefore);
const foundation = engine.n.lifecycleProgression.start({ operationId: "lifecycle:foundation", itemId: "foundation" });
assert.equal(foundation.result.item.status, "complete");
const upgrade = engine.n.lifecycleProgression.start({ operationId: "lifecycle:upgrade", itemId: "upgrade" });
assert.equal(upgrade.result.cost.amount, 5);
assert.equal(engine.n.economy, undefined, "Lifecycle cost remains descriptive without an adapter");
const progressed = engine.n.lifecycleProgression.advance({ operationId: "lifecycle:advance", delta: 2 });
assert.equal(progressed.result.completed[0].id, "upgrade");
assert.equal(progressed.result.effects[0].effects.facility.id, "mill");

assert.equal(engine.n.pursuitPressure.getState().caught, true);
assert.equal(engine.n.pursuitPressure.getState().band, "caught");
assert.throws(() => engine.n.pursuitPressure.setDistance({ operationId: "pursuit:bad-recovery", distance: 30 }), /explicit recovery/);
engine.n.pursuitPressure.recover({ operationId: "pursuit:recover", distance: 15 });
engine.n.pursuitPressure.setDistance({ operationId: "pursuit:warning", distance: 35 });
engine.n.pursuitPressure.setDistance({ operationId: "pursuit:caught", distance: 4 });
assert.equal(engine.n.pursuitPressure.getState().transitionHistory.length, 3);
assert.equal(engine.n.pursuitPressure.getState().caught, true);

console.log("restored Hazard, Pursuit, and Lifecycle behaviors: ok");
