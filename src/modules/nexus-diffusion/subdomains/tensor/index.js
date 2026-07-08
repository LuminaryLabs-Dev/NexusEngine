import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import { createDiffusionSeededRandom, randomNormal, clamp01 } from "../../utils/seeded-random.js";

function assertSameLength(a, b) {
  if (a.data.length !== b.data.length) throw new TypeError("Tensor lengths must match.");
}

function makeTensor(data, shape, metadata = {}) {
  const buffer = data instanceof Float32Array ? data : new Float32Array(data ?? []);
  return {
    id: metadata.id ?? `tensor-${buffer.length}-${shape.join("x")}`,
    kind: "diffusion-tensor",
    dtype: "float32",
    device: metadata.device ?? "cpu",
    shape: [...shape],
    data: buffer
  };
}

export function createTensorDescriptorKit(tensor) {
  return {
    id: tensor.id,
    kind: tensor.kind,
    dtype: tensor.dtype,
    device: tensor.device,
    shape: [...tensor.shape],
    length: tensor.data.length
  };
}

export function createCpuTensorBufferKit() {
  return {
    create(data, shape) {
      return makeTensor(data, shape);
    },
    zeros(shape) {
      return makeTensor(new Float32Array(shape.reduce((a, b) => a * b, 1)), shape);
    }
  };
}

export function createTensorRandomKit() {
  return {
    randomNormal(shape, seed = 1) {
      const random = createDiffusionSeededRandom(seed);
      const data = new Float32Array(shape.reduce((a, b) => a * b, 1));
      for (let i = 0; i < data.length; i += 1) data[i] = randomNormal(random);
      return makeTensor(data, shape);
    }
  };
}

export function createTensorNormalizeKit() {
  return {
    normalizePixels(pixels, shape) {
      const data = new Float32Array(pixels.length);
      for (let i = 0; i < pixels.length; i += 1) data[i] = clamp01(pixels[i]);
      return makeTensor(data, shape);
    },
    toPixels(tensor) {
      const pixels = new Float32Array(tensor.data.length);
      for (let i = 0; i < tensor.data.length; i += 1) pixels[i] = clamp01(tensor.data[i]);
      return pixels;
    }
  };
}

export function createTensorOpsKit() {
  const binary = (a, b, fn) => {
    assertSameLength(a, b);
    const data = new Float32Array(a.data.length);
    for (let i = 0; i < data.length; i += 1) data[i] = fn(a.data[i], b.data[i], i);
    return makeTensor(data, a.shape);
  };
  return {
    add: (a, b) => binary(a, b, (x, y) => x + y),
    sub: (a, b) => binary(a, b, (x, y) => x - y),
    mul: (a, b) => binary(a, b, (x, y) => x * y),
    scale(tensor, scalar) {
      const data = new Float32Array(tensor.data.length);
      for (let i = 0; i < data.length; i += 1) data[i] = tensor.data[i] * scalar;
      return makeTensor(data, tensor.shape);
    },
    mse(a, b) {
      assertSameLength(a, b);
      let sum = 0;
      for (let i = 0; i < a.data.length; i += 1) {
        const delta = a.data[i] - b.data[i];
        sum += delta * delta;
      }
      return sum / Math.max(1, a.data.length);
    }
  };
}

export function createDiffusionTensorDomain(config = {}) {
  const buffer = createCpuTensorBufferKit(config);
  const random = createTensorRandomKit(config);
  const normalize = createTensorNormalizeKit(config);
  const ops = createTensorOpsKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-tensor-domain-kit",
    domain: "diffusion-tensor",
    apiName: config.apiName ?? "diffusionTensor",
    version: "0.0.1",
    stability: "experimental",
    services: ["tensor", "random", "ops", "normalize"],
    metadata: {
      purpose: "Diffusion tensor subdomain backed by CPU Float32Array buffers."
    },
    createApi() {
      return {
        create: buffer.create,
        zeros: buffer.zeros,
        randomNormal: random.randomNormal,
        normalizePixels: normalize.normalizePixels,
        toPixels: normalize.toPixels,
        descriptor: createTensorDescriptorKit,
        add: ops.add,
        sub: ops.sub,
        mul: ops.mul,
        scale: ops.scale,
        mse: ops.mse
      };
    }
  });
}
