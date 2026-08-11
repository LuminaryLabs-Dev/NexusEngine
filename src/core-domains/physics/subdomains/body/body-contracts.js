import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const BODY_IDENTITY_SCHEMA = "nexusengine.physics-body-identity/1";
export const BODY_TYPE_SCHEMA = "nexusengine.physics-body-type/1";
export const BODY_POSE_SCHEMA = "nexusengine.physics-body-pose/1";
export const BODY_VELOCITY_SCHEMA = "nexusengine.physics-body-velocity/1";
export const BODY_FORCE_SCHEMA = "nexusengine.physics-body-force/1";
export const BODY_MASS_SCHEMA = "nexusengine.physics-body-mass/1";
export const BODY_INERTIA_SCHEMA = "nexusengine.physics-body-inertia/1";
export const BODY_DAMPING_SCHEMA = "nexusengine.physics-body-damping/1";
export const BODY_SLEEP_SCHEMA = "nexusengine.physics-body-sleep/1";
export const BODY_SLEEP_REQUEST_SCHEMA = "nexusengine.physics-body-sleep-command/1";
export const BODY_WAKE_REQUEST_SCHEMA = "nexusengine.physics-body-wake-command/1";
export const BODY_LIFECYCLE_SCHEMA = "nexusengine.physics-body-lifecycle/1";
export const BODY_LIFECYCLE_REQUEST_SCHEMA = "nexusengine.physics-body-lifecycle-command/1";
export const BODY_STATE_SCHEMA = "nexusengine.physics-body-state/1";
export const BODY_RECORD_SCHEMA = "nexusengine.physics-body-record/1";
export const BODY_DEFINE_COMMAND_SCHEMA = "nexusengine.physics-body-define-command/1";
export const BODY_REPLACE_COMMAND_SCHEMA = "nexusengine.physics-body-replace-command/1";
export const BODY_REMOVE_COMMAND_SCHEMA = "nexusengine.physics-body-remove-command/1";

export const BODY_TYPES = Object.freeze(["static", "dynamic", "kinematic"]);
export const BODY_LIFECYCLE_STATES = Object.freeze(["active", "disabled"]);

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

function normalizeSignedZero(value) {
  if (Array.isArray(value)) return value.map(normalizeSignedZero);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeSignedZero(value[key])]));
  }
  return Object.is(value, -0) ? 0 : value;
}

export function canonicalBodyValue(value, label = "value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireBodyObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectBodyFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireBodyText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireBodyNumber(value, label, { minimum = -Infinity, maximum = Infinity, exclusiveMinimum = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (exclusiveMinimum ? value <= minimum : value < minimum) {
    throw new TypeError(`${label} must be ${exclusiveMinimum ? "greater than" : "at least"} ${minimum}.`);
  }
  if (value > maximum) throw new TypeError(`${label} must be at most ${maximum}.`);
  return Object.is(value, -0) ? 0 : value;
}

