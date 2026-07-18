import { compareShapeMetrics, computeShapeMetrics, validatePortableTriangleGeometry } from "./metrics.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const NEXUS_OBJECT_SHAPE_QUALIFICATION_SCHEMA = "nexus-object-shape-qualification/1";

const DEFAULT_VIEWS = Object.freeze([
  { azimuth: 0, elevation: 0 },
  { azimuth: 45, elevation: 0 },
  { azimuth: 90, elevation: 0 },
  { azimuth: 135, elevation: 0 },
  { azimuth: 180, elevation: 0 },
  { azimuth: 225, elevation: 0 },
  { azimuth: 270, elevation: 0 },
  { azimuth: 315, elevation: 0 },
  { azimuth: 0, elevation: 20 },
  { azimuth: 90, elevation: 20 },
  { azimuth: 180, elevation: 20 },
  { azimuth: 270, elevation: 20 }
]);

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (ArrayBuffer.isView(value)) return stableStringify(Array.from(value));
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function hashValue(value) {
  return hashText(stableStringify(value));
}

function firstAttribute(geometry, names) {
  for (const name of names) {
    if (geometry.attributes?.[name]) return { name, ...geometry.attributes[name] };
  }
  return null;
}

function usedVertices(geometry) {
  return new Set(geometry.indices);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function qualificationConfig(profile = {}, target = {}) {
  const profileConfig = profile.qualification ?? {};
  const targetConfig = target.qualification ?? {};
  const mode = String(targetConfig.mode ?? profileConfig.mode ?? (profile.preserve?.skinning ? "safe-skinned" : "geometry"));
  return {
    mode,
    requireSkinning: targetConfig.requireSkinning ?? profileConfig.requireSkinning ?? mode.includes("skinned"),
    preserveSkeleton: targetConfig.preserveSkeleton ?? profileConfig.preserveSkeleton ?? mode !== "experimental-skinned",
    preserveSkinAttributes: targetConfig.preserveSkinAttributes ?? profileConfig.preserveSkinAttributes ?? mode.includes("skinned"),
    structure: {
      maximumInfluences: Math.max(1, Math.floor(finiteNumber(targetConfig.structure?.maximumInfluences ?? profileConfig.structure?.maximumInfluences, 4))),
      weightTolerance: Math.max(1e-8, finiteNumber(targetConfig.structure?.weightTolerance ?? profileConfig.structure?.weightTolerance, 1e-4)),
      requireProtectedVertices: targetConfig.structure?.requireProtectedVertices ?? profileConfig.structure?.requireProtectedVertices ?? mode.includes("skinned"),
      requireSameVertexLayout: targetConfig.structure?.requireSameVertexLayout ?? profileConfig.structure?.requireSameVertexLayout ?? mode === "safe-skinned",
      requireSameSkinAttributes: targetConfig.structure?.requireSameSkinAttributes ?? profileConfig.structure?.requireSameSkinAttributes ?? mode === "safe-skinned"
    },
    deformation: {
      enabled: targetConfig.deformation?.enabled ?? profileConfig.deformation?.enabled ?? mode.includes("skinned"),
      maximumRmsError: Math.max(0, finiteNumber(targetConfig.deformation?.maximumRmsError ?? profileConfig.deformation?.maximumRmsError, target.id === "proxy" ? 0.02 : 0.01)),
      maximumSurfaceError: Math.max(0, finiteNumber(targetConfig.deformation?.maximumSurfaceError ?? profileConfig.deformation?.maximumSurfaceError, target.id === "proxy" ? 0.06 : 0.03)),
      maximumProtectedError: Math.max(0, finiteNumber(targetConfig.deformation?.maximumProtectedError ?? profileConfig.deformation?.maximumProtectedError, target.id === "proxy" ? 0.01 : 0.005)),
      sampleLimit: Math.max(16, Math.floor(finiteNumber(targetConfig.deformation?.sampleLimit ?? profileConfig.deformation?.sampleLimit, 256)))
    },
    silhouette: {
      enabled: targetConfig.silhouette?.enabled ?? profileConfig.silhouette?.enabled ?? true,
      minimumIoU: Math.max(0, Math.min(1, finiteNumber(targetConfig.silhouette?.minimumIoU ?? profileConfig.silhouette?.minimumIoU, target.id === "proxy" ? 0.9 : 0.95))),
      gridSize: Math.max(16, Math.min(96, Math.floor(finiteNumber(targetConfig.silhouette?.gridSize ?? profileConfig.silhouette?.gridSize, 40)))),
      views: clone(targetConfig.silhouette?.views ?? profileConfig.silhouette?.views ?? DEFAULT_VIEWS),
      poseLimit: Math.max(1, Math.floor(finiteNumber(targetConfig.silhouette?.poseLimit ?? profileConfig.silhouette?.poseLimit, 4)))
    },
    fallbackRatios: Array.from(new Set(
      (targetConfig.fallbackRatios ?? target.options?.fallbackRatios ?? profileConfig.fallbackRatios ?? [])
        .map((value) => Math.max(target.ratio, Math.min(1, finiteNumber(value, 1))))
        .filter((value) => value > target.ratio)
    )).sort((a, b) => a - b),
    poseSuiteVersion: String(targetConfig.poseSuiteVersion ?? profileConfig.poseSuiteVersion ?? "object-shape-pose-suite/1")
  };
}

function protectedVertexList(source) {
  const metadata = source.metadata ?? {};
  const constraints = metadata.vertexConstraints ?? {};
  const skinning = metadata.skinning ?? metadata.deformation ?? {};
  const values = [
    ...(metadata.protectedVertices ?? []),
    ...(constraints.lockPosition ?? []),
    ...(constraints.lockTopology ?? []),
    ...(constraints.preserveWeights ?? []),
    ...(skinning.protectedVertices ?? [])
  ];
  return Array.from(new Set(values.map(Number).filter(Number.isInteger))).sort((a, b) => a - b);
}

function skinningMetadata(source) {
  return source.metadata?.skinning ?? source.metadata?.deformation ?? null;
}

function validateSkinStructure(source, candidateGeometry, config, candidateMetadata = {}) {
  const failures = [];
  const sourceGeometry = validatePortableTriangleGeometry(source.geometry);
  const geometry = validatePortableTriangleGeometry(candidateGeometry);
  const skinIndices = firstAttribute(geometry, ["skinIndex", "skinIndices", "joints", "JOINTS_0"]);
  const skinWeights = firstAttribute(geometry, ["skinWeight", "skinWeights", "weights", "WEIGHTS_0"]);
  const sourceSkinIndices = firstAttribute(sourceGeometry, ["skinIndex", "skinIndices", "joints", "JOINTS_0"]);
  const sourceSkinWeights = firstAttribute(sourceGeometry, ["skinWeight", "skinWeights", "weights", "WEIGHTS_0"]);
  const skinning = skinningMetadata(source);
  const boneCount = Math.max(0, Math.floor(finiteNumber(skinning?.boneCount, 0)));
  const used = usedVertices(geometry);
  const protectedVertices = protectedVertexList(source);

  if (config.requireSkinning && (!skinIndices || !skinWeights)) {
    failures.push({ check: "skinning-attributes", message: "Safe skinned qualification requires skin indices and skin weights." });
  }
  if ((skinIndices && !skinWeights) || (!skinIndices && skinWeights)) {
    failures.push({ check: "skinning-attribute-pair", message: "Skin indices and skin weights must be present together." });
  }
  if (skinIndices && skinWeights) {
    if (skinIndices.itemSize !== skinWeights.itemSize) {
      failures.push({ check: "skinning-item-size", measured: [skinIndices.itemSize, skinWeights.itemSize], allowed: "equal" });
    }
    if (skinIndices.itemSize > config.structure.maximumInfluences) {
      failures.push({ check: "maximum-influences", measured: skinIndices.itemSize, allowed: config.structure.maximumInfluences });
    }
    const vertexCount = geometry.positions.length / 3;
    let invalidBoneIndices = 0;
    let invalidWeights = 0;
    let unnormalizedWeights = 0;
    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      let sum = 0;
      for (let influence = 0; influence < skinWeights.itemSize; influence += 1) {
        const offset = vertex * skinWeights.itemSize + influence;
        const weight = Number(skinWeights.values[offset]);
        const bone = Number(skinIndices.values[offset]);
        if (!Number.isFinite(weight) || weight < 0) invalidWeights += 1;
        if (!Number.isInteger(bone) || bone < 0 || (boneCount > 0 && bone >= boneCount)) invalidBoneIndices += 1;
        if (Number.isFinite(weight)) sum += weight;
      }
      if (Math.abs(sum - 1) > config.structure.weightTolerance) unnormalizedWeights += 1;
    }
    if (invalidBoneIndices) failures.push({ check: "bone-indices", measured: invalidBoneIndices, allowed: 0 });
    if (invalidWeights) failures.push({ check: "skin-weights", measured: invalidWeights, allowed: 0 });
    if (unnormalizedWeights) failures.push({ check: "weight-normalization", measured: unnormalizedWeights, allowed: 0 });

    if (config.structure.requireSameSkinAttributes && sourceSkinIndices && sourceSkinWeights) {
      const sameIndices = stableStringify(skinIndices) === stableStringify(sourceSkinIndices);
      const sameWeights = stableStringify(skinWeights) === stableStringify(sourceSkinWeights);
      if (!sameIndices || !sameWeights) {
        failures.push({ check: "skin-attribute-preservation", message: "Safe skinned mode requires unchanged skin index and weight arrays." });
      }
    }
  }

  if (config.structure.requireSameVertexLayout && geometry.positions.length !== sourceGeometry.positions.length) {
    failures.push({
      check: "vertex-layout",
      measured: geometry.positions.length / 3,
      allowed: sourceGeometry.positions.length / 3
    });
  }

  const missingProtectedVertices = protectedVertices.filter((vertex) => !used.has(vertex));
  if (config.structure.requireProtectedVertices && missingProtectedVertices.length) {
    failures.push({
      check: "protected-vertices",
      measured: missingProtectedVertices,
      allowed: "all protected vertices referenced by approved triangles"
    });
  }

  if (config.preserveSkeleton && candidateMetadata.skeletonReduced === true) {
    failures.push({ check: "skeleton-preservation", measured: "reduced", allowed: "unchanged" });
  }
  if (config.preserveSkeleton && skinning?.bindMatrices && candidateMetadata.bindMatricesHash) {
    const expected = hashValue(skinning.bindMatrices);
    if (candidateMetadata.bindMatricesHash !== expected) {
      failures.push({ check: "bind-matrices", measured: candidateMetadata.bindMatricesHash, allowed: expected });
    }
  }

  return {
    status: failures.length ? "failed" : "passed",
    vertexCount: geometry.positions.length / 3,
    triangleCount: geometry.indices.length / 3,
    usedVertexCount: used.size,
    boneCount,
    invalidIndices: 0,
    invalidBoneIndices: failures.find((failure) => failure.check === "bone-indices")?.measured ?? 0,
    invalidWeights: failures.find((failure) => failure.check === "skin-weights")?.measured ?? 0,
    unnormalizedWeights: failures.find((failure) => failure.check === "weight-normalization")?.measured ?? 0,
    missingProtectedVertices,
    failures
  };
}

