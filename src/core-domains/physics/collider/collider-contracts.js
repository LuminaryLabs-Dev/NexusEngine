import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const COLLIDER_SCHEMAS = Object.freeze({
  identity: "nexusengine.physics-collider-identity/1",
  attachment: "nexusengine.physics-collider-attachment/1",
  pose: "nexusengine.physics-collider-pose/1",
  material: "nexusengine.physics-collider-material/1",
  filter: "nexusengine.physics-collider-filter/1",
  layer: "nexusengine.physics-collision-layer/1",
  mask: "nexusengine.physics-collision-mask/1",
  group: "nexusengine.physics-collision-group/1",
  sensor: "nexusengine.physics-sensor-collider/1",
  trigger: "nexusengine.physics-trigger-collider/1",
  lifecycle: "nexusengine.physics-collider-lifecycle/1",
  collider: "nexusengine.physics-collider/1",
  record: "nexusengine.physics-collider-record/1",
  defineCommand: "nexusengine.physics-collider-define-command/1",
  replaceCommand: "nexusengine.physics-collider-replace-command/1",
  removeCommand: "nexusengine.physics-collider-remove-command/1",
  lifecycleCommand: "nexusengine.physics-collider-lifecycle-command/1"
});

export const COLLISION_LAYER_MIN = 0;
export const COLLISION_LAYER_MAX = 31;
export const COLLIDER_LIFECYCLE_STATES = Object.freeze(["enabled", "disabled"]);
export const COLLIDER_TRIGGER_EVENTS = Object.freeze(["enter", "stay", "exit"]);

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

export function canonicalColliderValue(value, label = "value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireColliderObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

export function rejectColliderFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireColliderText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

export function requireColliderNumber(value, label, { minimum = -Infinity, maximum = Infinity } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (value < minimum || value > maximum) throw new TypeError(`${label} must be between ${minimum} and ${maximum}.`);
  return Object.is(value, -0) ? 0 : value;
}

export function requireColliderInteger(value, label, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new TypeError(`${label} must be a safe integer between ${minimum} and ${maximum}.`);
  }
  return value;
}

function requireColliderBoolean(value, label, fallback) {
  const normalized = value === undefined ? fallback : value;
  if (typeof normalized !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return normalized;
}

function normalizeSchema(value, schema, label) {
  const normalized = value ?? schema;
  if (normalized !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return normalized;
}

function normalizeTags(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return [...new Set(value.map((entry, index) => requireColliderText(entry, `${label}[${index}]`)))].sort();
}

function normalizeVector(value, length, label, fallback) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== length) throw new TypeError(`${label} must contain ${length} numbers.`);
  return source.map((entry, index) => requireColliderNumber(entry, `${label}[${index}]`));
}

function normalizeQuaternion(value, label) {
  const quaternion = normalizeVector(value, 4, label, [0, 0, 0, 1]);
  const magnitude = Math.hypot(...quaternion);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  const normalized = quaternion.map((entry) => entry / magnitude);
  const decisive = [normalized[3], normalized[0], normalized[1], normalized[2]].find((entry) => Math.abs(entry) > 1e-12) ?? 1;
  const sign = decisive < 0 ? -1 : 1;
  return normalized.map((entry) => normalizeSignedZero(entry * sign));
}

function normalizeOptionalRevision(value, label) {
  return value === undefined ? undefined : requireColliderInteger(value, label, { minimum: 1 });
}

function normalizeLayerValue(value, label) {
  return requireColliderInteger(value, label, { minimum: COLLISION_LAYER_MIN, maximum: COLLISION_LAYER_MAX });
}

function layersFromBits(bits) {
  const layers = [];
  for (let layer = COLLISION_LAYER_MIN; layer <= COLLISION_LAYER_MAX; layer += 1) {
    if (Math.floor(bits / (2 ** layer)) % 2 === 1) layers.push(layer);
  }
  return layers;
}

