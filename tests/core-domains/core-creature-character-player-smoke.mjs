import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreCreatureDomain } from "../../src/core-domains/core-creature-domain/index.js";
import { createCoreCharacterDomain } from "../../src/core-domains/core-character-domain/index.js";
import { createCorePlayerDomain } from "../../src/core-domains/core-player-domain/index.js";

const engine = createEngine({
  kits: [
    ...createCoreCreatureDomain(),
    ...createCoreCharacterDomain(),
    ...createCorePlayerDomain()
  ]
});

const creatureInput = {
  id: "raptor",
  archetype: "theropod",
  body: { provider: "procedural-creature-body", descriptorId: "raptor-body" },
  rig: { provider: "articulated-motion", descriptorId: "raptor-rig" },
  collision: { shape: "capsule", radius: 0.32 },
  support: { kind: "feet", boneIds: ["foot-R", "foot-L"] },
  presentation: { focusBoneId: "chest", framingPadding: 1.18, fovRange: [36, 48] },
  capabilities: ["terrain-ik", "locomotion"]
};
const creature = engine.coreCreature.register(creatureInput);
assert.equal(engine.coreCreature.register(creatureInput).id, creature.id, "same creature registration is idempotent");
assert.throws(() => engine.coreCreature.register({ ...creatureInput, archetype: "bird" }), /replace/);

assert.throws(() => engine.coreCharacter.create({ id: "bad", creatureId: "missing" }), /Unknown creature/);
const characterInput = {
  id: "player-character",
  creatureId: creature.id,
  profileId: "player-1",
  bindings: { poseId: "pose-1", motionActorId: "dino", physicsBodyId: "dino" },
  status: "active"
};
const character = engine.coreCharacter.create(characterInput);
assert.equal(engine.coreCharacter.create(characterInput).id, character.id, "same character creation is idempotent");

assert.throws(() => engine.corePlayer.register({ id: "bad-player", characterId: "missing" }), /Unknown character/);
const playerInput = { id: "player-1", characterId: character.id, controlStatus: "enabled", controlGeneration: 1, spawnGeneration: 1 };
const player = engine.corePlayer.register(playerInput);
assert.equal(engine.corePlayer.register(playerInput).id, player.id, "same player registration is idempotent");

const controlled = engine.corePlayer.getControlledCharacter(player.id);
assert.equal(controlled.character.id, character.id);
assert.equal(controlled.creature.id, creature.id);
assert.throws(() => engine.coreCreature.remove(creature.id), /referenced/);
assert.throws(() => engine.coreCharacter.remove(character.id), /possessed/);

const updatedCharacter = engine.coreCharacter.setPose(character.id, "pose-2");
assert.equal(updatedCharacter.bindings.poseId, "pose-2");
const nextSpawn = engine.corePlayer.advanceSpawn(player.id);
assert.equal(nextSpawn.spawnGeneration, 2);
assert.equal(engine.corePlayer.disableControl(player.id).controlStatus, "disabled");
assert.equal(engine.corePlayer.enableControl(player.id).controlStatus, "enabled");

const snapshots = {
  creature: engine.coreCreature.getSnapshot(),
  character: engine.coreCharacter.getSnapshot(),
  player: engine.corePlayer.getSnapshot()
};
assert.doesNotThrow(() => structuredClone(snapshots));
engine.corePlayer.reset();
engine.coreCharacter.reset();
engine.coreCreature.reset();
assert.equal(engine.coreCreature.list().length, 0);
assert.equal(engine.coreCharacter.list().length, 0);
assert.equal(engine.corePlayer.list().length, 0);
engine.coreCreature.loadSnapshot(snapshots.creature);
engine.coreCharacter.loadSnapshot(snapshots.character);
engine.corePlayer.loadSnapshot(snapshots.player);
assert.equal(engine.corePlayer.getControlledCharacter(player.id).creature.id, creature.id);

console.log("core creature character player smoke ok");
