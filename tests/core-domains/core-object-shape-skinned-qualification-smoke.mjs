import assert from "node:assert/strict";
import {
  createCoreObjectDomain,
  createHeadlessEditorHarness,
  createHeadlessEditorRouter,
  createRealtimeGame
} from "../../src/index.js";

function identityMatrix(tx = 0, ty = 0, tz = 0) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

function createSkinnedBoxGeometry({ invalidWeights = false } = {}) {
  const positions = [
    -0.5, 0, -0.5,
     0.5, 0, -0.5,
     0.5, 0,  0.5,
    -0.5, 0,  0.5,
    -0.5, 2, -0.5,
     0.5, 2, -0.5,
     0.5, 2,  0.5,
    -0.5, 2,  0.5
  ];
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    1, 5, 6, 1, 6, 2,
    2, 6, 7, 2, 7, 3,
    3, 7, 4, 3, 4, 0
  ];
  const skinIndex = [];
  const skinWeight = [];
  for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
    const bone = vertex < 4 ? 0 : vertex % 2 ? 1 : 2;
    skinIndex.push(bone, 0, 0, 0);
    skinWeight.push(vertex === 6 && invalidWeights ? -0.25 : 1, 0, 0, 0);
  }
  return {
    positions,
    indices,
    attributes: {
      skinIndex: { itemSize: 4, values: skinIndex },
      skinWeight: { itemSize: 4, values: skinWeight },
      normal: {
        itemSize: 3,
        values: Array.from({ length: positions.length }, (_, index) => index % 3 === 1 ? 1 : 0)
      },
      uv: {
        itemSize: 2,
        values: Array.from({ length: positions.length / 3 * 2 }, (_, index) => index % 2)
      }
    }
  };
}

function skinningMetadata() {
  return {
    protectedVertices: [0, 1, 2, 3],
    boneCount: 3,
    bindMatrices: [
      ...identityMatrix(),
      ...identityMatrix(),
      ...identityMatrix()
    ],
    validationPoses: [
      {
        id: "rest",
        boneMatrices: [
          ...identityMatrix(),
          ...identityMatrix(),
          ...identityMatrix()
        ]
      },
      {
        id: "wind-left",
        boneMatrices: [
          ...identityMatrix(),
          ...identityMatrix(0.1, 0, 0),
          ...identityMatrix(-0.1, 0, 0)
        ]
      },
      {
        id: "wind-right",
        boneMatrices: [
          ...identityMatrix(),
          ...identityMatrix(-0.1, 0, 0),
          ...identityMatrix(0.1, 0, 0)
        ]
      }
    ]
  };
}

function fallbackProvider() {
  return {
    id: "qualification-fallback-provider",
    version: "1.0.0",
    metadata: { deterministic: true, fixture: true },
    async derive(request, { updateProgress }) {
      updateProgress(0.5, 1, "candidate");
      const source = request.source.geometry;
      const geometry = request.target.ratio < 0.6
        ? {
            positions: source.positions,
            indices: [4, 6, 5, 4, 7, 6],
            attributes: source.attributes
          }
        : source;
      updateProgress(1, 1, "candidate-ready");
      return {
        geometry,
        preservation: request.profile.preserve,
        metadata: {
          algorithm: "qualification-fallback-fixture",
          skeletonReduced: false,
          attributeArraysPreserved: true
        }
      };
    }
  };
}

function registerTree(engine, id, revision, geometry = createSkinnedBoxGeometry()) {
  const object = engine.n.coreObject.register({
    id,
    objectType: "skinned-tree",
    bounds: { min: [-0.5, 0, -0.5], max: [0.5, 2, 0.5] },
    pivot: [0, 1, 0],
    groundAnchor: [0, 0, 0],
    geometry: { provider: "qualification-fixture", descriptorId: `${id}:source:${revision}` },
    material: { provider: "qualification-fixture", descriptorId: `${id}:material` },
    metadata: { revision }
  });
  const source = engine.n.objectShape.registerSource({
    id: `${id}:source:${revision}`,
    objectId: object.id,
    objectContentHash: object.contentHash,
    geometry,
    metadata: {
      skinning: skinningMetadata(),
      semanticPartitions: {
        trunkBase: [0, 1, 2, 3],
        crown: [4, 5, 6, 7]
      },
      vertexConstraints: {
        lockPosition: [0, 1, 2, 3],
        lockTopology: [0, 1, 2, 3],
        preserveWeights: [0, 1, 2, 3]
      }
    }
  });
  return { object, source };
}

