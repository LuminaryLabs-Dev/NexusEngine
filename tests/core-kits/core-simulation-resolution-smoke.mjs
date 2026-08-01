import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { defineEvent, defineResource } from "../../src/ecs.js";
import {
  createSimulationKit,
  SimulationResolutionLedger
} from "../../src/core-domains/simulation/kits/simulation-kit/index.js";

const ResultState = defineResource("test.simulation.result");
const AcceptedEvent = defineEvent("test.simulation.accepted");
let policyCalls = 0;
let acceptedOrder = null;
let observationOrder = null;

const engine = createEngine({
  kits: [createSimulationKit({ resolution: true })]
});
engine.world.setResource(ResultState, { value: 0 });

engine.n.simulation.registerObservationSource({
  id: "source-z",
  order: 20,
  observe() {
    return { id: "observation-z", type: "probe", value: { id: "z" } };
  }
});
engine.n.simulation.registerObservationSource({
  id: "source-a",
  order: 10,
  observe() {
    return { id: "observation-a", type: "probe", value: { id: "a" } };
  }
});
engine.n.simulation.setResolutionPolicy({
  id: "test-policy",
  version: 3,
  resolve({ proposals, observations }) {
    policyCalls += 1;
    acceptedOrder = proposals.map((entry) => entry.id);
    observationOrder = observations.map((entry) => entry.id);
    return {
      outcome: "continue",
      accepted: { proposalIds: acceptedOrder },
      rejected: {},
      statePatch: {
        resources: [{ resource: ResultState, value: { value: policyCalls } }]
      },
      events: [{ event: AcceptedEvent, payload: { policyCalls } }]
    };
  }
});

engine.scheduler.addSystem("simulate", (_world, tickContext) => {
  engine.n.simulation.submitProposal({ id: "proposal-z", source: "z", type: "test", order: 20 });
  engine.n.simulation.submitProposal({ id: "proposal-a", source: "a", type: "test", order: 10 });
  engine.n.simulation.submitProposal({ id: "proposal-a", source: "a", type: "test", order: 10 });
  assert.equal(tickContext.tickId, engine.getCurrentTickContext().tickId);
});

engine.tick(1 / 60);
const committed = engine.n.simulation.getCommittedFrame();
assert.equal(policyCalls, 1, "policy runs once per tick");
assert.deepEqual(acceptedOrder, ["proposal-a", "proposal-z"], "proposals are ordered deterministically and deduplicated");
assert.deepEqual(observationOrder, ["observation-a", "observation-z"], "observations are ordered deterministically");
assert.equal(committed.policy.id, "test-policy");
assert.equal(committed.policy.version, 3);
assert.equal(committed.revision, 1);
assert.equal(committed.committed, true);
assert.equal(engine.world.getResource(ResultState).value, 1, "policy state patch commits once");
assert.doesNotThrow(() => structuredClone(committed), "committed simulation frame is serializable");

engine.tick(1 / 60);
assert.equal(policyCalls, 2, "next tick commits once");
assert.equal(engine.n.simulation.getCommittedFrame().revision, 2);

const duplicateEngine = createEngine({
  kits: [createSimulationKit({ resolution: true })]
});
let duplicatePolicyCalls = 0;
duplicateEngine.n.simulation.setResolutionPolicy({
  id: "duplicate-test",
  version: 1,
  resolve() {
    duplicatePolicyCalls += 1;
    return { outcome: "continue" };
  }
});
duplicateEngine.world.setResource(SimulationResolutionLedger, {
  revision: 0,
  committedStepIds: ["simulation:tick:1"]
});
duplicateEngine.tick(1 / 60);
assert.equal(duplicatePolicyCalls, 0, "duplicate step is rejected before policy execution");
assert.equal(duplicateEngine.n.simulation.getCommittedFrame(), null, "duplicate step does not create another commit");

duplicateEngine.n.simulation.resetResolution();
assert.equal(duplicateEngine.n.simulation.getResolutionLedger().revision, 0, "reset clears resolution ledger");

console.log("core simulation resolution smoke ok");
