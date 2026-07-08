import assert from "node:assert/strict";
import {
  createRealtimeGame,
  createNexusDiffusionKits
} from "../../src/index.js";

const engine = createRealtimeGame({
  kits: createNexusDiffusionKits({
    imageSize: 16,
    channels: 1,
    timesteps: 8
  })
});

const prepared = engine.n.diffusion.prepare();
assert.equal(prepared.prepared, true, "diffusion prepares");
assert.equal(prepared.backend, "cpu", "cpu backend selected for v0");
assert.equal(prepared.datasetDescriptor.sampleCount > 0, true, "dataset descriptor created");
assert.equal(prepared.modelDescriptor.trainable, true, "model descriptor created");

const trained = engine.n.diffusion.train({
  epochs: 1,
  batchSize: 4,
  learningRate: 0.02,
  seed: 1
});

assert.equal(Number.isFinite(trained.metrics.latestLoss), true, "training returns finite loss");
assert.equal(trained.metrics.steps, 4, "training records batch steps");

const sample = engine.n.diffusion.sample({
  seed: 2,
  steps: 4
});

assert.equal(sample.frames.length, 4, "sampling returns preview frames");
assert.equal(sample.finalPixels.length, 16 * 16, "sampling returns final pixels");

const checkpoint = engine.n.diffusion.saveCheckpoint("smoke");
assert.equal(checkpoint.descriptor.id, "smoke", "checkpoint saved");

const restored = engine.n.diffusion.loadCheckpoint("smoke");
assert.equal(restored.descriptor.id, "smoke", "checkpoint restored");

const preview = engine.n.diffusion.getPreviewState();
assert.equal(preview.backend.selected, "cpu", "preview reports backend");
assert.equal(preview.datasetSamples.length > 0, true, "preview includes dataset samples");
assert.equal(preview.denoiseFrames.length, 4, "preview includes denoise frames");

console.log("nexus-diffusion-domain smoke ok");