function identityMatrices(count) {
  const values = [];
  for (let index = 0; index < count; index += 1) {
    values.push(1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  return values;
}

function transformPoint(matrix, x, y, z) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  ];
}

function deformedPositions(geometryInput, source, pose = null) {
  const geometry = validatePortableTriangleGeometry(geometryInput);
  const skinIndices = firstAttribute(geometry, ["skinIndex", "skinIndices", "joints", "JOINTS_0"]);
  const skinWeights = firstAttribute(geometry, ["skinWeight", "skinWeights", "weights", "WEIGHTS_0"]);
  const skinning = skinningMetadata(source);
  if (!skinIndices || !skinWeights || !skinning) return geometry.positions.slice();
  const boneCount = Math.max(1, Math.floor(finiteNumber(skinning.boneCount, 1)));
  const matrices = Array.from(pose?.boneMatrices ?? pose?.skinMatrices ?? identityMatrices(boneCount));
  if (matrices.length !== boneCount * 16) throw new TypeError(`Pose ${pose?.id ?? "rest"} must provide ${boneCount * 16} matrix values.`);
  const output = new Array(geometry.positions.length).fill(0);
  const vertexCount = geometry.positions.length / 3;
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    const x = geometry.positions[vertex * 3];
    const y = geometry.positions[vertex * 3 + 1];
    const z = geometry.positions[vertex * 3 + 2];
    let accumulated = 0;
    for (let influence = 0; influence < skinWeights.itemSize; influence += 1) {
      const offset = vertex * skinWeights.itemSize + influence;
      const weight = Number(skinWeights.values[offset]);
      if (!(weight > 0)) continue;
      const bone = Number(skinIndices.values[offset]);
      const matrix = matrices.slice(bone * 16, bone * 16 + 16);
      const point = transformPoint(matrix, x, y, z);
      output[vertex * 3] += point[0] * weight;
      output[vertex * 3 + 1] += point[1] * weight;
      output[vertex * 3 + 2] += point[2] * weight;
      accumulated += weight;
    }
    if (accumulated <= 1e-8) {
      output[vertex * 3] = x;
      output[vertex * 3 + 1] = y;
      output[vertex * 3 + 2] = z;
    }
  }
  return output;
}

