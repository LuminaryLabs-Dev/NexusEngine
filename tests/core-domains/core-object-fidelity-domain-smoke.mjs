import assert from "node:assert/strict";
import {
  createCaptureKit,
  createObjectFidelityKit,
  createObjectRegistryKit,
  createPresentationKit,
  createTransactionLedgerKit,
  createEngine
} from "../helpers/public-package-surface.mjs";

const engine = createEngine({
  kits: [
    createObjectRegistryKit(),
    createTransactionLedgerKit(),
    createPresentationKit(),
    createCaptureKit(),
    createObjectFidelityKit()
  ]
});
const capture = engine.n.capture;
const fidelity = engine.n.objectFidelity;
assert.ok(engine.n.ownersOf("n:object:fidelity").includes("object-fidelity-kit"));
assert.equal(engine.objectFidelity, undefined, "retired root Object Fidelity alias is not installed");

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
  return engine.n.object.register({
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
assert.ok(fidelity.getActivePackage("oak"), "tree fixture retains an active package");
assert.ok(fidelity.getActivePackage("rock"), "non-tree fixture proves generic ownership");
assert.ok(Object.keys(capture.getSnapshot().results).length > 0, "capture contract retains provider results");

console.log("core object fidelity and capture contract smoke ok");