function bitsFromLayers(layers) {
  return layers.reduce((bits, layer) => bits + (2 ** layer), 0);
}

export function normalizeColliderIdentity(input = {}, options = {}) {
  requireColliderObject(input, "Physics collider identity");
  rejectColliderFields(input, ["schema", "id", "tags", "metadata"], "Physics collider identity");
  const value = canonicalColliderValue(input, "Physics collider identity");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.identity, "Physics collider identity"),
    id: requireColliderText(value.id ?? options.id, "Physics collider identity.id"),
    tags: normalizeTags(value.tags, "Physics collider identity.tags"),
    metadata: canonicalColliderValue(value.metadata ?? {}, "Physics collider identity.metadata")
  };
}

export function normalizeColliderAttachment(input = {}) {
  requireColliderObject(input, "Physics collider attachment");
  rejectColliderFields(input, ["schema", "bodyId", "shapeId", "bodyRevision"], "Physics collider attachment");
  const value = canonicalColliderValue(input, "Physics collider attachment");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.attachment, "Physics collider attachment"),
    bodyId: requireColliderText(value.bodyId, "Physics collider attachment.bodyId"),
    shapeId: requireColliderText(value.shapeId, "Physics collider attachment.shapeId"),
    ...(value.bodyRevision === undefined ? {} : { bodyRevision: normalizeOptionalRevision(value.bodyRevision, "Physics collider attachment.bodyRevision") })
  };
}

export function normalizeColliderPose(input = {}) {
  requireColliderObject(input, "Physics collider pose");
  rejectColliderFields(input, ["schema", "position", "rotation"], "Physics collider pose");
  const value = canonicalColliderValue(input, "Physics collider pose");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.pose, "Physics collider pose"),
    position: normalizeVector(value.position, 3, "Physics collider pose.position", [0, 0, 0]),
    rotation: normalizeQuaternion(value.rotation, "Physics collider pose.rotation")
  };
}

export function normalizeColliderMaterial(input = {}) {
  requireColliderObject(input, "Physics collider material");
  rejectColliderFields(input, ["schema", "materialId"], "Physics collider material");
  const value = canonicalColliderValue(input, "Physics collider material");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.material, "Physics collider material"),
    materialId: requireColliderText(value.materialId, "Physics collider material.materialId")
  };
}

export function normalizeCollisionLayer(input = {}) {
  requireColliderObject(input, "Physics collision layer");
  rejectColliderFields(input, ["schema", "layer"], "Physics collision layer");
  const value = canonicalColliderValue(input, "Physics collision layer");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.layer, "Physics collision layer"),
    layer: normalizeLayerValue(value.layer ?? 0, "Physics collision layer.layer")
  };
}

export function normalizeCollisionMask(input = {}) {
  requireColliderObject(input, "Physics collision mask");
  rejectColliderFields(input, ["schema", "layers", "bits"], "Physics collision mask");
  const value = canonicalColliderValue(input, "Physics collision mask");
  const maximumBits = (2 ** (COLLISION_LAYER_MAX + 1)) - 1;
  const suppliedBits = value.bits === undefined
    ? undefined
    : requireColliderInteger(value.bits, "Physics collision mask.bits", { minimum: 0, maximum: maximumBits });
  const sourceLayers = value.layers ?? (suppliedBits === undefined ? [0] : layersFromBits(suppliedBits));
  if (!Array.isArray(sourceLayers)) throw new TypeError("Physics collision mask.layers must be an array.");
  const layers = [...new Set(sourceLayers.map((entry, index) => normalizeLayerValue(entry, `Physics collision mask.layers[${index}]`)))].sort((left, right) => left - right);
  const bits = bitsFromLayers(layers);
  if (suppliedBits !== undefined && suppliedBits !== bits) throw new TypeError("Physics collision mask.bits must equal the selected layers.");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.mask, "Physics collision mask"),
    layers,
    bits
  };
}

