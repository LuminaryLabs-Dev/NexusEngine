import assert from "node:assert/strict";
import {
  createCoreCaptureDomain,
  createCoreObjectFidelityDomain,
  createCoreObjectKit,
  createCoreTransactionLedgerKit,
  createHeadlessEditorHarness,
  createHeadlessEditorRouter,
  createRealtimeGame
} from "../../src/index.js";

const engine = createRealtimeGame({
  kits: [
    createCoreObjectKit(),
    createCoreTransactionLedgerKit(),
    ...createCoreCaptureDomain(),
    ...createCoreObjectFidelityDomain()
  ]
});
const capture = engine.n.coreCapture;
const fidelity = engine.n.objectFidelity;
assert.equal(engine.n.ownerOf("n:object:fidelity"), "core-object-fidelity-domain");
assert.equal(engine.objectFidelity, fidelity);

let captures = 0;
function provider() {
  return {
    id: "headless-object-views",
    async capture(request, { updateProgress }) {
      captures += 1;
      updateProgress(1, 1);
      return {
        observations: Object.fromEntries(request.observations.map((name) => [name, {
          assetId: `${request.id}:${name}`,
          kind: "fixture-observation"
        }]))
      };
    }
  };
}
capture.registerProvider(provider());

const profile = fidelity.registerProfile({
  id: "world-object",
  identity: {
    preserveSilhouette: true,
    preserveGrounding: true,
    preserveMajorStructure: true
  },
  forms: [
    {
      id: "full",
      fidelity: "full",
      builderId: "source-form",
      minimumProjectedSize: 48,
      requiredTraits: ["true-depth", "stable-silhouette"]
    },
    {
      id: "distant",
      fidelity: "distant",
      builderId: "captured-form",
      minimumProjectedSize: 0,
      requiredTraits: ["directional-silhouette"],
      capture: {
        viewSet: { pattern: "around-subject", azimuthCount: 8, elevations: [0, 20] },
        observations: ["color", "opacity", "normal"]
      }
    },
    {
      id: "absent",
      fidelity: "absent",
      builderId: "absent-form",
      required: false,
      minimumProjectedSize: 0
    }
  ],
  change: { mode: "blend", duration: 0.18, hysteresis: 0.12 }
});
assert.equal(profile.schema, "nexus-object-fidelity-profile/1");

function registerObject(id, type, revision) {
  return engine.n.coreObject.register({
    id,
    objectType: type,
    bounds: { min: [-2, 0, -2], max: [2, 8, 2] },
    pivot: [0, 4, 0],
    groundAnchor: [0, 0, 0],
    geometry: { provider: `${type}-source`, descriptorId: `${id}:geometry:${revision}` },
    material: { provider: `${type}-material`, descriptorId: `${id}:material:${revision}` },
    metadata: { revision }
  });
}

const tree = registerObject("oak", "procedural-tree", 1);
const treeBuild = await fidelity.requestBuild({ objectId: tree.id, profileId: profile.id });
assert.equal(treeBuild.state, "ready");
assert.equal(fidelity.getActivePackage(tree.id).readiness.complete, true);
assert.equal(captures, 1);
const duplicate = await fidelity.requestBuild({ objectId: tree.id, profileId: profile.id });
assert.equal(duplicate.id, treeBuild.id);
assert.equal(captures, 1, "duplicate fidelity build does not recapture");

const near = fidelity.adapt({ objectId: tree.id, projectedSize: 96, quality: "high" });
const far = fidelity.adapt({ objectId: tree.id, projectedSize: 2, quality: "high" });
assert.match(near.formId, /:full$/);
assert.match(far.formId, /:distant$/);

const rock = registerObject("rock", "procedural-rock", 1);
const rockBuild = await fidelity.requestBuild({ objectId: rock.id, profileId: profile.id });
assert.equal(rockBuild.state, "ready");
assert.equal(fidelity.getActivePackage(rock.id).readiness.complete, true);
assert.equal(Object.prototype.hasOwnProperty.call(fidelity.getSnapshot(), "tree"), false, "core state contains no tree-specific branch");

