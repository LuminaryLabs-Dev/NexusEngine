import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createActorDomain } from "../../src/core-domains/actor/index.js";

const engine = createEngine({ kits: createActorDomain() });
assert.equal(engine.creature, undefined);
assert.equal(engine.character, undefined);
assert.equal(engine.player, undefined);

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
const creature = engine.n.creature.register(creatureInput);
assert.equal(engine.n.creature.register(creatureInput).id, creature.id, "same creature registration is idempotent");
assert.throws(() => engine.n.creature.register({ ...creatureInput, archetype: "bird" }), /replace/);

assert.throws(() => engine.n.character.create({ id: "bad", creatureId: "missing" }), /Unknown creature/);
const characterInput = {
  id: "player-character",
  creatureId: creature.id,
  profileId: "player-1",
  bindings: { poseId: "pose-1", motionActorId: "dino", physicsBodyId: "dino" },
  status: "active"
};
const character = engine.n.character.create(characterInput);
assert.equal(engine.n.character.create(characterInput).id, character.id, "same character creation is idempotent");

assert.throws(() => engine.n.player.register({ id: "bad-player", characterId: "missing" }), /Unknown character/);
const playerInput = { id: "player-1", characterId: character.id, controlStatus: "enabled", controlGeneration: 1, spawnGeneration: 1 };
const player = engine.n.player.register(playerInput);
assert.equal(engine.n.player.register(playerInput).id, player.id, "same player registration is idempotent");

const controlled = engine.n.player.getControlledCharacter(player.id);
assert.equal(controlled.character.id, character.id);
assert.equal(controlled.creature.id, creature.id);
assert.throws(() => engine.n.creature.remove(creature.id), /referenced/);
assert.throws(() => engine.n.character.remove(character.id), /possessed/);

const updatedCharacter = engine.n.character.setPose(character.id, "pose-2");
assert.equal(updatedCharacter.bindings.poseId, "pose-2");
const nextSpawn = engine.n.player.advanceSpawn(player.id);
assert.equal(nextSpawn.spawnGeneration, 2);
assert.equal(engine.n.player.disableControl(player.id).controlStatus, "disabled");
assert.equal(engine.n.player.enableControl(player.id).controlStatus, "enabled");

const snapshots = {
  creature: engine.n.creature.getSnapshot(),
  character: engine.n.character.getSnapshot(),
  player: engine.n.player.getSnapshot()
};
assert.doesNotThrow(() => structuredClone(snapshots));
engine.n.player.reset();
engine.n.character.reset();
engine.n.creature.reset();
assert.equal(engine.n.creature.list().length, 0);
assert.equal(engine.n.character.list().length, 0);
assert.equal(engine.n.player.list().length, 0);
engine.n.creature.loadSnapshot(snapshots.creature);
engine.n.character.loadSnapshot(snapshots.character);
engine.n.player.loadSnapshot(snapshots.player);
assert.equal(engine.n.player.getControlledCharacter(player.id).creature.id, creature.id);

console.log("core creature character player smoke ok");