function sampleVertices(indices, limit) {
  const values = Array.from(new Set(indices));
  if (values.length <= limit) return values;
  const stride = values.length / limit;
  const result = [];
  for (let index = 0; index < limit; index += 1) result.push(values[Math.floor(index * stride)]);
  return result;
}

function distanceAt(sourcePositions, candidatePositions, sourceIndex, candidateIndex = sourceIndex) {
  const sx = sourcePositions[sourceIndex * 3];
  const sy = sourcePositions[sourceIndex * 3 + 1];
  const sz = sourcePositions[sourceIndex * 3 + 2];
  const cx = candidatePositions[candidateIndex * 3];
  const cy = candidatePositions[candidateIndex * 3 + 1];
  const cz = candidatePositions[candidateIndex * 3 + 2];
  return Math.hypot(sx - cx, sy - cy, sz - cz);
}

function nearestDistance(sourcePositions, x, y, z, sourceSample) {
  let best = Infinity;
  for (const vertex of sourceSample) {
    const distance = Math.hypot(
      sourcePositions[vertex * 3] - x,
      sourcePositions[vertex * 3 + 1] - y,
      sourcePositions[vertex * 3 + 2] - z
    );
    if (distance < best) best = distance;
  }
  return best;
}

function deformationEvidence(source, candidateGeometry, config) {
  if (!config.deformation.enabled) return { status: "not-required", poseCount: 0, failures: [] };
  const skinning = skinningMetadata(source);
  if (!skinning) return { status: config.requireSkinning ? "failed" : "not-applicable", poseCount: 0, failures: config.requireSkinning ? [{ check: "pose-suite", message: "Skinned qualification requires source skinning metadata." }] : [] };
  const sourceGeometry = validatePortableTriangleGeometry(source.geometry);
  const candidate = validatePortableTriangleGeometry(candidateGeometry);
  const poses = (skinning.validationPoses ?? skinning.poses ?? [{ id: "rest", boneMatrices: identityMatrices(Math.max(1, skinning.boneCount ?? 1)) }]).map((pose, index) => ({ id: String(pose.id ?? `pose-${index}`), ...clone(pose) }));
  const sourceMetrics = computeShapeMetrics(sourceGeometry);
  const sourceExtent = Math.max(1e-9, sourceMetrics.bounds.size[1], sourceMetrics.bounds.radius * 2);
  const protectedVertices = protectedVertexList(source);
  let squared = 0;
  let samples = 0;
  let maximumSurfaceError = 0;
  let maximumProtectedError = 0;
  const failedPoses = [];
  const sourceVertexCount = sourceGeometry.positions.length / 3;
  const candidateVertexCount = candidate.positions.length / 3;
  for (const pose of poses) {
    const sourcePositions = deformedPositions(sourceGeometry, source, pose);
    const candidatePositions = deformedPositions(candidate, source, pose);
    const candidateSample = sampleVertices(candidate.indices, config.deformation.sampleLimit);
    const sourceSample = sampleVertices(sourceGeometry.indices, Math.max(config.deformation.sampleLimit * 4, 512));
    let poseMaximum = 0;
    for (const vertex of candidateSample) {
      let distance;
      if (sourceVertexCount === candidateVertexCount && vertex < sourceVertexCount) {
        distance = distanceAt(sourcePositions, candidatePositions, vertex);
      } else {
        distance = nearestDistance(
          sourcePositions,
          candidatePositions[vertex * 3],
          candidatePositions[vertex * 3 + 1],
          candidatePositions[vertex * 3 + 2],
          sourceSample
        );
      }
      const normalized = distance / sourceExtent;
      squared += normalized * normalized;
      samples += 1;
      poseMaximum = Math.max(poseMaximum, normalized);
      maximumSurfaceError = Math.max(maximumSurfaceError, normalized);
    }
    for (const vertex of protectedVertices) {
      if (vertex >= sourceVertexCount || vertex >= candidateVertexCount) continue;
      maximumProtectedError = Math.max(maximumProtectedError, distanceAt(sourcePositions, candidatePositions, vertex) / sourceExtent);
    }
    if (poseMaximum > config.deformation.maximumSurfaceError) failedPoses.push(pose.id);
  }
  const rootMeanSquareError = Math.sqrt(squared / Math.max(1, samples));
  const failures = [];
  if (rootMeanSquareError > config.deformation.maximumRmsError) failures.push({ check: "deformation-rms", measured: rootMeanSquareError, allowed: config.deformation.maximumRmsError });
  if (maximumSurfaceError > config.deformation.maximumSurfaceError) failures.push({ check: "deformation-maximum", measured: maximumSurfaceError, allowed: config.deformation.maximumSurfaceError });
  if (maximumProtectedError > config.deformation.maximumProtectedError) failures.push({ check: "protected-deformation", measured: maximumProtectedError, allowed: config.deformation.maximumProtectedError });
  return {
    status: failures.length ? "failed" : "passed",
    poseCount: poses.length,
    poseIds: poses.map((pose) => pose.id),
    rootMeanSquareError,
    maximumSurfaceError,
    maximumProtectedError,
    failedPoses,
    failures
  };
}

