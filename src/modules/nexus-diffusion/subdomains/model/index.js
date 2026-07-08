import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

function clone(value) {
  return structuredClone(value);
}

export function createTimestepEmbeddingKit() {
  return {
    embed(timestep, timesteps = 50) {
      return Number(timestep) / Math.max(1, Number(timesteps) - 1);
    }
  };
}

export function createModelWeightKit(config = {}) {
  return {
    bias: config.bias ?? 0,
    noiseScale: config.noiseScale ?? 0.35,
    timestepScale: config.timestepScale ?? 0.05,
    contrastScale: config.contrastScale ?? 0.1
  };
}

export function createModelDescriptorKit(config = {}) {
  return {
    id: config.id ?? "tiny-denoiser-v0",
    kind: "diffusion-model-descriptor-kit",
    modelKind: config.kind ?? "tiny-denoiser",
    imageSize: config.imageSize ?? 32,
    channels: config.channels ?? 1,
    trainable: true,
    capabilities: ["predict-noise", "train-step", "snapshot"]
  };
}

export function createTinyDenoiserKit(config = {}) {
  const weights = createModelWeightKit(config.weights ?? config);
  const descriptor = createModelDescriptorKit(config);
  const timestepEmbedding = createTimestepEmbeddingKit();
  const predict = ({ noisy, timestep, timesteps }) => {
    const t = timestepEmbedding.embed(timestep, timesteps);
    const data = new Float32Array(noisy.data.length);
    for (let i = 0; i < data.length; i += 1) {
      const centered = noisy.data[i] - 0.5;
      data[i] = weights.bias + noisy.data[i] * weights.noiseScale + centered * weights.contrastScale + t * weights.timestepScale;
    }
    return { ...noisy, id: `predicted-noise-${noisy.id}`, data };
  };
  return {
    descriptor,
    weights,
    predict,
    trainStep({ noisy, noise, timestep, timesteps = 50, learningRate = 0.01 }) {
      const prediction = predict({ noisy, timestep, timesteps });
      const t = timestepEmbedding.embed(timestep, timesteps);
      let loss = 0;
      let gradBias = 0;
      let gradNoiseScale = 0;
      let gradTimestepScale = 0;
      let gradContrastScale = 0;
      const n = Math.max(1, prediction.data.length);
      for (let i = 0; i < prediction.data.length; i += 1) {
        const target = noise.data[i];
        const delta = prediction.data[i] - target;
        const centered = noisy.data[i] - 0.5;
        loss += delta * delta;
        const grad = (2 * delta) / n;
        gradBias += grad;
        gradNoiseScale += grad * noisy.data[i];
        gradTimestepScale += grad * t;
        gradContrastScale += grad * centered;
      }
      weights.bias -= learningRate * gradBias;
      weights.noiseScale -= learningRate * gradNoiseScale;
      weights.timestepScale -= learningRate * gradTimestepScale;
      weights.contrastScale -= learningRate * gradContrastScale;
      return { loss: loss / n, prediction, weights: clone(weights) };
    },
    snapshot() {
      return { descriptor: clone(descriptor), weights: clone(weights) };
    },
    loadSnapshot(snapshot = {}) {
      Object.assign(weights, clone(snapshot.weights ?? snapshot));
      return this.snapshot();
    }
  };
}

export function createDiffusionModelDomain(config = {}) {
  let model = createTinyDenoiserKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-model-domain-kit",
    domain: "diffusion-model",
    apiName: config.apiName ?? "diffusionModel",
    version: "0.0.1",
    stability: "experimental",
    services: ["model", "weights", "timestep-embedding", "descriptor"],
    metadata: {
      purpose: "Diffusion model subdomain with a deterministic tiny trainable denoiser."
    },
    createApi() {
      return {
        createModel(next = {}) {
          model = createTinyDenoiserKit({ ...config, ...next });
          return { descriptor: clone(model.descriptor) };
        },
        predictNoise(input = {}) {
          return model.predict(input);
        },
        trainStep(input = {}) {
          return model.trainStep(input);
        },
        snapshot() {
          return model.snapshot();
        },
        loadSnapshot(snapshot = {}) {
          return model.loadSnapshot(snapshot);
        }
      };
    }
  });
}
