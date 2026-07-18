import assert from "node:assert/strict";
import {
  createCoreComputeDomain,
  createCoreHeadlessEditorKit,
  createCoreObjectDomain,
  createEngine,
  createHeadlessEditorHarness,
  createNaturalTreeGrowthPlan,
  createTreeGrowthComputeDescriptors,
  validateTreeGrowthPlan
} from "../../src/index.js";

for (const factory of [createNaturalTreeGrowthPlan, validateTreeGrowthPlan, createTreeGrowthComputeDescriptors]) {
  assert.equal(typeof factory, "function", `${factory.name} is publicly exported`);
}

const shapes = [
  "giant-fern",
  "spire",
  "cycad",
  "umbrella",
  "column",
  "layered-araucaria",
  "fan-cycad",
  "ginkgo",
  "horsetail",
  "forked-ghostwood",
  "tall-palm",
  "short-palm"
];

const engine = createEngine({
  kits: [
    ...createCoreObjectDomain({ shape: false, fidelity: false }),
    ...createCoreComputeDomain(),
    createCoreHeadlessEditorKit()
  ]
});
const treeApi = engine.n.vegetationTree;
const foliageApi = engine.n.vegetationFoliage;
const compute = engine.n.coreCompute;
const records = [];

compute.setProvider({
  id: "natural-tree-reference-compute",
  async executeGraph(request) {
    const plan = createNaturalTreeGrowthPlan(request.input.tree, {
      foliage: request.input.foliage,
      seed: request.input.seed,
      quality: request.input.quality
    });
    return {
      outputs: {
        growthPlan: plan,
        branchBuffer: plan.woodSegments.flatMap((entry) => [
          ...entry.start,
          entry.radiusStart,
          ...entry.end,
          entry.radiusEnd,
          entry.order,
          entry.lightExposure
        ]),
        foliageBuffer: plan.foliageClusters.flatMap((entry) => [
          ...entry.position,
          ...entry.scale,
          entry.lightExposure,
          entry.shade,
          entry.windScale,
          entry.seed
        ])
      },
      metadata: {
        algorithm: plan.algorithm.kind,
        clusterCount: plan.metrics.clusterCount,
        estimatedCardCount: plan.metrics.estimatedCardCount
      }
    };
  }
});