function viewBasis(view) {
  const azimuth = finiteNumber(view.azimuth, 0) * Math.PI / 180;
  const elevation = finiteNumber(view.elevation, 0) * Math.PI / 180;
  const forward = [Math.cos(elevation) * Math.sin(azimuth), Math.sin(elevation), Math.cos(elevation) * Math.cos(azimuth)];
  const upReference = Math.abs(forward[1]) > 0.98 ? [0, 0, 1] : [0, 1, 0];
  const right = [
    upReference[1] * forward[2] - upReference[2] * forward[1],
    upReference[2] * forward[0] - upReference[0] * forward[2],
    upReference[0] * forward[1] - upReference[1] * forward[0]
  ];
  const rightLength = Math.max(1e-9, Math.hypot(...right));
  for (let axis = 0; axis < 3; axis += 1) right[axis] /= rightLength;
  const up = [
    forward[1] * right[2] - forward[2] * right[1],
    forward[2] * right[0] - forward[0] * right[2],
    forward[0] * right[1] - forward[1] * right[0]
  ];
  return { right, up };
}

function projectPositions(positions, basis) {
  const result = new Array(positions.length / 3 * 2);
  for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
    const x = positions[vertex * 3];
    const y = positions[vertex * 3 + 1];
    const z = positions[vertex * 3 + 2];
    result[vertex * 2] = x * basis.right[0] + y * basis.right[1] + z * basis.right[2];
    result[vertex * 2 + 1] = x * basis.up[0] + y * basis.up[1] + z * basis.up[2];
  }
  return result;
}

