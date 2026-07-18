import { computeShapeMetrics, validatePortableTriangleGeometry } from "../../../../core-kits/core-object-shape-kit/metrics.js";

function firstAttribute(geometry, names) {
  for (const name of names) {
    if (geometry.attributes?.[name]) return geometry.attributes[name];
  }
  return null;
}

function protectedVertices(source) {
  const metadata = source.metadata ?? {};
  const constraints = metadata.vertexConstraints ?? {};
  const skinning = metadata.skinning ?? metadata.deformation ?? {};
  return new Set([
    ...(metadata.protectedVertices ?? []),
    ...(constraints.lockPosition ?? []),
    ...(constraints.lockTopology ?? []),
    ...(constraints.preserveWeights ?? []),
    ...(skinning.protectedVertices ?? [])
  ].map(Number).filter(Number.isInteger));
}

function semanticPartitionMap(source, vertexCount) {
  const map = new Array(vertexCount).fill("unassigned");
  const partitions = source.metadata?.semanticPartitions ?? source.metadata?.partitions ?? {};
  const entries = Array.isArray(partitions)
    ? partitions.map((partition, index) => [partition.id ?? `partition-${index}`, partition.vertices ?? partition.vertexIndices ?? []])
    : Object.entries(partitions);
  for (const [id, vertices] of entries) {
    for (const vertex of vertices ?? []) {
      if (Number.isInteger(Number(vertex)) && vertex >= 0 && vertex < vertexCount) map[Number(vertex)] = String(id);
    }
  }
  return map;
}

function dominantBones(source) {
  const geometry = source.geometry;
  const indices = firstAttribute(geometry, ["skinIndex", "skinIndices", "joints", "JOINTS_0"]);
  const weights = firstAttribute(geometry, ["skinWeight", "skinWeights", "weights", "WEIGHTS_0"]);
  if (!indices || !weights || indices.itemSize !== weights.itemSize) return null;
  const vertexCount = geometry.positions.length / 3;
  const result = new Array(vertexCount).fill(0);
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    let bestWeight = -Infinity;
    let bestBone = 0;
    for (let influence = 0; influence < weights.itemSize; influence += 1) {
      const offset = vertex * weights.itemSize + influence;
      const weight = Number(weights.values[offset]);
      if (weight > bestWeight) {
        bestWeight = weight;
        bestBone = Number(indices.values[offset]);
      }
    }
    result[vertex] = bestBone;
  }
  return result;
}

function partitionTriangles(source, target) {
  const geometry = source.geometry;
  const vertexCount = geometry.positions.length / 3;
  const partitions = semanticPartitionMap(source, vertexCount);
  const bones = target.options?.partitionByDominantBone === false ? null : dominantBones(source);
  const protectedSet = protectedVertices(source);
  const groups = new Map();

  function push(key, triangle, locked = false) {
    let group = groups.get(key);
    if (!group) {
      group = { key, locked, indices: [] };
      groups.set(key, group);
    }
    group.locked ||= locked;
    group.indices.push(...triangle);
  }

  for (let index = 0; index < geometry.indices.length; index += 3) {
    const triangle = [geometry.indices[index], geometry.indices[index + 1], geometry.indices[index + 2]];
    const locked = target.options?.preserveProtectedTriangles !== false && triangle.some((vertex) => protectedSet.has(vertex));
    if (locked) {
      push(`protected:${index / 3}`, triangle, true);
      continue;
    }
    const partitionKey = Array.from(new Set(triangle.map((vertex) => partitions[vertex]))).sort().join("+");
    const boneKey = bones ? Array.from(new Set(triangle.map((vertex) => bones[vertex]))).sort((a, b) => a - b).join("+") : "none";
    push(`partition:${partitionKey}|bones:${boneKey}`, triangle, false);
  }
  return Array.from(groups.values()).sort((left, right) => left.key.localeCompare(right.key));
}

function simplificationFlags(request) {
  const flags = [];
  const safeSkinned = request.profile.qualification?.mode === "safe-skinned" || request.target.qualification?.mode === "safe-skinned";
  if (request.target.preserve?.borders ?? request.profile.preserve.borders ?? safeSkinned) flags.push("LockBorder");
  if (request.target.options?.prune) flags.push("Prune");
  if (request.target.options?.regularize) flags.push("Regularize");
  if (request.target.options?.aggressive && !safeSkinned) flags.push("Permissive");
  return flags;
}

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
      attribution: "Uses meshoptimizer. Copyright (c) 2016-2026, Arseny Kapoulkine",
      qualificationCandidateOnly: true,
      skinnedMode: "partitioned-index-simplification"
    },
    async derive(request, { updateProgress, isCancelled }) {
      if (!request.source.geometry) throw new TypeError("Meshoptimizer Shape provider requires inline geometry.");
      const source = validatePortableTriangleGeometry(request.source.geometry);
      if (request.target.mode === "source" || request.target.ratio >= 1) {
        return {
          geometry: source,
          metrics: computeShapeMetrics(source),
          preservation: request.profile.preserve,
          metadata: {
            algorithm: "meshoptimizer",
            sourcePassthrough: true,
            skeletonReduced: false,
            bindMatricesHash: request.source.metadata?.skinning?.bindMatricesHash ?? null
          }
        };
      }

      const module = await getSimplifier();
      if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
      updateProgress?.(0.1, 1, "partition");
      const groups = partitionTriangles({ ...request.source, geometry: source }, request.target);
      const positions = Float32Array.from(source.positions);
      const flags = simplificationFlags(request);
      const resultIndices = [];
      let maximumError = 0;

      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
        const group = groups[groupIndex];
        const indices = Uint32Array.from(group.indices);
        const sourceTriangleCount = indices.length / 3;
        const targetIndexCount = group.locked
          ? indices.length
          : Math.max(3, Math.floor(indices.length * request.target.ratio / 3) * 3);
        if (group.locked || targetIndexCount >= indices.length || sourceTriangleCount <= 1) {
          resultIndices.push(...indices);
        } else {
          const [simplified, error] = module.simplify(
            indices,
            positions,
            3,
            targetIndexCount,
            request.target.maximumDeviation,
            flags
          );
          resultIndices.push(...simplified);
          maximumError = Math.max(maximumError, Number(error) || 0);
        }
        updateProgress?.(0.1 + 0.65 * ((groupIndex + 1) / Math.max(1, groups.length)), 1, `simplify:${group.key}`);
      }

      if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
      updateProgress?.(0.85, 1, "validate-candidate");
      const geometry = {
        positions: source.positions,
        indices: resultIndices,
        attributes: source.attributes
      };
      const metrics = computeShapeMetrics(geometry);
      updateProgress?.(1, 1, "candidate-ready");
      return {
        geometry,
        metrics,
        quality: {
          geometricDeviation: maximumError,
          targetRatio: request.target.ratio,
          actualTriangleRatio: metrics.triangleCount / Math.max(1, source.indices.length / 3)
        },
        preservation: { ...request.profile.preserve, ...request.target.preserve },
        metadata: {
          algorithm: "meshoptimizer",
          flags,
          partitionCount: groups.length,
          protectedPartitionCount: groups.filter((group) => group.locked).length,
          skeletonReduced: false,
          attributeArraysPreserved: true,
          candidateOnly: true
        }
      };
    },
    reset() {},
    dispose() {
      simplifier = null;
    }
  };
}
