import assert from "node:assert/strict";
import { createEngine } from "nexusengine";

const engine = createEngine({ kits: [] });
const frame = engine.clock.frame;
engine.tick(1 / 60);
assert.equal(engine.clock.frame, frame + 1);

console.log("guide basic engine example ok");
