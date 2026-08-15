import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createPhysicsKit } from "../../src/core-domains/simulation/physics/kits/physics-kit/index.js";
import { createSimulationKit } from "../../src/core-domains/simulation/kits/simulation-kit/index.js";

let initialized = 0;
let stepped = 0;
let reset = 0;
let disposed = 0;
let bodies = [];
let colliders = [];
let motions = [];
let frame = null;
const backendObject = { privateHandle: new Map([["x", 1]]) };

const provider = {
  id: "fake-physics",
  initialize() { initialized += 1; },
  syncBodies(next) { bodies = next; },
  syncColliders(next) { colliders = next; },
  submitMotionRequests(next) { motions = next; },
  step(tickContext) {
    stepped += 1;
    frame = {
      stepId: tickContext.tickId,
      providerId: "fake-physics",
      bodyResults: [{
        bodyId: "player",
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        linearVelocity: { x: 0, y: 0, z: 4 },
        grounded: true
      }],
      contacts: [{ actorId: "player", colliderId: "tree", tags: ["fatal-obstacle"] }],
      backendObject
    };
  },
  getFrame() { return frame; },
  reset() { reset += 1; },
  dispose() { disposed += 1; }
};

const engine = createEngine({
  kits: [
    createSimulationKit({ resolution: true }),
    createPhysicsKit()
  ]
});

engine.n.physics.setProvider(provider);
assert.equal(initialized, 1, "provider initializes once");
engine.n.physics.syncBodies([{ id: "player", kind: "kinematic" }]);
engine.n.physics.syncColliders([{ id: "tree", kind: "ball", radius: 1 }]);
engine.n.physics.submitMotionRequests([{ id: "move", bodyId: "player", position: { x: 1, y: 2, z: 3 } }]);
assert.equal(bodies[0].id, "player");
assert.equal(colliders[0].id, "tree");
assert.equal(motions[0].bodyId, "player");

engine.n.simulation.registerObservationSource({
  id: "physics",
  order: 100,
  observe({ tick }) {
    return {
      id: `${tick.tickId}:physics`,
      type: "physics.frame",
      source: "physics",
      value: engine.n.physics.step(tick)
    };
  }
});
engine.n.simulation.setResolutionPolicy({
  id: "physics-observation-policy",
  version: 1,
  resolve({ observations }) {
    const physics = observations.find((entry) => entry.type === "physics.frame")?.value;
    return {
      outcome: physics?.contacts?.length ? "contact" : "continue",
      accepted: { contacts: physics?.contacts ?? [] }
    };
  }
});

engine.tick(1 / 60);
assert.equal(stepped, 1, "provider steps once in the authoritative tick");
const physicsFrame = engine.n.physics.getFrame();
assert.equal(physicsFrame.stepId, "tick:1", "physics frame uses TickContext identity");
assert.equal(physicsFrame.contacts[0].actorId, "player");
assert.equal("backendObject" in physicsFrame, false, "backend objects do not escape normalized output");
assert.doesNotThrow(() => structuredClone(physicsFrame), "physics frame is serializable");
assert.equal(engine.n.simulation.getCommittedFrame().outcome, "contact");

engine.n.physics.step({ tickId: "tick:1", frame: 1, delta: 1 / 60, elapsed: 1 / 60 });
assert.equal(stepped, 1, "same physics step identity is idempotent");
engine.n.physics.reset();
assert.equal(reset, 1, "provider reset is delegated");
engine.n.physics.dispose();
assert.equal(disposed, 1, "provider dispose is delegated");

console.log("core physics provider smoke ok");