const engine = createRealtimeGame({
  kits: createCoreObjectDomain({
    shapeProvider: fallbackProvider()
  })
});

const { object, source } = registerTree(engine, "qualified-tree", 1);
const job = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "skinned-organic-production",
  targetId: "reduced",
  providerId: "qualification-fallback-provider"
});

assert.equal(job.state, "ready");
assert.equal(job.fallbackUsed, true);
assert.equal(job.attemptedRatio, 0.7);
assert.equal(job.attempt, 2);

const qualifications = engine.n.objectShape.listQualifications(job.id);
assert.deepEqual(qualifications.map((value) => value.status), ["rejected", "rejected", "approved"]);
assert.equal(qualifications[0].structure.status, "failed");
assert.equal(qualifications[0].structure.missingProtectedVertices.length, 4);
assert.equal(qualifications[2].structure.status, "passed");
assert.equal(qualifications[2].deformation.status, "passed");
assert.equal(qualifications[2].silhouette.status, "passed");
assert.equal(qualifications[2].deformation.poseCount, 3);

const shape = engine.n.objectShape.getShape(job.resultShapeId);
assert.equal(shape.qualification.status, "approved");
assert.equal(shape.metadata.requestedRatio, 0.4);
assert.equal(shape.metadata.approvedRatio, 0.7);
assert.equal(shape.metadata.fallbackUsed, true);
assert.equal(shape.geometry.attributes.skinWeight.values.length, source.geometry.attributes.skinWeight.values.length);

const duplicate = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "skinned-organic-production",
  targetId: "reduced",
  providerId: "qualification-fallback-provider"
});
assert.equal(duplicate.id, job.id);
assert.equal(engine.n.objectShape.listQualifications(job.id).length, 3);

const fidelityProfile = engine.n.objectFidelity.registerProfile({
  id: "qualified-tree-fidelity",
  forms: [
    { id: "full", fidelity: "full", builderId: "source-form", minimumProjectedSize: 48 },
    {
      id: "reduced",
      fidelity: "reduced",
      builderId: "object-shape-form",
      minimumProjectedSize: 0,
      metadata: {
        shape: {
          sourceShapeId: source.id,
          profileId: "skinned-organic-production",
          targetId: "reduced",
          providerId: "qualification-fallback-provider"
        }
      }
    }
  ]
});
const fidelityBuild = await engine.n.objectFidelity.requestBuild({
  objectId: object.id,
  profileId: fidelityProfile.id
});
assert.equal(fidelityBuild.state, "ready");
const packageValue = engine.n.objectFidelity.getActivePackage(object.id);
const reducedForm = engine.n.objectFidelity.getForm(packageValue.forms.reduced);
assert.equal(reducedForm.layers[0].metadata.qualificationId, shape.qualification.id);
assert.equal(reducedForm.layers[0].metadata.fallbackUsed, true);

const invalid = registerTree(engine, "invalid-tree", 1, createSkinnedBoxGeometry({ invalidWeights: true }));
const invalidJob = await engine.n.objectShape.derive({
  sourceShapeId: invalid.source.id,
  profileId: "skinned-organic-production",
  targetId: "reduced",
  providerId: "qualification-fallback-provider"
});
assert.equal(invalidJob.state, "rejected");
assert.equal(invalidJob.resultShapeId, null);
const invalidQualification = engine.n.objectShape.getQualification(invalidJob.qualificationId);
assert.equal(invalidQualification.status, "rejected");
assert.ok(invalidQualification.failures.some((failure) => failure.check === "skin-weights"));

