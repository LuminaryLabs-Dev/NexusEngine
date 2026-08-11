import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const RENDER_BUFFER_DESCRIPTOR_SCHEMA = "nexusengine.render-buffer-descriptor/1";
export const RENDER_BUFFER_RECORD_SCHEMA = "nexusengine.render-buffer-record/1";
export const RENDER_BUFFER_CONTENT_SCHEMA = "nexusengine.render-buffer-content-state/1";
export const RENDER_BUFFER_UPDATE_SCHEMA = "nexusengine.render-buffer-update/1";
export const RENDER_BUFFER_UPDATE_RECEIPT_SCHEMA = "nexusengine.render-buffer-update-receipt/1";
export const RENDER_BUFFER_UPDATE_RECORD_SCHEMA = "nexusengine.render-buffer-update-record/1";
export const RENDER_BUFFER_FORMAT_SCHEMA = "nexusengine.render-buffer-format/1";
export const RENDER_BUFFER_LAYOUT_MEMBER_SCHEMA = "nexusengine.render-buffer-layout-member/1";
export const RENDER_BUFFER_LAYOUT_SCHEMA = "nexusengine.render-buffer-layout/1";
export const RENDER_VERTEX_BUFFER_SCHEMA = "nexusengine.render-vertex-buffer/1";
export const RENDER_INDEX_BUFFER_SCHEMA = "nexusengine.render-index-buffer/1";
export const RENDER_UNIFORM_BUFFER_SCHEMA = "nexusengine.render-uniform-buffer/1";
export const RENDER_STORAGE_BUFFER_SCHEMA = "nexusengine.render-storage-buffer/1";
export const RENDER_INSTANCE_BUFFER_SCHEMA = "nexusengine.render-instance-buffer/1";
export const RENDER_INDIRECT_BUFFER_SCHEMA = "nexusengine.render-indirect-buffer/1";

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

const BUFFER_USAGES = Object.freeze([
  "copy-source",
  "copy-destination",
  "vertex",
  "index",
  "uniform",
  "storage",
  "instance",
  "indirect",
  "query-resolve"
]);
const BUFFER_ACCESS = Object.freeze(["device-only", "host-write", "host-read", "host-read-write"]);
const BUFFER_UPDATE_MODES = Object.freeze(["immutable", "dynamic", "stream"]);
const UPDATE_STATUSES = Object.freeze(["requested", "completed", "failed"]);
const LAYOUT_ROLES = Object.freeze(["generic", "vertex", "instance", "uniform", "storage"]);
const SCALAR_BYTES = Object.freeze({
  uint8: 1,
  sint8: 1,
  uint16: 2,
  sint16: 2,
  float16: 2,
  uint32: 4,
  sint32: 4,
  float32: 4,
  float64: 8
});
const INDEX_FORMAT_BYTES = Object.freeze({ uint16: 2, uint32: 4 });
const INDIRECT_COMMAND_BYTES = Object.freeze({ draw: 16, "draw-indexed": 20, dispatch: 12 });

export function canonicalBufferValue(value, label = "value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireBufferObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectBufferFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireBufferText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalBufferText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireBufferText(value, label);
}

