import { createCoreCapabilityKit } from "../core-capability-kit.js";
import { createModelRegistry } from "./model-registry.js";
import { createMockModelAdapter } from "./mock-model-adapter.js";

export * from "./model-registry.js";
export * from "./model-descriptors.js";
export * from "./inference-request.js";
export * from "./inference-result.js";
export * from "./mock-model-adapter.js";
export * from "./adapters.js";

export function createCoreMLNNKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-mlnn",
    apiName: config.apiName ?? "coreMLNN",
    purpose: "Model and neural-network capability: registries, descriptors, inference requests/results, embeddings, classifications, perception, generation, and adapter boundaries.",
    owns: ["model registry", "model descriptors", "inference requests", "inference results", "embedding descriptors", "classification descriptors"],
    doesNotOwn: ["agent goals", "agent planning", "tool execution", "raw backend SDK ownership"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    },
    createApi(context) {
      const registry = createModelRegistry(config.models ?? []);
      const adapter = config.adapter ?? createMockModelAdapter(config.mock ?? {});
      return {
        registerModel(model = {}) {
          const descriptor = registry.register(model);
          context.baseApi.setDescriptor("models", descriptor.id, descriptor);
          return descriptor;
        },
        getModels() {
          return registry.list();
        },
        infer(request = {}) {
          const modelId = request.modelId ?? registry.list()[0]?.id ?? "mock-model";
          const result = adapter.infer({ ...request, modelId });
          context.baseApi.setDescriptor("inferenceResults", result.id, result);
          return result;
        },
        ...(config.createApi?.(context) ?? {})
      };
    }
  });
}
