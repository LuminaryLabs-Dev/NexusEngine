import assert from "node:assert/strict";
import {
  createCoreRegistrySnapshot,
  createRealtimeGame,
  mergeRegistrySnapshots,
  normalizeCompositionTree,
  normalizeRegistrySnapshot,
  planCompositionTree,
  validateCompositionTree
} from "../../src/index.js";
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

const coreRegistry = createCoreRegistrySnapshot();
assert.equal(coreRegistry.schema, "nexusengine.core-composition.registry/2");
assert.ok(coreRegistry.kits.every((kit) => kit.source.exportName), "core catalog resolves trusted exports by name");
assert.ok(coreRegistry.domains.every((domain) => !("children" in domain)), "domain children are derived rather than stored");

const demoImport = {
  schema: "nexusengine.core-composition.registry/2",
  registryId: "demo-registry",
  revision: 1,
  sources: [{ registryId: "demo-registry", package: "demo-registry", version: "1.0.0", contentHash: "sha256-demo", trusted: true }],
  domains: [{
    id: "demo-domain",
    domainPath: "n:demo",
    parentDomainPath: null,
    label: "Demo",
    ownedMeaning: ["demo rules"],
    forbiddenResponsibilities: ["renderer implementation"],
    sourceRegistryId: "demo-registry"
  }],
  kits: [
    {
      id: "demo-provider-kit",
      domain: "demo",
      domainPath: "n:demo",
      provides: ["demo:clock"],
      source: { registryId: "demo-registry", exportName: "untrustedFactory", trusted: true }
    },
    {
      id: "demo-consumer-kit",
      domain: "demo",
      domainPath: "n:demo",
      requires: ["demo:clock"],
      settingsSchema: {
        type: "object",
        required: ["mode"],
        additionalProperties: false,
        properties: { mode: { type: "string", enum: ["arcade", "simulation"] } }
      },
      source: { registryId: "demo-registry", exportName: "alsoUntrusted", trusted: true }
    }
  ],
  bundles: []
};
const mergedRegistry = mergeRegistrySnapshots(coreRegistry, demoImport);
assert.equal(mergedRegistry.sources.find((source) => source.registryId === "demo-registry").trusted, false, "imported JSON cannot authorize executable code");
assert.equal(mergedRegistry.kits.find((kit) => kit.id === "demo-provider-kit").source.trusted, false);
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, sources: [{ ...demoImport.sources[0], version: "" }] }), /valid version/);
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, sources: [{ ...demoImport.sources[0], contentHash: "bad hash" }] }), /valid contentHash/);
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, bundles: [{ id: "broken-bundle", domains: ["missing-domain"] }] }), /unknown domain/);
assert.throws(
  () => mergeRegistrySnapshots(coreRegistry, { ...demoImport, kits: [{ ...demoImport.kits[0], id: coreRegistry.kits[0].id }] }),
  /cannot replace core record/
);

const demoTree = normalizeCompositionTree({
  id: "demo-composition",
  registryHash: mergedRegistry.contentHash,
  rootNodeId: "demo-root",
  nodes: [
    { id: "demo-root", kind: "domain", registryId: "demo-domain", parentNodeId: null, order: 0, config: {} },
    { id: "consumer", kind: "kit", registryId: "demo-consumer-kit", parentNodeId: "demo-root", order: 0, config: { mode: "arcade" } },
    { id: "provider", kind: "kit", registryId: "demo-provider-kit", parentNodeId: "demo-root", order: 99, config: {} }
  ]
});
const demoValidation = validateCompositionTree(demoTree, mergedRegistry);
assert.equal(demoValidation.ok, true, JSON.stringify(demoValidation.errors));
assert.deepEqual(demoValidation.installOrderNodeIds, ["provider", "consumer"], "dependency order ignores visual order");
const scopedPlan = planCompositionTree(demoTree, mergedRegistry, { scopeNodeId: "consumer" });
assert.equal(scopedPlan.ok, true);
assert.deepEqual(scopedPlan.order.map((entry) => entry.nodeId), ["provider", "consumer"], "kit scope includes transitive dependencies");
assert.ok(scopedPlan.order.every((entry) => entry.trustedProvider === false), "imported registry exports remain non-executable");

const invalidTree = {
  ...demoTree,
  nodes: [
    ...demoTree.nodes.map((node) => node.id === "consumer" ? { ...node, config: {} } : node),
    { id: "provider-copy", kind: "kit", registryId: "demo-provider-kit", parentNodeId: "consumer", order: 0, config: {} }
  ]
};
const invalidReport = validateCompositionTree(invalidTree, mergedRegistry);
assert.equal(invalidReport.ok, false);
assert.ok(invalidReport.errors.some((entry) => entry.code === "invalid-node-config"));
assert.ok(invalidReport.errors.some((entry) => entry.code === "kit-has-children"));
assert.ok(invalidReport.errors.some((entry) => entry.code === "duplicate-kit-placement"));

const migratedV1 = normalizeRegistrySnapshot({
  schema: "nexusengine.core-composition.registry/1",
  revision: 4,
  domains: [{ id: "legacy", domainPath: "n:legacy", kits: ["legacy-kit"] }],
  kits: [{ id: "legacy-kit", domain: "legacy", domainPath: "n:legacy" }],
  bundles: []
});
assert.equal(migratedV1.schema, "nexusengine.core-composition.registry/2");
assert.equal(migratedV1.revision, 4);

const registrySnapshot = registry.getSnapshot();
registry.registerKit({ id: "temporary-kit", domain: "temporary", provides: ["temporary:service"] });
assert.ok(registry.getKit("temporary-kit"));
registry.loadSnapshot(registrySnapshot);
assert.equal(registry.getKit("temporary-kit"), null, "registry snapshot restores without retaining later mutations");

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
