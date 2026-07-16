import assert from "node:assert/strict";
import { createThreeObjectCaptureProvider } from "../../src/renderers/three/three-object-capture-provider.js";

const provider = createThreeObjectCaptureProvider({
  THREE: {},
  renderer: {
    setRenderTarget() {},
    render() {},
    readRenderTargetPixels() {}
  },
  resolveSubject() {}
});
assert.equal(provider.id, "three-object-capture");
assert.equal(typeof provider.capture, "function");
assert.equal(provider.metadata.renderer, "three");
console.log("three object capture provider smoke passed");
