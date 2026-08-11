import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const DETECTION_SCHEMAS = Object.freeze({
  bounds: "nexusengine.physics-detection-bounds/1",
  proxy: "nexusengine.physics-detection-proxy/1",
  pair: "nexusengine.physics-broad-phase-pair/1",
  pose: "nexusengine.physics-detection-pose/1",
  gjkResult: "nexusengine.physics-gjk-result/1",
  penetration: "nexusengine.physics-penetration-result/1",
  result: "nexusengine.physics-collision-detection-result/1",
  sweep: "nexusengine.physics-continuous-collision-result/1",
  tree: "nexusengine.physics-dynamic-aabb-tree/1",
  defineProxy: "nexusengine.physics-detection-proxy-define-command/1",
  replaceProxy: "nexusengine.physics-detection-proxy-replace-command/1",
  removeProxy: "nexusengine.physics-detection-proxy-remove-command/1"
});

export const DETECTION_RESULT_STATUSES = Object.freeze([
  "separated",
  "touching",
  "penetrating",
  "unsupported",
  "indeterminate"
]);

export const CONVEX_SUPPORT_SHAPE_TYPES = Object.freeze([
  "sphere",
  "box",
  "capsule",
  "cylinder",
  "cone",
  "convex"
]);

const STANDARD_SNAPSHOT_FIELDS = Object.freeze([
  "id",
  "domain",
  "version",
  "config",
  "descriptors",
  "policies",
  "adapters",
  "metadata",
  "sequence",
  "lastEvent",
  "operationReceipts"
]);

function normalizeSignedZero(value) {
  if (Array.isArray(value)) return value.map(normalizeSignedZero);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeSignedZero(value[key])]));
  }
  return Object.is(value, -0) ? 0 : value;
}

export function canonicalDetectionValue(value, label = "Detection value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireDetectionObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectDetectionFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length > 0) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireDetectionText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireDetectionNumber(value, label, { minimum = -Infinity, maximum = Infinity } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (value < minimum || value > maximum) {
    throw new TypeError(`${label} must be between ${minimum} and ${maximum}.`);
  }
  return Object.is(value, -0) ? 0 : value;
}

