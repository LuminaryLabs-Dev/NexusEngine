import assert from "node:assert/strict";
import { createEngine } from "../src/engine.js";
import { defineResource } from "../src/ecs.js";

let renderCalls = 0;
const renderer = {
  render() { renderCalls += 1; },
  draw() { renderCalls += 1; },
  present() { renderCalls += 1; }
};

const engine = createEngine({
  coreKits: false,
  renderer,
  tick: { maxDelta: 1 / 15, rejectReentry: true }
});

const ProbeState = defineResource("test.tick.probe");
engine.world.setResource(ProbeState, { count: 0 });
const contexts = [];
let reentryMessage = null;

engine.scheduler.addSystem("input", (world, tickContext) => {
  contexts.push(tickContext);
  assert.equal(Object.isFrozen(tickContext), true, "TickContext is immutable");
  try {
    engine.tick(1 / 60);
  } catch (error) {
    reentryMessage = error.message;
  }
  const state = world.getResource(ProbeState);
  world.setResource(ProbeState, { count: state.count + 1 });
});
engine.scheduler.addSystem("simulate", (_world, tickContext) => contexts.push(tickContext));

const returned = engine.tick(-1);
assert.equal(returned, engine.world, "tick preserves the world return value");
assert.equal(engine.clock.frame, 1, "frame advances once");
assert.equal(engine.clock.delta, 0, "negative delta is clamped to zero");
assert.equal(contexts.length, 2, "both systems ran");
assert.equal(contexts[0], contexts[1], "systems receive the same TickContext instance");
assert.match(reentryMessage ?? "", /re-entry/, "nested tick is rejected");
assert.equal(renderCalls, 0, "tick never invokes renderer methods");

const firstCommit = engine.getLastTickCommit();
assert.equal(firstCommit.tickId, "tick:1");
assert.equal(firstCommit.revision, 1);
assert.equal(firstCommit.committed, true);
assert.ok(firstCommit.dirty.resources.includes(ProbeState.name), "dirty resource identities are recorded");
assert.doesNotThrow(() => structuredClone(firstCommit), "TickCommit is serializable");
assert.equal(engine.getCurrentTickContext(), null, "TickContext retires after commit");
assert.equal(engine.isTicking(), false, "tick running flag retires after commit");

contexts.length = 0;
engine.tick(4);
assert.equal(engine.clock.frame, 2, "second frame advances once");
assert.equal(engine.clock.delta, 1 / 15, "large delta is clamped");
assert.equal(engine.getLastTickCommit().revision, 2, "tick revision advances once");
assert.equal(renderCalls, 0, "renderer remains outside the tick");

console.log("realtime core tick contract smoke ok");
