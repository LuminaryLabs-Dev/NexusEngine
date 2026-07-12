import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import {
  createArticulatedMotionDriveAdapter,
  createCorePhysicsDomain
} from "../../src/core-domains/core-physics-domain/index.js";

let constraints = [];
let articulations = [];
let motors = [];
let frame = null;

const provider = {
  id: "fake-articulated-physics",
  syncBodies() {},
  syncColliders() {},
  submitMotionRequests() {},
  syncConstraints(next) { constraints = next; },
  syncArticulations(next) { articulations = next; },
  submitJointMotorRequests(next) { motors = next; },
  step(tick) {
    frame = {
      stepId: tick.tickId,
      providerId: this.id,
      bodyResults: [],
      contacts: [],
      constraintResults: constraints.map((constraint) => ({
        constraintId: constraint.id,
        articulationId: constraint.articulationId,
        satisfied: true,
        error: 0
      })),
      jointResults: motors.map((motor) => ({
        jointId: motor.jointId,
        articulationId: motor.articulationId,
        rotation: motor.targetRotation,
        targetError: 0
      })),
      articulationResults: articulations.map((articulation) => ({
        articulationId: articulation.id,
        rigId: articulation.rigId,
        jointResults: []
      }))
    };
  },
  getFrame() { return frame; },
  reset() {},
  dispose() {}
};

const engine = createEngine({ kits: createCorePhysicsDomain() });
engine.corePhysics.setProvider(provider);

const articulation = engine.n.articulatedDynamics.syncArticulation({
  id: "raptor-dynamics",
  rigId: "raptor-rig",
  bodies: [
    { id: "thigh-L-body", boneId: "thigh-L", mass: 2 },
    { id: "shin-L-body", boneId: "shin-L", mass: 1 }
  ],
  joints: [{
    id: "knee-L",
    parentBodyId: "thigh-L-body",
    childBodyId: "shin-L-body",
    childBoneId: "shin-L",
    type: "revolute",
    limits: { minimum: 0, maximum: 2.5 }
  }]
});

assert.equal(constraints.length, 1);
assert.equal(articulations.length, 1);

const drive = createArticulatedMotionDriveAdapter();
const requests = drive.drive({
  articulation,
  corePhysics: engine.corePhysics,
  tickId: "tick:1",
  pose: {
    id: "raptor:pose",
    rigId: "raptor-rig",
    bones: {
      "shin-L": { rotation: { x: 0.1, y: 0, z: 0, w: 0.995 } }
    }
  }
});
assert.equal(requests.length, 1);
assert.equal(motors[0].jointId, "knee-L");

const physicsFrame = engine.corePhysics.step({
  tickId: "tick:1",
  frame: 1,
  delta: 1 / 60,
  elapsed: 1 / 60
});
assert.equal(physicsFrame.jointResults[0].jointId, "knee-L");
assert.equal(physicsFrame.articulationResults[0].articulationId, articulation.id);
assert.equal("backendObject" in physicsFrame, false);

const dynamicsFrame = engine.n.articulatedDynamics.commitFrame({ physicsFrame });
assert.equal(dynamicsFrame.schema, "nexus-articulated-dynamics-frame/1");
assert.doesNotThrow(() => structuredClone(engine.n.articulatedDynamics.getSnapshot()));

console.log("core physics domain smoke ok");