for (const [index, shape] of shapes.entries()) {
  const speciesId = `fixture-${shape}`;
  const family = foliageApi.createCardFamily({
    id: `${speciesId}:primary`,
    kind: /palm/.test(shape) ? "palm-frond" : /fern|cycad/.test(shape) ? "fern-frond" : /spire|araucaria/.test(shape) ? "needle-cluster" : "broadleaf-cluster",
    atlas: { assetId: "fixture-atlas", frameId: shape },
    size: { minimum: [0.4, 0.4], maximum: [6, 4] },
    alphaCutoff: 0.4,
    wind: { amplitude: 0.1, frequency: 0.7, stiffness: 0.7 }
  });
  const vine = foliageApi.createCardFamily({
    id: `${speciesId}:vine`,
    kind: "vine-spray",
    atlas: { assetId: "fixture-atlas", frameId: "vine" },
    size: { minimum: [0.4, 1], maximum: [2, 7] },
    alphaCutoff: 0.38,
    wind: { amplitude: 0.18, frequency: 0.56, stiffness: 0.42 }
  });
  const foliage = foliageApi.register({
    id: `${speciesId}:foliage`,
    speciesId,
    kind: family.kind,
    card: { familyId: family.id, alphaCutoff: 0.4, crossedPlanes: 2 },
    cardFamilies: [family, vine],
    clusters: [],
    wind: family.wind,
    fidelity: {
      near: { mode: "cards", density: 1 },
      medium: { mode: "cards", density: 0.48 },
      far: { mode: "captured-impostor" },
      horizon: { mode: "captured-impostor" }
    }
  });
  const radial = /palm|fern|cycad/.test(shape);
  const tree = treeApi.register({
    id: `${speciesId}:tree`,
    speciesId,
    shape,
    averageHeight: 18 + index * 2,
    averageWidth: 8 + index * 0.8,
    trunk: { radius: 0.7 + index * 0.04, taper: 0.68, radialSegments: 10, heightSegments: 4 },
    branches: { primaryCount: radial ? 0 : 4 + index % 3, secondaryCount: radial ? 0 : 8, levels: radial ? 0 : 3 },
    canopy: {
      height: 6 + index * 0.4,
      radius: 4 + index * 0.4,
      foliageIds: [foliage.id],
      clusterCount: 18 + index,
      layerCount: 3 + index % 4,
      edgeIrregularity: 0.42,
      hangingFoliage: shape === "umbrella" ? 0.14 : 0.02
    },
    foliage: { ids: [foliage.id], nearDensity: 1, mediumDensity: 0.48, windScale: 1 }
  });

  const near = treeApi.createGrowthPlan(tree, { foliage, seed: `headless:${shape}`, quality: "near" });
  const repeated = treeApi.createGrowthPlan(tree, { foliage, seed: `headless:${shape}`, quality: "near" });
  const medium = treeApi.createGrowthPlan(tree, { foliage, seed: `headless:${shape}`, quality: "medium" });
  assert.deepEqual(near, repeated, `${shape} growth is deterministic`);
  const validation = treeApi.validateGrowthPlan(near, { minimumClusters: radial ? 8 : 12 });
  assert.equal(validation.valid, true, `${shape}: ${validation.errors.join("; ")}`);
  assert.ok(near.woodSegments.every((segment) => segment.radiusEnd <= segment.radiusStart), `${shape} branches taper`);
  assert.ok(near.foliageClusters.every((cluster) => cluster.lightExposure >= 0 && cluster.lightExposure <= 1), `${shape} cards carry shading exposure`);
  assert.ok(medium.metrics.estimatedCardCount <= near.metrics.estimatedCardCount, `${shape} medium foliage is reduced`);

  const descriptors = treeApi.createGrowthComputeDescriptors(tree, {
    id: `${speciesId}:compute`,
    maximumSegments: 256,
    maximumClusters: 128
  });
  for (const buffer of descriptors.buffers) compute.registerBuffer(buffer);
  for (const kernel of descriptors.kernels) compute.registerKernel(kernel);
  compute.registerGraph(descriptors.graph);
  assert.deepEqual(compute.getExecutionPlan(descriptors.graph.id).executionOrder, ["grow-skeleton", "place-foliage", "shade-foliage"]);
  const computeResult = await compute.executeGraph(descriptors.graph.id, {
    tree,
    foliage,
    seed: `headless:${shape}`,
    quality: "near"
  });
  assert.equal(computeResult.status, "completed");
  assert.equal(computeResult.outputs.growthPlan.schema, "nexus-tree-growth-plan/1");
  assert.ok(computeResult.outputs.branchBuffer.length > 0);
  assert.ok(computeResult.outputs.foliageBuffer.length > 0);

  records.push({ shape, tree, foliage, near, medium, validation, computeResult });
}

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  goal: "Generate, review, and validate every production vegetation growth form",
  sessionId: "natural-vegetation-growth",
  now: () => "2026-07-18T12:00:00.000Z",
  adapter: {
    id: "natural-vegetation-headless-adapter",
    async read() {
      return {
        ok: true,
        scene: { id: "natural-vegetation-fixtures", objectCount: records.length },
        hierarchy: { roots: records.map((record) => record.tree.id) },
        assets: records.flatMap((record) => record.foliage.cardFamilies.map((family) => family.atlas.assetId)),
        runtime: { computeProvider: compute.getState().provider.id }
      };
    },
    async capture({ phase }) {
      return {
        ok: true,
        phase,
        captures: records.map((record) => ({ id: `${phase}:${record.shape}`, metrics: record.near.metrics })),
        files: {
          [`capture-${phase}/vegetation-metrics.json`]: JSON.stringify(records.map((record) => ({ shape: record.shape, metrics: record.near.metrics })), null, 2)
        }
      };
    },
    async plan() {
      return {
        ok: true,
        commands: records.map((record) => ({ action: "vegetation.grow", treeId: record.tree.id, algorithm: record.near.algorithm.kind }))
      };
    },
    async validate() {
      const issues = records.flatMap((record) => record.validation.errors.map((message) => ({ treeId: record.tree.id, message })));
      return { ok: issues.length === 0, issues };
    },
    async submit({ plan }) {
      return { ok: true, submitted: true, runId: "natural-growth-run", commandCount: plan.commands.length };
    },
    async observe() {
      return { ok: true, status: "completed", runId: "natural-growth-run", logs: records.map((record) => `${record.shape}:${record.near.metrics.clusterCount}`) };
    },
    async verify() {
      return {
        ok: true,
        checks: records.map((record) => ({
          id: record.shape,
          ok: record.validation.valid && record.near.metrics.crownCoverage >= 0.28 && record.near.metrics.estimatedCardCount >= 8
        })),
        readAfter: { scene: { id: "natural-vegetation-fixtures", validated: records.length } }
      };
    }
  }
});

const headlessResult = await harness.run();
assert.equal(headlessResult.ok, true);
assert.equal((await harness.workspace.readJson("plan/commands.json")).length, shapes.length);
assert.equal((await harness.workspace.readJson("verify/verification.json")).checks.every((check) => check.ok), true);
assert.equal(await harness.workspace.exists("capture-after/vegetation-metrics.json"), true);

console.log("core object vegetation natural growth, compute, and headless heuristic smoke passed");
