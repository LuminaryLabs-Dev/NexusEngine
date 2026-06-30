import assert from "node:assert/strict";
import {
  createEngine,
  createWorld,
  createScheduler,
  createRealtimeGame,
  createGameKitComposer,
  defineComponent,
  defineResource,
  defineEvent,
  defineRuntimeKit
} from "../src/index.js";

const Position = defineComponent("release.position");
const ReleaseState = defineResource("release.state");
const ReleaseEvent = defineEvent("release.event");

const world = createWorld();
const scheduler = createScheduler();
let inputRuns = 0;
let simulateRuns = 0;

scheduler.addSystem("input", (systemWorld) => {
  inputRuns += 1;
  systemWorld.emit(ReleaseEvent, { id: "release-event-1" });
});

scheduler.addSystem("simulate", (systemWorld) => {
  simulateRuns += 1;
  const events = systemWorld.readEvents(ReleaseEvent);
  systemWorld.setResource(ReleaseState, {
    seen: events.map((event) => event.id),
    phaseOrder: ["input", "simulate"]
  });
});

const engine = createEngine({ world, scheduler });
let eventSurfaceBatch = null;
let resourceSurfaceBatch = null;
let querySurfaceBatch = null;
let lifecycleSurfaceBatch = null;

engine.eventSurface(ReleaseEvent).subscribe((batch) => {
  eventSurfaceBatch = batch;
});
engine.resourceSurface(ReleaseState).subscribe((batch) => {
  resourceSurfaceBatch = batch;
});
engine.querySurface([Position]).subscribe((batch) => {
  querySurfaceBatch = batch;
});
engine.lifecycleSurface({ topics: ["tick", "phase"] }).subscribe((batch) => {
  lifecycleSurfaceBatch = batch;
});

const entity = world.addEntity();
world.setComponent(entity, Position, { x: 1, y: 2 });

engine.tick(0.25);

assert.equal(inputRuns, 1);
assert.equal(simulateRuns, 1);
assert.equal(engine.clock.frame, 1);
assert.equal(engine.clock.delta, 0.25);
assert.equal(engine.clock.elapsed, 0.25);
assert.deepEqual(world.getResource(ReleaseState).seen, ["release-event-1"]);
assert.equal(world.readEvents(ReleaseEvent).length, 0, "events should be tick-scoped and clear after scheduler run");
assert.ok(Array.isArray(eventSurfaceBatch));
assert.equal(eventSurfaceBatch[0].event.name, ReleaseEvent.name);
assert.ok(Array.isArray(resourceSurfaceBatch));
assert.equal(resourceSurfaceBatch[0].resource.name, ReleaseState.name);
assert.equal(querySurfaceBatch.kind, "query");
assert.ok(querySurfaceBatch.current.includes(entity));
assert.ok(Array.isArray(lifecycleSurfaceBatch));
assert.ok(lifecycleSurfaceBatch.some((record) => record.topic === "tick" && record.stage === "start"));
assert.ok(lifecycleSurfaceBatch.some((record) => record.topic === "tick" && record.stage === "end"));

const CounterState = defineResource("release.counter");
let systemRuns = 0;
function counterSystem(counterWorld) {
  systemRuns += 1;
  counterWorld.setResource(CounterState, Number(counterWorld.getResource(CounterState) ?? 0) + 1);
}
const counterKit = defineRuntimeKit({
  id: "release-counter-kit",
  resources: { CounterState },
  systems: [{ phase: "simulate", system: counterSystem, name: "counterSystem" }],
  initWorld({ world: kitWorld }) {
    kitWorld.setResource(CounterState, 0);
  }
});

const kitEngine = createEngine();
kitEngine.installKit(counterKit);
kitEngine.installKit(counterKit);
kitEngine.tick(1 / 60);
assert.equal(systemRuns, 1, "installing the same kit object twice should not duplicate systems");
assert.equal(kitEngine.world.getResource(CounterState), 1);

assert.throws(() => createGameKitComposer({ kits: [counterKit, counterKit] }), /Duplicate runtime kit id/);

const providerKit = defineRuntimeKit({ id: "release-provider-kit", provides: ["release:provider"] });
const dependentKit = defineRuntimeKit({ id: "release-dependent-kit", requires: ["release:provider"] });
const composed = createGameKitComposer({ kits: [dependentKit, providerKit] });
assert.deepEqual(composed.installOrder, ["release-provider-kit", "release-dependent-kit"]);
assert.throws(() => createGameKitComposer({ kits: [dependentKit] }), /Unable to resolve runtime kit dependencies/);

const game = createRealtimeGame({ kits: [providerKit, dependentKit] });
assert.deepEqual(game.game.installOrder, ["release-provider-kit", "release-dependent-kit"]);

console.log("release-0.0.3-runtime-contracts ok");
