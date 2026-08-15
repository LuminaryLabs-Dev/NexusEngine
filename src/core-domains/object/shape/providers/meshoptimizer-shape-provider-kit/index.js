import { createDomainKit } from "../../../../domain-kit.js";

export * from "./meshoptimizer-provider.js";
export * from "./reference-provider.js";

export function createMeshoptimizerShapeProviderKit(options = {}) {
  const provider = options.provider ?? null;
  return createDomainKit({
    ...options,
    manifestId: "object-meshoptimizer-shape-provider-kit",
    id: "object-meshoptimizer-shape-provider-kit",
    domain: "object-shape-provider",
    domainPath: "n:object:shape",
    parentDomainPath: "n:object",
    apiName: "meshoptimizerShapeProvider",
    requires: ["object:shape-jobs"],
    provides: ["object:shape-provider"],
    version: "0.0.4",
    purpose: "Register one explicitly supplied meshoptimizer-compatible Object Shape provider.",
    createApi({ engine, baseApi }) {
      return {
        providerId: provider?.id ?? null,
        register() {
          if (!provider) return false;
          const shape = engine.n?.objectShape;
          if (!shape?.registerProvider) throw new Error("Meshoptimizer Shape provider Kit requires Object Shape.");
          shape.registerProvider(provider);
          return true;
        },
        reset(payload = {}) {
          if (provider?.id) engine.n?.objectShape?.unregisterProvider?.(provider.id);
          return baseApi.reset(payload);
        }
      };
    },
    install({ engine }) {
      const api = engine.n?.objectShape;
      if (!api?.registerProvider) throw new Error("Meshoptimizer Shape provider Kit requires Object Shape.");
      if (provider) api.registerProvider(provider);
    },
    metadata: {
      ...(options.metadata ?? {}),
      scope: "object-shape-provider",
      providerNeutralDomain: "n:object:shape",
      ownsLoop: false,
      boundary: "Installs an optimization provider into Object Shape. The domain owns jobs, state, validation, readiness, and publication."
    }
  });
}

export default createMeshoptimizerShapeProviderKit;
