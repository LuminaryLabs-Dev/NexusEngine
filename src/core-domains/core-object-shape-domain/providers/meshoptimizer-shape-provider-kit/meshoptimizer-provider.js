import { computeShapeMetrics, validatePortableTriangleGeometry } from "../../../../core-kits/core-object-shape-kit/metrics.js";

export function createMeshoptimizerShapeProvider(options = {}) {
  let simplifier = options.MeshoptSimplifier ?? null;

  async function getSimplifier() {
    simplifier ??= await options.loadSimplifier?.();
    if (!simplifier) throw new Error("Meshoptimizer Shape provider requires MeshoptSimplifier or loadSimplifier().");
    if (simplifier.ready) await simplifier.ready;
    if (typeof simplifier.simplify !== "function") throw new TypeError("MeshoptSimplifier.simplify is unavailable.");
    return simplifier;
  }

  return {
    id: options.id ?? "meshoptimizer-shape-provider",
    version: options.version ?? "1.x",
    metadata: {
      algorithm: "meshoptimizer",
      attribution: "Uses meshoptimizer. Copyright (c) 2016-2026, Arseny Kapoulkine"
    },
    async derive(request, { updateProgress, isCancelled }) {
      if (!request.source.geometry) throw new TypeError("Meshoptimizer Shape provider requires inline geometry.");
      const source = validatePortableTriangleGeometry(request.source.geometry);
      if (request.target.mode === "source" || request.target.ratio >= 1) {
        return {
          geometry: source,
          metrics: computeShapeMetrics(source),
          preservation: request.profile.preserve,
          metadata: { algorithm: "meshoptimizer", sourcePassthrough: true }
        };
      }
      const module = await getSimplifier();
      if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
      updateProgress?.(0.2, 1, "simplify");
      const indices = Uint32Array.from(source.indices);
      const positions = Float32Array.from(source.positions);
      const targetIndexCount = Math.max(3, Math.floor(indices.length * request.target.ratio / 3) * 3);
      const flags = [];
      if (request.target.preserve?.borders ?? request.profile.preserve.borders) flags.push("LockBorder");
      if (request.target.options?.prune) flags.push("Prune");
      if (request.target.options?.regularize) flags.push("Regularize");
      const [resultIndices, resultError] = module.simplify(
        indices,
        positions,
        3,
        targetIndexCount,
        request.target.maximumDeviation,
        flags
      );
      if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
      updateProgress?.(0.8, 1, "validate");
      const geometry = {
        positions: source.positions,
        indices: Array.from(resultIndices),
        attributes: source.attributes
      };
      const metrics = computeShapeMetrics(geometry);
      updateProgress?.(1, 1, "ready");
      return {
        geometry,
        metrics,
        quality: {
          geometricDeviation: Number(resultError),
          targetRatio: request.target.ratio
        },
        preservation: { ...request.profile.preserve, ...request.target.preserve },
        metadata: { algorithm: "meshoptimizer", flags }
      };
    },
    reset() {},
    dispose() {
      simplifier = null;
    }
  };
}
