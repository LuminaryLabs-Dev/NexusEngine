import assert from "node:assert/strict";
import { createEngine } from "../helpers/public-package-surface.mjs";
import {
  createInteractionKit,
  createInteractionTarget,
  createAffordanceState,
  createActivationProgress,
  createInteractionPrompt,
  createInteractionResult
} from "../../src/core-domains/interaction/kits/interaction-kit/index.js";

assert.equal(createInteractionTarget({ id: "door", action: "open" }).action, "open", "target stores action");
assert.equal(createAffordanceState({ locked: true }).locked, true, "affordance stores locked state");
assert.equal(createActivationProgress({ progress: 2, target: 2 }).complete, true, "activation marks complete");
assert.equal(createInteractionPrompt({ label: "Open" }).label, "Open", "prompt stores label");
assert.equal(createInteractionResult({ accepted: false }).accepted, false, "result stores accepted state");

const engine = createEngine({ kits: [createInteractionKit()] });
engine.n.interaction.setDescriptor("targets", "door", createInteractionTarget({ id: "door" }));
assert.equal(engine.n.interaction.getDescriptors("targets").door.id, "door", "core interaction descriptor update works");

console.log("core-interaction-kit piece smoke ok");

{
  const interaction = engine.n.interaction;
  const send = (frame, patch = {}) => interaction.stepInteractor({ id: 'pointer', frame, tracked: true, targetId: 'door', pressed: false, ...patch });
  assert.deepEqual(send(0).events.map(e => e.type), ['hover-enter']);
  assert.deepEqual(send(1, { pressed: true }).events.map(e => e.type), ['select']);
  const held = interaction.getSnapshot();
  assert.equal(send(1, { pressed: true }).duplicate, true);
  assert.throws(() => send(0), /Stale/);
  assert.deepEqual(send(2).events.map(e => e.type), ['release', 'activate']);
  interaction.loadSnapshot(held);
  assert.deepEqual(send(2, { tracked: false, pressed: true }).events.map(e => e.type), ['hover-exit', 'cancel']);
  assert.equal(send(3, { pressed: true }).state.heldTargetId, null, 'tracking recovery requires a release before selecting');
  send(4);
  assert.deepEqual(send(5, { pressed: true }).events.map(e => e.type), ['select']);
  assert.deepEqual(send(6, { targetId: 'other' }).events.map(e => e.type), ['hover-exit', 'hover-enter', 'release']);
  assert.throws(() => send(7, { pressed: 'true' }), /booleans/);
  interaction.reset();
  assert.equal(interaction.getState().interactors, undefined);
  assert.deepEqual(send(0, { intent: 'grab', pressed: true }).events.map(e => e.type), ['hover-enter', 'grab']);
  assert.deepEqual(send(1, { intent: 'grab' }).events.map(e => e.type), ['release']);
  const replay = interaction.getSnapshot();
  interaction.reset(); send(0, { intent: 'grab', pressed: true }); send(1, { intent: 'grab' });
  assert.deepEqual(interaction.getSnapshot(), replay);
}