function projectionBounds(sourceProjected) {
  const min = [Infinity, Infinity];
  const max = [-Infinity, -Infinity];
  for (let index = 0; index < sourceProjected.length; index += 2) {
    min[0] = Math.min(min[0], sourceProjected[index]);
    min[1] = Math.min(min[1], sourceProjected[index + 1]);
    max[0] = Math.max(max[0], sourceProjected[index]);
    max[1] = Math.max(max[1], sourceProjected[index + 1]);
  }
  const paddingX = Math.max(1e-6, (max[0] - min[0]) * 0.02);
  const paddingY = Math.max(1e-6, (max[1] - min[1]) * 0.02);
  return { min: [min[0] - paddingX, min[1] - paddingY], max: [max[0] + paddingX, max[1] + paddingY] };
}

function edge(ax, ay, bx, by, px, py) {
  return (px - ax) * (by - ay) - (py - ay) * (bx - ax);
}

function rasterize(projected, indices, bounds, gridSize) {
  const occupied = new Set();
  const width = Math.max(1e-9, bounds.max[0] - bounds.min[0]);
  const height = Math.max(1e-9, bounds.max[1] - bounds.min[1]);
  const toGrid = (x, y) => [
    (x - bounds.min[0]) / width * (gridSize - 1),
    (y - bounds.min[1]) / height * (gridSize - 1)
  ];
  for (let index = 0; index < indices.length; index += 3) {
    const a = toGrid(projected[indices[index] * 2], projected[indices[index] * 2 + 1]);
    const b = toGrid(projected[indices[index + 1] * 2], projected[indices[index + 1] * 2 + 1]);
    const c = toGrid(projected[indices[index + 2] * 2], projected[indices[index + 2] * 2 + 1]);
    const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
    const maxX = Math.min(gridSize - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
    const maxY = Math.min(gridSize - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
    const area = edge(a[0], a[1], b[0], b[1], c[0], c[1]);
    if (Math.abs(area) <= 1e-9) continue;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const px = x + 0.5;
        const py = y + 0.5;
        const e0 = edge(a[0], a[1], b[0], b[1], px, py);
        const e1 = edge(b[0], b[1], c[0], c[1], px, py);
        const e2 = edge(c[0], c[1], a[0], a[1], px, py);
        if ((e0 >= 0 && e1 >= 0 && e2 >= 0) || (e0 <= 0 && e1 <= 0 && e2 <= 0)) occupied.add(y * gridSize + x);
      }
    }
  }
  return occupied;
}

