import assert from "node:assert/strict";
import {
  COMPOSITION_REGISTRY_SCHEMA,
  createEngineRegistrySnapshot,
  createEngine,
  mergeRegistrySnapshots,
  normalizeCompositionTree,
  normalizeRegistrySnapshot,
  planCompositionTree,
  validateCompositionTree
} from "../helpers/public-package-surface.mjs";
import { createDataKit } from "../../src/core-domains/runtime/subdomains/data/kits/data-kit/index.js";
import { createCompositionKit } from "../../src/core-domains/composition/index.js";
import { createSimulationKit } from "../../src/core-domains/simulation/kits/simulation-kit/index.js";

const engine = createEngine({
  tick: { maxDelta: 1 },
  kits: [
    createDataKit({
      random: { seed: "promotion-smoke", streams: ["world"] },
      completion: { ledgers: { objectives: [] } }
    }),
    createCompositionKit(),
    createSimulationKit({
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

const random = engine.n.data.random;
const randomSnapshot = random.getSnapshot();
const first = random.nextUint32("world");
random.loadSnapshot(randomSnapshot);
assert.equal(random.nextUint32("world"), first, "named random streams replay exactly");

const completion = engine.n.data.completion;
assert.equal(completion.complete("repair-relay", { data: { route: "fogline" } }, "objectives").accepted, true);
assert.equal(completion.complete("repair-relay", {}, "objectives").duplicate, true);
assert.deepEqual(completion.list("objectives"), ["repair-relay"]);

const digestA = engine.n.data.digest.digest({ b: 2, a: 1 });
const digestB = engine.n.data.digest.digest({ a: 1, b: 2 });
assert.equal(digestA.digest, digestB.digest, "state digest ignores object key order");
assert.equal(engine.n.seedStream, undefined, "retired random aliases are not installed");
assert.equal(engine.seedStream, undefined, "retired root random aliases are not installed");
assert.equal(engine.n.completionLedger, undefined, "retired completion aliases are not installed");

const registry = engine.n.composition.registry;
registry.registerDomain({
  id: "experience-domain",
  domainPath: "n:composition:experience",
  parentDomainPath: "n:composition",
  label: "Experience",
  responsibility: "Own the test composition meaning.",
  ownedMeaning: ["test composition"],
  forbiddenResponsibilities: ["runtime implementation"]
});
registry.registerKit({ id: "provider-kit", status: "official", domainPath: "n:composition:experience", parentDomainPath: "n:composition", provides: ["capability:provider"] });
registry.registerKit({ id: "consumer-kit", status: "candidate", domainPath: "n:composition:experience", parentDomainPath: "n:composition", requires: ["capability:provider"], provides: ["capability:consumer"] });
registry.registerRecipe({ id: "experience-stack", kits: ["consumer-kit"] });

const graph = engine.n.composition.capabilities.build();
assert.equal(graph.valid, true, "capability graph resolves dependencies");
assert.ok(graph.order.indexOf("provider-kit") < graph.order.indexOf("consumer-kit"), "provider orders before consumer");

const plan = engine.n.composition.planning.plan({ recipes: ["experience-stack"] });
assert.equal(plan.ok, true, "composition plan is valid");
assert.deepEqual(plan.selected, ["consumer-kit", "provider-kit"]);
assert.equal(engine.n.composition.health.getSnapshot().healthy, true);
assert.equal(engine.n.kitRegistry, undefined, "retired Composition aliases are not installed");

const coreRegistry = createEngineRegistrySnapshot();
assert.equal(coreRegistry.schema, COMPOSITION_REGISTRY_SCHEMA);
assert.ok(coreRegistry.kits.every((kit) => kit.source.exportName), "core catalog resolves trusted exports by name");
assert.ok(coreRegistry.domains.every((domain) => !("children" in domain)), "domain children are derived rather than stored");

const demoImport = {
  schema: COMPOSITION_REGISTRY_SCHEMA,
  registryId: "demo-registry",
  revision: 1,
  sources: [{
    registryId: "demo-registry",
    package: "demo-registry",
    version: "1.0.0",
    sourceCommit: "1111111111111111111111111111111111111111",
    integrity: `sha256:${"a".repeat(64)}`,
    status: "available",
    environments: ["node"],
    permissions: []
  }],
  domains: [{
    id: "demo-domain",
    domainPath: "n:demo",
    parentDomainPath: null,
    label: "Demo",
    responsibility: "Own demo composition meaning.",
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
      source: { registryId: "demo-registry", subpath: "./domains/demo/provider", exportName: "demoProviderFactory", environments: ["node"], permissions: [], installable: true }
    },
    {
      id: "demo-consumer-kit",
      domain: "demo",
      domainPath: "n:demo",
      requires: ["demo:clock"],
      provides: ["demo:consumer"],
      settingsSchema: {
        type: "object",
        required: ["mode"],
        additionalProperties: false,
        properties: { mode: { type: "string", enum: ["arcade", "simulation"] } }
      },
      source: { registryId: "demo-registry", subpath: "./domains/demo/consumer", exportName: "demoConsumerFactory", environments: ["node"], permissions: [], installable: true }
    }
  ],
  recipes: []
};
const mergedRegistry = mergeRegistrySnapshots(coreRegistry, demoImport);
assert.equal(mergedRegistry.sources.find((source) => source.registryId === "demo-registry").sourceCommit, "1111111111111111111111111111111111111111");
assert.equal(typeof mergedRegistry.kits.find((kit) => kit.id === "demo-provider-kit").source.factory, "undefined", "registry metadata does not carry executable code");
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, sources: [{ ...demoImport.sources[0], version: "" }] }), /version requires/);
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, sources: [{ ...demoImport.sources[0], integrity: "bad hash" }] }), /requires sha256/);
assert.throws(() => normalizeRegistrySnapshot({ ...demoImport, recipes: [{ id: "broken-recipe", domains: ["missing-domain"] }] }), /unknown domain/);
assert.throws(
  () => mergeRegistrySnapshots(coreRegistry, { ...demoImport, kits: [{ ...demoImport.kits[0], id: coreRegistry.kits[0].id }] }),
  /cannot replace .* record/
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
assert.ok(scopedPlan.order.every((entry) => entry.source && typeof entry.source.factory === "undefined"), "plans contain immutable code references, not executable functions");

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

assert.throws(
  () => normalizeRegistrySnapshot({ schema: "nexusengine.core-composition.registry/1" }),
  /Unsupported Composition registry snapshot/,
  "legacy registry schemas are rejected instead of forwarded"
);

const registrySnapshot = registry.getSnapshot();
registry.registerKit({ id: "temporary-kit", domainPath: "n:composition:experience", parentDomainPath: "n:composition", provides: ["temporary:service"] });
assert.ok(registry.getKit("temporary-kit"));
registry.loadSnapshot(registrySnapshot);
assert.equal(registry.getKit("temporary-kit"), null, "registry snapshot restores without retaining later mutations");

const windows = engine.n.simulation.windows;
assert.equal(windows.action("parry", { actorId: "player" }).quality, "perfect");
assert.equal(windows.action("parry", { actorId: "player" }).reason, "cooldown");
assert.equal(engine.n.genericActionWindow, undefined, "retired action-window aliases are not installed");

engine.tick(1);

assert.equal(engine.n.simulation.resources.get("energy").value, 8, "resource rates advance on engine ticks");
assert.equal(engine.n.simulation.pressure.get("heat").value, 3, "pressure rates advance on engine ticks");
assert.equal(engine.n.simulation.pressure.get("heat").status, "warning");
assert.equal(engine.n.resourceMeter, undefined, "retired resource aliases are not installed");

const snapshot = engine.n.simulation.getSnapshot();
engine.n.simulation.resources.spend("energy", 8);
assert.equal(engine.n.simulation.resources.get("energy").value, 0);
engine.n.simulation.loadSnapshot(snapshot);
assert.equal(engine.n.simulation.resources.get("energy").value, 8, "simulation service snapshot restores");

console.log("core promoted services smoke ok");
