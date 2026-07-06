import assert from "node:assert/strict";
import {
  createRealtimeGame,
  createCoreDataKit,
  createCorePersistenceKit,
  createCoreAssetsKit,
  createCorePlatformKit,
  createCoreInputKit,
  createCoreSpatialKit,
  createCoreSceneKit,
  createCorePhysicsKit,
  createCoreMotionKit,
  createCoreSimulationKit,
  createCoreInteractionKit,
  createCoreGraphicsKit,
  createCoreSkyboxKit,
  createCoreCameraKit,
  createCoreAnimationKit,
  createCoreAudioKit,
  createCoreUIKit,
  createCoreNetworkKit,
  createCoreDiagnosticsKit,
  createCorePolicyKit,
  createCoreCompositionKit,
  createCoreMLNNKit,
  createCoreAgentKit,
  createSeededRandom,
  createSnapshotEnvelope,
  createCompletionLedger,
  createProgressTimer
} from "../src/index.js";

const factories = [
  createCoreDataKit,
  createCorePersistenceKit,
  createCoreAssetsKit,
  createCorePlatformKit,
  createCoreInputKit,
  createCoreSpatialKit,
  createCoreSceneKit,
  createCorePhysicsKit,
  createCoreMotionKit,
  createCoreSimulationKit,
  createCoreInteractionKit,
  createCoreGraphicsKit,
  createCoreSkyboxKit,
  createCoreCameraKit,
  createCoreAnimationKit,
  createCoreAudioKit,
  createCoreUIKit,
  createCoreNetworkKit,
  createCoreDiagnosticsKit,
  createCorePolicyKit,
  createCoreCompositionKit,
  createCoreMLNNKit,
  createCoreAgentKit
];

for (const factory of factories) {
  assert.equal(typeof factory, "function", `${factory.name} is exported`);
}

const engine = createRealtimeGame({
  kits: factories.map((factory) => factory())
});

for (const namespace of [
  "coreData",
  "corePersistence",
  "coreAssets",
  "corePlatform",
  "coreInput",
  "coreSpatial",
  "coreScene",
  "corePhysics",
  "coreMotion",
  "coreSimulation",
  "coreInteraction",
  "coreGraphics",
  "coreSkybox",
  "coreCamera",
  "coreAnimation",
  "coreAudio",
  "coreUI",
  "coreNetwork",
  "coreDiagnostics",
  "corePolicy",
  "coreComposition",
  "coreMLNN",
  "coreAgent"
]) {
  assert.equal(typeof engine.n?.[namespace]?.getSnapshot, "function", `${namespace} installed under engine.n`);
}

engine.n.coreData.configure({ profile: "smoke" });
assert.equal(engine.n.coreData.getConfig().profile, "smoke", "core data config updates");
engine.n.coreGraphics.setDescriptor("objects", "cube", { kind: "box" });
assert.deepEqual(engine.n.coreGraphics.getDescriptors("objects").cube, { kind: "box" }, "core graphics descriptors update");
engine.n.coreSkybox.setPreset("golden-horizon");
assert.equal(engine.n.coreSkybox.getActivePreset().id, "golden-horizon", "core skybox preset updates");
const inference = engine.n.coreMLNN.infer({ modelId: "mock", input: { text: "hello" } });
assert.equal(inference.output.label, "mock", "core MLNN mock inference is deterministic");
const proposal = engine.n.coreAgent.proposeAction("agent", { action: "inspect", evidence: { inferenceId: inference.id } });
assert.equal(proposal.action, "inspect", "core agent proposal records action");

const rngA = createSeededRandom("seed");
const rngB = createSeededRandom("seed");
assert.equal(rngA.next(), rngB.next(), "seeded random repeats");
assert.equal(createSnapshotEnvelope({ id: "snap", state: { ok: true } }).state.ok, true, "snapshot envelope stores state");
assert.equal(createCompletionLedger().complete("once").accepted, true, "completion ledger accepts first completion");
assert.equal(createProgressTimer({ durationSeconds: 2 }).tick(1).progress, 0.5, "progress timer advances deterministically");

console.log("core capability domain barrel smoke ok");
