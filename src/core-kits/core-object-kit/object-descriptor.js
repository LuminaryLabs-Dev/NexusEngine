export const NEXUS_OBJECT_DESCRIPTOR_SCHEMA = "nexus-object-descriptor/1";
export const NEXUS_OBJECT_DESCRIPTOR_VERSION = "0.1.0";
export const CORE_OBJECT_LIFECYCLE_STATES = Object.freeze([
  "declared",
  "generated",
  "prepared",
  "active",
  "suspended",
  "disposed"
]);

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (ArrayBuffer.isView(value)) return stableStringify(Array.from(value));
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function finite(value, fallback = 0, label = "value") {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function vector(value, length, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== length) {
    throw new TypeError(`${label} must contain ${length} values.`);
  }
  return source.map((entry, index) => finite(entry, fallback[index], `${label}[${index}]`));
}

function normalizeTransform(value = {}) {
  return {
    position: vector(value.position, 3, [0, 0, 0], "transform.position"),
    rotation: vector(value.rotation, 4, [0, 0, 0, 1], "transform.rotation"),
    scale: vector(value.scale, 3, [1, 1, 1], "transform.scale")
  };
}

function normalizeBounds(value = {}) {
  const min = vector(value.min, 3, [0, 0, 0], "bounds.min");
  const max = vector(value.max, 3, [0, 0, 0], "bounds.max");
  for (let index = 0; index < 3; index += 1) {
    if (max[index] < min[index]) {
      throw new RangeError(`bounds.max[${index}] must be greater than or equal to bounds.min[${index}].`);
    }
  }
  const size = max.map((entry, index) => entry - min[index]);
  const center = max.map((entry, index) => (entry + min[index]) * 0.5);
  return {
    min,
    max,
    size,
    center,
    radius: 0.5 * Math.hypot(...size)
  };
}

function normalizeReference(value, fallbackProvider = null, fallbackId = null) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return {
      provider: fallbackProvider,
      descriptorId: value,
      contentHash: null,
      metadata: {}
    };
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Object descriptor references must be strings, objects, or null.");
  }
  const provider = value.provider == null && fallbackProvider == null
    ? null
    : text(value.provider, fallbackProvider, "reference.provider");
  const descriptorId = text(value.descriptorId ?? value.id, fallbackId, "reference.descriptorId");
  return {
    provider,
    descriptorId,
    contentHash: value.contentHash == null ? null : text(value.contentHash, null, "reference.contentHash"),
    metadata: clone(value.metadata ?? {})
  };
}

function normalizePart(value = {}, index = 0) {
  return {
    id: text(value.id, `part-${index}`, "part.id"),
    parentId: value.parentId == null ? null : text(value.parentId, null, "part.parentId"),
    kind: text(value.kind, "object-part", "part.kind"),
    transform: normalizeTransform(value.transform),
    geometry: normalizeReference(value.geometry),
    material: normalizeReference(value.material),
    collision: normalizeReference(value.collision),
    metadata: clone(value.metadata ?? {})
  };
}

function descriptorHashInput(descriptor) {
  const { contentHash, lifecycle, ...content } = descriptor;
  return content;
}

export function createObjectDescriptor(input = {}) {
  const id = text(input.id, null, "object.id");
  const objectType = text(input.objectType ?? input.type, "object", "object.objectType");
  const bounds = normalizeBounds(input.bounds);
  const parts = (input.parts ?? []).map(normalizePart);
  const partIds = new Set();
  for (const part of parts) {
    if (partIds.has(part.id)) throw new TypeError(`Duplicate object part id: ${part.id}`);
    partIds.add(part.id);
  }
  for (const part of parts) {
    if (part.parentId !== null && !partIds.has(part.parentId)) {
      throw new TypeError(`Object part ${part.id} references missing parent ${part.parentId}.`);
    }
  }

  const lifecycleStatus = text(input.lifecycle?.status, "generated", "lifecycle.status");
  if (!CORE_OBJECT_LIFECYCLE_STATES.includes(lifecycleStatus)) {
    throw new TypeError(`Unsupported object lifecycle state: ${lifecycleStatus}`);
  }

  const descriptor = {
    schema: NEXUS_OBJECT_DESCRIPTOR_SCHEMA,
    version: NEXUS_OBJECT_DESCRIPTOR_VERSION,
    id,
    objectType,
    transform: normalizeTransform(input.transform),
    parts,
    bounds,
    pivot: vector(input.pivot, 3, bounds.center, "object.pivot"),
    groundAnchor: vector(input.groundAnchor, 3, [bounds.center[0], bounds.min[1], bounds.center[2]], "object.groundAnchor"),
    geometry: normalizeReference(input.geometry),
    material: normalizeReference(input.material),
    collision: normalizeReference(input.collision),
    lod: normalizeReference(input.lod),
    capture: normalizeReference(input.capture),
    metadata: clone(input.metadata ?? {}),
    lifecycle: {
      status: lifecycleStatus,
      revision: Math.max(0, Math.floor(finite(input.lifecycle?.revision, 0, "lifecycle.revision")))
    }
  };
  descriptor.contentHash = hashText(stableStringify(descriptorHashInput(descriptor)));
  return descriptor;
}

export function validateObjectDescriptor(value) {
  const errors = [];
  if (!value || value.schema !== NEXUS_OBJECT_DESCRIPTOR_SCHEMA) {
    return { valid: false, errors: [`schema must be ${NEXUS_OBJECT_DESCRIPTOR_SCHEMA}`] };
  }
  try {
    const normalized = createObjectDescriptor(value);
    if (value.contentHash && value.contentHash !== normalized.contentHash) {
      errors.push("contentHash does not match normalized descriptor content");
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}

export function updateObjectLifecycle(value, status) {
  const descriptor = createObjectDescriptor(value);
  const nextStatus = text(status, null, "lifecycle.status");
  if (!CORE_OBJECT_LIFECYCLE_STATES.includes(nextStatus)) {
    throw new TypeError(`Unsupported object lifecycle state: ${nextStatus}`);
  }
  return {
    ...descriptor,
    lifecycle: {
      status: nextStatus,
      revision: descriptor.lifecycle.revision + 1
    }
  };
}

export function hashObjectDescriptor(value) {
  return createObjectDescriptor(value).contentHash;
}
