import { createDomainKit } from "../../../../domain-kit.js";
import { createInferenceRequest } from "./inference-request.js";
import { createInferenceResult } from "./inference-result.js";
import { createModelDescriptor } from "./model-descriptors.js";

export * from "./model-registry.js";
export * from "./model-descriptors.js";
export * from "./inference-request.js";
export * from "./inference-result.js";
export * from "./adapters.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function normalizeAdapter(adapter) {
  if (!adapter || typeof adapter !== "object" || Array.isArray(adapter)) {
    throw new TypeError("Model adapter must be an object.");
  }
  if (typeof adapter.id !== "string" || !adapter.id.trim()) {
    throw new TypeError("Model adapter requires an id.");
  }
  if (typeof adapter.infer !== "function") {
    throw new TypeError("Model adapter requires infer(request, context).");
  }
  return adapter;
}

function adapterDescriptor(adapter) {
  return {
    id: adapter.id,
    kind: adapter.kind ?? "provider",
    capabilities: [...(adapter.capabilities ?? [])],
    metadata: clone(adapter.metadata ?? {})
  };
}

function configuredAdapters(config) {
  const values = Array.isArray(config.adapters)
    ? config.adapters
    : Object.values(config.adapters ?? {});
  if (config.adapter) values.push(config.adapter);
  return values.map(normalizeAdapter);
}

export function createModelKit(config = {}) {
  const initialModels = (config.models ?? []).map(createModelDescriptor);
  const initialAdapters = configuredAdapters(config);
  const adapters = new Map(initialAdapters.map((adapter) => [adapter.id, adapter]));

  return createDomainKit({
    ...config,

    manifestId: "model-registry-kit",
    id: config.id ?? "model-registry-kit",
    domainPath: config.domainPath ?? "n:compute:model",
    parentDomainPath: config.parentDomainPath ?? "n:compute",
    domain: "model",
    apiName: config.apiName ?? "model",
    purpose: "Provider-neutral model descriptors, registries, inference requests and results, and adapter boundaries.",
    owns: ["model registry", "model descriptors", "inference requests", "inference results", "embedding descriptors", "classification descriptors"],
    doesNotOwn: ["model runtime implementation", "model files", "network transport", "provider credentials", "agent goals", "agent planning", "tool execution"],
    descriptors: {
      ...(config.descriptors ?? {}),
      models: Object.fromEntries(initialModels.map((model) => [model.id, model])),
      adapters: Object.fromEntries(initialAdapters.map((adapter) => [adapter.id, adapterDescriptor(adapter)])),
      inferenceRequests: {},
      inferenceResults: {}
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      providerNeutral: true
    },
    createApi(context) {
      const { baseApi } = context;

      const api = {
        registerModel(input = {}) {
          const descriptor = createModelDescriptor(input);
          const existing = baseApi.getDescriptors("models")[descriptor.id];
          if (existing) {
            if (!same(existing, descriptor)) {
              throw new Error(`Model descriptor ${descriptor.id} already exists with different content.`);
            }
            return clone(existing);
          }
          baseApi.setDescriptor("models", descriptor.id, descriptor);
          return clone(descriptor);
        },

        getModels() {
          return Object.values(baseApi.getDescriptors("models"));
        },

        registerAdapter(input) {
          const adapter = normalizeAdapter(input);
          const existing = adapters.get(adapter.id);
          if (existing && existing !== adapter) {
            throw new Error(`Model adapter ${adapter.id} already exists with different content.`);
          }
          adapters.set(adapter.id, adapter);
          if (!baseApi.getDescriptors("adapters")[adapter.id]) {
            baseApi.setDescriptor("adapters", adapter.id, adapterDescriptor(adapter));
          }
          return adapter.id;
        },

        getAdapters() {
          return Object.values(baseApi.getDescriptors("adapters"));
        },

        infer(input = {}) {
          const models = baseApi.getDescriptors("models");
          const modelId = input.modelId ?? Object.keys(models)[0];
          if (!modelId || !models[modelId]) {
            throw new RangeError(`Unknown model descriptor: ${modelId ?? "none"}.`);
          }
          const request = createInferenceRequest({
            ...input,
            id: input.id ?? `inference:${modelId}`,
            modelId
          });
          const acceptedRequest = baseApi.getDescriptors("inferenceRequests")[request.id];
          if (acceptedRequest) {
            if (!same(acceptedRequest, request)) {
              throw new Error(`Inference request ${request.id} already exists with different content.`);
            }
            return clone(baseApi.getDescriptors("inferenceResults")[request.id]);
          }

          const model = models[modelId];
          const adapterId = request.adapterId
            ?? model.adapterId
            ?? (adapters.has(model.backend) ? model.backend : null)
            ?? adapters.keys().next().value;
          const adapter = adapters.get(adapterId);
          if (!adapter) {
            throw new Error(`No model adapter is available for ${modelId}.`);
          }

          const commit = (rawResult = {}) => {
            const result = createInferenceResult({
              ...rawResult,
              id: request.id,
              modelId,
              kind: rawResult.kind ?? request.kind,
              input: request.input
            });
            baseApi.setDescriptor("inferenceRequests", request.id, request);
            baseApi.setDescriptor("inferenceResults", request.id, result);
            return clone(result);
          };

          const pending = adapter.infer(clone(request), {
            engine: context.engine,
            world: context.world,
            model: clone(model)
          });
          return pending && typeof pending.then === "function"
            ? pending.then(commit)
            : commit(pending);
        },

        getInferenceResult(id) {
          return clone(baseApi.getDescriptors("inferenceResults")[String(id)]);
        },

        ...(config.createApi?.(context) ?? {})
      };
      return api;
    }
  });
}
