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