export function requireDetectionInteger(value, label, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be an integer between ${minimum} and ${maximum}.`);
  }
  return value;
}

export function requireDetectionBoolean(value, label, fallback) {
  const selected = value ?? fallback;
  if (typeof selected !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return selected;
}

function normalizeSchema(value, expected, label) {
  const schema = value ?? expected;
  if (schema !== expected) throw new TypeError(`${label}.schema must equal ${expected}.`);
  return schema;
}

export function normalizeDetectionVector(value, label, fallback) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== 3) throw new TypeError(`${label} must contain three numbers.`);
  return source.map((entry, index) => requireDetectionNumber(entry, `${label}[${index}]`));
}

export function normalizeDetectionQuaternion(value, label = "Detection quaternion") {
  const quaternion = value ?? [0, 0, 0, 1];
  if (!Array.isArray(quaternion) || quaternion.length !== 4) {
    throw new TypeError(`${label} must contain four numbers.`);
  }
  const finite = quaternion.map((entry, index) => requireDetectionNumber(entry, `${label}[${index}]`));
  const magnitude = Math.hypot(...finite);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  const normalized = finite.map((entry) => entry / magnitude);
  const decisive = [normalized[3], normalized[0], normalized[1], normalized[2]].find((entry) => Math.abs(entry) > 1e-12) ?? 1;
  const sign = decisive < 0 ? -1 : 1;
  return normalized.map((entry) => normalizeSignedZero(entry * sign));
}

export function normalizeDetectionPose(input = {}, label = "Detection pose") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, ["schema", "position", "rotation"], label);
  const value = canonicalDetectionValue(input, label);
  return {
    schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.pose, label),
    position: normalizeDetectionVector(value.position, `${label}.position`, [0, 0, 0]),
    rotation: normalizeDetectionQuaternion(value.rotation, `${label}.rotation`)
  };
}

export function normalizeDetectionBounds(input = {}, label = "Detection bounds") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, ["schema", "kind", "min", "max"], label);
  const value = canonicalDetectionValue(input, label);
  const kind = value.kind ?? "finite";
  if (kind === "unbounded") {
    if (value.min !== undefined || value.max !== undefined) {
      throw new TypeError(`${label} cannot include min or max when kind is unbounded.`);
    }
    return { schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.bounds, label), kind };
  }
  if (kind !== "finite") throw new TypeError(`${label}.kind must be finite or unbounded.`);
  const min = normalizeDetectionVector(value.min, `${label}.min`);
  const max = normalizeDetectionVector(value.max, `${label}.max`);
  for (let axis = 0; axis < 3; axis += 1) {
    if (min[axis] > max[axis]) throw new TypeError(`${label}.min[${axis}] cannot exceed max[${axis}].`);
  }
  return { schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.bounds, label), kind, min, max };
}

export function detectionBoundsOverlap(leftInput, rightInput, tolerance = 0) {
  const left = normalizeDetectionBounds(leftInput, "Left Detection bounds");
  const right = normalizeDetectionBounds(rightInput, "Right Detection bounds");
  const margin = requireDetectionNumber(tolerance, "Detection bounds tolerance", { minimum: 0 });
  if (left.kind === "unbounded" || right.kind === "unbounded") return true;
  return left.min.every((minimum, axis) => minimum <= right.max[axis] + margin)
    && right.min.every((minimum, axis) => minimum <= left.max[axis] + margin);
}

export function mergeDetectionBounds(inputs, label = "Detection bounds collection") {
  if (!Array.isArray(inputs) || inputs.length === 0) throw new TypeError(`${label} must not be empty.`);
  const bounds = inputs.map((entry, index) => normalizeDetectionBounds(entry, `${label}[${index}]`));
  if (bounds.some((entry) => entry.kind === "unbounded")) {
    return { schema: DETECTION_SCHEMAS.bounds, kind: "unbounded" };
  }
  return normalizeDetectionBounds({
    min: [0, 1, 2].map((axis) => Math.min(...bounds.map((entry) => entry.min[axis]))),
    max: [0, 1, 2].map((axis) => Math.max(...bounds.map((entry) => entry.max[axis])))
  }, label);
}

export function normalizeDetectionFilter(input = {}, label = "Detection filter") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, ["layer", "maskLayers", "maskBits", "groupId", "excludedColliderIds"], label);
  const value = canonicalDetectionValue(input, label);
  const layer = requireDetectionInteger(value.layer ?? 0, `${label}.layer`, { maximum: 30 });
  const maximumBits = (2 ** 31) - 1;
  let maskLayers;
  if (value.maskLayers === undefined) {
    const bits = requireDetectionInteger(value.maskBits ?? 1, `${label}.maskBits`, { maximum: maximumBits });
    maskLayers = [];
    for (let candidate = 0; candidate <= 30; candidate += 1) {
      if (Math.floor(bits / (2 ** candidate)) % 2 === 1) maskLayers.push(candidate);
    }
  } else {
    if (!Array.isArray(value.maskLayers)) throw new TypeError(`${label}.maskLayers must be an array.`);
    maskLayers = [...new Set(value.maskLayers.map((entry, index) => requireDetectionInteger(entry, `${label}.maskLayers[${index}]`, { maximum: 30 })))].sort((a, b) => a - b);
  }
  const maskBits = maskLayers.reduce((bits, candidate) => bits + (2 ** candidate), 0);
  if (value.maskBits !== undefined && requireDetectionInteger(value.maskBits, `${label}.maskBits`, { maximum: maximumBits }) !== maskBits) {
    throw new TypeError(`${label}.maskBits must equal maskLayers.`);
  }
  const excludedColliderIds = value.excludedColliderIds ?? [];
  if (!Array.isArray(excludedColliderIds)) throw new TypeError(`${label}.excludedColliderIds must be an array.`);
  return {
    layer,
    maskLayers,
    maskBits,
    groupId: value.groupId === undefined || value.groupId === null ? null : requireDetectionText(value.groupId, `${label}.groupId`),
    excludedColliderIds: [...new Set(excludedColliderIds.map((entry, index) => requireDetectionText(entry, `${label}.excludedColliderIds[${index}]`)))].sort()
  };
}

export function normalizeDetectionProxy(input = {}, label = "Detection proxy") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, [
    "schema", "id", "colliderId", "bodyId", "shapeId", "bounds", "filter",
    "linearVelocity", "active", "revision", "metadata"
  ], label);
  const value = canonicalDetectionValue(input, label);
  const id = requireDetectionText(value.id ?? value.colliderId, `${label}.id`);
  return {
    schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.proxy, label),
    id,
    colliderId: requireDetectionText(value.colliderId ?? id, `${label}.colliderId`),
    bodyId: value.bodyId === undefined || value.bodyId === null ? null : requireDetectionText(value.bodyId, `${label}.bodyId`),
    shapeId: value.shapeId === undefined || value.shapeId === null ? null : requireDetectionText(value.shapeId, `${label}.shapeId`),
    bounds: normalizeDetectionBounds(value.bounds, `${label}.bounds`),
    filter: normalizeDetectionFilter(value.filter ?? {}, `${label}.filter`),
    linearVelocity: normalizeDetectionVector(value.linearVelocity, `${label}.linearVelocity`, [0, 0, 0]),
    active: requireDetectionBoolean(value.active, `${label}.active`, true),
    revision: requireDetectionInteger(value.revision ?? 1, `${label}.revision`, { minimum: 1 }),
    metadata: canonicalDetectionValue(value.metadata ?? {}, `${label}.metadata`)
  };
}

export function detectionProxyPairAllowed(leftInput, rightInput) {
  const left = normalizeDetectionProxy(leftInput, "Left Detection proxy");
  const right = normalizeDetectionProxy(rightInput, "Right Detection proxy");
  if (!left.active || !right.active || left.id === right.id || left.colliderId === right.colliderId) return false;
  if (left.filter.excludedColliderIds.includes(right.colliderId) || right.filter.excludedColliderIds.includes(left.colliderId)) return false;
  if (!left.filter.maskLayers.includes(right.filter.layer) || !right.filter.maskLayers.includes(left.filter.layer)) return false;
  return true;
}

export function normalizeBroadPhasePair(input = {}, label = "Broad-phase pair") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, ["schema", "id", "proxyAId", "proxyBId", "colliderAId", "colliderBId"], label);
  const value = canonicalDetectionValue(input, label);
  const first = {
    proxyId: requireDetectionText(value.proxyAId, `${label}.proxyAId`),
    colliderId: requireDetectionText(value.colliderAId, `${label}.colliderAId`)
  };
  const second = {
    proxyId: requireDetectionText(value.proxyBId, `${label}.proxyBId`),
    colliderId: requireDetectionText(value.colliderBId, `${label}.colliderBId`)
  };
  if (first.proxyId === second.proxyId || first.colliderId === second.colliderId) {
    throw new TypeError(`${label} must reference two different proxies and colliders.`);
  }
  const [a, b] = first.proxyId.localeCompare(second.proxyId) <= 0 ? [first, second] : [second, first];
  const id = `${a.proxyId}|${b.proxyId}`;
  if (value.id !== undefined && value.id !== id) throw new TypeError(`${label}.id must equal ${id}.`);
  return {
    schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.pair, label),
    id,
    proxyAId: a.proxyId,
    proxyBId: b.proxyId,
    colliderAId: a.colliderId,
    colliderBId: b.colliderId
  };
}

export function createBroadPhasePair(leftInput, rightInput) {
  const left = normalizeDetectionProxy(leftInput, "Left Detection proxy");
  const right = normalizeDetectionProxy(rightInput, "Right Detection proxy");
  return normalizeBroadPhasePair({
    proxyAId: left.id,
    proxyBId: right.id,
    colliderAId: left.colliderId,
    colliderBId: right.colliderId
  });
}

export function normalizeDetectionShape(input = {}, label = "Detection shape") {
  requireDetectionObject(input, label);
  const value = canonicalDetectionValue(input, label);
  const type = requireDetectionText(value.type, `${label}.type`);
  const id = requireDetectionText(value.id, `${label}.id`);
  return { ...value, id, type };
}

export function normalizeDetectionInput(input = {}, label = "Collision detection input") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, ["shapeA", "shapeB", "poseA", "poseB", "tolerance", "maxIterations", "metadata"], label);
  const value = canonicalDetectionValue(input, label);
  return {
    shapeA: normalizeDetectionShape(value.shapeA, `${label}.shapeA`),
    shapeB: normalizeDetectionShape(value.shapeB, `${label}.shapeB`),
    poseA: normalizeDetectionPose(value.poseA ?? {}, `${label}.poseA`),
    poseB: normalizeDetectionPose(value.poseB ?? {}, `${label}.poseB`),
    tolerance: requireDetectionNumber(value.tolerance ?? 1e-7, `${label}.tolerance`, { minimum: 1e-12, maximum: 1 }),
    maxIterations: requireDetectionInteger(value.maxIterations ?? 32, `${label}.maxIterations`, { minimum: 1, maximum: 256 }),
    metadata: canonicalDetectionValue(value.metadata ?? {}, `${label}.metadata`)
  };
}

export function normalizeContinuousCollisionInput(input = {}, label = "Continuous collision input") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, [
    "shapeA", "shapeB", "poseA", "poseB", "velocityA", "velocityB", "maxTime",
    "tolerance", "maxIterations", "metadata"
  ], label);
  const value = canonicalDetectionValue(input, label);
  return {
    ...normalizeDetectionInput({
      shapeA: value.shapeA,
      shapeB: value.shapeB,
      poseA: value.poseA,
      poseB: value.poseB,
      tolerance: value.tolerance,
      maxIterations: value.maxIterations,
      metadata: value.metadata
    }, label),
    velocityA: normalizeDetectionVector(value.velocityA, `${label}.velocityA`, [0, 0, 0]),
    velocityB: normalizeDetectionVector(value.velocityB, `${label}.velocityB`, [0, 0, 0]),
    maxTime: requireDetectionNumber(value.maxTime ?? 1, `${label}.maxTime`, { minimum: 0 })
  };
}

function normalizeOptionalVector(value, label) {
  return value === null || value === undefined ? null : normalizeDetectionVector(value, label);
}

export function normalizeCollisionDetectionResult(input = {}, label = "Collision detection result") {
  requireDetectionObject(input, label);
  rejectDetectionFields(input, [
    "schema", "status", "intersects", "algorithm", "iterations", "normal", "depth",
    "pointA", "pointB", "timeOfImpact", "reason", "pair", "metadata"
  ], label);
  const value = canonicalDetectionValue(input, label);
  const status = value.status ?? "indeterminate";
  if (!DETECTION_RESULT_STATUSES.includes(status)) {
    throw new TypeError(`${label}.status must be one of ${DETECTION_RESULT_STATUSES.join(", ")}.`);
  }
  const intersects = Boolean(value.intersects);
  if (intersects !== ["touching", "penetrating"].includes(status)) {
    throw new TypeError(`${label}.intersects is inconsistent with status ${status}.`);
  }
  const depth = requireDetectionNumber(value.depth ?? 0, `${label}.depth`, { minimum: 0 });
  if (status !== "penetrating" && depth !== 0) throw new TypeError(`${label}.depth must be zero unless status is penetrating.`);
  return {
    schema: normalizeSchema(value.schema, DETECTION_SCHEMAS.result, label),
    status,
    intersects,
    algorithm: requireDetectionText(value.algorithm ?? "none", `${label}.algorithm`),
    iterations: requireDetectionInteger(value.iterations ?? 0, `${label}.iterations`),
    normal: normalizeOptionalVector(value.normal, `${label}.normal`),
    depth,
    pointA: normalizeOptionalVector(value.pointA, `${label}.pointA`),
    pointB: normalizeOptionalVector(value.pointB, `${label}.pointB`),
    timeOfImpact: value.timeOfImpact === null || value.timeOfImpact === undefined
      ? null
      : requireDetectionNumber(value.timeOfImpact, `${label}.timeOfImpact`, { minimum: 0 }),
    reason: value.reason === null || value.reason === undefined ? null : requireDetectionText(value.reason, `${label}.reason`),
    pair: value.pair === null || value.pair === undefined ? null : normalizeBroadPhasePair(value.pair, `${label}.pair`),
    metadata: canonicalDetectionValue(value.metadata ?? {}, `${label}.metadata`)
  };
}

export function compareCollisionDetectionResults(leftInput, rightInput) {
  const left = normalizeCollisionDetectionResult(leftInput, "Left collision result");
  const right = normalizeCollisionDetectionResult(rightInput, "Right collision result");
  const leftPair = left.pair?.id ?? "";
  const rightPair = right.pair?.id ?? "";
  return leftPair.localeCompare(rightPair)
    || left.status.localeCompare(right.status)
    || left.algorithm.localeCompare(right.algorithm);
}

function normalizeProxyCommand(command, schema, allowedFields, label) {
  requireDetectionObject(command, label);
  rejectDetectionFields(command, ["schema", "operationId", ...allowedFields], label);
  const value = canonicalDetectionValue(command, label);
  return {
    schema: normalizeSchema(value.schema, schema, label),
    operationId: requireDetectionText(value.operationId, `${label}.operationId`),
    value
  };
}

export function normalizeProxyDefinitionCommand(command = {}) {
  const normalized = normalizeProxyCommand(command, DETECTION_SCHEMAS.defineProxy, ["proxy"], "Detection proxy definition command");
  return { schema: normalized.schema, operationId: normalized.operationId, proxy: normalizeDetectionProxy(normalized.value.proxy) };
}

export function normalizeProxyReplacementCommand(command = {}) {
  const normalized = normalizeProxyCommand(command, DETECTION_SCHEMAS.replaceProxy, ["proxy", "expectedRevision"], "Detection proxy replacement command");
  return {
    schema: normalized.schema,
    operationId: normalized.operationId,
    proxy: normalizeDetectionProxy(normalized.value.proxy),
    ...(normalized.value.expectedRevision === undefined ? {} : {
      expectedRevision: requireDetectionInteger(normalized.value.expectedRevision, "Detection proxy replacement command.expectedRevision", { minimum: 1 })
    })
  };
}

export function normalizeProxyRemovalCommand(command = {}) {
  const normalized = normalizeProxyCommand(command, DETECTION_SCHEMAS.removeProxy, ["proxyId", "expectedRevision"], "Detection proxy removal command");
  return {
    schema: normalized.schema,
    operationId: normalized.operationId,
    proxyId: requireDetectionText(normalized.value.proxyId, "Detection proxy removal command.proxyId"),
    ...(normalized.value.expectedRevision === undefined ? {} : {
      expectedRevision: requireDetectionInteger(normalized.value.expectedRevision, "Detection proxy removal command.expectedRevision", { minimum: 1 })
    })
  };
}

export function normalizeSpatialPartitionSnapshot(snapshot = {}) {
  requireDetectionObject(snapshot, "Physics spatial partition snapshot");
  rejectDetectionFields(snapshot, [...STANDARD_SNAPSHOT_FIELDS, "proxies", "order", "partitionRevision"], "Physics spatial partition snapshot");
  const value = canonicalDetectionValue(snapshot, "Physics spatial partition snapshot");
  if (value.domain !== "physics-spatial-partition") {
    throw new TypeError("Physics spatial partition snapshot.domain must equal physics-spatial-partition.");
  }
  requireDetectionInteger(value.sequence, "Physics spatial partition snapshot.sequence");
  requireDetectionInteger(value.partitionRevision, "Physics spatial partition snapshot.partitionRevision");
  requireDetectionObject(value.proxies, "Physics spatial partition snapshot.proxies");
  const proxies = Object.fromEntries(Object.keys(value.proxies).sort().map((proxyId) => {
    const proxy = normalizeDetectionProxy(value.proxies[proxyId], `Physics spatial partition proxy ${proxyId}`);
    if (proxy.id !== proxyId) throw new TypeError(`Physics spatial partition key ${proxyId} must match proxy.id.`);
    return [proxyId, proxy];
  }));
  const order = Object.keys(proxies).sort();
  if (value.order !== undefined && JSON.stringify(value.order) !== JSON.stringify(order)) {
    throw new TypeError("Physics spatial partition snapshot.order must equal sorted proxy IDs.");
  }
  return { ...value, proxies, order };
}

export function sameDetectionValue(left, right) {
  return JSON.stringify(canonicalDetectionValue(left, "Left Detection value"))
    === JSON.stringify(canonicalDetectionValue(right, "Right Detection value"));
}