export function requireBufferInteger(value, label, { minimum = 0 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be a safe integer of at least ${minimum}.`);
  }
  return value;
}

export function requireBufferBoolean(value, label, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return value;
}

export function requirePowerOfTwo(value, label, { minimum = 1 } = {}) {
  const normalized = requireBufferInteger(value, label, { minimum });
  if (!Number.isInteger(Math.log2(normalized))) throw new TypeError(`${label} must be a power of two.`);
  return normalized;
}

function normalizeSchema(value, expected, label) {
  const normalized = value ?? expected;
  if (normalized !== expected) throw new TypeError(`${label}.schema must equal ${expected}.`);
  return normalized;
}

export function normalizeBufferEnum(value, allowed, label, fallback) {
  const normalized = String(value ?? fallback);
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

export function normalizeBufferTextList(value = [], allowed, label, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireBufferText(entry, `${label}[${index}]`));
  if (normalized.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} value(s).`);
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicate values.`);
  if (allowed) {
    const unknown = normalized.filter((entry) => !allowed.includes(entry));
    if (unknown.length) throw new TypeError(`${label} contains unsupported values: ${unknown.join(", ")}.`);
  }
  return normalized.sort();
}

function normalizeMetadata(value, label) {
  return canonicalBufferValue(value ?? {}, `${label}.metadata`);
}

export function normalizeBufferOperation(input, allowedFields, label) {
  requireBufferObject(input, label);
  rejectBufferFields(input, ["operationId", ...allowedFields], label);
  const value = canonicalBufferValue(input, label);
  value.operationId = requireBufferText(value.operationId, `${label}.operationId`);
  return value;
}

export function normalizeBufferSource(input, label = "Render Buffer source") {
  if (input === undefined || input === null) return null;
  requireBufferObject(input, label);
  rejectBufferFields(input, ["sourceId", "contentId", "offsetBytes", "sizeBytes", "metadata"], label);
  const value = canonicalBufferValue(input, label);
  return {
    sourceId: requireBufferText(value.sourceId, `${label}.sourceId`),
    contentId: requireBufferText(value.contentId, `${label}.contentId`),
    offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, `${label}.offsetBytes`),
    sizeBytes: requireBufferInteger(value.sizeBytes, `${label}.sizeBytes`, { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, label)
  };
}

export function normalizeBufferDescriptor(input = {}) {
  requireBufferObject(input, "Render Buffer descriptor");
  rejectBufferFields(input, ["schema", "sizeBytes", "usage", "access", "updateMode", "alignmentBytes", "source", "metadata"], "Render Buffer descriptor");
  const value = canonicalBufferValue(input, "Render Buffer descriptor");
  const descriptor = {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_DESCRIPTOR_SCHEMA, "Render Buffer descriptor"),
    sizeBytes: requireBufferInteger(value.sizeBytes, "Render Buffer descriptor.sizeBytes", { minimum: 1 }),
    usage: normalizeBufferTextList(value.usage, BUFFER_USAGES, "Render Buffer descriptor.usage", { minimum: 1 }),
    access: normalizeBufferEnum(value.access, BUFFER_ACCESS, "Render Buffer descriptor.access", "device-only"),
    updateMode: normalizeBufferEnum(value.updateMode, BUFFER_UPDATE_MODES, "Render Buffer descriptor.updateMode", "immutable"),
    alignmentBytes: requirePowerOfTwo(value.alignmentBytes ?? 4, "Render Buffer descriptor.alignmentBytes"),
    source: normalizeBufferSource(value.source),
    metadata: normalizeMetadata(value.metadata, "Render Buffer descriptor")
  };
  if (descriptor.sizeBytes % descriptor.alignmentBytes !== 0) {
    throw new TypeError("Render Buffer descriptor.sizeBytes must be aligned to alignmentBytes.");
  }
  if (descriptor.source && descriptor.source.offsetBytes + descriptor.source.sizeBytes > descriptor.sizeBytes) {
    throw new TypeError("Render Buffer source range exceeds descriptor.sizeBytes.");
  }
  if (descriptor.access === "host-read" && !descriptor.usage.includes("copy-destination")) {
    throw new TypeError("Host-readable Render Buffers require copy-destination usage.");
  }
  if (["host-write", "host-read-write"].includes(descriptor.access) && descriptor.updateMode === "immutable") {
    throw new TypeError("Host-writable Render Buffers cannot use immutable updateMode.");
  }
  return descriptor;
}

export function normalizeBufferRecord(input = {}) {
  requireBufferObject(input, "Render Buffer record");
  rejectBufferFields(input, ["schema", "bufferId", "identityId", "revision", "descriptor", "metadata"], "Render Buffer record");
  const value = canonicalBufferValue(input, "Render Buffer record");
  return {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_RECORD_SCHEMA, "Render Buffer record"),
    bufferId: requireBufferText(value.bufferId, "Render Buffer record.bufferId"),
    identityId: requireBufferText(value.identityId, "Render Buffer record.identityId"),
    revision: requireBufferInteger(value.revision ?? 0, "Render Buffer record.revision"),
    descriptor: normalizeBufferDescriptor(value.descriptor),
    metadata: normalizeMetadata(value.metadata, "Render Buffer record")
  };
}

export function normalizeBufferContentState(input = {}) {
  requireBufferObject(input, "Render Buffer content state");
  rejectBufferFields(input, ["schema", "identityId", "contentId", "contentRevision", "updateId"], "Render Buffer content state");
  const value = canonicalBufferValue(input, "Render Buffer content state");
  return {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_CONTENT_SCHEMA, "Render Buffer content state"),
    identityId: requireBufferText(value.identityId, "Render Buffer content state.identityId"),
    contentId: optionalBufferText(value.contentId, "Render Buffer content state.contentId"),
    contentRevision: requireBufferInteger(value.contentRevision ?? 0, "Render Buffer content state.contentRevision"),
    updateId: optionalBufferText(value.updateId, "Render Buffer content state.updateId")
  };
}

export function normalizeBufferUpdate(input = {}) {
  requireBufferObject(input, "Render Buffer update");
  rejectBufferFields(input, ["schema", "updateId", "identityId", "queueId", "submissionId", "offsetBytes", "sizeBytes", "sourceId", "contentId", "metadata"], "Render Buffer update");
  const value = canonicalBufferValue(input, "Render Buffer update");
  return {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_UPDATE_SCHEMA, "Render Buffer update"),
    updateId: requireBufferText(value.updateId, "Render Buffer update.updateId"),
    identityId: requireBufferText(value.identityId, "Render Buffer update.identityId"),
    queueId: requireBufferText(value.queueId, "Render Buffer update.queueId"),
    submissionId: requireBufferText(value.submissionId, "Render Buffer update.submissionId"),
    offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Buffer update.offsetBytes"),
    sizeBytes: requireBufferInteger(value.sizeBytes, "Render Buffer update.sizeBytes", { minimum: 1 }),
    sourceId: requireBufferText(value.sourceId, "Render Buffer update.sourceId"),
    contentId: requireBufferText(value.contentId, "Render Buffer update.contentId"),
    metadata: normalizeMetadata(value.metadata, "Render Buffer update")
  };
}

export function normalizeBufferUpdateReceipt(input = {}) {
  requireBufferObject(input, "Render Buffer update receipt");
  rejectBufferFields(input, ["schema", "updateId", "identityId", "submissionId", "deviceId", "providerId", "providerVersion", "completed", "contentId", "offsetBytes", "sizeBytes", "details"], "Render Buffer update receipt");
  const value = canonicalBufferValue(input, "Render Buffer update receipt");
  if (value.completed !== true) throw new TypeError("Render Buffer update receipt.completed must be true.");
  return {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_UPDATE_RECEIPT_SCHEMA, "Render Buffer update receipt"),
    updateId: requireBufferText(value.updateId, "Render Buffer update receipt.updateId"),
    identityId: requireBufferText(value.identityId, "Render Buffer update receipt.identityId"),
    submissionId: requireBufferText(value.submissionId, "Render Buffer update receipt.submissionId"),
    deviceId: requireBufferText(value.deviceId, "Render Buffer update receipt.deviceId"),
    providerId: requireBufferText(value.providerId, "Render Buffer update receipt.providerId"),
    providerVersion: optionalBufferText(value.providerVersion, "Render Buffer update receipt.providerVersion"),
    completed: true,
    contentId: requireBufferText(value.contentId, "Render Buffer update receipt.contentId"),
    offsetBytes: requireBufferInteger(value.offsetBytes, "Render Buffer update receipt.offsetBytes"),
    sizeBytes: requireBufferInteger(value.sizeBytes, "Render Buffer update receipt.sizeBytes", { minimum: 1 }),
    details: canonicalBufferValue(value.details ?? {}, "Render Buffer update receipt.details")
  };
}

export function normalizeBufferFailure(input = {}) {
  requireBufferObject(input, "Render Buffer failure");
  rejectBufferFields(input, ["code", "message", "details"], "Render Buffer failure");
  const value = canonicalBufferValue(input, "Render Buffer failure");
  return {
    code: requireBufferText(value.code, "Render Buffer failure.code"),
    message: requireBufferText(value.message, "Render Buffer failure.message"),
    details: canonicalBufferValue(value.details ?? {}, "Render Buffer failure.details")
  };
}

export function normalizeStoredBufferUpdate(input = {}) {
  requireBufferObject(input, "Stored Render Buffer update");
  rejectBufferFields(input, ["schema", "request", "status", "providerReceipt", "failure"], "Stored Render Buffer update");
  const value = canonicalBufferValue(input, "Stored Render Buffer update");
  const status = normalizeBufferEnum(value.status, UPDATE_STATUSES, "Stored Render Buffer update.status", "requested");
  const record = {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_UPDATE_RECORD_SCHEMA, "Stored Render Buffer update"),
    request: normalizeBufferUpdate(value.request),
    status,
    providerReceipt: value.providerReceipt === undefined || value.providerReceipt === null ? null : normalizeBufferUpdateReceipt(value.providerReceipt),
    failure: value.failure === undefined || value.failure === null ? null : normalizeBufferFailure(value.failure)
  };
  if (status === "requested" && (record.providerReceipt || record.failure)) throw new TypeError("Requested Render Buffer update cannot retain a receipt or failure.");
  if (status === "completed" && !record.providerReceipt) throw new TypeError("Completed Render Buffer update requires providerReceipt.");
  if (status === "completed" && record.failure) throw new TypeError("Completed Render Buffer update cannot retain failure.");
  if (status === "failed" && !record.failure) throw new TypeError("Failed Render Buffer update requires failure.");
  if (status === "failed" && record.providerReceipt) throw new TypeError("Failed Render Buffer update cannot retain providerReceipt.");
  return record;
}

export function normalizeBufferFormat(input = {}) {
  requireBufferObject(input, "Render Buffer format");
  rejectBufferFields(input, ["schema", "scalarType", "components", "columns", "arrayLength", "normalized"], "Render Buffer format");
  const value = canonicalBufferValue(input, "Render Buffer format");
  const scalarType = normalizeBufferEnum(value.scalarType, Object.keys(SCALAR_BYTES), "Render Buffer format.scalarType", "float32");
  const format = {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_FORMAT_SCHEMA, "Render Buffer format"),
    scalarType,
    components: requireBufferInteger(value.components ?? 1, "Render Buffer format.components", { minimum: 1 }),
    columns: requireBufferInteger(value.columns ?? 1, "Render Buffer format.columns", { minimum: 1 }),
    arrayLength: requireBufferInteger(value.arrayLength ?? 1, "Render Buffer format.arrayLength", { minimum: 1 }),
    normalized: requireBufferBoolean(value.normalized, "Render Buffer format.normalized")
  };
  if (format.components > 4 || format.columns > 4) throw new TypeError("Render Buffer format components and columns cannot exceed four.");
  if (format.normalized && !["uint8", "sint8", "uint16", "sint16"].includes(scalarType)) {
    throw new TypeError("Only 8-bit and 16-bit integer Render Buffer formats may be normalized.");
  }
  return format;
}

export function bufferFormatByteSize(formatInput) {
  const format = normalizeBufferFormat(formatInput);
  return SCALAR_BYTES[format.scalarType] * format.components * format.columns * format.arrayLength;
}

export function normalizeBufferLayoutMember(input = {}) {
  requireBufferObject(input, "Render Buffer layout member");
  rejectBufferFields(input, ["schema", "memberId", "offsetBytes", "format", "sizeBytes", "alignmentBytes", "shaderLocation", "semantic", "metadata"], "Render Buffer layout member");
  const value = canonicalBufferValue(input, "Render Buffer layout member");
  const format = normalizeBufferFormat(value.format);
  const member = {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_LAYOUT_MEMBER_SCHEMA, "Render Buffer layout member"),
    memberId: requireBufferText(value.memberId, "Render Buffer layout member.memberId"),
    offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Buffer layout member.offsetBytes"),
    format,
    sizeBytes: bufferFormatByteSize(format),
    alignmentBytes: requirePowerOfTwo(value.alignmentBytes ?? SCALAR_BYTES[format.scalarType], "Render Buffer layout member.alignmentBytes"),
    shaderLocation: value.shaderLocation === undefined || value.shaderLocation === null
      ? null
      : requireBufferInteger(value.shaderLocation, "Render Buffer layout member.shaderLocation"),
    semantic: optionalBufferText(value.semantic, "Render Buffer layout member.semantic"),
    metadata: normalizeMetadata(value.metadata, "Render Buffer layout member")
  };
  if (value.sizeBytes !== undefined && value.sizeBytes !== member.sizeBytes) {
    throw new TypeError(`Render Buffer layout member ${member.memberId} sizeBytes does not match its format.`);
  }
  if (member.offsetBytes % member.alignmentBytes !== 0) throw new TypeError(`Render Buffer layout member ${member.memberId} offset is not aligned.`);
  return member;
}

export function normalizeBufferLayout(input = {}) {
  requireBufferObject(input, "Render Buffer layout");
  rejectBufferFields(input, ["schema", "layoutId", "role", "strideBytes", "alignmentBytes", "members", "metadata"], "Render Buffer layout");
  const value = canonicalBufferValue(input, "Render Buffer layout");
  if (!Array.isArray(value.members) || value.members.length === 0) throw new TypeError("Render Buffer layout.members must contain at least one member.");
  const members = value.members.map(normalizeBufferLayoutMember)
    .sort((left, right) => left.offsetBytes - right.offsetBytes || left.memberId.localeCompare(right.memberId));
  if (new Set(members.map((member) => member.memberId)).size !== members.length) throw new TypeError("Render Buffer layout member IDs must be unique.");
  const locations = members.map((member) => member.shaderLocation).filter((entry) => entry !== null);
  if (new Set(locations).size !== locations.length) throw new TypeError("Render Buffer layout shader locations must be unique.");
  const layout = {
    schema: normalizeSchema(value.schema, RENDER_BUFFER_LAYOUT_SCHEMA, "Render Buffer layout"),
    layoutId: requireBufferText(value.layoutId, "Render Buffer layout.layoutId"),
    role: normalizeBufferEnum(value.role, LAYOUT_ROLES, "Render Buffer layout.role", "generic"),
    strideBytes: requireBufferInteger(value.strideBytes, "Render Buffer layout.strideBytes", { minimum: 1 }),
    alignmentBytes: requirePowerOfTwo(value.alignmentBytes ?? 4, "Render Buffer layout.alignmentBytes"),
    members,
    metadata: normalizeMetadata(value.metadata, "Render Buffer layout")
  };
  if (layout.strideBytes % layout.alignmentBytes !== 0) throw new TypeError("Render Buffer layout.strideBytes must be aligned.");
  for (let index = 0; index < members.length; index += 1) {
    const member = members[index];
    if (member.offsetBytes + member.sizeBytes > layout.strideBytes) throw new TypeError(`Render Buffer layout member ${member.memberId} exceeds strideBytes.`);
    if (index > 0) {
      const previous = members[index - 1];
      if (member.offsetBytes < previous.offsetBytes + previous.sizeBytes) {
        throw new TypeError(`Render Buffer layout members ${previous.memberId} and ${member.memberId} overlap.`);
      }
    }
  }
  if (["vertex", "instance"].includes(layout.role) && members.some((member) => member.shaderLocation === null)) {
    throw new TypeError(`${layout.role} Render Buffer layout members require shaderLocation.`);
  }
  return layout;
}

function normalizeBufferView(input, { schema, label, idField, fields, normalize }) {
  requireBufferObject(input, label);
  rejectBufferFields(input, ["schema", idField, "identityId", ...fields, "metadata"], label);
  const value = canonicalBufferValue(input, label);
  return {
    schema: normalizeSchema(value.schema, schema, label),
    [idField]: requireBufferText(value[idField], `${label}.${idField}`),
    identityId: requireBufferText(value.identityId, `${label}.identityId`),
    ...normalize(value),
    metadata: normalizeMetadata(value.metadata, label)
  };
}

export function normalizeVertexBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_VERTEX_BUFFER_SCHEMA,
    label: "Render Vertex Buffer",
    idField: "vertexBufferId",
    fields: ["layoutId", "offsetBytes", "vertexCount"],
    normalize(value) {
      return {
        layoutId: requireBufferText(value.layoutId, "Render Vertex Buffer.layoutId"),
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Vertex Buffer.offsetBytes"),
        vertexCount: requireBufferInteger(value.vertexCount ?? 0, "Render Vertex Buffer.vertexCount")
      };
    }
  });
}

export function normalizeIndexBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_INDEX_BUFFER_SCHEMA,
    label: "Render Index Buffer",
    idField: "indexBufferId",
    fields: ["indexFormat", "offsetBytes", "indexCount"],
    normalize(value) {
      return {
        indexFormat: normalizeBufferEnum(value.indexFormat, Object.keys(INDEX_FORMAT_BYTES), "Render Index Buffer.indexFormat", "uint32"),
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Index Buffer.offsetBytes"),
        indexCount: requireBufferInteger(value.indexCount ?? 0, "Render Index Buffer.indexCount")
      };
    }
  });
}

export function normalizeUniformBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_UNIFORM_BUFFER_SCHEMA,
    label: "Render Uniform Buffer",
    idField: "uniformBufferId",
    fields: ["layoutId", "offsetBytes", "sizeBytes", "dynamicOffset", "dynamicAlignmentBytes"],
    normalize(value) {
      const dynamicOffset = requireBufferBoolean(value.dynamicOffset, "Render Uniform Buffer.dynamicOffset");
      if (dynamicOffset && value.dynamicAlignmentBytes === undefined) {
        throw new TypeError("Render Uniform Buffer.dynamicAlignmentBytes is required when dynamicOffset is true.");
      }
      return {
        layoutId: requireBufferText(value.layoutId, "Render Uniform Buffer.layoutId"),
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Uniform Buffer.offsetBytes"),
        sizeBytes: requireBufferInteger(value.sizeBytes, "Render Uniform Buffer.sizeBytes", { minimum: 1 }),
        dynamicOffset,
        dynamicAlignmentBytes: requirePowerOfTwo(value.dynamicAlignmentBytes ?? 1, "Render Uniform Buffer.dynamicAlignmentBytes")
      };
    }
  });
}

export function normalizeStorageBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_STORAGE_BUFFER_SCHEMA,
    label: "Render Storage Buffer",
    idField: "storageBufferId",
    fields: ["layoutId", "offsetBytes", "sizeBytes", "access", "elementCount"],
    normalize(value) {
      return {
        layoutId: requireBufferText(value.layoutId, "Render Storage Buffer.layoutId"),
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Storage Buffer.offsetBytes"),
        sizeBytes: requireBufferInteger(value.sizeBytes, "Render Storage Buffer.sizeBytes", { minimum: 1 }),
        access: normalizeBufferEnum(value.access, ["read-only", "read-write"], "Render Storage Buffer.access", "read-only"),
        elementCount: requireBufferInteger(value.elementCount, "Render Storage Buffer.elementCount", { minimum: 1 })
      };
    }
  });
}

export function normalizeInstanceBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_INSTANCE_BUFFER_SCHEMA,
    label: "Render Instance Buffer",
    idField: "instanceBufferId",
    fields: ["layoutId", "offsetBytes", "instanceCount"],
    normalize(value) {
      return {
        layoutId: requireBufferText(value.layoutId, "Render Instance Buffer.layoutId"),
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Instance Buffer.offsetBytes"),
        instanceCount: requireBufferInteger(value.instanceCount ?? 0, "Render Instance Buffer.instanceCount")
      };
    }
  });
}

export function normalizeIndirectBuffer(input = {}) {
  return normalizeBufferView(input, {
    schema: RENDER_INDIRECT_BUFFER_SCHEMA,
    label: "Render Indirect Buffer",
    idField: "indirectBufferId",
    fields: ["commandType", "offsetBytes", "commandCount", "strideBytes"],
    normalize(value) {
      const commandType = normalizeBufferEnum(value.commandType, Object.keys(INDIRECT_COMMAND_BYTES), "Render Indirect Buffer.commandType", "draw");
      const minimumStride = INDIRECT_COMMAND_BYTES[commandType];
      const strideBytes = requireBufferInteger(value.strideBytes ?? minimumStride, "Render Indirect Buffer.strideBytes", { minimum: minimumStride });
      if (strideBytes % 4 !== 0) throw new TypeError("Render Indirect Buffer.strideBytes must be four-byte aligned.");
      return {
        commandType,
        offsetBytes: requireBufferInteger(value.offsetBytes ?? 0, "Render Indirect Buffer.offsetBytes"),
        commandCount: requireBufferInteger(value.commandCount ?? 0, "Render Indirect Buffer.commandCount"),
        strideBytes
      };
    }
  });
}

export function bufferIndexFormatByteSize(format) {
  return INDEX_FORMAT_BYTES[normalizeBufferEnum(format, Object.keys(INDEX_FORMAT_BYTES), "Render Index Buffer.indexFormat", "uint32")];
}

export function bufferIndirectCommandByteSize(commandType) {
  return INDIRECT_COMMAND_BYTES[normalizeBufferEnum(commandType, Object.keys(INDIRECT_COMMAND_BYTES), "Render Indirect Buffer.commandType", "draw")];
}

export function assertBufferRange(bufferInput, { offsetBytes = 0, sizeBytes = 0, alignmentBytes = 1, label = "Render Buffer range" } = {}) {
  const buffer = normalizeBufferRecord(bufferInput);
  const offset = requireBufferInteger(offsetBytes, `${label}.offsetBytes`);
  const size = requireBufferInteger(sizeBytes, `${label}.sizeBytes`);
  const alignment = requirePowerOfTwo(alignmentBytes, `${label}.alignmentBytes`);
  if (offset % alignment !== 0) throw new TypeError(`${label}.offsetBytes must be aligned to ${alignment}.`);
  if (offset + size > buffer.descriptor.sizeBytes) throw new TypeError(`${label} exceeds Buffer sizeBytes.`);
  return true;
}

export function assertBufferUsage(bufferInput, usage, label = "Render Buffer") {
  const buffer = normalizeBufferRecord(bufferInput);
  if (!buffer.descriptor.usage.includes(usage)) throw new TypeError(`${label} requires ${usage} usage.`);
  return true;
}

export function normalizeBufferState(snapshot, { domain, fields, label, validate }) {
  requireBufferObject(snapshot, label);
  rejectBufferFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const normalized = canonicalBufferValue(snapshot, label);
  if (normalized.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireBufferInteger(normalized.sequence, `${label}.sequence`);
  validate?.(normalized);
  return normalized;
}

export function assertSortedBufferRecords(state, { collection, order, revision, normalizeRecord, idField, label }) {
  requireBufferObject(state[collection], `${label}.${collection}`);
  const records = Object.fromEntries(Object.entries(state[collection]).map(([key, record]) => {
    const normalized = normalizeRecord(record);
    const recordId = String(idField).split(".").reduce((value, field) => value?.[field], normalized);
    if (key !== recordId) throw new TypeError(`${label}.${collection} key ${key} does not match ${idField} ${recordId}.`);
    return [key, normalized];
  }));
  const expectedOrder = Object.keys(records).sort();
  if (JSON.stringify(state[order]) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must match sorted ${collection} keys.`);
  requireBufferInteger(state[revision], `${label}.${revision}`);
  state[collection] = records;
  return state;
}

export function normalizeBufferRegistrySnapshot(snapshot, { domain, collection, order, revision, normalizeRecord, idField, label }) {
  return normalizeBufferState(snapshot, {
    domain,
    fields: [collection, order, revision],
    label,
    validate(state) {
      assertSortedBufferRecords(state, { collection, order, revision, normalizeRecord, idField, label });
    }
  });
}

export function normalizeBufferRegistrationCommand(input, field, normalizeRecord, label) {
  const value = normalizeBufferOperation(input, [field], label);
  return { operationId: value.operationId, [field]: normalizeRecord(value[field]) };
}

export const renderBufferEnums = Object.freeze({
  usages: BUFFER_USAGES,
  access: BUFFER_ACCESS,
  updateModes: BUFFER_UPDATE_MODES,
  updateStatuses: UPDATE_STATUSES,
  layoutRoles: LAYOUT_ROLES,
  scalarTypes: Object.freeze(Object.keys(SCALAR_BYTES)),
  indexFormats: Object.freeze(Object.keys(INDEX_FORMAT_BYTES)),
  indirectCommandTypes: Object.freeze(Object.keys(INDIRECT_COMMAND_BYTES))
});
