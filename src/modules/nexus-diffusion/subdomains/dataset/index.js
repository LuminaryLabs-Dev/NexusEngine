import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import { createDiffusionSeededRandom, clamp01 } from "../../utils/seeded-random.js";

function clone(value) {
  return structuredClone(value);
}

function makeShapePixels({ shape, imageSize, channels, offsetX = 0, offsetY = 0 }) {
  const pixels = new Float32Array(imageSize * imageSize * channels);
  const cx = imageSize * 0.5 + offsetX;
  const cy = imageSize * 0.5 + offsetY;
  const radius = imageSize * 0.24;
  for (let y = 0; y < imageSize; y += 1) {
    for (let x = 0; x < imageSize; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let value = 0;
      if (shape === "circle") value = dist <= radius ? 1 : 0;
      if (shape === "ring") value = dist <= radius && dist >= radius * 0.62 ? 1 : 0;
      if (shape === "square") value = Math.abs(dx) <= radius && Math.abs(dy) <= radius ? 1 : 0;
      if (shape === "bar") value = Math.abs(dx) <= imageSize * 0.08 ? 1 : 0;
      if (shape === "diagonal") value = Math.abs(dx - dy) <= imageSize * 0.08 ? 1 : 0;
      if (shape === "cross") value = Math.abs(dx) <= imageSize * 0.07 || Math.abs(dy) <= imageSize * 0.07 ? 1 : 0;
      for (let c = 0; c < channels; c += 1) {
        pixels[(y * imageSize + x) * channels + c] = clamp01(value);
      }
    }
  }
  return pixels;
}

export function createProceduralShapeDatasetKit(config = {}) {
  const imageSize = config.imageSize ?? 32;
  const channels = config.channels ?? 1;
  const count = config.count ?? 48;
  const random = createDiffusionSeededRandom(config.seed ?? 11);
  const shapes = ["circle", "square", "bar", "ring", "diagonal", "cross"];
  const samples = Array.from({ length: count }, (_, index) => {
    const shape = shapes[index % shapes.length];
    const offsetX = Math.floor((random() - 0.5) * imageSize * 0.12);
    const offsetY = Math.floor((random() - 0.5) * imageSize * 0.12);
    return {
      id: `shape-${String(index).padStart(3, "0")}`,
      kind: "procedural-shape",
      label: shape,
      width: imageSize,
      height: imageSize,
      channels,
      pixels: makeShapePixels({ shape, imageSize, channels, offsetX, offsetY })
    };
  });
  return {
    descriptor: {
      id: "procedural-shapes",
      kind: "procedural-shape-dataset-kit",
      sampleCount: samples.length,
      imageSize,
      channels,
      labels: shapes
    },
    samples
  };
}

export function createDatasetBatchStreamKit(dataset, config = {}) {
  const samples = dataset.samples ?? [];
  const random = createDiffusionSeededRandom(config.seed ?? 1);
  return {
    getBatch({ batchSize = 4 } = {}) {
      return Array.from({ length: batchSize }, () => {
        const index = Math.floor(random() * samples.length) % samples.length;
        return clone(samples[index]);
      });
    }
  };
}

export function createDiffusionDatasetDomain(config = {}) {
  let dataset = createProceduralShapeDatasetKit(config);
  let stream = createDatasetBatchStreamKit(dataset, config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-dataset-domain-kit",
    domain: "diffusion-dataset",
    apiName: config.apiName ?? "diffusionDataset",
    version: "0.0.1",
    stability: "experimental",
    services: ["dataset", "batch-stream"],
    metadata: {
      purpose: "Diffusion dataset subdomain with deterministic procedural shape samples."
    },
    createApi() {
      return {
        createDataset(next = {}) {
          dataset = createProceduralShapeDatasetKit({ ...config, ...next });
          stream = createDatasetBatchStreamKit(dataset, { ...config, ...next });
          return { descriptor: clone(dataset.descriptor) };
        },
        getSamples(count = 8) {
          return dataset.samples.slice(0, count).map(clone);
        },
        getBatch(options = {}) {
          return stream.getBatch(options);
        },
        snapshot() {
          return { descriptor: clone(dataset.descriptor), samples: dataset.samples.map(clone) };
        }
      };
    }
  });
}
