import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

function clone(value) {
  return structuredClone(value);
}

export function createCheckpointDescriptorKit({ id, state, model } = {}) {
  return {
    id,
    kind: "diffusion-checkpoint-descriptor-kit",
    version: "0.0.1",
    modelId: model?.descriptor?.id ?? state?.modelDescriptor?.id ?? "unknown-model",
    epochs: state?.metrics?.epochs ?? 0,
    steps: state?.metrics?.steps ?? 0,
    imageSize: state?.imageSize,
    channels: state?.channels,
    savedAtStep: state?.metrics?.steps ?? 0
  };
}

export function createMemoryCheckpointKit() {
  const store = new Map();
  return {
    save({ id = "memory", state = {}, model = {} } = {}) {
      const descriptor = createCheckpointDescriptorKit({ id, state, model });
      const record = { descriptor, state: clone(state), model: clone(model) };
      store.set(id, record);
      return clone(record);
    },
    load(id = "memory") {
      return clone(store.get(id));
    },
    list() {
      return Array.from(store.values()).map((entry) => clone(entry.descriptor));
    },
    clear(id) {
      return id ? store.delete(id) : (store.clear(), true);
    }
  };
}

export function createCheckpointRestoreKit() {
  return {
    restore(record) {
      return record ? clone(record) : null;
    }
  };
}

export function createDiffusionCheckpointDomain(config = {}) {
  const memory = createMemoryCheckpointKit(config);
  const restore = createCheckpointRestoreKit(config);
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-checkpoint-domain-kit",
    domain: "diffusion-checkpoint",
    apiName: config.apiName ?? "diffusionCheckpoint",
    version: "0.0.1",
    stability: "experimental",
    services: ["checkpoint", "memory", "restore"],
    metadata: {
      purpose: "Diffusion checkpoint subdomain with deterministic in-memory checkpoints."
    },
    createApi() {
      return {
        save(input = {}) {
          return memory.save(input);
        },
        load(id = "memory") {
          return restore.restore(memory.load(id));
        },
        list() {
          return memory.list();
        },
        clear(id) {
          return memory.clear(id);
        }
      };
    }
  });
}
