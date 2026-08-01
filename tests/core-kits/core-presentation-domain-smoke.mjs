import assert from "node:assert/strict";
import {
  createPresentationDomain,
  createPresentationDescriptor,
  createEngine
} from "../helpers/public-package-surface.mjs";

const engine = createEngine({
  kits: createPresentationDomain({
    output: { referenceAspect: 16 / 9, frameMode: "contain", maximumPixelRatio: 2 },
    ui: { referenceWidth: 1920, referenceHeight: 1080, mode: "match-shortest-side" },
    framing: { padding: 1.18, smoothTime: 0.18 }
  })
});

assert.equal(engine.n.ownerOf("n:presentation"), "presentation-registry-kit");
assert.equal(engine.n.ownerOf("n:presentation:output"), "presentation-output-kit");
assert.ok(engine.n.ownersOf("n:presentation:ui").includes("ui-scale-kit"));
assert.ok(engine.n.ownersOf("n:presentation:camera").includes("camera-framing-kit"));

const output = engine.n.presentationOutput;
const descriptor = output.setSurface({ cssWidth: 1000, cssHeight: 1000, pixelRatio: 3 });
assert.equal(descriptor.frame.viewport.width, 1000);
assert.ok(Math.abs(descriptor.frame.viewport.height - 562.5) < 1e-8);
assert.ok(descriptor.frame.bars.top > 0);
assert.equal(descriptor.render.pixelRatio, 2);

for (const frameMode of ["native", "contain", "cover", "width", "height", "stretch", "safe-contain"]) {
  const next = createPresentationDescriptor(
    { cssWidth: 853, cssHeight: 480, pixelRatio: 1.5, safeInsets: { top: 8, right: 12, bottom: 10, left: 14 } },
    { referenceAspect: 16 / 9, frameMode }
  );
  assert.ok(next.frame.visibleViewport.width >= 0);
  assert.ok(next.frame.visibleViewport.height >= 0);
  assert.ok(Number.isInteger(next.render.pixelWidth));
  assert.ok(Number.isInteger(next.render.pixelHeight));
  assert.ok(Object.values(next.frame.bars).every((value) => value >= 0));
}

const uiDescriptor = engine.n.uiScale.setViewport(descriptor);
assert.ok(uiDescriptor.scale > 0);
assert.equal(uiDescriptor.viewportWidth, descriptor.frame.viewport.width);

const framing = engine.n.cameraFraming.create({ id: "preview", padding: 1.15, smoothTime: 0.2 });
const first = framing.update({
  subjectBounds: { minimum: [-3, 0, -1], maximum: [3, 2, 1] },
  viewport: { width: 1280, height: 720 },
  camera: { projection: "perspective", verticalFov: 42, preferredDirection: [0.72, 0.32, 1] },
  deltaTime: 1 / 60
});
assert.equal(first.projection, "perspective");
assert.ok(first.distance > 0);
const second = framing.update({
  subjectBounds: { minimum: [-4, 0, -1], maximum: [4, 2.5, 1] },
  viewport: { width: 720, height: 1280 },
  camera: { projection: "perspective", verticalFov: 42 },
  deltaTime: 1 / 60
});
assert.equal(second.status, "damping");

console.log("core presentation domain smoke ok");