export function normalizeCollisionGroup(input = {}) {
  requireColliderObject(input, "Physics collision group");
  rejectColliderFields(input, ["schema", "id", "layer", "maskLayers", "maskBits", "metadata"], "Physics collision group");
  const value = canonicalColliderValue(input, "Physics collision group");
  const mask = normalizeCollisionMask({
    ...(value.maskLayers === undefined ? {} : { layers: value.maskLayers }),
    ...(value.maskBits === undefined ? {} : { bits: value.maskBits })
  });
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.group, "Physics collision group"),
    id: requireColliderText(value.id, "Physics collision group.id"),
    layer: normalizeLayerValue(value.layer ?? 0, "Physics collision group.layer"),
    maskLayers: mask.layers,
    maskBits: mask.bits,
    metadata: canonicalColliderValue(value.metadata ?? {}, "Physics collision group.metadata")
  };
}

export function normalizeColliderFilter(input = {}) {
  requireColliderObject(input, "Physics collider filter");
  rejectColliderFields(input, ["schema", "layer", "maskLayers", "maskBits", "groupId", "excludedColliderIds"], "Physics collider filter");
  const value = canonicalColliderValue(input, "Physics collider filter");
  const mask = normalizeCollisionMask({
    ...(value.maskLayers === undefined ? {} : { layers: value.maskLayers }),
    ...(value.maskBits === undefined ? {} : { bits: value.maskBits })
  });
  const excludedColliderIds = value.excludedColliderIds === undefined
    ? []
    : normalizeTags(value.excludedColliderIds, "Physics collider filter.excludedColliderIds");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.filter, "Physics collider filter"),
    layer: normalizeLayerValue(value.layer ?? 0, "Physics collider filter.layer"),
    maskLayers: mask.layers,
    maskBits: mask.bits,
    groupId: value.groupId === undefined || value.groupId === null
      ? null
      : requireColliderText(value.groupId, "Physics collider filter.groupId"),
    excludedColliderIds
  };
}

export function normalizeSensorCollider(input = {}) {
  requireColliderObject(input, "Physics sensor collider");
  rejectColliderFields(input, ["schema", "enabled", "reportContacts"], "Physics sensor collider");
  const value = canonicalColliderValue(input, "Physics sensor collider");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.sensor, "Physics sensor collider"),
    enabled: requireColliderBoolean(value.enabled, "Physics sensor collider.enabled", false),
    reportContacts: requireColliderBoolean(value.reportContacts, "Physics sensor collider.reportContacts", false)
  };
}

export function normalizeTriggerCollider(input = {}) {
  requireColliderObject(input, "Physics trigger collider");
  rejectColliderFields(input, ["schema", "enabled", "events"], "Physics trigger collider");
  const value = canonicalColliderValue(input, "Physics trigger collider");
  const sourceEvents = value.events ?? ["enter", "exit"];
  if (!Array.isArray(sourceEvents)) throw new TypeError("Physics trigger collider.events must be an array.");
  const selected = new Set(sourceEvents.map((entry, index) => {
    const event = requireColliderText(entry, `Physics trigger collider.events[${index}]`);
    if (!COLLIDER_TRIGGER_EVENTS.includes(event)) throw new TypeError(`Physics trigger collider event ${event} is unsupported.`);
    return event;
  }));
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.trigger, "Physics trigger collider"),
    enabled: requireColliderBoolean(value.enabled, "Physics trigger collider.enabled", false),
    events: COLLIDER_TRIGGER_EVENTS.filter((event) => selected.has(event))
  };
}

export function normalizeColliderLifecycle(input = {}) {
  requireColliderObject(input, "Physics collider lifecycle");
  rejectColliderFields(input, ["schema", "status"], "Physics collider lifecycle");
  const value = canonicalColliderValue(input, "Physics collider lifecycle");
  const status = value.status ?? "enabled";
  if (!COLLIDER_LIFECYCLE_STATES.includes(status)) {
    throw new TypeError(`Physics collider lifecycle.status must be one of ${COLLIDER_LIFECYCLE_STATES.join(", ")}.`);
  }
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.lifecycle, "Physics collider lifecycle"),
    status
  };
}

