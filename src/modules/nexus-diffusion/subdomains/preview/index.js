import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

function summarizePixels(sample) {
  const pixels = Array.from(sample.pixels ?? []);
  return {
    id: sample.id,
    label: sample.label,
    width: sample.width,
    height: sample.height,
    channels: sample.channels,
    pixels
  };
}

export function createDatasetPreviewKit() {
  return {
    create(dataset, count = 6) {
      return dataset.getSamples(count).map(summarizePixels);
    }
  };
}

export function createNoisePreviewKit() {
  return {
    create(state = {}) {
      const timesteps = state.timesteps ?? 1;
      return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const timestep = Math.round(ratio * Math.max(1, timesteps - 1));
        return { timestep, amount: ratio };
      });
    }
  };
}

export function createDenoisePreviewKit() {
  return {
    create(sample = {}) {
      return sample.frames ?? [];
    }
  };
}

export function createLossChartKit() {
  return {
    create(metrics = {}) {
      return {
        epochs: metrics.epochs ?? 0,
        steps: metrics.steps ?? 0,
        latestLoss: metrics.latestLoss ?? null,
        meanLoss: metrics.meanLoss ?? null,
        losses: metrics.losses ?? []
      };
    }
  };
}

export function createBackendStatusKit() {
  return {
    create(state = {}) {
      return {
        selected: state.backend ?? "cpu",
        webgpu: "descriptor-only",
        execution: state.backend === "webgpu" ? "webgpu-requested" : "cpu"
      };
    }
  };
}

export function createDiffusionPreviewDomain(config = {}) {
  const datasetPreview = createDatasetPreviewKit(config);
  const noisePreview = createNoisePreviewKit(config);
  const denoisePreview = createDenoisePreviewKit(config);
  const lossChart = createLossChartKit(config);
  const backendStatus = createBackendStatusKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-preview-domain-kit",
    domain: "diffusion-preview",
    apiName: config.apiName ?? "diffusionPreview",
    version: "0.0.1",
    stability: "experimental",
    services: ["dataset-preview", "noise-preview", "denoise-preview", "loss-chart", "backend-status"],
    metadata: {
      purpose: "Diffusion preview subdomain that emits render-agnostic teaching descriptors."
    },
    createApi() {
      return {
        createPreviewState({ state = {}, dataset, sample } = {}) {
          return {
            backend: backendStatus.create(state),
            metrics: lossChart.create(state.metrics),
            datasetSamples: dataset ? datasetPreview.create(dataset) : [],
            noiseSteps: noisePreview.create(state),
            denoiseFrames: denoisePreview.create(sample),
            finalImage: sample?.finalPixels ? { pixels: sample.finalPixels, width: state.imageSize, height: state.imageSize, channels: state.channels } : null
          };
        }
      };
    }
  });
}