function intersectionOverUnion(left, right) {
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  const union = left.size + right.size - intersection;
  return union ? intersection / union : 1;
}

function silhouetteEvidence(source, candidateGeometry, config) {
  if (!config.silhouette.enabled) return { status: "not-required", views: 0, failures: [] };
  const sourceGeometry = validatePortableTriangleGeometry(source.geometry);
  const candidate = validatePortableTriangleGeometry(candidateGeometry);
  const skinning = skinningMetadata(source);
  const poses = (skinning?.validationPoses ?? skinning?.poses ?? [null]).slice(0, config.silhouette.poseLimit);
  const values = [];
  for (let poseIndex = 0; poseIndex < poses.length; poseIndex += 1) {
    const pose = poses[poseIndex];
    const sourcePositions = deformedPositions(sourceGeometry, source, pose);
    const candidatePositions = deformedPositions(candidate, source, pose);
    for (const view of config.silhouette.views) {
      const basis = viewBasis(view);
      const sourceProjected = projectPositions(sourcePositions, basis);
      const candidateProjected = projectPositions(candidatePositions, basis);
      const bounds = projectionBounds(sourceProjected);
      const sourceMask = rasterize(sourceProjected, sourceGeometry.indices, bounds, config.silhouette.gridSize);
      const candidateMask = rasterize(candidateProjected, candidate.indices, bounds, config.silhouette.gridSize);
      values.push({
        poseId: pose?.id ?? `pose-${poseIndex}`,
        azimuth: finiteNumber(view.azimuth, 0),
        elevation: finiteNumber(view.elevation, 0),
        intersectionOverUnion: intersectionOverUnion(sourceMask, candidateMask)
      });
    }
  }
  const minimumIntersectionOverUnion = values.reduce((minimum, value) => Math.min(minimum, value.intersectionOverUnion), 1);
  const averageIntersectionOverUnion = values.reduce((sum, value) => sum + value.intersectionOverUnion, 0) / Math.max(1, values.length);
  const worstView = values.reduce((worst, value) => !worst || value.intersectionOverUnion < worst.intersectionOverUnion ? value : worst, null);
  const failures = minimumIntersectionOverUnion < config.silhouette.minimumIoU
    ? [{ check: "silhouette-iou", measured: minimumIntersectionOverUnion, allowed: config.silhouette.minimumIoU, worstView }]
    : [];
  return {
    status: failures.length ? "failed" : "passed",
    views: values.length,
    minimumIntersectionOverUnion,
    averageIntersectionOverUnion,
    worstView,
    failures
  };
}

