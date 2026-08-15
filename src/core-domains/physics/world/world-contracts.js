import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const PHYSICS_WORLD_SCHEMA = "nexusengine.physics-world/1";
export const PHYSICS_WORLD_SETTINGS_SCHEMA = "nexusengine.physics-world-settings/1";
export const GRAVITY_FIELD_SCHEMA = "nexusengine.physics-gravity-field/1";
export const FORCE_FIELD_SCHEMA = "nexusengine.physics-force-field/1";
export const WIND_FIELD_SCHEMA = "nexusengine.physics-wind-field/1";
export const TIME_SCALE_SCHEMA = "nexusengine.physics-time-scale/1";
export const SIMULATION_REGION_SCHEMA = "nexusengine.physics-simulation-region/1";

function normalizeSignedZero(value) {
  if (typeof value === "number") return Object.is(value, -0) ? 0 : value;
  if (Array.isArray(value)) return value.map(normalizeSignedZero);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeSignedZero(entry)]));
}

const COMMON_STATE_KEYS = Object.freeze([
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

const COORDINATE_SYSTEMS = Object.freeze(["right-handed", "left-handed"]);
const OUT_OF_BOUNDS_POLICIES = Object.freeze(["ignore", "report", "sleep", "disable"]);
const FIELD_FALLOFFS = Object.freeze(["constant", "linear", "inverse", "inverse-square"]);
const FIELD_DIRECTIONS = Object.freeze(["inward", "outward"]);
const FORCE_MODES = Object.freeze(["force", "acceleration"]);
const REGION_BEHAVIORS = Object.freeze(["simulate", "sleep", "disable"]);

export function canonicalWorldValue(value, label = "value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireWorldObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectWorldFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireWorldText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireWorldNumber(value, label, { minimum = -Infinity, maximum = Infinity, exclusiveMinimum = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (exclusiveMinimum ? value <= minimum : value < minimum) {
    throw new TypeError(`${label} must be ${exclusiveMinimum ? "greater than" : "at least"} ${minimum}.`);
  }
  if (value > maximum) throw new TypeError(`${label} must be at most ${maximum}.`);
  return Object.is(value, -0) ? 0 : value;
}

function requireNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${label} must be a nonnegative integer.`);
  return value;
}

function normalizeSchema(value, schema, label) {
  const normalized = value ?? schema;
  if (normalized !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return normalized;
}

function enumValue(value, allowed, label, fallback) {
  const normalized = String(value ?? fallback);
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

function booleanValue(value, label, fallback = true) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return value;
}

function rejectPresent(value, fields, label) {
  const present = fields.filter((field) => value[field] !== undefined);
  if (present.length) throw new TypeError(`${label} does not accept ${present.join(", ")}.`);
}

export function normalizeWorldVector(value, label, fallback = [0, 0, 0], { unit = false } = {}) {
  const source = value === undefined ? fallback : value;
  const vector = Array.isArray(source)
    ? source
    : [source?.x, source?.y, source?.z];
  if (!Array.isArray(vector) || vector.length !== 3) throw new TypeError(`${label} must be a three-number vector.`);
  const normalized = vector.map((entry, index) => requireWorldNumber(entry, `${label}[${index}]`));
  if (!unit) return normalized;
  const magnitude = Math.hypot(...normalized);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  return normalized.map((entry) => entry / magnitude);
}

function normalizeMetadata(value, label) {
  return canonicalWorldValue(value ?? {}, `${label}.metadata`);
}

function normalizeIdList(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return [...new Set(value.map((entry, index) => requireWorldText(entry, `${label}[${index}]`)))].sort();
}

export function normalizeWorldBounds(value, label = "world bounds", { optional = false } = {}) {
  if ((value === undefined || value === null) && optional) return null;
  requireWorldObject(value, label);
  rejectWorldFields(value, ["minimum", "maximum"], label);
  const minimum = normalizeWorldVector(value.minimum, `${label}.minimum`);
  const maximum = normalizeWorldVector(value.maximum, `${label}.maximum`);
  minimum.forEach((entry, index) => {
    if (entry > maximum[index]) throw new TypeError(`${label}.minimum[${index}] cannot exceed maximum[${index}].`);
  });
  return { minimum, maximum };
}

function pointInBounds(point, bounds) {
  if (!bounds) return true;
  return point.every((entry, index) => entry >= bounds.minimum[index] && entry <= bounds.maximum[index]);
}

export function normalizePhysicsWorldSettings(input = {}) {
  requireWorldObject(input, "Physics world settings");
  rejectWorldFields(input, [
    "schema",
    "coordinateSystem",
    "lengthUnitMeters",
    "upAxis",
    "bounds",
    "outOfBoundsPolicy",
    "deterministicOrdering",
    "metadata"
  ], "Physics world settings");
  const value = canonicalWorldValue(input, "Physics world settings");
  const deterministicOrdering = booleanValue(value.deterministicOrdering, "Physics world settings.deterministicOrdering");
  if (!deterministicOrdering) throw new TypeError("Physics world settings.deterministicOrdering must remain true.");
  return {
    schema: normalizeSchema(value.schema, PHYSICS_WORLD_SETTINGS_SCHEMA, "Physics world settings"),
    coordinateSystem: enumValue(value.coordinateSystem, COORDINATE_SYSTEMS, "Physics world settings.coordinateSystem", "right-handed"),
    lengthUnitMeters: requireWorldNumber(value.lengthUnitMeters ?? 1, "Physics world settings.lengthUnitMeters", { minimum: 0, exclusiveMinimum: true }),
    upAxis: normalizeWorldVector(value.upAxis, "Physics world settings.upAxis", [0, 1, 0], { unit: true }),
    bounds: normalizeWorldBounds(value.bounds, "Physics world settings.bounds", { optional: true }),
    outOfBoundsPolicy: enumValue(value.outOfBoundsPolicy, OUT_OF_BOUNDS_POLICIES, "Physics world settings.outOfBoundsPolicy", "report"),
    deterministicOrdering,
    metadata: normalizeMetadata(value.metadata, "Physics world settings")
  };
}

function normalizeFalloff(value, label) {
  return enumValue(value, FIELD_FALLOFFS, label, "constant");
}

function normalizeFieldRange(value, label) {
  const minDistance = requireWorldNumber(value.minDistance ?? 0.001, `${label}.minDistance`, { minimum: 0, exclusiveMinimum: true });
  const maxDistance = requireWorldNumber(value.maxDistance ?? 1000000, `${label}.maxDistance`, { minimum: minDistance });
  return {
    referenceDistance: requireWorldNumber(value.referenceDistance ?? 1, `${label}.referenceDistance`, { minimum: 0, exclusiveMinimum: true }),
    minDistance,
    maxDistance
  };
}

export function normalizeGravityField(input = {}) {
  requireWorldObject(input, "gravity field");
  rejectWorldFields(input, [
    "schema", "id", "kind", "enabled", "vector", "center", "strength", "direction",
    "falloff", "referenceDistance", "minDistance", "maxDistance", "regionIds", "metadata"
  ], "gravity field");
  const value = canonicalWorldValue(input, "gravity field");
  const kind = enumValue(value.kind, ["uniform", "point"], "gravity field.kind", "uniform");
  if (kind === "uniform") {
    rejectPresent(value, ["center", "strength", "direction", "falloff", "referenceDistance", "minDistance", "maxDistance"], "uniform gravity field");
  }
  else rejectPresent(value, ["vector"], "point gravity field");
  const common = {
    schema: normalizeSchema(value.schema, GRAVITY_FIELD_SCHEMA, "gravity field"),
    id: requireWorldText(value.id, "gravity field.id"),
    kind,
    enabled: booleanValue(value.enabled, "gravity field.enabled"),
    regionIds: normalizeIdList(value.regionIds, "gravity field.regionIds"),
    metadata: normalizeMetadata(value.metadata, "gravity field")
  };
  if (kind === "uniform") {
    return { ...common, vector: normalizeWorldVector(value.vector, "gravity field.vector", [0, -9.81, 0]) };
  }
  return {
    ...common,
    center: normalizeWorldVector(value.center, "gravity field.center"),
    strength: requireWorldNumber(value.strength ?? 9.81, "gravity field.strength", { minimum: 0 }),
    direction: enumValue(value.direction, FIELD_DIRECTIONS, "gravity field.direction", "inward"),
    falloff: normalizeFalloff(value.falloff, "gravity field.falloff"),
    ...normalizeFieldRange(value, "gravity field")
  };
}

function falloffWeight(field, distance) {
  if (distance > field.maxDistance) return 0;
  const clamped = Math.max(field.minDistance, distance);
  if (field.falloff === "constant") return 1;
  if (field.falloff === "linear") {
    const range = Math.max(1e-12, field.maxDistance - field.minDistance);
    return Math.max(0, Math.min(1, (field.maxDistance - clamped) / range));
  }
  if (field.falloff === "inverse") return field.referenceDistance / clamped;
  return (field.referenceDistance * field.referenceDistance) / (clamped * clamped);
}

function subtract(left, right) {
  return left.map((entry, index) => {
    const value = entry - right[index];
    return Object.is(value, -0) ? 0 : value;
  });
}

function scale(vector, amount) {
  return vector.map((entry) => {
    const value = entry * amount;
    return Object.is(value, -0) ? 0 : value;
  });
}

function normalizeDirection(vector, fallback = [0, 0, 0]) {
  const magnitude = Math.hypot(...vector);
  return magnitude <= 1e-12
    ? [...fallback]
    : vector.map((entry) => {
      const value = entry / magnitude;
      return Object.is(value, -0) ? 0 : value;
    });
}

export function sampleGravityField(fieldInput, pointInput = [0, 0, 0]) {
  const field = normalizeGravityField(fieldInput);
  const point = normalizeWorldVector(pointInput, "gravity sample point");
  if (!field.enabled) {
    return canonicalWorldValue(
      { fieldId: field.id, acceleration: [0, 0, 0], weight: 0 },
      "gravity field sample"
    );
  }
  if (field.kind === "uniform") {
    return canonicalWorldValue(
      { fieldId: field.id, acceleration: [...field.vector], weight: 1 },
      "gravity field sample"
    );
  }
  const towardCenter = subtract(field.center, point);
  const distance = Math.hypot(...towardCenter);
  const weight = falloffWeight(field, distance);
  const direction = normalizeDirection(towardCenter);
  const polarity = field.direction === "inward" ? 1 : -1;
  return canonicalWorldValue({
    fieldId: field.id,
    acceleration: scale(direction, field.strength * weight * polarity),
    weight
  }, "gravity field sample");
}

export function normalizeForceField(input = {}) {
  requireWorldObject(input, "force field");
  rejectWorldFields(input, [
    "schema", "id", "kind", "mode", "enabled", "vector", "center", "strength", "direction",
    "falloff", "referenceDistance", "minDistance", "maxDistance", "regionIds", "metadata"
  ], "force field");
  const value = canonicalWorldValue(input, "force field");
  const kind = enumValue(value.kind, ["uniform", "radial"], "force field.kind", "uniform");
  if (kind === "uniform") {
    rejectPresent(value, ["center", "strength", "direction", "falloff", "referenceDistance", "minDistance", "maxDistance"], "uniform force field");
  }
  else rejectPresent(value, ["vector"], "radial force field");
  const common = {
    schema: normalizeSchema(value.schema, FORCE_FIELD_SCHEMA, "force field"),
    id: requireWorldText(value.id, "force field.id"),
    kind,
    mode: enumValue(value.mode, FORCE_MODES, "force field.mode", "force"),
    enabled: booleanValue(value.enabled, "force field.enabled"),
    regionIds: normalizeIdList(value.regionIds, "force field.regionIds"),
    metadata: normalizeMetadata(value.metadata, "force field")
  };
  if (kind === "uniform") return { ...common, vector: normalizeWorldVector(value.vector, "force field.vector") };
  return {
    ...common,
    center: normalizeWorldVector(value.center, "force field.center"),
    strength: requireWorldNumber(value.strength ?? 0, "force field.strength", { minimum: 0 }),
    direction: enumValue(value.direction, FIELD_DIRECTIONS, "force field.direction", "outward"),
    falloff: normalizeFalloff(value.falloff, "force field.falloff"),
    ...normalizeFieldRange(value, "force field")
  };
}

export function sampleForceField(fieldInput, pointInput = [0, 0, 0]) {
  const field = normalizeForceField(fieldInput);
  const point = normalizeWorldVector(pointInput, "force sample point");
  let vector = [0, 0, 0];
  let weight = 0;
  if (field.enabled && field.kind === "uniform") {
    vector = [...field.vector];
    weight = 1;
  } else if (field.enabled) {
    const outward = subtract(point, field.center);
    const distance = Math.hypot(...outward);
    weight = falloffWeight(field, distance);
    const direction = normalizeDirection(outward);
    const polarity = field.direction === "outward" ? 1 : -1;
    vector = scale(direction, field.strength * weight * polarity);
  }
  return canonicalWorldValue({
    fieldId: field.id,
    force: field.mode === "force" ? vector : [0, 0, 0],
    acceleration: field.mode === "acceleration" ? vector : [0, 0, 0],
    weight
  }, "force field sample");
}

function normalizePointList(value, label) {
  if (!Array.isArray(value) || value.length < 2) throw new TypeError(`${label} must contain at least two points.`);
  return value.map((entry, index) => normalizeWorldVector(entry, `${label}[${index}]`));
}

export function normalizeWindField(input = {}) {
  requireWorldObject(input, "wind field");
  rejectWorldFields(input, [
    "schema", "id", "kind", "enabled", "velocity", "direction", "speed", "gustAmplitude",
    "gustFrequencyHz", "spatialFrequency", "phase", "density", "turbulence", "points", "radius",
    "edgeWidth", "verticalSpeed", "regionIds", "metadata"
  ], "wind field");
  const value = canonicalWorldValue(input, "wind field");
  const kind = enumValue(value.kind, ["uniform", "gust", "corridor"], "wind field.kind", "uniform");
  if (kind !== "corridor") rejectPresent(value, ["points", "radius", "edgeWidth", "verticalSpeed"], `${kind} wind field`);
  else rejectPresent(value, ["velocity", "direction"], "corridor wind field");
  if (kind === "uniform") rejectPresent(value, ["gustAmplitude", "gustFrequencyHz", "spatialFrequency", "phase"], "uniform wind field");
  if (kind === "uniform" && value.velocity !== undefined) rejectPresent(value, ["direction", "speed"], "velocity-defined uniform wind field");
  if (kind === "gust" && value.velocity !== undefined) rejectPresent(value, ["speed"], "velocity-defined gust wind field");
  const common = {
    schema: normalizeSchema(value.schema, WIND_FIELD_SCHEMA, "wind field"),
    id: requireWorldText(value.id, "wind field.id"),
    kind,
    enabled: booleanValue(value.enabled, "wind field.enabled"),
    density: requireWorldNumber(value.density ?? 1.225, "wind field.density", { minimum: 0 }),
    turbulence: requireWorldNumber(value.turbulence ?? 0, "wind field.turbulence", { minimum: 0 }),
    regionIds: normalizeIdList(value.regionIds, "wind field.regionIds"),
    metadata: normalizeMetadata(value.metadata, "wind field")
  };
  if (kind !== "corridor") {
    const direction = normalizeWorldVector(value.direction, "wind field.direction", [1, 0, 0], { unit: true });
    const explicitVelocity = value.velocity === undefined ? null : normalizeWorldVector(value.velocity, "wind field.velocity");
    const speed = requireWorldNumber(value.speed ?? (explicitVelocity ? Math.hypot(...explicitVelocity) : 0), "wind field.speed", { minimum: 0 });
    const velocity = explicitVelocity ?? scale(direction, speed);
    if (kind === "uniform") return { ...common, velocity };
    return {
      ...common,
      velocity,
      direction,
      gustAmplitude: requireWorldNumber(value.gustAmplitude ?? 0, "wind field.gustAmplitude", { minimum: 0 }),
      gustFrequencyHz: requireWorldNumber(value.gustFrequencyHz ?? 0, "wind field.gustFrequencyHz", { minimum: 0 }),
      spatialFrequency: requireWorldNumber(value.spatialFrequency ?? 0, "wind field.spatialFrequency", { minimum: 0 }),
      phase: requireWorldNumber(value.phase ?? 0, "wind field.phase")
    };
  }
  const speed = requireWorldNumber(value.speed ?? 0, "wind field.speed", { minimum: 0 });
  const gust = {
    gustAmplitude: requireWorldNumber(value.gustAmplitude ?? 0, "wind field.gustAmplitude", { minimum: 0 }),
    gustFrequencyHz: requireWorldNumber(value.gustFrequencyHz ?? 0, "wind field.gustFrequencyHz", { minimum: 0 }),
    spatialFrequency: requireWorldNumber(value.spatialFrequency ?? 0, "wind field.spatialFrequency", { minimum: 0 }),
    phase: requireWorldNumber(value.phase ?? 0, "wind field.phase")
  };
  return {
    ...common,
    ...gust,
    speed,
    points: normalizePointList(value.points, "wind field.points"),
    radius: requireWorldNumber(value.radius ?? 1, "wind field.radius", { minimum: 0, exclusiveMinimum: true }),
    edgeWidth: requireWorldNumber(value.edgeWidth ?? 0, "wind field.edgeWidth", { minimum: 0 }),
    verticalSpeed: requireWorldNumber(value.verticalSpeed ?? 0, "wind field.verticalSpeed")
  };
}

function nearestPointOnSegment(point, start, end) {
  const segment = subtract(end, start);
  const relative = subtract(point, start);
  const denominator = segment.reduce((sum, entry) => sum + entry * entry, 0);
  const t = denominator <= 1e-12
    ? 0
    : Math.max(0, Math.min(1, relative.reduce((sum, entry, index) => sum + entry * segment[index], 0) / denominator));
  const nearest = start.map((entry, index) => entry + segment[index] * t);
  return {
    t,
    nearest,
    tangent: normalizeDirection(segment, [1, 0, 0]),
    distance: Math.hypot(...subtract(point, nearest))
  };
}

function smoothstep(edge0, edge1, value) {
  if (edge1 <= edge0) return value <= edge0 ? 0 : 1;
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}

export function sampleWindField(fieldInput, pointInput = [0, 0, 0], timeSecondsInput = 0) {
  const field = normalizeWindField(fieldInput);
  const point = normalizeWorldVector(pointInput, "wind sample point");
  const timeSeconds = requireWorldNumber(timeSecondsInput, "wind sample timeSeconds", { minimum: 0 });
  if (!field.enabled) {
    return canonicalWorldValue(
      { fieldId: field.id, velocity: [0, 0, 0], density: field.density, turbulence: field.turbulence, influence: 0, distance: 0 },
      "wind field sample"
    );
  }
  const gust = field.kind === "uniform"
    ? 0
    : Math.sin(
      Math.PI * 2 * field.gustFrequencyHz * timeSeconds
      + (point[0] + point[1] + point[2]) * field.spatialFrequency
      + field.phase
    ) * field.gustAmplitude;
  if (field.kind === "uniform") {
    return canonicalWorldValue({
      fieldId: field.id,
      velocity: [...field.velocity],
      density: field.density,
      turbulence: field.turbulence,
      influence: 1,
      distance: 0
    }, "wind field sample");
  }
  if (field.kind === "gust") {
    return canonicalWorldValue({
      fieldId: field.id,
      velocity: field.velocity.map((entry, index) => {
        const value = entry + field.direction[index] * gust;
        return Object.is(value, -0) ? 0 : value;
      }),
      density: field.density,
      turbulence: field.turbulence,
      influence: 1,
      distance: 0
    }, "wind field sample");
  }
  let best = null;
  for (let index = 0; index < field.points.length - 1; index += 1) {
    const sample = nearestPointOnSegment(point, field.points[index], field.points[index + 1]);
    if (!best || sample.distance < best.distance || (sample.distance === best.distance && index < best.segmentIndex)) {
      best = { ...sample, segmentIndex: index };
    }
  }
  const inner = Math.max(0, field.radius - field.edgeWidth);
  const outer = field.radius + field.edgeWidth;
  const influence = outer <= inner
    ? (best.distance <= field.radius ? 1 : 0)
    : 1 - smoothstep(inner, outer, best.distance);
  const speed = Math.max(0, field.speed + gust);
  return canonicalWorldValue({
    fieldId: field.id,
    velocity: [best.tangent[0] * speed, best.tangent[1] * speed + field.verticalSpeed, best.tangent[2] * speed],
    density: field.density,
    turbulence: field.turbulence,
    influence,
    distance: best.distance,
    segmentIndex: best.segmentIndex,
    segmentT: best.t
  }, "wind field sample");
}

export function normalizeTimeScale(input = {}) {
  requireWorldObject(input, "Physics time scale");
  rejectWorldFields(input, ["schema", "id", "factor", "priority", "enabled", "metadata"], "Physics time scale");
  const value = canonicalWorldValue(input, "Physics time scale");
  return {
    schema: normalizeSchema(value.schema, TIME_SCALE_SCHEMA, "Physics time scale"),
    id: requireWorldText(value.id, "Physics time scale.id"),
    factor: requireWorldNumber(value.factor ?? 1, "Physics time scale.factor", { minimum: 0, maximum: 1000 }),
    priority: requireWorldNumber(value.priority ?? 0, "Physics time scale.priority"),
    enabled: booleanValue(value.enabled, "Physics time scale.enabled"),
    metadata: normalizeMetadata(value.metadata, "Physics time scale")
  };
}

export function normalizeSimulationRegion(input = {}) {
  requireWorldObject(input, "simulation region");
  rejectWorldFields(input, [
    "schema", "id", "shape", "minimum", "maximum", "center", "radius", "behavior", "priority", "enabled", "metadata"
  ], "simulation region");
  const value = canonicalWorldValue(input, "simulation region");
  const shape = enumValue(value.shape, ["aabb", "sphere"], "simulation region.shape", "aabb");
  if (shape === "aabb") rejectPresent(value, ["center", "radius"], "AABB simulation region");
  else rejectPresent(value, ["minimum", "maximum"], "sphere simulation region");
  const bounds = shape === "aabb"
    ? normalizeWorldBounds({ minimum: value.minimum, maximum: value.maximum }, "simulation region bounds")
    : null;
  const common = {
    schema: normalizeSchema(value.schema, SIMULATION_REGION_SCHEMA, "simulation region"),
    id: requireWorldText(value.id, "simulation region.id"),
    shape,
    behavior: enumValue(value.behavior, REGION_BEHAVIORS, "simulation region.behavior", "simulate"),
    priority: requireWorldNumber(value.priority ?? 0, "simulation region.priority"),
    enabled: booleanValue(value.enabled, "simulation region.enabled"),
    metadata: normalizeMetadata(value.metadata, "simulation region")
  };
  return shape === "aabb"
    ? { ...common, minimum: bounds.minimum, maximum: bounds.maximum }
    : {
      ...common,
      center: normalizeWorldVector(value.center, "simulation region.center"),
      radius: requireWorldNumber(value.radius, "simulation region.radius", { minimum: 0, exclusiveMinimum: true })
    };
}

export function simulationRegionContains(regionInput, pointInput = [0, 0, 0]) {
  const region = normalizeSimulationRegion(regionInput);
  const point = normalizeWorldVector(pointInput, "simulation region point");
  if (!region.enabled) return false;
  if (region.shape === "aabb") return pointInBounds(point, { minimum: region.minimum, maximum: region.maximum });
  return Math.hypot(...subtract(point, region.center)) <= region.radius;
}

export function normalizePhysicsWorld(input = {}) {
  requireWorldObject(input, "Physics world");
  rejectWorldFields(input, [
    "schema", "id", "enabled", "settings", "gravityFieldIds", "forceFieldIds", "windFieldIds",
    "timeScaleIds", "simulationRegionIds", "metadata"
  ], "Physics world");
  const value = canonicalWorldValue(input, "Physics world");
  return {
    schema: normalizeSchema(value.schema, PHYSICS_WORLD_SCHEMA, "Physics world"),
    id: requireWorldText(value.id, "Physics world.id"),
    enabled: booleanValue(value.enabled, "Physics world.enabled"),
    settings: normalizePhysicsWorldSettings(value.settings),
    gravityFieldIds: normalizeIdList(value.gravityFieldIds, "Physics world.gravityFieldIds"),
    forceFieldIds: normalizeIdList(value.forceFieldIds, "Physics world.forceFieldIds"),
    windFieldIds: normalizeIdList(value.windFieldIds, "Physics world.windFieldIds"),
    timeScaleIds: normalizeIdList(value.timeScaleIds, "Physics world.timeScaleIds"),
    simulationRegionIds: normalizeIdList(value.simulationRegionIds, "Physics world.simulationRegionIds"),
    metadata: normalizeMetadata(value.metadata, "Physics world")
  };
}

export function inspectWorldValue(normalize, input, schema) {
  try {
    normalize(input);
    return Object.freeze({ schema, valid: true, errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      errors: Object.freeze([Object.freeze({ code: "invalid-physics-world-value", message: error.message })])
    });
  }
}

export function normalizeDefinitionCommand(input, fieldName, normalize, label) {
  requireWorldObject(input, `${label} command`);
  rejectWorldFields(input, ["operationId", fieldName], `${label} command`);
  return {
    operationId: requireWorldText(input.operationId, `${label} command.operationId`),
    [fieldName]: normalize(input[fieldName])
  };
}

export function normalizeRemovalCommand(input, idName, label) {
  requireWorldObject(input, `${label} removal command`);
  rejectWorldFields(input, ["operationId", idName], `${label} removal command`);
  return {
    operationId: requireWorldText(input.operationId, `${label} removal command.operationId`),
    [idName]: requireWorldText(input[idName], `${label} removal command.${idName}`)
  };
}

export function normalizeWorldState(snapshot, { domain, fields = [], validate } = {}) {
  requireWorldObject(snapshot, `${domain} snapshot`);
  rejectWorldFields(snapshot, [...COMMON_STATE_KEYS, ...fields], `${domain} snapshot`);
  const value = canonicalWorldValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireNonnegativeInteger(value.sequence, `${domain} snapshot.sequence`);
  validate?.(value);
  return value;
}

export function normalizeAtomicWorldSnapshot(snapshot, domain) {
  return normalizeWorldState(snapshot, { domain });
}

export function normalizeRegistrySnapshot(snapshot, {
  domain,
  collectionName,
  revisionName,
  normalizeRecord
}) {
  return normalizeWorldState(snapshot, {
    domain,
    fields: [collectionName, "order", revisionName],
    validate(value) {
      requireWorldObject(value[collectionName], `${domain} snapshot.${collectionName}`);
      const records = {};
      for (const id of Object.keys(value[collectionName]).sort()) {
        const record = normalizeRecord(value[collectionName][id]);
        if (record.id !== id) throw new TypeError(`${domain} snapshot key ${id} must match record.id.`);
        records[id] = record;
      }
      value[collectionName] = records;
      const order = Object.keys(records).sort();
      if (value.order !== undefined && (!Array.isArray(value.order) || JSON.stringify(value.order) !== JSON.stringify(order))) {
        throw new TypeError(`${domain} snapshot.order must contain every record ID in sorted order.`);
      }
      value.order = order;
      value[revisionName] = requireNonnegativeInteger(value[revisionName], `${domain} snapshot.${revisionName}`);
    }
  });
}

export function sameWorldValue(left, right) {
  return JSON.stringify(canonicalWorldValue(left)) === JSON.stringify(canonicalWorldValue(right));
}

export function sumWorldVectors(vectors) {
  const sum = vectors.reduce(
    (sum, vector) => sum.map((entry, index) => {
      const value = entry + vector[index];
      return Object.is(value, -0) ? 0 : value;
    }),
    [0, 0, 0]
  );
  return canonicalWorldValue(sum, "Physics world vector sum");
}

export function pointInsideWorldSettings(settingsInput, pointInput) {
  const settings = normalizePhysicsWorldSettings(settingsInput);
  const point = normalizeWorldVector(pointInput, "Physics world point");
  return pointInBounds(point, settings.bounds);
}
