import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

function amountFor(timestep, timesteps) {
  return Math.max(0, Math.min(1, Number(timestep) / Math.max(1, Number(timesteps) - 1)));
}

export function createLinearNoiseScheduleKit(config = {}) {
  const timesteps = config.timesteps ?? 50;
  return {
    id: "linear-noise-schedule",
    kind: "linear-noise-schedule-kit",
    timesteps,
    amountFor(timestep) {
      return amountFor(timestep, timesteps);
    }
  };
}

export function createEducationalStepNoiseKit(config = {}) {
  const schedule = createLinearNoiseScheduleKit(config);
  return {
    getSteps(count = 5) {
      return Array.from({ length: count }, (_, index) => {
        const timestep = Math.round((index / Math.max(1, count - 1)) * (schedule.timesteps - 1));
        return { timestep, amount: schedule.amountFor(timestep) };
      });
    }
  };
}

export function createAddNoiseKit(config = {}) {
  const schedule = createLinearNoiseScheduleKit(config);
  return {
    addNoise(clean, noise, timestep) {
      const amount = schedule.amountFor(timestep);
      const data = new Float32Array(clean.data.length);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = clean.data[i] * (1 - amount) + noise.data[i] * amount;
      }
      return { ...clean, id: `noisy-${clean.id}`, data };
    },
    removePredictedNoise(noisy, predicted, timestep) {
      const amount = schedule.amountFor(timestep);
      const data = new Float32Array(noisy.data.length);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = noisy.data[i] - predicted.data[i] * Math.max(0.02, amount);
      }
      return { ...noisy, id: `denoised-${noisy.id}`, data };
    }
  };
}

export function createDiffusionNoiseDomain(config = {}) {
  let schedule = createLinearNoiseScheduleKit(config);
  let noiser = createAddNoiseKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-noise-domain-kit",
    domain: "diffusion-noise",
    apiName: config.apiName ?? "diffusionNoise",
    version: "0.0.1",
    stability: "experimental",
    services: ["schedule", "add-noise", "reverse-step"],
    metadata: {
      purpose: "Diffusion noise subdomain with linear and educational schedule descriptors."
    },
    createApi() {
      return {
        createSchedule(next = {}) {
          schedule = createLinearNoiseScheduleKit({ ...config, ...next });
          noiser = createAddNoiseKit({ ...config, ...next });
          return structuredClone({ id: schedule.id, kind: schedule.kind, timesteps: schedule.timesteps });
        },
        getEducationalSteps(count) {
          return createEducationalStepNoiseKit({ timesteps: schedule.timesteps }).getSteps(count);
        },
        amountFor(timestep) {
          return schedule.amountFor(timestep);
        },
        addNoise(clean, noise, timestep) {
          return noiser.addNoise(clean, noise, timestep);
        },
        removePredictedNoise(noisy, predicted, timestep) {
          return noiser.removePredictedNoise(noisy, predicted, timestep);
        }
      };
    }
  });
}
