import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

export function createSeededNoiseKit() {
  return {
    create(tensor, shape, seed) {
      return tensor.randomNormal(shape, seed);
    }
  };
}

export function createReverseStepKit() {
  return {
    step({ current, predicted, timestep, noise }) {
      return noise.removePredictedNoise(current, predicted, timestep);
    }
  };
}

export function createSampleFrameKit() {
  return {
    capture({ tensor, frame, timestep, current }) {
      return {
        frame,
        timestep,
        pixels: Array.from(tensor.toPixels(current))
      };
    }
  };
}

export function createDDPMSamplerKit() {
  const seededNoise = createSeededNoiseKit();
  const reverse = createReverseStepKit();
  const frameKit = createSampleFrameKit();
  return {
    sample({ state, tensor, noise, model, options = {} }) {
      const steps = options.steps ?? Math.min(8, state.timesteps ?? 8);
      const imageSize = state.imageSize ?? 32;
      const channels = state.channels ?? 1;
      const shape = [1, imageSize, imageSize, channels];
      let current = seededNoise.create(tensor, shape, options.seed ?? 1);
      const frames = [];
      for (let frame = 0; frame < steps; frame += 1) {
        const ratio = 1 - frame / Math.max(1, steps - 1);
        const timestep = Math.round(ratio * Math.max(1, (state.timesteps ?? steps) - 1));
        const predicted = model.predictNoise({ noisy: current, timestep, timesteps: state.timesteps });
        current = reverse.step({ current, predicted, timestep, noise });
        frames.push(frameKit.capture({ tensor, frame, timestep, current }));
      }
      return {
        seed: options.seed ?? 1,
        steps,
        frames,
        finalTensor: current,
        finalPixels: Array.from(tensor.toPixels(current))
      };
    }
  };
}

export function createDiffusionSamplingDomain(config = {}) {
  const sampler = createDDPMSamplerKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-sampling-domain-kit",
    domain: "diffusion-sampling",
    apiName: config.apiName ?? "diffusionSampling",
    version: "0.0.1",
    stability: "experimental",
    services: ["ddpm-sampler", "seeded-noise", "reverse-step", "sample-frame"],
    metadata: {
      purpose: "Diffusion sampling subdomain with deterministic DDPM-like preview frames."
    },
    createApi() {
      return {
        sample(input = {}) {
          return sampler.sample(input);
        }
      };
    }
  });
}