export function requireBodyNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${label} must be a nonnegative integer.`);
  return value;
}

function requireBodyBoolean(value, label) {
  if (typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return value;
}

function normalizeSchema(value, schema, label) {
  const normalized = value ?? schema;
  if (normalized !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return normalized;
}

function normalizeEnum(value, allowed, fallback, label) {
  const normalized = value ?? fallback;
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

function normalizeMetadata(value, label) {
  return canonicalBodyValue(value ?? {}, `${label}.metadata`);
}

function normalizeTags(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return [...new Set(value.map((entry, index) => requireBodyText(entry, `${label}[${index}]`)))].sort();
}

export function normalizeBodyVector(value, label, fallback = [0, 0, 0]) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== 3) throw new TypeError(`${label} must be a three-number array.`);
  return source.map((entry, index) => requireBodyNumber(entry, `${label}[${index}]`));
}

export function normalizeBodyQuaternion(value, label, fallback = [0, 0, 0, 1]) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== 4) throw new TypeError(`${label} must be a four-number array.`);
  const quaternion = source.map((entry, index) => requireBodyNumber(entry, `${label}[${index}]`));
  const magnitude = Math.hypot(...quaternion);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  const normalized = quaternion.map((entry) => entry / magnitude);
  const decisive = [normalized[3], normalized[0], normalized[1], normalized[2]].find((entry) => Math.abs(entry) > 1e-12) ?? 1;
  const sign = decisive < 0 ? -1 : 1;
  return normalized.map((entry) => {
    const canonical = entry * sign;
    return Object.is(canonical, -0) ? 0 : canonical;
  });
}

export function normalizeBodyId(value, label = "bodyId") {
  return requireBodyText(value, label);
}

export function normalizeBodyIdentity(input = {}) {
  requireBodyObject(input, "Physics body identity");
  rejectBodyFields(input, ["schema", "id", "tags", "metadata"], "Physics body identity");
  const value = canonicalBodyValue(input, "Physics body identity");
  return {
    schema: normalizeSchema(value.schema, BODY_IDENTITY_SCHEMA, "Physics body identity"),
    id: normalizeBodyId(value.id, "Physics body identity.id"),
    tags: normalizeTags(value.tags, "Physics body identity.tags"),
    metadata: normalizeMetadata(value.metadata, "Physics body identity")
  };
}

export function normalizeBodyType(input = {}) {
  requireBodyObject(input, "Physics body type");
  rejectBodyFields(input, ["schema", "kind"], "Physics body type");
  const value = canonicalBodyValue(input, "Physics body type");
  return {
    schema: normalizeSchema(value.schema, BODY_TYPE_SCHEMA, "Physics body type"),
    kind: normalizeEnum(value.kind, BODY_TYPES, "dynamic", "Physics body type.kind")
  };
}

export function normalizeBodyPose(input = {}) {
  requireBodyObject(input, "Physics body pose");
  rejectBodyFields(input, ["schema", "position", "rotation"], "Physics body pose");
  const value = canonicalBodyValue(input, "Physics body pose");
  return {
    schema: normalizeSchema(value.schema, BODY_POSE_SCHEMA, "Physics body pose"),
    position: normalizeBodyVector(value.position, "Physics body pose.position"),
    rotation: normalizeBodyQuaternion(value.rotation, "Physics body pose.rotation")
  };
}

export function normalizeBodyVelocity(input = {}) {
  requireBodyObject(input, "Physics body velocity");
  rejectBodyFields(input, ["schema", "linear", "angular"], "Physics body velocity");
  const value = canonicalBodyValue(input, "Physics body velocity");
  return {
    schema: normalizeSchema(value.schema, BODY_VELOCITY_SCHEMA, "Physics body velocity"),
    linear: normalizeBodyVector(value.linear, "Physics body velocity.linear"),
    angular: normalizeBodyVector(value.angular, "Physics body velocity.angular")
  };
}

export function normalizeBodyForce(input = {}) {
  requireBodyObject(input, "Physics body force state");
  rejectBodyFields(input, ["schema", "force", "torque", "linearImpulse", "angularImpulse"], "Physics body force state");
  const value = canonicalBodyValue(input, "Physics body force state");
  return {
    schema: normalizeSchema(value.schema, BODY_FORCE_SCHEMA, "Physics body force state"),
    force: normalizeBodyVector(value.force, "Physics body force state.force"),
    torque: normalizeBodyVector(value.torque, "Physics body force state.torque"),
    linearImpulse: normalizeBodyVector(value.linearImpulse, "Physics body force state.linearImpulse"),
    angularImpulse: normalizeBodyVector(value.angularImpulse, "Physics body force state.angularImpulse")
  };
}

export function normalizeBodyMass(input = {}, options = {}) {
  requireBodyObject(input, "Physics body mass");
  rejectBodyFields(input, ["schema", "kilograms", "inverseMass", "centerOfMass"], "Physics body mass");
  const value = canonicalBodyValue(input, "Physics body mass");
  const bodyType = normalizeEnum(options.bodyType, BODY_TYPES, "dynamic", "Physics body mass type");
  if (bodyType !== "dynamic" && value.kilograms !== undefined && value.kilograms !== 0) {
    throw new TypeError(`Physics ${bodyType} body mass.kilograms must equal 0.`);
  }
  const kilograms = bodyType === "dynamic"
    ? requireBodyNumber(value.kilograms ?? 1, "Physics body mass.kilograms", { minimum: 0, exclusiveMinimum: true })
    : 0;
  const inverseMass = bodyType === "dynamic" ? 1 / kilograms : 0;
  if (value.inverseMass !== undefined && requireBodyNumber(value.inverseMass, "Physics body mass.inverseMass", { minimum: 0 }) !== inverseMass) {
    throw new TypeError("Physics body mass.inverseMass must equal the derived reciprocal mass.");
  }
  return {
    schema: normalizeSchema(value.schema, BODY_MASS_SCHEMA, "Physics body mass"),
    kilograms,
    inverseMass,
    centerOfMass: normalizeBodyVector(value.centerOfMass, "Physics body mass.centerOfMass")
  };
}

export function normalizeBodyInertia(input = {}, options = {}) {
  requireBodyObject(input, "Physics body inertia");
  rejectBodyFields(input, ["schema", "principal", "inversePrincipal", "orientation"], "Physics body inertia");
  const value = canonicalBodyValue(input, "Physics body inertia");
  const bodyType = normalizeEnum(options.bodyType, BODY_TYPES, "dynamic", "Physics body inertia type");
  const principal = bodyType === "dynamic"
    ? normalizeBodyVector(value.principal, "Physics body inertia.principal", [1, 1, 1]).map((entry, index) => (
      requireBodyNumber(entry, `Physics body inertia.principal[${index}]`, { minimum: 0, exclusiveMinimum: true })
    ))
    : [0, 0, 0];
  if (bodyType !== "dynamic" && value.principal !== undefined && value.principal.some((entry) => entry !== 0)) {
    throw new TypeError(`Physics ${bodyType} body inertia.principal must contain only zeroes.`);
  }
  const inversePrincipal = bodyType === "dynamic" ? principal.map((entry) => 1 / entry) : [0, 0, 0];
  if (value.inversePrincipal !== undefined) {
    const supplied = normalizeBodyVector(value.inversePrincipal, "Physics body inertia.inversePrincipal");
    if (JSON.stringify(supplied) !== JSON.stringify(inversePrincipal)) {
      throw new TypeError("Physics body inertia.inversePrincipal must equal the derived reciprocal principal inertia.");
    }
  }
  return {
    schema: normalizeSchema(value.schema, BODY_INERTIA_SCHEMA, "Physics body inertia"),
    principal,
    inversePrincipal,
    orientation: normalizeBodyQuaternion(value.orientation, "Physics body inertia.orientation")
  };
}

export function normalizeBodyDamping(input = {}) {
  requireBodyObject(input, "Physics body damping");
  rejectBodyFields(input, ["schema", "linear", "angular"], "Physics body damping");
  const value = canonicalBodyValue(input, "Physics body damping");
  return {
    schema: normalizeSchema(value.schema, BODY_DAMPING_SCHEMA, "Physics body damping"),
    linear: requireBodyNumber(value.linear ?? 0, "Physics body damping.linear", { minimum: 0 }),
    angular: requireBodyNumber(value.angular ?? 0, "Physics body damping.angular", { minimum: 0 })
  };
}

export function normalizeBodySleep(input = {}, options = {}) {
  requireBodyObject(input, "Physics body sleep state");
  rejectBodyFields(input, ["schema", "allowSleep", "sleeping", "linearThreshold", "angularThreshold", "timeThreshold", "idleSeconds"], "Physics body sleep state");
  const value = canonicalBodyValue(input, "Physics body sleep state");
  const bodyType = normalizeEnum(options.bodyType, BODY_TYPES, "dynamic", "Physics body sleep type");
  const dynamic = bodyType === "dynamic";
  const expectedSleeping = bodyType === "static";
  if (!dynamic && value.allowSleep !== undefined && value.allowSleep !== false) {
    throw new TypeError(`Physics ${bodyType} body sleep.allowSleep must equal false.`);
  }
  if (!dynamic && value.sleeping !== undefined && value.sleeping !== expectedSleeping) {
    throw new TypeError(`Physics ${bodyType} body sleep.sleeping must equal ${expectedSleeping}.`);
  }
  const allowSleep = dynamic ? requireBodyBoolean(value.allowSleep ?? true, "Physics body sleep.allowSleep") : false;
  const sleeping = dynamic ? requireBodyBoolean(value.sleeping ?? false, "Physics body sleep.sleeping") : expectedSleeping;
  if (!allowSleep && sleeping) throw new TypeError("Physics dynamic body cannot be sleeping when allowSleep is false.");
  return {
    schema: normalizeSchema(value.schema, BODY_SLEEP_SCHEMA, "Physics body sleep state"),
    allowSleep,
    sleeping,
    linearThreshold: requireBodyNumber(value.linearThreshold ?? 0.05, "Physics body sleep.linearThreshold", { minimum: 0 }),
    angularThreshold: requireBodyNumber(value.angularThreshold ?? 0.05, "Physics body sleep.angularThreshold", { minimum: 0 }),
    timeThreshold: requireBodyNumber(value.timeThreshold ?? 0.5, "Physics body sleep.timeThreshold", { minimum: 0 }),
    idleSeconds: requireBodyNumber(value.idleSeconds ?? 0, "Physics body sleep.idleSeconds", { minimum: 0 })
  };
}

export function normalizeBodyLifecycle(input = {}) {
  requireBodyObject(input, "Physics body lifecycle");
  rejectBodyFields(input, ["schema", "status"], "Physics body lifecycle");
  const value = canonicalBodyValue(input, "Physics body lifecycle");
  return {
    schema: normalizeSchema(value.schema, BODY_LIFECYCLE_SCHEMA, "Physics body lifecycle"),
    status: normalizeEnum(value.status, BODY_LIFECYCLE_STATES, "active", "Physics body lifecycle.status")
  };
}

const DEFAULT_BODY_PARTS = Object.freeze({
  identity: normalizeBodyIdentity,
  type: normalizeBodyType,
  pose: normalizeBodyPose,
  velocity: normalizeBodyVelocity,
  force: normalizeBodyForce,
  mass: normalizeBodyMass,
  inertia: normalizeBodyInertia,
  damping: normalizeBodyDamping,
  sleep: normalizeBodySleep,
  lifecycle: normalizeBodyLifecycle
});

export function normalizeBodyState(input = {}, parts = DEFAULT_BODY_PARTS) {
  requireBodyObject(input, "Physics body state");
  rejectBodyFields(input, ["schema", "identity", "type", "pose", "velocity", "force", "mass", "inertia", "damping", "sleep", "lifecycle"], "Physics body state");
  const value = canonicalBodyValue(input, "Physics body state");
  const type = parts.type(value.type ?? {});
  const bodyType = type.kind;
  return {
    schema: normalizeSchema(value.schema, BODY_STATE_SCHEMA, "Physics body state"),
    identity: parts.identity(value.identity),
    type,
    pose: parts.pose(value.pose ?? {}),
    velocity: parts.velocity(value.velocity ?? {}),
    force: parts.force(value.force ?? {}),
    mass: parts.mass(value.mass ?? {}, { bodyType }),
    inertia: parts.inertia(value.inertia ?? {}, { bodyType }),
    damping: parts.damping(value.damping ?? {}),
    sleep: parts.sleep(value.sleep ?? {}, { bodyType }),
    lifecycle: parts.lifecycle(value.lifecycle ?? {})
  };
}

function normalizeCommandBase(input, allowedFields, schema, label) {
  requireBodyObject(input, label);
  rejectBodyFields(input, ["schema", "operationId", ...allowedFields], label);
  const value = canonicalBodyValue(input, label);
  value.schema = normalizeSchema(value.schema, schema, label);
  value.operationId = requireBodyText(value.operationId, `${label}.operationId`);
  return value;
}

function normalizeExpectedRevision(value, label) {
  return value === undefined ? undefined : requireBodyNonnegativeInteger(value, label);
}

export function normalizeBodyDefinitionCommand(input = {}, normalize = normalizeBodyState) {
  const value = normalizeCommandBase(input, ["body"], BODY_DEFINE_COMMAND_SCHEMA, "Physics body definition command");
  value.body = normalize(value.body);
  return value;
}

export function normalizeBodyReplacementCommand(input = {}, normalize = normalizeBodyState) {
  const value = normalizeCommandBase(input, ["body", "expectedRevision"], BODY_REPLACE_COMMAND_SCHEMA, "Physics body replacement command");
  value.body = normalize(value.body);
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics body replacement command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

export function normalizeBodyRemovalCommand(input = {}) {
  const value = normalizeCommandBase(input, ["bodyId", "expectedRevision"], BODY_REMOVE_COMMAND_SCHEMA, "Physics body removal command");
  value.bodyId = normalizeBodyId(value.bodyId, "Physics body removal command.bodyId");
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics body removal command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

function normalizeBodyTransitionCommand(input, schema, label, extraFields = []) {
  const value = normalizeCommandBase(input, ["bodyId", "expectedRevision", "reason", "tickId", ...extraFields], schema, label);
  value.bodyId = normalizeBodyId(value.bodyId, `${label}.bodyId`);
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, `${label}.expectedRevision`);
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  if (value.reason === undefined) value.reason = "unspecified";
  else value.reason = requireBodyText(value.reason, `${label}.reason`);
  if (value.tickId === undefined) value.tickId = 0;
  else value.tickId = requireBodyNonnegativeInteger(value.tickId, `${label}.tickId`);
  return value;
}

export function normalizeBodySleepRequest(input = {}) {
  return normalizeBodyTransitionCommand(input, BODY_SLEEP_REQUEST_SCHEMA, "Physics body sleep command");
}

export function normalizeBodyWakeRequest(input = {}) {
  return normalizeBodyTransitionCommand(input, BODY_WAKE_REQUEST_SCHEMA, "Physics body wake command");
}

export function normalizeBodyLifecycleRequest(input = {}) {
  const value = normalizeBodyTransitionCommand(
    input,
    BODY_LIFECYCLE_REQUEST_SCHEMA,
    "Physics body lifecycle command",
    ["status"]
  );
  value.status = normalizeEnum(value.status, BODY_LIFECYCLE_STATES, undefined, "Physics body lifecycle command.status");
  return value;
}

export function createBodyRecord(body, revision = 1) {
  return {
    schema: BODY_RECORD_SCHEMA,
    body: normalizeBodyState(body),
    revision: requireBodyNonnegativeInteger(revision, "Physics body record.revision")
  };
}

export function normalizeBodyRecord(input = {}, normalize = normalizeBodyState) {
  requireBodyObject(input, "Physics body record");
  rejectBodyFields(input, ["schema", "body", "revision"], "Physics body record");
  const value = canonicalBodyValue(input, "Physics body record");
  return {
    schema: normalizeSchema(value.schema, BODY_RECORD_SCHEMA, "Physics body record"),
    body: normalize(value.body),
    revision: requireBodyNonnegativeInteger(value.revision, "Physics body record.revision")
  };
}

export function inspectBodyValue(normalize, input, schema) {
  try {
    normalize(input);
    return Object.freeze({ schema, valid: true, errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      errors: Object.freeze([Object.freeze({ code: "invalid-physics-body", message: error.message })])
    });
  }
}

export function normalizeBodyStateSnapshot(snapshot, { domain, fields = [], validate } = {}) {
  requireBodyObject(snapshot, `${domain} snapshot`);
  rejectBodyFields(snapshot, [...COMMON_STATE_KEYS, ...fields], `${domain} snapshot`);
  const value = canonicalBodyValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireBodyNonnegativeInteger(value.sequence, `${domain} snapshot.sequence`);
  validate?.(value);
  return value;
}

export function normalizeAtomicBodySnapshot(snapshot, domain) {
  return normalizeBodyStateSnapshot(snapshot, { domain });
}

export function normalizeBodyRegistrySnapshot(snapshot, normalize = normalizeBodyState) {
  return normalizeBodyStateSnapshot(snapshot, {
    domain: "physics-body-registry",
    fields: ["bodies", "order", "bodyRevision"],
    validate(value) {
      requireBodyObject(value.bodies, "Physics body registry snapshot.bodies");
      const bodies = {};
      for (const id of Object.keys(value.bodies).sort()) {
        const record = normalizeBodyRecord(value.bodies[id], normalize);
        if (record.body.identity.id !== id) {
          throw new TypeError(`Physics body registry snapshot key ${id} must match body.identity.id.`);
        }
        bodies[id] = record;
      }
      value.bodies = bodies;
      const order = Object.keys(bodies).sort();
      if (!Array.isArray(value.order) || JSON.stringify(value.order) !== JSON.stringify(order)) {
        throw new TypeError("Physics body registry snapshot.order must contain every body ID in sorted order.");
      }
      value.order = order;
      value.bodyRevision = requireBodyNonnegativeInteger(value.bodyRevision, "Physics body registry snapshot.bodyRevision");
    }
  });
}

export function sameBodyValue(left, right) {
  return JSON.stringify(canonicalBodyValue(left)) === JSON.stringify(canonicalBodyValue(right));
}
