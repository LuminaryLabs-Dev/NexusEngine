import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import { createDiffusionSeededRandom } from "../../utils/seeded-random.js";

export function createMSELossKit() {
  return {
    compute(tensor, target) {
      return tensor.mse ? tensor.mse(target) : null;
    }
  };
}

export function createSGDOptimizerKit(config = {}) {
  return {
    learningRate: config.learningRate ?? 0.01,
    describe() {
      return { id: "sgd", kind: "sgd-optimizer-kit", learningRate: this.learningRate };
    }
  };
}

export function createTrainingMetricsKit() {
  return {
    summarize({ epochs, steps, losses }) {
      const latestLoss = losses.at(-1) ?? null;
      const meanLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : null;
      return { epochs, steps, latestLoss, meanLoss, losses };
    }
  };
}

export function createEpochRunnerKit() {
  return {
    train({ state, dataset, tensor, noise, model, options = {} }) {
      const epochs = options.epochs ?? 1;
      const batchSize = options.batchSize ?? 4;
      const learningRate = options.learningRate ?? 0.01;
      const random = createDiffusionSeededRandom(options.seed ?? 1);
      const losses = [];
      let steps = Number(state.metrics?.steps ?? 0);
      for (let epoch = 0; epoch < epochs; epoch += 1) {
        const batch = dataset.getBatch({ batchSize, seed: options.seed ?? 1 });
        for (const sample of batch) {
          const clean = tensor.normalizePixels(sample.pixels, [1, sample.height, sample.width, sample.channels]);
          const sampledNoise = tensor.randomNormal(clean.shape, Math.floor(random() * 100000) + steps + 1);
          const timestep = Math.floor(random() * Math.max(1, state.timesteps));
          const noisy = noise.addNoise(clean, sampledNoise, timestep);
          const result = model.trainStep({
            clean,
            noisy,
            noise: sampledNoise,
            timestep,
            timesteps: state.timesteps,
            learningRate
          });
          losses.push(result.loss);
          steps += 1;
        }
      }
      const metrics = createTrainingMetricsKit().summarize({
        epochs: Number(state.metrics?.epochs ?? 0) + epochs,
        steps,
        losses
      });
      return { metrics, optimizer: createSGDOptimizerKit({ learningRate }).describe() };
    }
  };
}

export function createDiffusionTrainingDomain(config = {}) {
  const runner = createEpochRunnerKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-training-domain-kit",
    domain: "diffusion-training",
    apiName: config.apiName ?? "diffusionTraining",
    version: "0.0.1",
    stability: "experimental",
    services: ["epoch-runner", "mse-loss", "sgd-optimizer", "metrics"],
    metadata: {
      purpose: "Diffusion training subdomain for deterministic tiny CPU training loops."
    },
    createApi() {
      return {
        train(input = {}) {
          return runner.train(input);
        }
      };
    }
  });
}