function normalizePart(parts, name, fallback, input) {
  return (parts?.[name] ?? fallback)(input);
}

export function normalizeCollider(input = {}, parts = {}) {
  requireColliderObject(input, "Physics collider");
  rejectColliderFields(input, ["schema", "identity", "attachment", "pose", "material", "filter", "sensor", "trigger", "lifecycle"], "Physics collider");
  const value = canonicalColliderValue(input, "Physics collider");
  const sensor = normalizePart(parts, "sensor", normalizeSensorCollider, value.sensor ?? {});
  const trigger = normalizePart(parts, "trigger", normalizeTriggerCollider, value.trigger ?? {});
  if (trigger.enabled && !sensor.enabled) throw new TypeError("A trigger collider requires sensor.enabled.");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.collider, "Physics collider"),
    identity: normalizePart(parts, "identity", normalizeColliderIdentity, value.identity),
    attachment: normalizePart(parts, "attachment", normalizeColliderAttachment, value.attachment),
    pose: normalizePart(parts, "pose", normalizeColliderPose, value.pose ?? {}),
    material: normalizePart(parts, "material", normalizeColliderMaterial, value.material),
    filter: normalizePart(parts, "filter", normalizeColliderFilter, value.filter ?? {}),
    sensor,
    trigger,
    lifecycle: normalizePart(parts, "lifecycle", normalizeColliderLifecycle, value.lifecycle ?? {})
  };
}

export function normalizeColliderRecord(input = {}, normalize = normalizeCollider) {
  requireColliderObject(input, "Physics collider record");
  rejectColliderFields(input, ["schema", "collider", "revision"], "Physics collider record");
  const value = canonicalColliderValue(input, "Physics collider record");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.record, "Physics collider record"),
    collider: normalize(value.collider),
    revision: requireColliderInteger(value.revision, "Physics collider record.revision", { minimum: 1 })
  };
}

export function normalizeColliderDefinitionCommand(command = {}, normalize = normalizeCollider) {
  requireColliderObject(command, "Physics collider definition command");
  rejectColliderFields(command, ["schema", "operationId", "collider"], "Physics collider definition command");
  const value = canonicalColliderValue(command, "Physics collider definition command");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.defineCommand, "Physics collider definition command"),
    operationId: requireColliderText(value.operationId, "Physics collider definition command.operationId"),
    collider: normalize(value.collider)
  };
}

export function normalizeColliderReplacementCommand(command = {}, normalize = normalizeCollider) {
  requireColliderObject(command, "Physics collider replacement command");
  rejectColliderFields(command, ["schema", "operationId", "collider", "expectedRevision"], "Physics collider replacement command");
  const value = canonicalColliderValue(command, "Physics collider replacement command");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.replaceCommand, "Physics collider replacement command"),
    operationId: requireColliderText(value.operationId, "Physics collider replacement command.operationId"),
    collider: normalize(value.collider),
    ...(value.expectedRevision === undefined ? {} : { expectedRevision: normalizeOptionalRevision(value.expectedRevision, "Physics collider replacement command.expectedRevision") })
  };
}

export function normalizeColliderRemovalCommand(command = {}) {
  requireColliderObject(command, "Physics collider removal command");
  rejectColliderFields(command, ["schema", "operationId", "colliderId", "expectedRevision"], "Physics collider removal command");
  const value = canonicalColliderValue(command, "Physics collider removal command");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.removeCommand, "Physics collider removal command"),
    operationId: requireColliderText(value.operationId, "Physics collider removal command.operationId"),
    colliderId: requireColliderText(value.colliderId, "Physics collider removal command.colliderId"),
    ...(value.expectedRevision === undefined ? {} : { expectedRevision: normalizeOptionalRevision(value.expectedRevision, "Physics collider removal command.expectedRevision") })
  };
}

