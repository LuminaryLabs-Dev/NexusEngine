import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const SHAPE_SCHEMA = "nexusengine.physics-shape/1";
export const SHAPE_IDENTITY_SCHEMA = "nexusengine.physics-shape-identity/1";
export const SHAPE_DEFINE_COMMAND_SCHEMA = "nexusengine.physics-shape-define-command/1";
export const SHAPE_REMOVE_COMMAND_SCHEMA = "nexusengine.physics-shape-remove-command/1";

export const SHAPE_TYPES = Object.freeze([
  "sphere",
  "box",
  "capsule",
  "cylinder",
  "cone",
  "plane",
  "convex",
  "triangle-mesh",
  "heightfield",
  "compound",
  "scaled"
]);

const PARAMETERS = Object.freeze({
  sphere: Object.freeze(["radius"]),
  box: Object.freeze(["halfExtents"]),
  capsule: Object.freeze(["radius", "halfHeight"]),
  cylinder: Object.freeze(["radius", "halfHeight"]),
  cone: Object.freeze(["radius", "halfHeight"]),
  plane: Object.freeze(["normal", "offset"]),
  convex: Object.freeze(["vertices"]),
  "triangle-mesh": Object.freeze(["vertices", "indices"]),
  heightfield: Object.freeze(["columns", "rows", "samples", "cellSize"]),
  compound: Object.freeze(["children"]),
  scaled: Object.freeze(["shapeId", "scale"])
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

export function canonicalShapeValue(value, label = "value") {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireShapeObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectShapeFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireShapeText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireShapeNumber(value, label, { minimum = -Infinity, maximum = Infinity, exclusiveMinimum = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (exclusiveMinimum ? value <= minimum : value < minimum) {
    throw new TypeError(`${label} must be ${exclusiveMinimum ? "greater than" : "at least"} ${minimum}.`);
  }
  if (value > maximum) throw new TypeError(`${label} must be at most ${maximum}.`);
  return Object.is(value, -0) ? 0 : value;
}

function requireShapeInteger(value, label, minimum = 0) {
  if (!Number.isInteger(value) || value < minimum) throw new TypeError(`${label} must be an integer at least ${minimum}.`);
  return value;
}

function normalizeSchema(value, schema, label) {
  const normalized = value ?? schema;
  if (normalized !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return normalized;
}

function normalizeShapeType(value, label = "shape.type") {
  if (!SHAPE_TYPES.includes(value)) throw new TypeError(`${label} must be one of ${SHAPE_TYPES.join(", ")}.`);
  return value;
}

export function normalizeShapeVector(value, length, label, fallback) {
  const source = value ?? fallback;
  if (!Array.isArray(source) || source.length !== length) {
    throw new TypeError(`${label} must contain ${length} numbers.`);
  }
  return source.map((entry, index) => requireShapeNumber(entry, `${label}[${index}]`));
}

function normalizeShapeQuaternion(value, label) {
  const quaternion = normalizeShapeVector(value, 4, label, [0, 0, 0, 1]);
  const magnitude = Math.hypot(...quaternion);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  const normalized = quaternion.map((entry) => entry / magnitude);
  const decisive = [normalized[3], normalized[0], normalized[1], normalized[2]].find((entry) => Math.abs(entry) > 1e-12) ?? 1;
  const sign = decisive < 0 ? -1 : 1;
  return normalized.map((entry) => normalizeSignedZero(entry * sign));
}

function normalizeUnitVector(value, label) {
  const vector = normalizeShapeVector(value, 3, label);
  const magnitude = Math.hypot(...vector);
  if (magnitude <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  return vector.map((entry) => normalizeSignedZero(entry / magnitude));
}

function normalizeVertices(value, label, minimum) {
  if (!Array.isArray(value) || value.length < minimum) {
    throw new TypeError(`${label} must contain at least ${minimum} vertices.`);
  }
  const vertices = value.map((entry, index) => normalizeShapeVector(entry, 3, `${label}[${index}]`));
  const identities = new Set(vertices.map((entry) => JSON.stringify(entry)));
  if (identities.size !== vertices.length) throw new TypeError(`${label} cannot contain duplicate vertices.`);
  return vertices;
}

function normalizeCompoundChild(input, index) {
  const label = `shape.children[${index}]`;
  requireShapeObject(input, label);
  rejectShapeFields(input, ["shapeId", "position", "rotation", "metadata"], label);
  const value = canonicalShapeValue(input, label);
  return {
    shapeId: requireShapeText(value.shapeId, `${label}.shapeId`),
    position: normalizeShapeVector(value.position, 3, `${label}.position`, [0, 0, 0]),
    rotation: normalizeShapeQuaternion(value.rotation, `${label}.rotation`),
    metadata: canonicalShapeValue(value.metadata ?? {}, `${label}.metadata`)
  };
}

export function normalizeShapeIdentity(input = {}, options = {}) {
  requireShapeObject(input, "Physics shape identity");
  rejectShapeFields(input, ["schema", "id", "type", "metadata"], "Physics shape identity");
  const value = canonicalShapeValue(input, "Physics shape identity");
  return {
    schema: normalizeSchema(value.schema, SHAPE_IDENTITY_SCHEMA, "Physics shape identity"),
    id: requireShapeText(value.id ?? options.id, "Physics shape identity.id"),
    type: normalizeShapeType(value.type ?? options.type, "Physics shape identity.type"),
    metadata: canonicalShapeValue(value.metadata ?? {}, "Physics shape identity.metadata")
  };
}

export function normalizeShape(input = {}, expectedType) {
  requireShapeObject(input, "Physics shape");
  const value = canonicalShapeValue(input, "Physics shape");
  const type = normalizeShapeType(value.type ?? expectedType);
  if (expectedType !== undefined && type !== expectedType) {
    throw new TypeError(`Physics shape.type must equal ${expectedType}.`);
  }
  rejectShapeFields(value, ["schema", "id", "type", "metadata", ...PARAMETERS[type]], "Physics shape");

  const shape = {
    schema: normalizeSchema(value.schema, SHAPE_SCHEMA, "Physics shape"),
    id: requireShapeText(value.id, "Physics shape.id"),
    type,
    metadata: canonicalShapeValue(value.metadata ?? {}, "Physics shape.metadata")
  };

  if (type === "sphere") {
    shape.radius = requireShapeNumber(value.radius, "Physics shape.radius", { minimum: 0, exclusiveMinimum: true });
  } else if (["capsule", "cylinder", "cone"].includes(type)) {
    shape.radius = requireShapeNumber(value.radius, "Physics shape.radius", { minimum: 0, exclusiveMinimum: true });
    shape.halfHeight = requireShapeNumber(value.halfHeight, "Physics shape.halfHeight", { minimum: 0, exclusiveMinimum: true });
  } else if (type === "box") {
    shape.halfExtents = normalizeShapeVector(value.halfExtents, 3, "Physics shape.halfExtents")
      .map((entry, index) => requireShapeNumber(entry, `Physics shape.halfExtents[${index}]`, { minimum: 0, exclusiveMinimum: true }));
  } else if (type === "plane") {
    shape.normal = normalizeUnitVector(value.normal, "Physics shape.normal");
    shape.offset = requireShapeNumber(value.offset ?? 0, "Physics shape.offset");
  } else if (type === "convex") {
    shape.vertices = normalizeVertices(value.vertices, "Physics shape.vertices", 4);
  } else if (type === "triangle-mesh") {
    shape.vertices = normalizeVertices(value.vertices, "Physics shape.vertices", 3);
    if (!Array.isArray(value.indices) || value.indices.length < 3 || value.indices.length % 3 !== 0) {
      throw new TypeError("Physics shape.indices must contain complete triangle triplets.");
    }
    shape.indices = value.indices.map((entry, index) => {
      const vertexIndex = requireShapeInteger(entry, `Physics shape.indices[${index}]`);
      if (vertexIndex >= shape.vertices.length) throw new TypeError(`Physics shape.indices[${index}] is out of range.`);
      return vertexIndex;
    });
  } else if (type === "heightfield") {
    shape.columns = requireShapeInteger(value.columns, "Physics shape.columns", 2);
    shape.rows = requireShapeInteger(value.rows, "Physics shape.rows", 2);
    if (!Array.isArray(value.samples) || value.samples.length !== shape.columns * shape.rows) {
      throw new TypeError("Physics shape.samples must contain rows * columns heights.");
    }
    shape.samples = value.samples.map((entry, index) => requireShapeNumber(entry, `Physics shape.samples[${index}]`));
    shape.cellSize = normalizeShapeVector(value.cellSize, 2, "Physics shape.cellSize", [1, 1])
      .map((entry, index) => requireShapeNumber(entry, `Physics shape.cellSize[${index}]`, { minimum: 0, exclusiveMinimum: true }));
  } else if (type === "compound") {
    if (!Array.isArray(value.children) || value.children.length === 0) {
      throw new TypeError("Physics compound shape.children must not be empty.");
    }
    shape.children = value.children.map(normalizeCompoundChild);
  } else if (type === "scaled") {
    shape.shapeId = requireShapeText(value.shapeId, "Physics scaled shape.shapeId");
    shape.scale = normalizeShapeVector(value.scale, 3, "Physics scaled shape.scale")
      .map((entry, index) => requireShapeNumber(entry, `Physics scaled shape.scale[${index}]`, { minimum: 0, exclusiveMinimum: true }));
  }

  return shape;
}

export function normalizeShapeDefinitionCommand(command = {}) {
  requireShapeObject(command, "Physics shape definition command");
  rejectShapeFields(command, ["schema", "operationId", "shape"], "Physics shape definition command");
  const value = canonicalShapeValue(command, "Physics shape definition command");
  return {
    schema: normalizeSchema(value.schema, SHAPE_DEFINE_COMMAND_SCHEMA, "Physics shape definition command"),
    operationId: requireShapeText(value.operationId, "Physics shape definition command.operationId"),
    shape: normalizeShape(value.shape)
  };
}

export function normalizeShapeRemovalCommand(command = {}) {
  requireShapeObject(command, "Physics shape removal command");
  rejectShapeFields(command, ["schema", "operationId", "shapeId"], "Physics shape removal command");
  const value = canonicalShapeValue(command, "Physics shape removal command");
  return {
    schema: normalizeSchema(value.schema, SHAPE_REMOVE_COMMAND_SCHEMA, "Physics shape removal command"),
    operationId: requireShapeText(value.operationId, "Physics shape removal command.operationId"),
    shapeId: requireShapeText(value.shapeId, "Physics shape removal command.shapeId")
  };
}

export function sameShapeValue(left, right) {
  return JSON.stringify(canonicalShapeValue(left, "left shape")) === JSON.stringify(canonicalShapeValue(right, "right shape"));
}

export function inspectShapeValue(normalize, input, schema = SHAPE_SCHEMA) {
  try {
    const value = normalize(input);
    return Object.freeze({ schema, valid: true, value, errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      value: null,
      errors: Object.freeze([Object.freeze({ code: "invalid-shape", message: error.message })])
    });
  }
}

export function normalizeAtomicShapeSnapshot(snapshot, domain) {
  requireShapeObject(snapshot, `${domain} snapshot`);
  rejectShapeFields(snapshot, COMMON_STATE_KEYS, `${domain} snapshot`);
  const value = canonicalShapeValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireShapeInteger(value.sequence, `${domain} snapshot.sequence`);
  return value;
}

export function normalizeShapeRegistrySnapshot(snapshot) {
  requireShapeObject(snapshot, "Physics shape registry snapshot");
  rejectShapeFields(snapshot, [...COMMON_STATE_KEYS, "shapes", "order", "shapeRevision"], "Physics shape registry snapshot");
  const value = canonicalShapeValue(snapshot, "Physics shape registry snapshot");
  if (value.domain !== "physics-shape-registry") {
    throw new TypeError("Physics shape registry snapshot.domain must equal physics-shape-registry.");
  }
  requireShapeInteger(value.sequence, "Physics shape registry snapshot.sequence");
  requireShapeInteger(value.shapeRevision, "Physics shape registry snapshot.shapeRevision");
  requireShapeObject(value.shapes, "Physics shape registry snapshot.shapes");
  const shapes = Object.fromEntries(Object.keys(value.shapes).sort().map((shapeId) => {
    const shape = normalizeShape(value.shapes[shapeId]);
    if (shape.id !== shapeId) throw new TypeError(`Physics shape registry key ${shapeId} must match shape.id.`);
    return [shapeId, shape];
  }));
  const order = Object.keys(shapes).sort();
  if (value.order !== undefined && JSON.stringify(value.order) !== JSON.stringify(order)) {
    throw new TypeError("Physics shape registry snapshot.order must equal sorted shape IDs.");
  }
  return { ...value, shapes, order };
}

export function shapeParameters(type) {
  return Object.freeze([...(PARAMETERS[normalizeShapeType(type)] ?? [])]);
}

export function createShapeKit({ createDomainKit, type, id, apiName, purpose, provides }) {
  normalizeShapeType(type, "Shape Kit type");
  return function createKit(config = {}) {
    const domain = `physics-${type}-shape`;
    const normalize = (input) => normalizeShape(input, type);
    return createDomainKit({
      ...config,
      manifestId: id,
      id: config.id ?? id,
      domain,
      domainPath: "n:physics:shape",
      parentDomainPath: "n:physics",
      apiName: config.apiName ?? apiName,
      requires: ["n:physics"],
      provides: ["n:physics:shape", ...provides.filter((token) => token !== "n:physics:shape")],
      purpose,
      owns: [`portable ${type} shape descriptors`, `${type} shape validation`],
      doesNotOwn: ["collision detection", "solver execution", "provider objects", "render geometry"],
      createApi({ baseApi }) {
        return {
          ...baseApi,
          getContract() {
            return Object.freeze({
              schema: SHAPE_SCHEMA,
              type,
              parameters: shapeParameters(type),
              providerExecutionOwnedExternally: true
            });
          },
          normalize,
          inspect(input) {
            return inspectShapeValue(normalize, input);
          },
          loadSnapshot(snapshot) {
            return baseApi.loadSnapshot(normalizeAtomicShapeSnapshot(snapshot, domain));
          }
        };
      }
    });
  };
}
