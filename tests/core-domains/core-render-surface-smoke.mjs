import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createRenderContractsDomain } from "../../src/core-domains/render/subdomains/contracts/index.js";
import { createRenderLifecycleDomain } from "../../src/core-domains/render/subdomains/lifecycle/index.js";
import { createRenderDeviceDomain } from "../../src/core-domains/render/subdomains/device/index.js";
import {
  createRenderSurfaceDomain,
  normalizeSurfaceDescriptor
} from "../../src/core-domains/render/subdomains/surface/index.js";

const engine = createEngine({
  kits: [
    ...createRenderContractsDomain(),
    ...createRenderLifecycleDomain(),
    ...createRenderDeviceDomain(),
    ...createRenderSurfaceDomain()
  ]
});

const expectedApis = [
  "renderSurfaces",
  "renderWindowSurfaces",
  "renderOffscreenSurfaces",
  "renderSwapchainSurfaces",
  "renderViewports",
  "renderScissors",
  "renderResizeIntents",
  "renderFullscreenIntents",
  "renderSurfaceFormats"
];
for (const apiName of expectedApis) {
  assert.ok(engine.n[apiName], `missing ${apiName}`);
}

const surface = normalizeSurfaceDescriptor("render-surface-kit", {
  id: "surface:main",
  kind: "window",
  width: 1280,
  height: 720,
  pixelRatio: 2,
  colorSpace: "srgb",
  visible: true
});
assert.doesNotThrow(() => structuredClone(surface));
assert.equal(JSON.stringify(surface).includes("HTMLCanvasElement"), false);
assert.equal(JSON.stringify(surface).includes("WebGL"), false);
assert.equal(JSON.stringify(surface).includes("GPUCanvasContext"), false);
assert.equal(JSON.stringify(surface).includes("THREE"), false);

assert.equal(
  normalizeSurfaceDescriptor("viewport-kit", {
    id: "viewport:main",
    surfaceId: "surface:main",
    units: "normalized",
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    minDepth: 0,
    maxDepth: 1
  }).surfaceId,
  "surface:main"
);
assert.throws(
  () => normalizeSurfaceDescriptor("render-surface-kit", {
    id: "surface:bad",
    kind: "window",
    width: 0,
    height: 720
  }),
  /positive safe integer|greater than zero/
);
assert.throws(
  () => normalizeSurfaceDescriptor("viewport-kit", {
    id: "viewport:bad",
    surfaceId: "surface:main",
    units: "normalized",
    x: 0.75,
    y: 0,
    width: 0.5,
    height: 1
  }),
  /within \[0, 1\]/
);
assert.throws(
  () => normalizeSurfaceDescriptor("scissor-kit", {
    id: "scissor:bad",
    surfaceId: "surface:main",
    units: "pixels",
    x: -1,
    y: 0,
    width: 100,
    height: 100
  }),
  /cannot be negative/
);

const surfaces = engine.n.renderSurfaces;
const created = surfaces.define({ operationId: "surface:define:main", descriptor: surface });
assert.equal(created.result.created, true);
assert.deepEqual(surfaces.define({ operationId: "surface:define:main", descriptor: surface }), created);

const windowRecord = engine.n.renderWindowSurfaces.define({
  operationId: "surface:window:main",
  descriptor: {
    id: "window:main",
    surfaceId: "surface:main",
    resizable: true,
    transparent: false
  }
});
assert.equal(windowRecord.result.created, true);

const viewport = engine.n.renderViewports.define({
  operationId: "surface:viewport:main",
  descriptor: {
    id: "viewport:main",
    surfaceId: "surface:main",
    units: "pixels",
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    minDepth: 0,
    maxDepth: 1
  }
});
assert.equal(viewport.result.created, true);

const scissor = engine.n.renderScissors.define({
  operationId: "surface:scissor:main",
  descriptor: {
    id: "scissor:main",
    surfaceId: "surface:main",
    units: "pixels",
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    enabled: true
  }
});
assert.equal(scissor.result.created, true);

const resize = engine.n.renderResizeIntents.define({
  operationId: "surface:resize:main",
  descriptor: {
    id: "resize:main",
    surfaceId: "surface:main",
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    reason: "user"
  }
});
assert.equal(resize.result.created, true);

const fullscreen = engine.n.renderFullscreenIntents.define({
  operationId: "surface:fullscreen:main",
  descriptor: {
    id: "fullscreen:main",
    surfaceId: "surface:main",
    action: "enter",
    mode: "borderless"
  }
});
assert.equal(fullscreen.result.created, true);

const offscreenSurface = surfaces.define({
  operationId: "surface:define:offscreen",
  descriptor: {
    id: "surface:offscreen",
    kind: "offscreen",
    width: 256,
    height: 256,
    pixelRatio: 1,
    colorSpace: "srgb",
    visible: false
  }
});
assert.equal(offscreenSurface.result.created, true);
const offscreen = engine.n.renderOffscreenSurfaces.define({
  operationId: "surface:offscreen:descriptor",
  descriptor: {
    id: "offscreen:main",
    surfaceId: "surface:offscreen",
    layers: 1,
    sampleCount: 1,
    usage: ["color-attachment", "sampled"]
  }
});
assert.equal(offscreen.result.created, true);

const format = engine.n.renderSurfaceFormats.define({
  operationId: "surface:format:main",
  descriptor: {
    id: "format:main",
    colorFormat: "rgba8unorm",
    depthStencilFormat: "depth24plus",
    colorSpace: "srgb",
    alphaMode: "opaque",
    sampleCount: 1,
    hdr: false
  }
});
assert.equal(format.result.created, true);

assert.doesNotThrow(() => engine.n.renderSwapchainSurfaces.normalize({
  id: "swapchain:main",
  surfaceId: "surface:main",
  deviceId: "device:future",
  formatId: "format:main",
  imageCount: 2,
  presentMode: "fifo",
  alphaMode: "opaque"
}));

const snapshot = surfaces.getSnapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
assert.throws(
  () => surfaces.remove({
    operationId: "surface:remove:still-referenced",
    id: "surface:main",
    expectedRevision: surfaces.getRecord("surface:main").revision
  }),
  /still referenced/
);

console.log("core render surface smoke ok");
