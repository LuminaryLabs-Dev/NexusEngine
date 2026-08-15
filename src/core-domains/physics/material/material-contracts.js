import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const PHYSICS_MATERIAL_SCHEMA = "nexusengine.physics-material/1";
export const FRICTION_MATERIAL_SCHEMA = "nexusengine.physics-friction-material/1";
export const RESTITUTION_MATERIAL_SCHEMA = "nexusengine.physics-restitution-material/1";
export const DENSITY_MATERIAL_SCHEMA = "nexusengine.physics-density-material/1";
export const SURFACE_MATERIAL_SCHEMA = "nexusengine.physics-surface-material/1";
export const MATERIAL_COMBINE_POLICY_SCHEMA = "nexusengine.physics-material-combine-policy/1";
export const MATERIAL_PAIR_SCHEMA = "nexusengine.physics-material-pair/1";

export const MATERIAL_COMBINE_MODES = Object.freeze([
  "average",
  "minimum",
  "multiply",
  "maximum",
  "geometric-mean"
]);

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

const COMBINE_RANK = Object.freeze({
  average: 0,
  minimum: 1,
  multiply: 2,
  maximum: 3,
  "geometric-mean": 4
});

export function canonicalMaterialValue(value, label = "value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireMaterialObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectMaterialFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) {
    throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
  }
}

export function requireMaterialText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function requireMaterialNumber(value, label, { minimum = -Infinity, maximum = Infinity, exclusiveMinimum = false } = {}) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  if (exclusiveMinimum ? value <= minimum : value < minimum) {
    const comparison = exclusiveMinimum ? "greater than" : "at least";
    throw new TypeError(`${label} must be ${comparison} ${minimum}.`);
  }
  if (value > maximum) throw new TypeError(`${label} must be at most ${maximum}.`);
  return value;
}

function requireNonnegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a nonnegative integer.`);
  }
  return value;
}

function normalizeSchema(value, schema, label) {
  const normalized = value ?? schema;
  if (normalized !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return normalized;
}

function normalizeMetadata(value, label) {
  return canonicalMaterialValue(value ?? {}, `${label}.metadata`);
}

function normalizeTags(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return [...new Set(value.map((entry, index) => requireMaterialText(entry, `${label}[${index}]`)))].sort();
}

function normalizeDirection(value, label) {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new TypeError(`${label} must be a three-number array.`);
  }
  const direction = value.map((entry, index) => requireMaterialNumber(entry, `${label}[${index}]`));
  const length = Math.hypot(...direction);
  if (length <= 1e-12) throw new TypeError(`${label} must have nonzero length.`);
  return direction.map((entry) => entry / length);
}

function normalizeAnisotropy(value, fallback, label) {
  if (value === undefined || value === null) return null;
  requireMaterialObject(value, label);
  rejectMaterialFields(value, ["direction", "staticCoefficient", "dynamicCoefficient"], label);
  const normalized = canonicalMaterialValue(value, label);
  return {
    direction: normalizeDirection(normalized.direction, `${label}.direction`),
    staticCoefficient: requireMaterialNumber(
      normalized.staticCoefficient ?? fallback.staticCoefficient,
      `${label}.staticCoefficient`,
      { minimum: 0 }
    ),
    dynamicCoefficient: requireMaterialNumber(
      normalized.dynamicCoefficient ?? fallback.dynamicCoefficient,
      `${label}.dynamicCoefficient`,
      { minimum: 0 }
    )
  };
}

export function normalizeFrictionMaterial(input = {}, options = {}) {
  requireMaterialObject(input, "friction material");
  rejectMaterialFields(input, [
    "schema",
    "id",
    "staticCoefficient",
    "dynamicCoefficient",
    "rollingCoefficient",
    "spinningCoefficient",
    "anisotropy",
    "metadata"
  ], "friction material");
  const normalized = canonicalMaterialValue(input, "friction material");
  const id = requireMaterialText(normalized.id ?? options.id, "friction material.id");
  const staticCoefficient = requireMaterialNumber(
    normalized.staticCoefficient ?? 0.6,
    "friction material.staticCoefficient",
    { minimum: 0 }
  );
  const dynamicCoefficient = requireMaterialNumber(
    normalized.dynamicCoefficient ?? 0.5,
    "friction material.dynamicCoefficient",
    { minimum: 0 }
  );
  return {
    schema: normalizeSchema(normalized.schema, FRICTION_MATERIAL_SCHEMA, "friction material"),
    id,
    staticCoefficient,
    dynamicCoefficient,
    rollingCoefficient: requireMaterialNumber(
      normalized.rollingCoefficient ?? 0,
      "friction material.rollingCoefficient",
      { minimum: 0 }
    ),
    spinningCoefficient: requireMaterialNumber(
      normalized.spinningCoefficient ?? 0,
      "friction material.spinningCoefficient",
      { minimum: 0 }
    ),
    anisotropy: normalizeAnisotropy(normalized.anisotropy, { staticCoefficient, dynamicCoefficient }, "friction material.anisotropy"),
    metadata: normalizeMetadata(normalized.metadata, "friction material")
  };
}

export function normalizeRestitutionMaterial(input = {}, options = {}) {
  requireMaterialObject(input, "restitution material");
  rejectMaterialFields(input, ["schema", "id", "coefficient", "thresholdSpeed", "metadata"], "restitution material");
  const normalized = canonicalMaterialValue(input, "restitution material");
  return {
    schema: normalizeSchema(normalized.schema, RESTITUTION_MATERIAL_SCHEMA, "restitution material"),
    id: requireMaterialText(normalized.id ?? options.id, "restitution material.id"),
    coefficient: requireMaterialNumber(
      normalized.coefficient ?? 0,
      "restitution material.coefficient",
      { minimum: 0, maximum: 1 }
    ),
    thresholdSpeed: requireMaterialNumber(
      normalized.thresholdSpeed ?? 1,
      "restitution material.thresholdSpeed",
      { minimum: 0 }
    ),
    metadata: normalizeMetadata(normalized.metadata, "restitution material")
  };
}

export function normalizeDensityMaterial(input = {}, options = {}) {
  requireMaterialObject(input, "density material");
  rejectMaterialFields(input, ["schema", "id", "kilogramsPerCubicMeter", "metadata"], "density material");
  const normalized = canonicalMaterialValue(input, "density material");
  return {
    schema: normalizeSchema(normalized.schema, DENSITY_MATERIAL_SCHEMA, "density material"),
    id: requireMaterialText(normalized.id ?? options.id, "density material.id"),
    kilogramsPerCubicMeter: requireMaterialNumber(
      normalized.kilogramsPerCubicMeter ?? 1000,
      "density material.kilogramsPerCubicMeter",
      { minimum: 0, exclusiveMinimum: true }
    ),
    metadata: normalizeMetadata(normalized.metadata, "density material")
  };
}

export function normalizeSurfaceMaterial(input = {}, options = {}) {
  requireMaterialObject(input, "surface material");
  rejectMaterialFields(input, ["schema", "id", "surfaceType", "tags", "metadata"], "surface material");
  const normalized = canonicalMaterialValue(input, "surface material");
  return {
    schema: normalizeSchema(normalized.schema, SURFACE_MATERIAL_SCHEMA, "surface material"),
    id: requireMaterialText(normalized.id ?? options.id, "surface material.id"),
    surfaceType: requireMaterialText(normalized.surfaceType ?? "generic", "surface material.surfaceType"),
    tags: normalizeTags(normalized.tags, "surface material.tags"),
    metadata: normalizeMetadata(normalized.metadata, "surface material")
  };
}

export function normalizeCombineMode(value, label) {
  if (!MATERIAL_COMBINE_MODES.includes(value)) {
    throw new TypeError(`${label} must be one of ${MATERIAL_COMBINE_MODES.join(", ")}.`);
  }
  return value;
}

export function normalizeMaterialCombinePolicy(input = {}, options = {}) {
  requireMaterialObject(input, "material combine policy");
  rejectMaterialFields(input, ["schema", "id", "frictionMode", "restitutionMode", "priority", "metadata"], "material combine policy");
  const normalized = canonicalMaterialValue(input, "material combine policy");
  return {
    schema: normalizeSchema(normalized.schema, MATERIAL_COMBINE_POLICY_SCHEMA, "material combine policy"),
    id: requireMaterialText(normalized.id ?? options.id, "material combine policy.id"),
    frictionMode: normalizeCombineMode(normalized.frictionMode ?? "average", "material combine policy.frictionMode"),
    restitutionMode: normalizeCombineMode(normalized.restitutionMode ?? "maximum", "material combine policy.restitutionMode"),
    priority: requireNonnegativeInteger(normalized.priority ?? 0, "material combine policy.priority"),
    metadata: normalizeMetadata(normalized.metadata, "material combine policy")
  };
}

export function normalizePhysicsMaterial(input = {}) {
  requireMaterialObject(input, "physics material");
  rejectMaterialFields(input, [
    "schema",
    "id",
    "friction",
    "restitution",
    "density",
    "surface",
    "combinePolicy",
    "metadata"
  ], "physics material");
  const normalized = canonicalMaterialValue(input, "physics material");
  const id = requireMaterialText(normalized.id, "physics material.id");
  return {
    schema: normalizeSchema(normalized.schema, PHYSICS_MATERIAL_SCHEMA, "physics material"),
    id,
    friction: normalizeFrictionMaterial(normalized.friction ?? {}, { id: `${id}:friction` }),
    restitution: normalizeRestitutionMaterial(normalized.restitution ?? {}, { id: `${id}:restitution` }),
    density: normalizeDensityMaterial(normalized.density ?? {}, { id: `${id}:density` }),
    surface: normalizeSurfaceMaterial(normalized.surface ?? {}, { id: `${id}:surface` }),
    combinePolicy: normalizeMaterialCombinePolicy(normalized.combinePolicy ?? {}, { id: `${id}:combine-policy` }),
    metadata: normalizeMetadata(normalized.metadata, "physics material")
  };
}

export function normalizeMaterialDefinitionCommand(command = {}) {
  requireMaterialObject(command, "physics material definition command");
  rejectMaterialFields(command, ["schema", "operationId", "material"], "physics material definition command");
  const normalized = canonicalMaterialValue(command, "physics material definition command");
  normalized.schema = normalizeSchema(normalized.schema, "nexusengine.physics-material-define-command/1", "physics material definition command");
  normalized.operationId = requireMaterialText(normalized.operationId, "physics material definition command.operationId");
  normalized.material = normalizePhysicsMaterial(normalized.material);
  return normalized;
}

export function normalizeMaterialRemovalCommand(command = {}) {
  requireMaterialObject(command, "physics material removal command");
  rejectMaterialFields(command, ["schema", "operationId", "materialId"], "physics material removal command");
  const normalized = canonicalMaterialValue(command, "physics material removal command");
  normalized.schema = normalizeSchema(normalized.schema, "nexusengine.physics-material-remove-command/1", "physics material removal command");
  normalized.operationId = requireMaterialText(normalized.operationId, "physics material removal command.operationId");
  normalized.materialId = requireMaterialText(normalized.materialId, "physics material removal command.materialId");
  return normalized;
}

export function normalizeMaterialId(value, label = "materialId") {
  return requireMaterialText(value, label);
}

export function inspectMaterialValue(normalize, input, schema) {
  try {
    normalize(input);
    return Object.freeze({ schema, valid: true, errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema,
      valid: false,
      errors: Object.freeze([Object.freeze({ code: "invalid-material", message: error.message })])
    });
  }
}

export function normalizeMaterialState(snapshot, { domain, fields = [], validate } = {}) {
  requireMaterialObject(snapshot, `${domain} snapshot`);
  rejectMaterialFields(snapshot, [...COMMON_STATE_KEYS, ...fields], `${domain} snapshot`);
  const normalized = canonicalMaterialValue(snapshot, `${domain} snapshot`);
  if (normalized.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireNonnegativeInteger(normalized.sequence, `${domain} snapshot.sequence`);
  validate?.(normalized);
  return normalized;
}

export function normalizeAtomicMaterialSnapshot(snapshot, domain) {
  return normalizeMaterialState(snapshot, { domain });
}

export function normalizePhysicsMaterialSnapshot(snapshot) {
  return normalizeMaterialState(snapshot, {
    domain: "physics-material",
    fields: ["materials", "order", "materialRevision"],
    validate(value) {
      requireMaterialObject(value.materials, "physics material snapshot.materials");
      const materials = {};
      for (const id of Object.keys(value.materials).sort()) {
        const material = normalizePhysicsMaterial(value.materials[id]);
        if (material.id !== id) throw new TypeError(`physics material snapshot key ${id} must match material.id.`);
        materials[id] = material;
      }
      value.materials = materials;
      const order = Object.keys(materials).sort();
      if (value.order !== undefined) {
        if (!Array.isArray(value.order) || JSON.stringify(value.order) !== JSON.stringify(order)) {
          throw new TypeError("physics material snapshot.order must contain every material ID in sorted order.");
        }
      }
      value.order = order;
      value.materialRevision = requireNonnegativeInteger(
        value.materialRevision,
        "physics material snapshot.materialRevision"
      );
    }
  });
}

export function sameMaterialValue(left, right) {
  return JSON.stringify(canonicalMaterialValue(left)) === JSON.stringify(canonicalMaterialValue(right));
}

export function combineMaterialCoefficient(left, right, mode) {
  const a = requireMaterialNumber(left, "left coefficient", { minimum: 0 });
  const b = requireMaterialNumber(right, "right coefficient", { minimum: 0 });
  switch (normalizeCombineMode(mode, "combine mode")) {
    case "average": return (a + b) / 2;
    case "minimum": return Math.min(a, b);
    case "multiply": return a * b;
    case "maximum": return Math.max(a, b);
    case "geometric-mean": return Math.sqrt(a * b);
    default: throw new TypeError(`Unsupported combine mode ${mode}.`);
  }
}

function selectedPolicy(left, right, property) {
  if (left.priority !== right.priority) return left.priority > right.priority ? left : right;
  const leftMode = left[property];
  const rightMode = right[property];
  if (leftMode === rightMode) return left.id.localeCompare(right.id) <= 0 ? left : right;
  return COMBINE_RANK[leftMode] > COMBINE_RANK[rightMode] ? left : right;
}

function selectedAnisotropy(left, right) {
  const candidates = [left, right]
    .filter((entry) => entry.material.friction.anisotropy)
    .sort((a, b) => b.material.combinePolicy.priority - a.material.combinePolicy.priority || a.material.id.localeCompare(b.material.id));
  return candidates.length ? canonicalMaterialValue(candidates[0].material.friction.anisotropy) : null;
}

export function resolveMaterialPair(input = {}) {
  requireMaterialObject(input, "material pair");
  rejectMaterialFields(input, ["left", "right", "policy"], "material pair");
  const left = normalizePhysicsMaterial(input.left);
  const right = normalizePhysicsMaterial(input.right);
  const explicit = input.policy === undefined
    ? null
    : normalizeMaterialCombinePolicy(input.policy, { id: "material-pair:policy" });
  const frictionPolicy = explicit ?? selectedPolicy(left.combinePolicy, right.combinePolicy, "frictionMode");
  const restitutionPolicy = explicit ?? selectedPolicy(left.combinePolicy, right.combinePolicy, "restitutionMode");
  const ordered = [left, right].sort((a, b) => a.id.localeCompare(b.id));
  const tags = [...new Set([...left.surface.tags, ...right.surface.tags])].sort();
  return {
    schema: MATERIAL_PAIR_SCHEMA,
    materialIds: ordered.map((material) => material.id),
    policy: {
      frictionMode: frictionPolicy.frictionMode,
      restitutionMode: restitutionPolicy.restitutionMode,
      frictionPolicyId: frictionPolicy.id,
      restitutionPolicyId: restitutionPolicy.id
    },
    friction: {
      staticCoefficient: combineMaterialCoefficient(left.friction.staticCoefficient, right.friction.staticCoefficient, frictionPolicy.frictionMode),
      dynamicCoefficient: combineMaterialCoefficient(left.friction.dynamicCoefficient, right.friction.dynamicCoefficient, frictionPolicy.frictionMode),
      rollingCoefficient: combineMaterialCoefficient(left.friction.rollingCoefficient, right.friction.rollingCoefficient, frictionPolicy.frictionMode),
      spinningCoefficient: combineMaterialCoefficient(left.friction.spinningCoefficient, right.friction.spinningCoefficient, frictionPolicy.frictionMode),
      anisotropy: selectedAnisotropy({ material: left }, { material: right })
    },
    restitution: {
      coefficient: combineMaterialCoefficient(left.restitution.coefficient, right.restitution.coefficient, restitutionPolicy.restitutionMode),
      thresholdSpeed: Math.max(left.restitution.thresholdSpeed, right.restitution.thresholdSpeed)
    },
    surfaces: ordered.map((material) => ({
      materialId: material.id,
      surfaceType: material.surface.surfaceType
    })),
    tags
  };
}
