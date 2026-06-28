import assert from "node:assert/strict";
import { createRealtimeGame } from "../../src/index.js";
import {
  createCoreInputKit,
  createInputActionMap,
  createInputBindings,
  resolveInputBinding,
  createInputContext,
  selectActiveInputContext,
  normalizeInputIntent,
  getActiveInputActions
} from "../../src/core-kits/core-input-kit/index.js";

const actions = createInputActionMap(["jump", "confirm"]);
assert.equal(actions.jump.kind, "button", "action map normalizes actions");

const bindings = createInputBindings({ keyboard: { jump: "Space" } });
assert.equal(resolveInputBinding(bindings, "keyboard", "jump"), "Space", "binding resolves action");

const active = selectActiveInputContext([
  createInputContext({ id: "menu", priority: 1 }),
  createInputContext({ id: "game", priority: 5 })
]);
assert.equal(active.id, "game", "highest priority context is active");

const intent = normalizeInputIntent({ x: 2, actions: { jump: true } });
assert.equal(intent.x, 1, "intent axis clamps");
assert.deepEqual(getActiveInputActions(intent), ["jump"], "active actions are discoverable");

const engine = createRealtimeGame({ kits: [createCoreInputKit({ bindings })] });
assert.equal(typeof engine.n.coreInput.getSnapshot, "function", "core input installs under engine.n");

console.log("core-input-kit piece smoke ok");