export function createShapeFallbackTargets(profile = {}, target = {}) {
  const config = qualificationConfig(profile, target);
  const targets = [{ ...clone(target), requestedRatio: target.ratio, fallback: false }];
  if (target.mode === "source" || target.ratio >= 1) return targets;
  for (const ratio of [...config.fallbackRatios, 1]) {
    if (ratio <= target.ratio || targets.some((entry) => Math.abs(entry.ratio - ratio) <= 1e-9)) continue;
    targets.push({
      ...clone(target),
      ratio,
      mode: ratio >= 1 ? "source" : target.mode,
      requestedRatio: target.ratio,
      fallback: true,
      options: { ...clone(target.options ?? {}), qualificationFallback: true }
    });
  }
  return targets;
}

export function createObjectShapeQualification(input = {}) {
  const evidence = {
    schema: NEXUS_OBJECT_SHAPE_QUALIFICATION_SCHEMA,
    id: String(input.id ?? "").trim(),
    candidateShapeId: String(input.candidateShapeId ?? "").trim(),
    objectId: String(input.objectId ?? "").trim(),
    objectContentHash: String(input.objectContentHash ?? "").trim(),
    sourceShapeId: String(input.sourceShapeId ?? "").trim(),
    sourceContentHash: String(input.sourceContentHash ?? "").trim(),
    profileId: String(input.profileId ?? "").trim(),
    targetId: String(input.targetId ?? "").trim(),
    provider: clone(input.provider ?? {}),
    mode: String(input.mode ?? "geometry"),
    status: String(input.status ?? "rejected"),
    attempt: Math.max(0, Math.floor(finiteNumber(input.attempt, 0))),
    requestedRatio: Math.max(0.001, Math.min(1, finiteNumber(input.requestedRatio, 1))),
    attemptedRatio: Math.max(0.001, Math.min(1, finiteNumber(input.attemptedRatio, 1))),
    fallback: Boolean(input.fallback),
    thresholds: clone(input.thresholds ?? {}),
    structure: clone(input.structure ?? {}),
    deformation: clone(input.deformation ?? {}),
    silhouette: clone(input.silhouette ?? {}),
    quality: clone(input.quality ?? {}),
    failures: clone(input.failures ?? []),
    reproducibility: clone(input.reproducibility ?? {}),
    metadata: clone(input.metadata ?? {})
  };
  for (const [key, value] of Object.entries({
    id: evidence.id,
    candidateShapeId: evidence.candidateShapeId,
    objectId: evidence.objectId,
    objectContentHash: evidence.objectContentHash,
    sourceShapeId: evidence.sourceShapeId,
    sourceContentHash: evidence.sourceContentHash,
    profileId: evidence.profileId,
    targetId: evidence.targetId
  })) {
    if (!value) throw new TypeError(`Object shape qualification ${key} requires a non-empty value.`);
  }
  if (!["approved", "rejected"].includes(evidence.status)) throw new TypeError(`Unsupported shape qualification status: ${evidence.status}.`);
  evidence.contentHash = hashValue(evidence);
  structuredClone(evidence);
  return Object.freeze(evidence);
}

