import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const CONSTRAINT_SCHEMA = "nexusengine.physics-constraint/1";
export const CONSTRAINT_FRAME_SCHEMA = "nexusengine.physics-constraint-frame/1";
export const CONSTRAINT_BREAK_POLICY_SCHEMA = "nexusengine.physics-constraint-break-policy/1";
export const CONSTRAINT_BREAK_MEASUREMENT_SCHEMA = "nexusengine.physics-constraint-break-measurement/1";
export const CONSTRAINT_BREAK_RECORD_SCHEMA = "nexusengine.physics-constraint-break-record/1";
export const CONSTRAINT_RECORD_SCHEMA = "nexusengine.physics-constraint-record/1";
export const CONSTRAINT_DEFINE_COMMAND_SCHEMA = "nexusengine.physics-constraint-define-command/1";
export const CONSTRAINT_REPLACE_COMMAND_SCHEMA = "nexusengine.physics-constraint-replace-command/1";
export const CONSTRAINT_REMOVE_COMMAND_SCHEMA = "nexusengine.physics-constraint-remove-command/1";
export const CONSTRAINT_STATUS_COMMAND_SCHEMA = "nexusengine.physics-constraint-status-command/1";
export const CONSTRAINT_BREAK_COMMAND_SCHEMA = "nexusengine.physics-constraint-break-command/1";

export const CONSTRAINT_TYPES = Object.freeze([
  "ball-socket",
  "cone-twist",
  "distance",
  "drive",
  "fixed",
  "hinge",
  "limit",
  "motor",
  "slider",
  "spring"
]);
export const CONSTRAINT_STATUSES = Object.freeze(["enabled", "disabled", "broken"]);
export const CONSTRAINT_ACTIVE_STATUSES = Object.freeze(["enabled", "disabled"]);
export const CONSTRAINT_MODES = Object.freeze(["linear", "angular"]);

export const CONSTRAINT_PARAMETER_SCHEMAS = Object.freeze({
  "ball-socket": "nexusengine.physics-ball-socket-constraint/1",
  "cone-twist": "nexusengine.physics-cone-twist-constraint/1",
  distance: "nexusengine.physics-distance-constraint/1",
  drive: "nexusengine.physics-drive-constraint/1",
  fixed: "nexusengine.physics-fixed-constraint/1",
  hinge: "nexusengine.physics-hinge-constraint/1",
  limit: "nexusengine.physics-limit-constraint/1",
  motor: "nexusengine.physics-motor-constraint/1",
  slider: "nexusengine.physics-slider-constraint/1",
  spring: "nexusengine.physics-spring-constraint/1"
});

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

export function canonicalConstraintValue(value, label = "constraint value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireConstraintObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectConstraintFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireConstraintText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireConstraintNumber(value, label, { minimum = -Infinity, maximum = Infinity, exclusiveMinimum = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (exclusiveMinimum ? value <= minimum : value < minimum) {
    throw new TypeError(`${label} must be ${exclusiveMinimum ? "greater than" : "at least"} ${minimum}.`);
  }
  if (value > maximum) throw new TypeError(`${label} must be at most ${maximum}.`);
  return Object.is(value, -0) ? 0 : value;
}

