import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createSimulationKit } from "../kits/simulation-kit/index.js";
import { createMotionKit } from "../motion/kits/motion-kit/index.js";
import { createPhysicsKit } from "../physics/kits/physics-kit/index.js";
import { createActionLocomotionKit } from "../motion/locomotion/kits/action-locomotion-kit/index.js";
import { createVehicleDynamicsKit } from "../motion/vehicle/kits/vehicle-dynamics-kit/index.js";
import { createWorldContactKit } from "../physics/world-contact/kits/world-contact-kit/index.js";
import { createSoftRespawnKit } from "../recovery/soft-respawn/kits/soft-respawn-kit/index.js";

const engine = createEngine({ kits: [
  createSimulationKit(),
  createMotionKit(),
  createPhysicsKit(),
  createActionLocomotionKit({ actorId: "pilot", start: { x: 0, y: 4, z: 0 }, grounded: false }),
  createVehicleDynamicsKit({ vehicleId: "cart", boost: { max: 0, start: 0 } }),
  createWorldContactKit(),
  createSoftRespawnKit({ defaultPoint: { x: 1, y: 2, z: 3 } })
] });

const glideOne = engine.n.actionLocomotion.step({ operationId: "locomotion:1", delta: 0.01, input: { glide: true } });
const glideTwo = engine.n.actionLocomotion.step({ operationId: "locomotion:2", delta: 0.01, input: { glide: true } });
assert.deepEqual(glideOne.result.transitions, ["glide-started"]);
assert.deepEqual(glideTwo.result.transitions, []);

const falling = engine.n.actionLocomotion.getSnapshot();
falling.position.y = -50;
falling.velocity.y = -2;
falling.grounded = false;
engine.n.actionLocomotion.loadSnapshot(falling);
const fall = engine.n.actionLocomotion.step({ operationId: "locomotion:fall", delta: 0, contact: { grounded: true, groundHeight: 0 } });
assert.equal(fall.result.recoveryRequired.reason, "fall");
assert.equal(fall.result.grounded, false);
assert.equal(fall.result.position.y, -50);

const vehicle = engine.n.vehicleDynamics.step({ operationId: "vehicle:1", delta: 1 / 60, input: { x: 1, boost: true } });
assert.equal(vehicle.result.boost.active, false);
assert.equal(vehicle.result.boost.value, 0);

const contact = engine.n.worldContact.resolve({
  operationId: "contact:fall",
  body: { id: "pilot", position: { x: 0, y: -100, z: 0 }, velocity: { x: 0, y: -5, z: 0 } },
  sample: { groundHeight: 0, normal: { x: 0, y: 1, z: 0 }, surface: { traction: 1 } }
});
assert.equal(contact.result.recoveryRequired.reason, "fall");
assert.equal(contact.result.contact.grounded, false);
assert.equal(contact.result.correction.position.y, -100);

const recovery = engine.n.softRespawn.recover({ operationId: "recovery:1", subjectId: "pilot", reason: "fall" });
const recoveryState = engine.n.softRespawn.getSnapshot();
assert.deepEqual(engine.n.softRespawn.recover({ operationId: "recovery:1", subjectId: "pilot", reason: "fall" }), recovery);
assert.deepEqual(engine.n.softRespawn.getSnapshot(), recoveryState);
assert.equal(recovery.result.position.y, 2);
assert.equal(engine.n.softRespawn.getState().recoveries, 1);

const cloned = engine.n.vehicleDynamics.getSnapshot();
cloned.position.x = 999;
assert.notEqual(engine.n.vehicleDynamics.getState().position.x, 999);

console.log("restored Motion and contact behaviors: ok");