export function qualifyObjectShapeCandidate(input = {}) {
  const { source, profile, target, candidate, provider = {}, attempt = 0 } = input;
  if (!source?.geometry) throw new TypeError("Object Shape qualification requires inline source geometry.");
  if (!candidate?.geometry) throw new TypeError("Object Shape qualification requires inline candidate geometry.");
  const config = qualificationConfig(profile, target);
  const structure = validateSkinStructure(source, candidate.geometry, config, candidate.metadata ?? {});
  const deformation = structure.status === "passed"
    ? deformationEvidence(source, candidate.geometry, config)
    : { status: "blocked", poseCount: 0, failures: [] };
  const silhouette = structure.status === "passed" && deformation.status !== "failed"
    ? silhouetteEvidence(source, candidate.geometry, config)
    : { status: "blocked", views: 0, failures: [] };
  const sourceMetrics = source.metrics ?? computeShapeMetrics(source.geometry);
  const candidateMetrics = candidate.metrics ?? computeShapeMetrics(candidate.geometry);
  const quality = { ...compareShapeMetrics(sourceMetrics, candidateMetrics), ...clone(candidate.quality ?? {}) };
  const failures = [...(structure.failures ?? []), ...(deformation.failures ?? []), ...(silhouette.failures ?? [])];
  const status = failures.length ? "rejected" : "approved";
  return createObjectShapeQualification({
    id: `${candidate.id}:qualification`,
    candidateShapeId: candidate.id,
    objectId: source.objectId,
    objectContentHash: source.objectContentHash,
    sourceShapeId: source.id,
    sourceContentHash: source.contentHash,
    profileId: profile.id,
    targetId: target.id,
    provider,
    mode: config.mode,
    status,
    attempt,
    requestedRatio: target.requestedRatio ?? target.ratio,
    attemptedRatio: target.ratio,
    fallback: Boolean(target.fallback),
    thresholds: {
      structure: config.structure,
      deformation: config.deformation,
      silhouette: config.silhouette
    },
    structure,
    deformation,
    silhouette,
    quality,
    failures,
    reproducibility: {
      sourceObjectContentHash: source.objectContentHash,
      sourceShapeContentHash: source.contentHash,
      profileContentHash: profile.contentHash,
      providerId: provider.id ?? "object-shape-provider",
      providerVersion: provider.version ?? "0.1.0",
      targetRatio: target.ratio,
      maximumDeviation: target.maximumDeviation,
      options: clone(target.options ?? {}),
      poseSuiteVersion: config.poseSuiteVersion,
      qualificationHash: hashValue({
        mode: config.mode,
        structure: config.structure,
        deformation: config.deformation,
        silhouette: config.silhouette
      })
    }
  });
}
