import { computeShapeMetrics, validatePortableTriangleGeometry } from "../../../../core-kits/core-object-shape-kit/metrics.js";

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

function subsetGeometry(sourceInput, targetRatio, preserveProtected = true) {
  const source = validatePortableTriangleGeometry(sourceInput.geometry ?? sourceInput);
  const targetTriangles = Math.max(1, Math.floor(source.indices.length / 3 * targetRatio));
  if (targetTriangles >= source.indices.length / 3) return source;
  const protectedSet = protectedVertices(sourceInput);
  const protectedTriangles = [];
  const ordinaryTriangles = [];
  for (let index = 0; index < source.indices.length; index += 3) {
    const triangle = [source.indices[index], source.indices[index + 1], source.indices[index + 2]];
    (preserveProtected && triangle.some((vertex) => protectedSet.has(vertex)) ? protectedTriangles : ordinaryTriangles).push(triangle);
  }
  const result = protectedTriangles.slice();
  const remaining = Math.max(0, targetTriangles - result.length);
  if (remaining > 0 && ordinaryTriangles.length) {
    const stride = ordinaryTriangles.length / remaining;
    for (let index = 0; index < remaining; index += 1) {
      result.push(ordinaryTriangles[Math.min(ordinaryTriangles.length - 1, Math.floor(index * stride))]);
    }
  }
  if (!result.length) result.push(ordinaryTriangles[0] ?? protectedTriangles[0]);
  return {
    positions: source.positions,
    indices: result.flat(),
    attributes: source.attributes
  };
}

function clusterGeometry(geometry, targetRatio, preserveBorders) {
  const source = validatePortableTriangleGeometry(geometry);
  const targetTriangles = Math.max(1, Math.floor(source.indices.length / 3 * targetRatio));
  if (targetTriangles >= source.indices.length / 3) return source;
  const metrics = computeShapeMetrics(source);
  const boundary = new Set();
  if (preserveBorders) {
    const edges = new Map();
    for (let i = 0; i < source.indices.length; i += 3) {
      const tri = [source.indices[i], source.indices[i + 1], source.indices[i + 2]];
      for (let edge = 0; edge < 3; edge += 1) {
        const a = tri[edge];
        const b = tri[(edge + 1) % 3];
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    for (const [key, count] of edges) {
      if (count === 1) key.split(":").forEach((value) => boundary.add(Number(value)));
    }
  }

  function reduce(resolution) {
    const min = metrics.bounds.min;
    const size = metrics.bounds.size.map((value) => Math.max(value, 1e-9));
    const clusters = new Map();
    const vertexCluster = new Array(source.positions.length / 3);
    for (let vertex = 0; vertex < vertexCluster.length; vertex += 1) {
      const offset = vertex * 3;
      const key = boundary.has(vertex)
        ? `b:${vertex}`
        : `${Math.round((source.positions[offset] - min[0]) / size[0] * resolution)}:${Math.round((source.positions[offset + 1] - min[1]) / size[1] * resolution)}:${Math.round((source.positions[offset + 2] - min[2]) / size[2] * resolution)}`;
      let cluster = clusters.get(key);
      if (!cluster) {
        cluster = { id: clusters.size, count: 0, sums: [0, 0, 0], attributeSums: {} };
        clusters.set(key, cluster);
      }
      cluster.count += 1;
      cluster.sums[0] += source.positions[offset];
      cluster.sums[1] += source.positions[offset + 1];
      cluster.sums[2] += source.positions[offset + 2];
      for (const [name, attribute] of Object.entries(source.attributes)) {
        cluster.attributeSums[name] ??= new Array(attribute.itemSize).fill(0);
        for (let component = 0; component < attribute.itemSize; component += 1) {
          cluster.attributeSums[name][component] += attribute.values[vertex * attribute.itemSize + component];
        }
      }
      vertexCluster[vertex] = cluster.id;
    }
    const positions = new Array(clusters.size * 3);
    const attributes = Object.fromEntries(Object.entries(source.attributes).map(([name, value]) => [name, { itemSize: value.itemSize, values: new Array(clusters.size * value.itemSize) }]));
    for (const cluster of clusters.values()) {
      positions[cluster.id * 3] = cluster.sums[0] / cluster.count;
      positions[cluster.id * 3 + 1] = cluster.sums[1] / cluster.count;
      positions[cluster.id * 3 + 2] = cluster.sums[2] / cluster.count;
      for (const [name, sums] of Object.entries(cluster.attributeSums)) {
        const attribute = attributes[name];
        for (let component = 0; component < attribute.itemSize; component += 1) {
          attribute.values[cluster.id * attribute.itemSize + component] = sums[component] / cluster.count;
        }
      }
    }
    const indices = [];
    const triangles = new Set();
    for (let index = 0; index < source.indices.length; index += 3) {
      const a = vertexCluster[source.indices[index]];
      const b = vertexCluster[source.indices[index + 1]];
      const c = vertexCluster[source.indices[index + 2]];
      if (a === b || b === c || c === a) continue;
      const key = [a, b, c].sort((left, right) => left - right).join(":");
      if (triangles.has(key)) continue;
      triangles.add(key);
      indices.push(a, b, c);
    }
    return { positions, indices, attributes };
  }

  let best = null;
  for (let resolution = 64; resolution >= 2; resolution = Math.max(1, Math.floor(resolution * 0.78))) {
    const candidate = reduce(resolution);
    const triangles = candidate.indices.length / 3;
    if (!best || Math.abs(triangles - targetTriangles) < Math.abs(best.indices.length / 3 - targetTriangles)) best = candidate;
    if (triangles <= targetTriangles || resolution <= 2) break;
  }
  return best ?? source;
}

export function createReferenceObjectShapeProvider(options = {}) {
  return {
    id: options.id ?? "reference-object-shape-provider",
    version: "0.2.0",
    metadata: {
      algorithm: "deterministic-spatial-clustering-or-safe-index-subset",
      portableFallback: true,
      qualificationCandidateOnly: true
    },
    async derive(request, { updateProgress, isCancelled }) {
      if (!request.source.geometry) throw new TypeError("Reference Object Shape provider requires inline geometry.");
      updateProgress?.(0.2, 1, "analyze");
      if (isCancelled?.()) throw new Error("Object Shape derivation cancelled.");
      const safeSkinned = request.profile.qualification?.mode === "safe-skinned" || request.target.qualification?.mode === "safe-skinned";
      const geometry = request.target.mode === "source"
        ? validatePortableTriangleGeometry(request.source.geometry)
        : safeSkinned
          ? subsetGeometry(request.source, request.target.ratio, request.target.options?.preserveProtectedTriangles !== false)
          : clusterGeometry(request.source.geometry, request.target.ratio, request.target.preserve?.borders ?? request.profile.preserve.borders);
      updateProgress?.(0.8, 1, "validate-candidate");
      const metrics = computeShapeMetrics(geometry);
      updateProgress?.(1, 1, "candidate-ready");
      return {
        geometry,
        metrics,
        preservation: { ...request.profile.preserve, ...request.target.preserve },
        metadata: {
          algorithm: safeSkinned ? "deterministic-safe-index-subset" : "deterministic-spatial-clustering",
          targetRatio: request.target.ratio,
          skeletonReduced: false,
          attributeArraysPreserved: safeSkinned,
          candidateOnly: true
        }
      };
    }
  };
}