export function requireConstraintNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${label} must be a nonnegative integer.`);
  return value;
}

export function requireConstraintPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) throw new TypeError(`${label} must be a positive integer.`);
  return value;
}

export function requireConstraintBoolean(value, label) {
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

export function normalizeConstraintVector(value, label, fallback = [0, 0, 0]) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== 3) throw new TypeError(`${label} must be a three-number array.`);
  return source.map((entry, index) => requireConstraintNumber(entry, `${label}[${index}]`));
}

export function normalizeConstraintAxis(value, label, fallback = [1, 0, 0]) {
  const axis = normalizeConstraintVector(value, label, fallback);
  const magnitude = Math.hypot(...axis);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  return axis.map((entry) => {
    const normalized = entry / magnitude;
    return Object.is(normalized, -0) ? 0 : normalized;
  });
}

export function normalizeConstraintQuaternion(value, label, fallback = [0, 0, 0, 1]) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== 4) throw new TypeError(`${label} must be a four-number array.`);
  const quaternion = source.map((entry, index) => requireConstraintNumber(entry, `${label}[${index}]`));
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

export function normalizeConstraintFrame(input = {}) {
  requireConstraintObject(input, "Physics constraint frame");
  rejectConstraintFields(input, ["schema", "position", "rotation"], "Physics constraint frame");
  const value = canonicalConstraintValue(input, "Physics constraint frame");
  return {
    schema: normalizeSchema(value.schema, CONSTRAINT_FRAME_SCHEMA, "Physics constraint frame"),
    position: normalizeConstraintVector(value.position, "Physics constraint frame.position"),
    rotation: normalizeConstraintQuaternion(value.rotation, "Physics constraint frame.rotation")
  };
}

export function normalizeConstraintBreakPolicy(input = {}) {
  requireConstraintObject(input, "Physics constraint break policy");
  rejectConstraintFields(input, ["schema", "enabled", "force", "torque"], "Physics constraint break policy");
  const value = canonicalConstraintValue(input, "Physics constraint break policy");
  const enabled = requireConstraintBoolean(value.enabled ?? false, "Physics constraint break policy.enabled");
  const force = value.force == null
    ? null
    : requireConstraintNumber(value.force, "Physics constraint break policy.force", { minimum: 0, exclusiveMinimum: true });
  const torque = value.torque == null
    ? null
    : requireConstraintNumber(value.torque, "Physics constraint break policy.torque", { minimum: 0, exclusiveMinimum: true });
  if (!enabled && (force !== null || torque !== null)) {
    throw new TypeError("Disabled Physics constraint break policy cannot declare force or torque thresholds.");
  }
  if (enabled && force === null && torque === null) {
    throw new TypeError("Enabled Physics constraint break policy requires a force or torque threshold.");
  }
  return {
    schema: normalizeSchema(value.schema, CONSTRAINT_BREAK_POLICY_SCHEMA, "Physics constraint break policy"),
    enabled,
    force,
    torque
  };
}

export function normalizeConstraintBreakMeasurement(input = {}) {
  requireConstraintObject(input, "Physics constraint break measurement");
  rejectConstraintFields(input, ["schema", "force", "torque", "tickId"], "Physics constraint break measurement");
  const value = canonicalConstraintValue(input, "Physics constraint break measurement");
  return {
    schema: normalizeSchema(value.schema, CONSTRAINT_BREAK_MEASUREMENT_SCHEMA, "Physics constraint break measurement"),
    force: requireConstraintNumber(value.force ?? 0, "Physics constraint break measurement.force", { minimum: 0 }),
    torque: requireConstraintNumber(value.torque ?? 0, "Physics constraint break measurement.torque", { minimum: 0 }),
    tickId: requireConstraintNonnegativeInteger(value.tickId ?? 0, "Physics constraint break measurement.tickId")
  };
}

export function evaluateConstraintBreak(policyInput = {}, measurementInput = {}) {
  const policy = normalizeConstraintBreakPolicy(policyInput);
  const measurement = normalizeConstraintBreakMeasurement(measurementInput);
  const forceExceeded = policy.enabled && policy.force !== null && measurement.force >= policy.force;
  const torqueExceeded = policy.enabled && policy.torque !== null && measurement.torque >= policy.torque;
  return canonicalConstraintValue({
    shouldBreak: forceExceeded || torqueExceeded,
    forceExceeded,
    torqueExceeded,
    policy,
    measurement
  }, "Physics constraint break evaluation");
}

function normalizeParameterObject(input, schema, allowedFields, label) {
  requireConstraintObject(input, label);
  rejectConstraintFields(input, ["schema", ...allowedFields], label);
  const value = canonicalConstraintValue(input, label);
  value.schema = normalizeSchema(value.schema, schema, label);
  return value;
}

export function normalizeBallSocketConstraintParameters(input = {}) {
  return normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS["ball-socket"], [], "Physics ball-socket constraint parameters");
}

export function normalizeFixedConstraintParameters(input = {}) {
  return normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.fixed, [], "Physics fixed constraint parameters");
}

export function normalizeDistanceConstraintParameters(input = {}) {
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.distance, ["minimumDistance", "maximumDistance"], "Physics distance constraint parameters");
  const minimumDistance = requireConstraintNumber(value.minimumDistance ?? 0, "Physics distance constraint parameters.minimumDistance", { minimum: 0 });
  const maximumDistance = requireConstraintNumber(value.maximumDistance ?? 1, "Physics distance constraint parameters.maximumDistance", { minimum: 0 });
  if (maximumDistance < minimumDistance) throw new TypeError("Physics distance constraint maximumDistance must be at least minimumDistance.");
  return { schema: value.schema, minimumDistance, maximumDistance };
}

function normalizeAxisPairParameters(input, type, label) {
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS[type], ["axisA", "axisB"], label);
  return {
    schema: value.schema,
    axisA: normalizeConstraintAxis(value.axisA, `${label}.axisA`),
    axisB: normalizeConstraintAxis(value.axisB, `${label}.axisB`)
  };
}

export function normalizeHingeConstraintParameters(input = {}) {
  return normalizeAxisPairParameters(input, "hinge", "Physics hinge constraint parameters");
}

export function normalizeSliderConstraintParameters(input = {}) {
  return normalizeAxisPairParameters(input, "slider", "Physics slider constraint parameters");
}

export function normalizeConeTwistConstraintParameters(input = {}) {
  const label = "Physics cone-twist constraint parameters";
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS["cone-twist"], ["axisA", "axisB", "coneAngle", "twistMinimum", "twistMaximum"], label);
  const twistMinimum = requireConstraintNumber(value.twistMinimum ?? -Math.PI, `${label}.twistMinimum`, { minimum: -Math.PI, maximum: Math.PI });
  const twistMaximum = requireConstraintNumber(value.twistMaximum ?? Math.PI, `${label}.twistMaximum`, { minimum: -Math.PI, maximum: Math.PI });
  if (twistMaximum < twistMinimum) throw new TypeError("Physics cone-twist constraint twistMaximum must be at least twistMinimum.");
  return {
    schema: value.schema,
    axisA: normalizeConstraintAxis(value.axisA, `${label}.axisA`),
    axisB: normalizeConstraintAxis(value.axisB, `${label}.axisB`),
    coneAngle: requireConstraintNumber(value.coneAngle ?? Math.PI, `${label}.coneAngle`, { minimum: 0, maximum: Math.PI }),
    twistMinimum,
    twistMaximum
  };
}

function normalizeModeAndAxes(value, label) {
  return {
    mode: normalizeEnum(value.mode, CONSTRAINT_MODES, "linear", `${label}.mode`),
    axisA: normalizeConstraintAxis(value.axisA, `${label}.axisA`),
    axisB: normalizeConstraintAxis(value.axisB, `${label}.axisB`)
  };
}

function normalizeMaximumEffort(value, mode, label) {
  if (mode === "linear") {
    if (value.maxTorque != null) throw new TypeError(`${label}.maxTorque is only valid for angular constraints.`);
    return {
      maxForce: requireConstraintNumber(value.maxForce ?? 1, `${label}.maxForce`, { minimum: 0, exclusiveMinimum: true }),
      maxTorque: null
    };
  }
  if (value.maxForce != null) throw new TypeError(`${label}.maxForce is only valid for linear constraints.`);
  return {
    maxForce: null,
    maxTorque: requireConstraintNumber(value.maxTorque ?? 1, `${label}.maxTorque`, { minimum: 0, exclusiveMinimum: true })
  };
}

export function normalizeSpringConstraintParameters(input = {}) {
  const label = "Physics spring constraint parameters";
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.spring, ["mode", "axisA", "axisB", "rest", "stiffness", "damping"], label);
  const modeAndAxes = normalizeModeAndAxes(value, label);
  return {
    schema: value.schema,
    ...modeAndAxes,
    rest: requireConstraintNumber(value.rest ?? 0, `${label}.rest`, modeAndAxes.mode === "linear" ? { minimum: 0 } : {}),
    stiffness: requireConstraintNumber(value.stiffness ?? 1, `${label}.stiffness`, { minimum: 0, exclusiveMinimum: true }),
    damping: requireConstraintNumber(value.damping ?? 0, `${label}.damping`, { minimum: 0 })
  };
}

export function normalizeLimitConstraintParameters(input = {}) {
  const label = "Physics limit constraint parameters";
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.limit, ["mode", "axisA", "axisB", "minimum", "maximum"], label);
  const modeAndAxes = normalizeModeAndAxes(value, label);
  const minimum = requireConstraintNumber(value.minimum ?? 0, `${label}.minimum`);
  const maximum = requireConstraintNumber(value.maximum ?? 0, `${label}.maximum`);
  if (maximum < minimum) throw new TypeError("Physics limit constraint maximum must be at least minimum.");
  return { schema: value.schema, ...modeAndAxes, minimum, maximum };
}

export function normalizeMotorConstraintParameters(input = {}) {
  const label = "Physics motor constraint parameters";
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.motor, ["mode", "axisA", "axisB", "targetVelocity", "maxForce", "maxTorque"], label);
  const modeAndAxes = normalizeModeAndAxes(value, label);
  return {
    schema: value.schema,
    ...modeAndAxes,
    targetVelocity: requireConstraintNumber(value.targetVelocity ?? 0, `${label}.targetVelocity`),
    ...normalizeMaximumEffort(value, modeAndAxes.mode, label)
  };
}

export function normalizeDriveConstraintParameters(input = {}) {
  const label = "Physics drive constraint parameters";
  const value = normalizeParameterObject(input, CONSTRAINT_PARAMETER_SCHEMAS.drive, ["mode", "axisA", "axisB", "targetPosition", "targetVelocity", "stiffness", "damping", "maxForce", "maxTorque"], label);
  const modeAndAxes = normalizeModeAndAxes(value, label);
  return {
    schema: value.schema,
    ...modeAndAxes,
    targetPosition: requireConstraintNumber(value.targetPosition ?? 0, `${label}.targetPosition`),
    targetVelocity: requireConstraintNumber(value.targetVelocity ?? 0, `${label}.targetVelocity`),
    stiffness: requireConstraintNumber(value.stiffness ?? 0, `${label}.stiffness`, { minimum: 0 }),
    damping: requireConstraintNumber(value.damping ?? 0, `${label}.damping`, { minimum: 0 }),
    ...normalizeMaximumEffort(value, modeAndAxes.mode, label)
  };
}

export const CONSTRAINT_PARAMETER_NORMALIZERS = Object.freeze({
  "ball-socket": normalizeBallSocketConstraintParameters,
  "cone-twist": normalizeConeTwistConstraintParameters,
  distance: normalizeDistanceConstraintParameters,
  drive: normalizeDriveConstraintParameters,
  fixed: normalizeFixedConstraintParameters,
  hinge: normalizeHingeConstraintParameters,
  limit: normalizeLimitConstraintParameters,
  motor: normalizeMotorConstraintParameters,
  slider: normalizeSliderConstraintParameters,
  spring: normalizeSpringConstraintParameters
});

export function normalizeConstraintDescriptor(input = {}, expectedType, normalizeParameters) {
  requireConstraintObject(input, "Physics constraint");
  rejectConstraintFields(input, ["schema", "id", "type", "bodyA", "bodyB", "frames", "parameters", "breakPolicy", "collideConnected", "metadata"], "Physics constraint");
  const value = canonicalConstraintValue(input, "Physics constraint");
  const type = normalizeEnum(value.type, CONSTRAINT_TYPES, expectedType, "Physics constraint.type");
  if (expectedType && type !== expectedType) throw new TypeError(`Physics constraint.type must equal ${expectedType}.`);
  const parameterNormalizer = normalizeParameters ?? CONSTRAINT_PARAMETER_NORMALIZERS[type];
  if (typeof parameterNormalizer !== "function") throw new TypeError(`Physics constraint type ${type} has no parameter normalizer.`);
  const bodyA = requireConstraintText(value.bodyA, "Physics constraint.bodyA");
  const bodyB = requireConstraintText(value.bodyB, "Physics constraint.bodyB");
  if (bodyA === bodyB) throw new TypeError("Physics constraint bodyA and bodyB must differ.");
  const frames = value.frames ?? {};
  requireConstraintObject(frames, "Physics constraint.frames");
  rejectConstraintFields(frames, ["bodyA", "bodyB"], "Physics constraint.frames");
  const metadata = value.metadata ?? {};
  requireConstraintObject(metadata, "Physics constraint.metadata");
  return {
    schema: normalizeSchema(value.schema, CONSTRAINT_SCHEMA, "Physics constraint"),
    id: requireConstraintText(value.id, "Physics constraint.id"),
    type,
    bodyA,
    bodyB,
    frames: {
      bodyA: normalizeConstraintFrame(frames.bodyA ?? {}),
      bodyB: normalizeConstraintFrame(frames.bodyB ?? {})
    },
    parameters: parameterNormalizer(value.parameters ?? {}),
    breakPolicy: normalizeConstraintBreakPolicy(value.breakPolicy ?? {}),
    collideConnected: requireConstraintBoolean(value.collideConnected ?? false, "Physics constraint.collideConnected"),
    metadata: canonicalConstraintValue(metadata, "Physics constraint.metadata")
  };
}

function normalizeCommandBase(input, allowedFields, schema, label) {
  requireConstraintObject(input, label);
  rejectConstraintFields(input, ["schema", "operationId", ...allowedFields], label);
  const value = canonicalConstraintValue(input, label);
  value.schema = normalizeSchema(value.schema, schema, label);
  value.operationId = requireConstraintText(value.operationId, `${label}.operationId`);
  return value;
}

function normalizeExpectedRevision(value, label) {
  return value === undefined ? undefined : requireConstraintPositiveInteger(value, label);
}

export function normalizeConstraintDefinitionCommand(input = {}, normalize = normalizeConstraintDescriptor) {
  const value = normalizeCommandBase(input, ["constraint", "status"], CONSTRAINT_DEFINE_COMMAND_SCHEMA, "Physics constraint definition command");
  value.constraint = normalize(value.constraint);
  value.status = normalizeEnum(value.status, CONSTRAINT_ACTIVE_STATUSES, "enabled", "Physics constraint definition command.status");
  return value;
}

export function normalizeConstraintReplacementCommand(input = {}, normalize = normalizeConstraintDescriptor) {
  const value = normalizeCommandBase(input, ["constraint", "expectedRevision"], CONSTRAINT_REPLACE_COMMAND_SCHEMA, "Physics constraint replacement command");
  value.constraint = normalize(value.constraint);
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics constraint replacement command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

export function normalizeConstraintRemovalCommand(input = {}) {
  const value = normalizeCommandBase(input, ["constraintId", "expectedRevision"], CONSTRAINT_REMOVE_COMMAND_SCHEMA, "Physics constraint removal command");
  value.constraintId = requireConstraintText(value.constraintId, "Physics constraint removal command.constraintId");
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics constraint removal command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

export function normalizeConstraintStatusCommand(input = {}) {
  const value = normalizeCommandBase(input, ["constraintId", "status", "expectedRevision", "reason"], CONSTRAINT_STATUS_COMMAND_SCHEMA, "Physics constraint status command");
  value.constraintId = requireConstraintText(value.constraintId, "Physics constraint status command.constraintId");
  value.status = normalizeEnum(value.status, CONSTRAINT_ACTIVE_STATUSES, undefined, "Physics constraint status command.status");
  value.reason = value.reason === undefined ? "unspecified" : requireConstraintText(value.reason, "Physics constraint status command.reason");
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics constraint status command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

export function normalizeConstraintBreakCommand(input = {}) {
  const value = normalizeCommandBase(input, ["constraintId", "expectedRevision", "measurement"], CONSTRAINT_BREAK_COMMAND_SCHEMA, "Physics constraint break command");
  value.constraintId = requireConstraintText(value.constraintId, "Physics constraint break command.constraintId");
  value.measurement = normalizeConstraintBreakMeasurement(value.measurement ?? {});
  const expectedRevision = normalizeExpectedRevision(value.expectedRevision, "Physics constraint break command.expectedRevision");
  if (expectedRevision === undefined) delete value.expectedRevision;
  else value.expectedRevision = expectedRevision;
  return value;
}

export function normalizeConstraintBreakRecord(input = {}) {
  requireConstraintObject(input, "Physics constraint break record");
  rejectConstraintFields(input, ["schema", "measurement", "forceExceeded", "torqueExceeded"], "Physics constraint break record");
  const value = canonicalConstraintValue(input, "Physics constraint break record");
  const result = {
    schema: normalizeSchema(value.schema, CONSTRAINT_BREAK_RECORD_SCHEMA, "Physics constraint break record"),
    measurement: normalizeConstraintBreakMeasurement(value.measurement),
    forceExceeded: requireConstraintBoolean(value.forceExceeded, "Physics constraint break record.forceExceeded"),
    torqueExceeded: requireConstraintBoolean(value.torqueExceeded, "Physics constraint break record.torqueExceeded")
  };
  if (!result.forceExceeded && !result.torqueExceeded) {
    throw new TypeError("Physics constraint break record requires an exceeded force or torque threshold.");
  }
  return result;
}

export function normalizeConstraintRecord(input = {}, normalize = normalizeConstraintDescriptor) {
  requireConstraintObject(input, "Physics constraint record");
  rejectConstraintFields(input, ["schema", "constraint", "status", "revision", "breakRecord"], "Physics constraint record");
  const value = canonicalConstraintValue(input, "Physics constraint record");
  const constraint = normalize(value.constraint);
  const status = normalizeEnum(value.status, CONSTRAINT_STATUSES, "enabled", "Physics constraint record.status");
  const breakRecord = value.breakRecord == null ? null : normalizeConstraintBreakRecord(value.breakRecord);
  if (status === "broken" && breakRecord === null) throw new TypeError("Broken Physics constraint record requires breakRecord.");
  if (status !== "broken" && breakRecord !== null) throw new TypeError("Unbroken Physics constraint record cannot contain breakRecord.");
  if (breakRecord !== null) {
    const evaluation = evaluateConstraintBreak(constraint.breakPolicy, breakRecord.measurement);
    if (!evaluation.shouldBreak
      || evaluation.forceExceeded !== breakRecord.forceExceeded
      || evaluation.torqueExceeded !== breakRecord.torqueExceeded) {
      throw new TypeError("Physics constraint break record must match the constraint policy and measurement.");
    }
  }
  return {
    schema: normalizeSchema(value.schema, CONSTRAINT_RECORD_SCHEMA, "Physics constraint record"),
    constraint,
    status,
    revision: requireConstraintPositiveInteger(value.revision, "Physics constraint record.revision"),
    breakRecord
  };
}

export function inspectConstraintValue(normalize, input, schema) {
  try {
    normalize(input);
    return Object.freeze({ schema, valid: true, errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      errors: Object.freeze([Object.freeze({ code: "invalid-physics-constraint", message: error.message })])
    });
  }
}

export function normalizeConstraintStateSnapshot(snapshot, { domain, fields = [], validate } = {}) {
  requireConstraintObject(snapshot, `${domain} snapshot`);
  rejectConstraintFields(snapshot, [...COMMON_STATE_KEYS, ...fields], `${domain} snapshot`);
  const value = canonicalConstraintValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  value.id = requireConstraintText(value.id, `${domain} snapshot.id`);
  value.version = requireConstraintText(value.version, `${domain} snapshot.version`);
  for (const field of ["config", "descriptors", "policies", "metadata"]) {
    requireConstraintObject(value[field], `${domain} snapshot.${field}`);
  }
  if (!Array.isArray(value.adapters)) throw new TypeError(`${domain} snapshot.adapters must be an array.`);
  const adapters = value.adapters.map((entry, index) => requireConstraintText(entry, `${domain} snapshot.adapters[${index}]`));
  if (new Set(adapters).size !== adapters.length) throw new TypeError(`${domain} snapshot.adapters must not contain duplicates.`);
  value.adapters = adapters;
  value.sequence = requireConstraintNonnegativeInteger(value.sequence, `${domain} snapshot.sequence`);
  if (value.lastEvent !== null && typeof value.lastEvent !== "string") {
    throw new TypeError(`${domain} snapshot.lastEvent must be null or a string.`);
  }
  const hasOperationReceipts = value.operationReceipts !== undefined;
  const receipts = value.operationReceipts ?? {};
  requireConstraintObject(receipts, `${domain} snapshot.operationReceipts`);
  const normalizedReceipts = {};
  for (const operationId of Object.keys(receipts).sort()) {
    const receipt = receipts[operationId];
    requireConstraintObject(receipt, `${domain} operation receipt ${operationId}`);
    rejectConstraintFields(receipt, ["schema", "operationId", "requestHash", "kitId", "revision", "result"], `${domain} operation receipt ${operationId}`);
    if (receipt.schema !== "nexusengine.operation-receipt/1") {
      throw new TypeError(`${domain} operation receipt ${operationId}.schema must equal nexusengine.operation-receipt/1.`);
    }
    if (requireConstraintText(receipt.operationId, `${domain} operation receipt ${operationId}.operationId`) !== operationId) {
      throw new TypeError(`${domain} operation receipt key ${operationId} must match receipt.operationId.`);
    }
    if (typeof receipt.requestHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(receipt.requestHash)) {
      throw new TypeError(`${domain} operation receipt ${operationId}.requestHash must be a SHA-256 integrity string.`);
    }
    requireConstraintText(receipt.kitId, `${domain} operation receipt ${operationId}.kitId`);
    const receiptRevision = requireConstraintPositiveInteger(receipt.revision, `${domain} operation receipt ${operationId}.revision`);
    if (receiptRevision > value.sequence) {
      throw new TypeError(`${domain} operation receipt ${operationId}.revision cannot exceed snapshot.sequence.`);
    }
    normalizedReceipts[operationId] = canonicalConstraintValue(receipt, `${domain} operation receipt ${operationId}`);
  }
  if (hasOperationReceipts) value.operationReceipts = normalizedReceipts;
  else delete value.operationReceipts;
  validate?.(value);
  return value;
}

export function normalizeAtomicConstraintSnapshot(snapshot, domain) {
  return normalizeConstraintStateSnapshot(snapshot, { domain });
}

export function assertConstraintSnapshotIdentity(snapshot, current, kitId) {
  if (snapshot.id !== current.id) throw new TypeError(`Physics constraint snapshot.id must equal ${current.id}.`);
  if (snapshot.version !== current.version) throw new TypeError(`Physics constraint snapshot.version must equal ${current.version}.`);
  for (const [operationId, receipt] of Object.entries(snapshot.operationReceipts ?? {})) {
    if (receipt.kitId !== kitId) {
      throw new TypeError(`Physics constraint operation receipt ${operationId}.kitId must equal ${kitId}.`);
    }
  }
  return snapshot;
}

export function normalizeConstraintRegistrySnapshot(snapshot, normalize = normalizeConstraintDescriptor) {
  return normalizeConstraintStateSnapshot(snapshot, {
    domain: "physics-constraint-registry",
    fields: ["constraints", "order", "constraintRevision"],
    validate(value) {
      requireConstraintObject(value.constraints, "Physics constraint registry snapshot.constraints");
      const constraints = {};
      let liveRevisionTotal = 0;
      for (const id of Object.keys(value.constraints).sort()) {
        const record = normalizeConstraintRecord(value.constraints[id], normalize);
        if (record.constraint.id !== id) {
          throw new TypeError(`Physics constraint registry snapshot key ${id} must match constraint.id.`);
        }
        constraints[id] = record;
        liveRevisionTotal += record.revision;
      }
      value.constraints = constraints;
      const order = Object.keys(constraints).sort();
      if (!Array.isArray(value.order) || JSON.stringify(value.order) !== JSON.stringify(order)) {
        throw new TypeError("Physics constraint registry snapshot.order must contain every constraint ID in sorted order.");
      }
      value.order = order;
      value.constraintRevision = requireConstraintNonnegativeInteger(value.constraintRevision, "Physics constraint registry snapshot.constraintRevision");
      if (value.constraintRevision < liveRevisionTotal) {
        throw new TypeError("Physics constraint registry snapshot.constraintRevision cannot be below the sum of live record revisions.");
      }
      if (value.constraintRevision > value.sequence) {
        throw new TypeError("Physics constraint registry snapshot.constraintRevision cannot exceed snapshot.sequence.");
      }
    }
  });
}

export function sameConstraintValue(left, right) {
  return JSON.stringify(canonicalConstraintValue(left)) === JSON.stringify(canonicalConstraintValue(right));
}

export function constraintTypeContract(type) {
  if (!CONSTRAINT_TYPES.includes(type)) throw new TypeError(`Unknown Physics constraint type ${type}.`);
  return Object.freeze({
    schema: CONSTRAINT_SCHEMA,
    parametersSchema: CONSTRAINT_PARAMETER_SCHEMAS[type],
    type,
    frameSpace: "local-body",
    descriptorOnly: true,
    mutableStateOwner: "constraint-registry-kit",
    solverOwnedExternally: true,
    providerObjectsOwnedExternally: true
  });
}

export function constraintBreakContract() {
  return Object.freeze({
    schema: CONSTRAINT_BREAK_POLICY_SCHEMA,
    measurementSchema: CONSTRAINT_BREAK_MEASUREMENT_SCHEMA,
    pureEvaluation: true,
    statusOwner: "constraint-registry-kit",
    impulseOwner: "n:physics:solver"
  });
}

export function constraintRegistryContract() {
  return Object.freeze({
    recordSchema: CONSTRAINT_RECORD_SCHEMA,
    exactOnceCommands: true,
    expectedRevision: true,
    sortedOrder: true,
    oneStateOwner: true,
    bodyReferences: "public-body-registry",
    bodyDetachmentGuard: "assertBodyDetachable",
    bodyRemovalEnforcementOwner: "n:physics:integration",
    providerSynchronizationOwner: "n:physics:integration",
    brokenStateTerminal: true,
    supportedOperations: Object.freeze(["defineConstraint", "replaceConstraint", "removeConstraint", "transitionConstraint", "breakConstraint"])
  });
}
