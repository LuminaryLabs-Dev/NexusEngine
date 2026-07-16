export * from "./meshoptimizer-provider.js";
export * from "./reference-provider.js";

export function createMeshoptimizerShapeProviderKit(options = {}) {
  const provider = options.provider ?? null;
  return Object.freeze({
    id: options.id ?? "meshoptimizer-shape-provider-kit",
    version: "0.1.0",
    install({ engine }) {
      const api = engine.n?.objectShape ?? engine.objectShape;
      if (!api?.registerProvider) throw new Error("Meshoptimizer Shape provider kit requires Object Shape.");
      if (provider) api.registerProvider(provider);
    },
    reset({ engine }) {
      const api = engine.n?.objectShape ?? engine.objectShape;
      if (provider?.id) api?.unregisterProvider?.(provider.id);
    },
    metadata: {
      scope: "object-shape-provider",
      providerNeutralDomain: "n:object:shape",
      ownsLoop: false,
      boundary: "Installs an optimization provider into Object Shape. The domain owns jobs, state, validation, readiness, and publication."
    }
  });
}

export default createMeshoptimizerShapeProviderKit;
