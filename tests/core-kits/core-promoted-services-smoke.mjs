import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import { createCoreDataKit } from "../../src/core-kits/core-data-kit/index.js";
import { createCoreCompositionKit } from "../../src/core-kits/core-composition-kit/index.js";
import { createCoreSimulationKit } from "../../src/core-kits/core-simulation-kit/index.js";

const engine = createRealtimeGame({
  tick: { maxDelta: 1 },
  kits: [
    createCoreDataKit({
      random: { seed: "promotion-smoke", streams: ["world"] },
      completion: { ledgers: { objectives: [] } }
    }),
    createCoreCompositionKit(),
    createCoreSimulationKit({
      resourceMeters: [{
        id: "energy",
        min: 0,
        max: 10,
        initial: 10,
        ratePerSecond: -2,
        thresholds: [{ id: "low", value: 4, direction: "below", once: true }]
      }],
      pressureChannels: [{
        id: "heat",
        min: 0,
        max: 10,
        initial: 0,
        ratePerSecond: 3,
        warningAt: 2,
        failAt: 8
      }],
      actionWindows: [{
        id: "parry",
        intervalSeconds: 2,
        perfectWindowSeconds: 0.1,
        goodWindowSeconds: 0.25,
        cooldownSeconds: 0.5
      }]
    })
  ]
});

const random = engine.n.coreData.random;
const randomSnapshot = random.getSnapshot();
const first = random.nextUint32("world");
random.loadSnapshot(randomSnapshot);
assert.equal(random.nextUint32("world"), first, "named random streams replay exactly");

const completion = engine.n.coreData.completion;
assert.equal(completion.complete("repair-relay", { data: { route: "fogline" } }, "objectives").accepted, true);
assert.equal(completion.complete("repair-relay", {}, "objectives").duplicate, true);
assert.deepEqual(completion.list("objectives"), ["repair-relay"]);

const digestA = engine.n.coreData.digest.digest({ b: 2, a: 1 });
const digestB = engine.n.coreData.digest.digest({ a: 1, b: 2 });
assert.equal(digestA.digest, digestB.digest, "state digest ignores object key order");
assert.equal(engine.n.seedStream, random, "seed compatibility alias points to Core Data");
assert.equal(engine.n.genericSeed, random, "generic seed alias points to Core Data");
assert.equal(engine.n.completionLedger, completion, "completion ledger alias points to Core Data");

const registry = engine.n.coreComposition.registry;
registry.registerKit({ id: "provider-kit", status: "official", domain: "foundation", provides: ["capability:provider"] });
registry.registerKit({ id: "consumer-kit", status: "candidate", domain: "experience", requires: ["capability:provider"] });
registry.registerDomain({ id: "experience", kits: ["consumer-kit"] });
registry.registerBundle({ id: "experience-stack", domains: ["experience"] });

const graph = engine.n.coreComposition.capabilities.build();
assert.equal(graph.valid, true, "capability graph resolves dependencies");
assert.ok(graph.order.indexOf("provider-kit") < graph.order.indexOf("consumer-kit"), "provider orders before consumer");

const plan = engine.n.coreComposition.planning.plan({ bundles: ["experience-stack"] });
assert.equal(plan.ok, true, "composition plan is valid");
assert.deepEqual(plan.selected, ["consumer-kit", "provider-kit"]);
assert.equal(engine.n.coreComposition.health.getSnapshot().healthy, true);
assert.equal(engine.n.kitRegistry, registry, "registry compatibility alias points to Core Composition");

const windows = engine.n.coreSimulation.windows;
assert.equal(windows.action("parry", { actorId: "player" }).quality, "perfect");
assert.equal(windows.action("parry", { actorId: "player" }).reason, "cooldown");
assert.equal(engine.n.genericActionWindow, windows, "generic action-window alias points to Core Simulation");

engine.tick(1);

assert.equal(engine.n.coreSimulation.resources.get("energy").value, 8, "resource rates advance on engine ticks");
assert.equal(engine.n.coreSimulation.pressure.get("heat").value, 3, "pressure rates advance on engine ticks");
assert.equal(engine.n.coreSimulation.pressure.get("heat").status, "warning");
assert.equal(engine.n.resourceMeter, engine.n.coreSimulation.resources, "resource compatibility alias points to Core Simulation");

const snapshot = engine.n.coreSimulation.getSnapshot();
engine.n.coreSimulation.resources.spend("energy", 8);
assert.equal(engine.n.coreSimulation.resources.get("energy").value, 0);
engine.n.coreSimulation.loadSnapshot(snapshot);
assert.equal(engine.n.coreSimulation.resources.get("energy").value, 8, "simulation service snapshot restores");

console.log("core promoted services smoke ok");
