import assert from "node:assert/strict";

import { createEngine } from "../../../engine.js";
import { createSimulationKit } from "../../simulation/kits/simulation-kit/index.js";
import { createMotionKit } from "../../simulation/subdomains/motion/kits/motion-kit/index.js";
import { createActorRegistryKit } from "../../actor/kits/actor-registry-kit/index.js";
import { createCreatureKit } from "../../actor/subdomains/creature/kits/creature-kit/index.js";
import { createCharacterKit } from "../../actor/subdomains/character/kits/character-kit/index.js";
import { createPresentationKit } from "../kits/presentation-kit/index.js";
import { createCameraKit } from "../subdomains/camera/kits/camera-kit/index.js";
import { createThirdPersonCameraKit } from "../subdomains/camera/subdomains/third-person/kits/third-person-camera-kit/index.js";

function createCameraEngine(withMotionBinding = true) {
  const engine = createEngine({ kits: [
    createSimulationKit(), createMotionKit(),
    createActorRegistryKit(), createCreatureKit(), createCharacterKit(),
    createPresentationKit(), createCameraKit()
  ] });
  engine.n.creature.register({ id: "human", body: { provider: "fixture", descriptorId: "human-body" }, rig: { provider: "fixture", descriptorId: "human-rig" } });
  engine.n.character.create({ id: "hero", creatureId: "human", bindings: withMotionBinding ? { motionActorId: "hero-motion" } : {} });
  return engine;
}

const engine = createCameraEngine();
engine.n.motion.commitMotionFrame({ tickId: "frame:1", results: [{ actorId: "hero-motion", position: { x: 2, y: 3, z: 4 } }] });
engine.installKit(createThirdPersonCameraKit({ characterId: "hero" }));
const described = engine.n.thirdPersonCamera.describe({ operationId: "camera:1", delta: 1 / 60 });
assert.equal(described.result.descriptor.characterId, "hero");
assert.equal(described.result.descriptor.metadata.occlusionResolved, false);
const state = engine.n.thirdPersonCamera.getSnapshot();
assert.deepEqual(engine.n.thirdPersonCamera.describe({ operationId: "camera:1", delta: 1 / 60 }), described);
assert.deepEqual(engine.n.thirdPersonCamera.getSnapshot(), state);

const invalid = createCameraEngine(false);
assert.throws(() => invalid.installKit(createThirdPersonCameraKit({ characterId: "hero" })), /motionActorId binding/);
assert.throws(() => createCameraEngine().installKit(createThirdPersonCameraKit()), /cannot resolve character character/);

console.log("third-person camera restoration: ok");