let releaseDeferred;
const deferred = new Promise((resolve) => { releaseDeferred = resolve; });
engine.n.objectShape.registerProvider({
  id: "deferred-shape-provider",
  version: "1.0.0",
  async derive(request) {
    await deferred;
    return {
      geometry: request.source.geometry,
      preservation: request.profile.preserve,
      metadata: { skeletonReduced: false, attributeArraysPreserved: true }
    };
  }
});
const stale = registerTree(engine, "stale-tree", 1);
const stalePromise = engine.n.objectShape.derive({
  sourceShapeId: stale.source.id,
  profileId: "skinned-organic-production",
  targetId: "reduced",
  providerId: "deferred-shape-provider"
});
await Promise.resolve();
engine.n.coreObject.register({
  id: "stale-tree",
  objectType: "skinned-tree",
  bounds: { min: [-0.5, 0, -0.5], max: [0.5, 2.2, 0.5] },
  pivot: [0, 1.1, 0],
  groundAnchor: [0, 0, 0],
  geometry: { provider: "qualification-fixture", descriptorId: "stale-tree:source:2" },
  material: { provider: "qualification-fixture", descriptorId: "stale-tree:material" },
  metadata: { revision: 2 }
});
releaseDeferred();
const staleJob = await stalePromise;
assert.equal(staleJob.state, "stale");
assert.equal(staleJob.resultShapeId, null);

structuredClone(engine.n.objectShape.getSnapshot());
const snapshot = engine.n.objectShape.getSnapshot();
engine.n.objectShape.reset();
engine.n.objectShape.loadSnapshot(snapshot);
assert.equal(engine.n.objectShape.getShape(shape.id).qualification.status, "approved");
assert.equal(engine.n.objectShape.getJob(invalidJob.id).state, "rejected");

const adapter = {
  id: "skinned-shape-qualification-proof",
  async read() {
    return { ok: true, snapshot: engine.n.objectShape.getSnapshot() };
  },
  async capture({ phase }) {
    return { ok: true, phase, captures: [{ id: `${phase}:qualification`, kind: "snapshot" }] };
  },
  async plan() {
    return {
      ok: true,
      commands: [{ action: "object-shape.qualify-skinned" }],
      notes: ["Prove approved, rejected, fallback, stale, snapshot, and Fidelity-gated paths."]
    };
  },
  async validate() {
    const current = engine.n.objectShape.getSnapshot();
    const issues = [];
    if (!current.shapes[shape.id]?.qualification) issues.push({ severity: "error", code: "missing-qualification" });
    if (current.jobs[invalidJob.id]?.state !== "rejected") issues.push({ severity: "error", code: "missing-rejection" });
    return { ok: issues.length === 0, issues };
  },
  async submit() {
    return { ok: true, submitted: true };
  },
  async observe() {
    return { ok: true, status: "completed" };
  },
  async verify() {
    const current = engine.n.objectShape.getSnapshot();
    return {
      ok: true,
      checks: [
        { id: "approved-shape", ok: current.shapes[shape.id]?.qualification?.status === "approved" },
        { id: "fallback-used", ok: current.jobs[job.id]?.fallbackUsed === true },
        { id: "invalid-rejected", ok: current.jobs[invalidJob.id]?.state === "rejected" },
        { id: "stale-blocked", ok: current.jobs[staleJob.id]?.state === "stale" }
      ],
      readAfter: current
    };
  },
  async observedDifferences() {
    return {
      ok: true,
      structured: [{ key: "shape.qualification", before: "candidate", after: "approved-or-rejected" }],
      visual: [],
      validation: [{ id: "skinned-shape-qualification", ok: true }],
      regressions: [],
      unverifiedClaims: []
    };
  }
};

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter,
  goal: "Prove safe skinned Object Shape qualification and fallback.",
  sessionId: "skinned-shape-qualification",
  now: () => "2026-07-18T12:00:00.000Z"
});
const router = createHeadlessEditorRouter({
  harness,
  now: () => "2026-07-18T12:00:00.000Z"
});
assert.equal((await router.dispatch("status")).ok, true);
assert.equal((await router.dispatch("next")).ok, true);
const run = await router.dispatch("run-until observed-differences");
assert.equal(run.result.ok, true);
const differences = await router.dispatch("inspect observed-differences/difference.json");
assert.equal(JSON.parse(differences.result.text).regressions.length, 0);
assert.equal((await router.dispatch("report")).result.ok, true);

console.log("core object shape skinned qualification smoke ok", {
  requestedRatio: shape.metadata.requestedRatio,
  approvedRatio: shape.metadata.approvedRatio,
  qualificationAttempts: qualifications.length,
  poseCount: shape.qualification.deformation.poseCount,
  silhouetteViews: shape.qualification.silhouette.views
});