capture.unregisterProvider("headless-object-views");
const changedTree = registerObject("oak", "procedural-tree", 2);
const pending = await fidelity.requestBuild({ objectId: changedTree.id, profileId: profile.id });
assert.equal(pending.state, "awaiting-views");
assert.equal(fidelity.getActivePackage("oak").objectContentHash, tree.contentHash, "old package stays active");
assert.equal(fidelity.getPendingPackage("oak").readiness.visible, true, "new source form is minimum-ready");
assert.equal(fidelity.getPendingPackage("oak").readiness.complete, false);

capture.registerProvider(provider());
await capture.resumeWaiting();
const completed = await fidelity.resumeBuild(pending.id);
assert.equal(completed.state, "ready");
assert.equal(fidelity.getActivePackage("oak").objectContentHash, changedTree.contentHash);
assert.equal(fidelity.getActivePackage("oak").revision, 2);

capture.unregisterProvider("headless-object-views");
const staleSource = registerObject("oak", "procedural-tree", 3);
const staleBuild = await fidelity.requestBuild({ objectId: staleSource.id, profileId: profile.id });
assert.equal(staleBuild.state, "awaiting-views");
registerObject("oak", "procedural-tree", 4);
capture.registerProvider(provider());
await capture.resumeWaiting();
const staleResult = await fidelity.resumeBuild(staleBuild.id);
assert.equal(staleResult.state, "stale");
assert.equal(fidelity.getActivePackage("oak").objectContentHash, changedTree.contentHash, "stale work cannot replace active package");

structuredClone(capture.getSnapshot());
structuredClone(fidelity.getSnapshot());

const adapter = {
  id: "object-fidelity-headless-proof",
  async read() {
    return { ok: true, runtime: { capture: capture.getSnapshot(), fidelity: fidelity.getSnapshot() } };
  },
  async capture({ phase }) {
    return { ok: true, phase, captures: [{ id: `${phase}:state`, kind: "snapshot" }] };
  },
  async plan() {
    return {
      ok: true,
      commands: [{ action: "object-fidelity.inspect" }],
      notes: ["Verify generic forms, readiness, adaptation, and atomic replacement."]
    };
  },
  async validate() {
    const snapshot = fidelity.getSnapshot();
    const issues = [];
    try { structuredClone(snapshot); } catch (error) { issues.push({ severity: "error", code: "snapshot", message: error.message }); }
    if (!snapshot.activePackages.rock) issues.push({ severity: "error", code: "genericity", message: "Rock fixture package missing." });
    return { ok: issues.length === 0, issues };
  },
  async submit() {
    return { ok: true, submitted: true, runId: "object-fidelity-proof" };
  },
  async observe() {
    return { ok: true, status: "completed" };
  },
  async verify() {
    return {
      ok: true,
      checks: [
        { id: "tree-package", ok: Boolean(fidelity.getActivePackage("oak")) },
        { id: "rock-package", ok: Boolean(fidelity.getActivePackage("rock")) },
        { id: "capture-results", ok: Object.keys(capture.getSnapshot().results).length > 0 }
      ],
      readAfter: { capture: capture.getSnapshot(), fidelity: fidelity.getSnapshot() }
    };
  },
  async observedDifferences({ readBefore, readAfter }) {
    return {
      ok: true,
      structured: [{ key: "fidelity.sequence", before: readBefore.runtime.fidelity.sequence, after: readAfter.fidelity.sequence }],
      visual: [],
      validation: [{ id: "object-fidelity", ok: true }],
      regressions: [],
      unverifiedClaims: []
    };
  }
};

const harness = createHeadlessEditorHarness({
  workspace: "memory",
  adapter,
  goal: "Prove Core Object Fidelity and Capture installed composition.",
  sessionId: "object-fidelity-capture-smoke",
  now: () => "2026-07-14T12:00:00.000Z"
});
const router = createHeadlessEditorRouter({ harness, now: () => "2026-07-14T12:00:00.000Z" });
assert.equal((await router.dispatch("status")).ok, true);
assert.equal((await router.dispatch("next")).ok, true);
assert.equal((await router.dispatch("run read")).ok, true);
assert.equal((await router.dispatch("inspect read/packet.json")).result.ok, true);
const run = await router.dispatch("run-until observed-differences");
assert.equal(run.result.ok, true);
const differences = await router.dispatch("inspect observed-differences/difference.json");
assert.equal(JSON.parse(differences.result.text).regressions.length, 0);
assert.equal((await router.dispatch("report")).result.ok, true);

console.log("core object fidelity domain and Headless Editor smoke ok");
