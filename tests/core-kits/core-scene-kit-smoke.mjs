import assert from "node:assert/strict";
import { createEngine, createSpatialKit, createWorldDomain } from "../helpers/public-package-surface.mjs";
import {
  createSceneKit,
  createSceneHostBinding,
  createSceneRegistry,
  mountAcceptedSceneTransition
} from "../../src/core-domains/world/scene/kits/scene-kit/index.js";

const scenes = {
  camp: {
    title: "Camp",
    kind: "web-html-scene",
    entry: "./camp.html",
    exits: {
      road: { to: "crossroads", label: "Take the road" }
    }
  },
  crossroads: {
    title: "Crossroads",
    kind: "web-html-scene",
    entry: "./crossroads.html",
    exits: {
      forest: { to: "forest", requires: ["has-lantern"] },
      bridge: { to: "bridge" }
    }
  },
  forest: {
    title: "Forest",
    kind: "native-rust-scene",
    entry: "scenes/forest.scene.json",
    exits: {
      shrine: { to: "shrine" }
    }
  },
  bridge: {
    title: "Bridge",
    kind: "headless-scene",
    exits: {
      shrine: { to: "shrine" }
    }
  },
  shrine: {
    title: "Shrine",
    kind: "native-command-scene",
    entry: "scenes/shrine.commands.json"
  }
};

const registry = createSceneRegistry(scenes);
assert.equal(registry.camp.hostBinding, "web-html", "web HTML scenes infer a web host binding");
assert.equal(registry.forest.hostBinding, "rust-native", "native Rust scenes infer a native host binding");

function createSceneEngine() {
  return createEngine({ kits: [
    createSpatialKit(),
    createWorldDomain({ childDomains: false }),
    createSceneKit({ scenes, initialSceneId: "camp" })
  ] });
}

const engine = createSceneEngine();
assert.equal(engine.n.scene.getCurrentScene().id, "camp", "initial scene is active");
assert.deepEqual(engine.n.scene.getVisitedScenes(), ["camp"], "initial scene is visited");

const toCrossroads = engine.n.scene.requestTransition({
  transitionId: "camp-road-001",
  exitId: "road",
  payload: { spawnPoint: "south" }
});
assert.equal(toCrossroads.accepted, true, "manifest exit transition is accepted");
assert.equal(toCrossroads.transition.toSceneId, "crossroads", "transition targets the exit scene");
assert.equal(toCrossroads.transition.scene.entry, "./crossroads.html", "transition carries host entry descriptor");
assert.equal(engine.n.scene.getCurrentScene().id, "crossroads", "accepted transition changes current scene");

const duplicate = engine.n.scene.requestTransition({
  transitionId: "camp-road-001",
  exitId: "road"
});
assert.equal(duplicate.duplicate, true, "duplicate transition id is idempotent");
assert.equal(engine.n.scene.getTransitionLedger().length, 1, "duplicate transition does not add ledger rows");

const blocked = engine.n.scene.requestTransition({
  transitionId: "crossroads-forest-blocked-001",
  exitId: "forest"
});
assert.equal(blocked.accepted, false, "missing requirement rejects transition");
assert.equal(blocked.transition.reason, "missing-requirements", "rejection reports missing requirement reason");
assert.deepEqual(blocked.transition.missingRequirements, ["has-lantern"], "rejection reports missing tokens");
assert.equal(engine.n.scene.getCurrentScene().id, "crossroads", "rejected transition does not change current scene");

engine.n.scene.grantToken("has-lantern");
const toForest = engine.n.scene.requestTransition({
  transitionId: "crossroads-forest-accepted-001",
  exitId: "forest",
  payload: { spawnPoint: "forest-south" }
});
assert.equal(toForest.accepted, true, "granted token unblocks transition");
assert.equal(toForest.transition.scene.hostBinding, "rust-native", "accepted transition remains host agnostic");

const nativeHost = createSceneHostBinding({ id: "test-native", kinds: ["native-rust-scene", "native-command-scene"] });
const nativeMount = mountAcceptedSceneTransition(engine, nativeHost, toForest);
assert.equal(nativeMount.mountResult.sceneId, "forest", "native host binding mounts accepted transition");
assert.equal(engine.n.scene.getMountedSceneLedger().length, 1, "mount is recorded in scene ledger");

const toShrine = engine.n.scene.requestTransition({
  transitionId: "forest-shrine-001",
  exitId: "shrine"
});
const headlessHost = createSceneHostBinding({ id: "test-headless" });
const headlessMount = mountAcceptedSceneTransition(engine, headlessHost, toShrine);
assert.equal(headlessMount.mountResult.mounted, true, "headless host mounts transition without renderer");

const descriptor = engine.n.scene.getSceneHostDescriptor();
assert.equal(descriptor.currentScene.id, "shrine", "host descriptor exposes current scene");
assert.deepEqual(descriptor.visitedSceneIds, ["camp", "crossroads", "forest", "shrine"], "visited ledger preserves route");

const snapshot = engine.n.scene.getSnapshot();
const restored = createSceneEngine();
restored.n.scene.loadSceneSnapshot(snapshot);
assert.equal(restored.n.scene.getCurrentScene().id, "shrine", "scene snapshot restores current scene");
assert.equal(restored.n.scene.getTransitionLedger().length, 3, "scene snapshot restores transition ledger");

console.log("core-scene-kit smoke ok");
