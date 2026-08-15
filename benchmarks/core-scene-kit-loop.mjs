import { performance } from "node:perf_hooks";
import assert from "node:assert/strict";
import { createRealtimeGame } from "../src/index.js";
import { createSceneKit } from "../src/core-domains/world/scene/kits/scene-kit/index.js";

const sceneCount = 60;
const transitionCount = 300;
const scenes = {};
for (let index = 0; index < sceneCount; index += 1) {
  const id = `scene-${index}`;
  scenes[id] = {
    id,
    kind: index % 2 === 0 ? "headless-scene" : "web-html-scene",
    entry: `./${id}`,
    exits: { next: { to: `scene-${(index + 1) % sceneCount}` } }
  };
}

const engine = createRealtimeGame({
  kits: [createSceneKit({ scenes, initialSceneId: "scene-0", transitionHistoryLimit: 128 })]
});

const start = performance.now();
for (let index = 0; index < transitionCount; index += 1) {
  const result = engine.n.scene.requestTransition({
    transitionId: `transition-${index}`,
    exitId: "next"
  });
  assert.equal(result.accepted, true);
}
const durationMs = performance.now() - start;
const snapshot = engine.n.scene.getSnapshot();
assert.equal(snapshot.visitedSceneIds.length, sceneCount);

console.log(JSON.stringify({
  benchmark: "core-scene-kit-loop",
  sceneCount,
  transitionCount,
  durationMs: Number(durationMs.toFixed(3)),
  transitionsPerSecond: Number((transitionCount / (durationMs / 1000)).toFixed(2))
}, null, 2));