export function normalizeColliderLifecycleCommand(command = {}) {
  requireColliderObject(command, "Physics collider lifecycle command");
  rejectColliderFields(command, ["schema", "operationId", "colliderId", "status", "expectedRevision"], "Physics collider lifecycle command");
  const value = canonicalColliderValue(command, "Physics collider lifecycle command");
  return {
    schema: normalizeSchema(value.schema, COLLIDER_SCHEMAS.lifecycleCommand, "Physics collider lifecycle command"),
    operationId: requireColliderText(value.operationId, "Physics collider lifecycle command.operationId"),
    colliderId: requireColliderText(value.colliderId, "Physics collider lifecycle command.colliderId"),
    status: normalizeColliderLifecycle({ status: value.status }).status,
    ...(value.expectedRevision === undefined ? {} : { expectedRevision: normalizeOptionalRevision(value.expectedRevision, "Physics collider lifecycle command.expectedRevision") })
  };
}

export function sameColliderValue(left, right) {
  return JSON.stringify(canonicalColliderValue(left, "left collider")) === JSON.stringify(canonicalColliderValue(right, "right collider"));
}

export function inspectColliderValue(normalize, input, schema) {
  try {
    return Object.freeze({ schema, valid: true, value: normalize(input), errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      value: null,
      errors: Object.freeze([Object.freeze({ code: "invalid-collider", message: error.message })])
    });
  }
}

export function normalizeAtomicColliderSnapshot(snapshot, domain) {
  requireColliderObject(snapshot, `${domain} snapshot`);
  rejectColliderFields(snapshot, COMMON_STATE_KEYS, `${domain} snapshot`);
  const value = canonicalColliderValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireColliderInteger(value.sequence, `${domain} snapshot.sequence`);
  return value;
}

export function normalizeColliderRegistrySnapshot(snapshot, normalize = normalizeCollider) {
  requireColliderObject(snapshot, "Physics collider registry snapshot");
  rejectColliderFields(snapshot, [...COMMON_STATE_KEYS, "colliders", "order", "colliderRevision"], "Physics collider registry snapshot");
  const value = canonicalColliderValue(snapshot, "Physics collider registry snapshot");
  if (value.domain !== "physics-collider-registry") {
    throw new TypeError("Physics collider registry snapshot.domain must equal physics-collider-registry.");
  }
  requireColliderInteger(value.sequence, "Physics collider registry snapshot.sequence");
  requireColliderInteger(value.colliderRevision, "Physics collider registry snapshot.colliderRevision");
  requireColliderObject(value.colliders, "Physics collider registry snapshot.colliders");
  const colliders = Object.fromEntries(Object.keys(value.colliders).sort().map((colliderId) => {
    const record = normalizeColliderRecord(value.colliders[colliderId], normalize);
    if (record.collider.identity.id !== colliderId) {
      throw new TypeError(`Physics collider registry key ${colliderId} must match collider.identity.id.`);
    }
    return [colliderId, record];
  }));
  const order = Object.keys(colliders).sort();
  if (value.order !== undefined && JSON.stringify(value.order) !== JSON.stringify(order)) {
    throw new TypeError("Physics collider registry snapshot.order must equal sorted collider IDs.");
  }
  const minimumColliderRevision = Object.values(colliders)
    .reduce((total, record) => total + record.revision, 0);
  if (value.colliderRevision < minimumColliderRevision) {
    throw new TypeError(`Physics collider registry snapshot.colliderRevision must be at least ${minimumColliderRevision}.`);
  }
  if (value.sequence < value.colliderRevision) {
    throw new TypeError("Physics collider registry snapshot.sequence cannot be lower than colliderRevision.");
  }
  return { ...value, colliders, order };
}
