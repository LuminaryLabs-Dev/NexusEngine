import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const RENDER_TEXTURE_FORMAT_SCHEMA = "nexusengine.render-texture-format/1";
export const RENDER_TEXTURE_DESCRIPTOR_SCHEMA = "nexusengine.render-texture-descriptor/1";
export const RENDER_TEXTURE_RECORD_SCHEMA = "nexusengine.render-texture-record/1";
export const RENDER_TEXTURE_2D_SCHEMA = "nexusengine.render-texture-2d/1";
export const RENDER_TEXTURE_CUBE_SCHEMA = "nexusengine.render-texture-cube/1";
export const RENDER_TEXTURE_ARRAY_SCHEMA = "nexusengine.render-texture-array/1";
export const RENDER_TARGET_TEXTURE_SCHEMA = "nexusengine.render-target-texture/1";
export const RENDER_DEPTH_TEXTURE_SCHEMA = "nexusengine.render-depth-texture/1";
export const RENDER_SHADOW_TEXTURE_SCHEMA = "nexusengine.render-shadow-texture/1";
export const RENDER_TEXTURE_MIP_LEVEL_SCHEMA = "nexusengine.render-texture-mip-level/1";
export const RENDER_TEXTURE_MIPMAP_SCHEMA = "nexusengine.render-texture-mipmap/1";
export const RENDER_TEXTURE_STREAM_SCHEMA = "nexusengine.render-texture-stream/1";
export const RENDER_TEXTURE_STREAM_RECEIPT_SCHEMA = "nexusengine.render-texture-stream-receipt/1";
export const RENDER_TEXTURE_STREAM_RECORD_SCHEMA = "nexusengine.render-texture-stream-record/1";
export const RENDER_TEXTURE_SUBRESOURCE_SCHEMA = "nexusengine.render-texture-subresource/1";
export const RENDER_TEXTURE_RESIDENCY_SCHEMA = "nexusengine.render-texture-residency/1";

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

const TEXTURE_DIMENSIONS = Object.freeze(["2d", "cube", "2d-array"]);
const TEXTURE_USAGES = Object.freeze([
  "color-attachment",
  "copy-destination",
  "copy-source",
  "depth-stencil-attachment",
  "sampled",
  "storage"
]);
const TEXTURE_ASPECTS = Object.freeze(["color", "depth", "stencil"]);
const TEXTURE_COMPONENT_TYPES = Object.freeze([
  "compressed",
  "depth",
  "depth-stencil",
  "float",
  "sint",
  "snorm",
  "uint",
  "unorm"
]);
const TEXTURE_VIEW_TYPES = Object.freeze(["2d", "cube", "array"]);
const MIPMAP_MODES = Object.freeze(["provider-generated", "source-provided"]);
const STREAM_STATUSES = Object.freeze(["requested", "completed", "failed"]);

export function canonicalTextureValue(value, label = "value") {
  try {
    return canonicalizePortableValue(value, label);
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

export function requireTextureObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function rejectTextureFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

export function requireTextureText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

export function optionalTextureText(value, label, fallback = null) {
  return value === undefined || value === null ? fallback : requireTextureText(value, label);
}

export function requireTextureInteger(value, label, { minimum = 0 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} must be a safe integer of at least ${minimum}.`);
  }
  return value;
}

export function requireTextureBoolean(value, label, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return value;
}

export function requireTexturePowerOfTwo(value, label) {
  const normalized = requireTextureInteger(value, label, { minimum: 1 });
  if (!Number.isInteger(Math.log2(normalized))) throw new TypeError(`${label} must be a power of two.`);
  return normalized;
}

function normalizeSchema(value, expected, label) {
  const normalized = value ?? expected;
  if (normalized !== expected) throw new TypeError(`${label}.schema must equal ${expected}.`);
  return normalized;
}

export function normalizeTextureEnum(value, allowed, label, fallback) {
  const normalized = String(value ?? fallback);
  if (!allowed.includes(normalized)) throw new TypeError(`${label} must be one of ${allowed.join(", ")}.`);
  return normalized;
}

export function normalizeTextureTextList(value = [], allowed, label, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireTextureText(entry, `${label}[${index}]`));
  if (normalized.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} value(s).`);
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicate values.`);
  if (allowed) {
    const unknown = normalized.filter((entry) => !allowed.includes(entry));
    if (unknown.length) throw new TypeError(`${label} contains unsupported values: ${unknown.join(", ")}.`);
  }
  return normalized.sort();
}

export function normalizeOrderedTextureTextList(value = [], label, { minimum = 0 } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const normalized = value.map((entry, index) => requireTextureText(entry, `${label}[${index}]`));
  if (normalized.length < minimum) throw new TypeError(`${label} must contain at least ${minimum} value(s).`);
  return normalized;
}

function normalizeMetadata(value, label) {
  return canonicalTextureValue(value ?? {}, `${label}.metadata`);
}

export function normalizeTextureOperation(input, allowedFields, label) {
  requireTextureObject(input, label);
  rejectTextureFields(input, ["operationId", ...allowedFields], label);
  const value = canonicalTextureValue(input, label);
  value.operationId = requireTextureText(value.operationId, `${label}.operationId`);
  return value;
}

function safeProduct(values, label) {
  let result = 1;
  for (const value of values) {
    result *= value;
    if (!Number.isSafeInteger(result)) throw new TypeError(`${label} exceeds the portable safe-integer range.`);
  }
  return result;
}

export function normalizeTextureFormat(input = {}) {
  requireTextureObject(input, "Render Texture format");
  rejectTextureFields(input, [
    "schema",
    "formatId",
    "aspects",
    "componentType",
    "channelCount",
    "blockWidth",
    "blockHeight",
    "bytesPerBlock",
    "filterable",
    "renderable",
    "storageWritable",
    "blendable",
    "metadata"
  ], "Render Texture format");
  const value = canonicalTextureValue(input, "Render Texture format");
  const aspects = normalizeTextureTextList(value.aspects, TEXTURE_ASPECTS, "Render Texture format.aspects", { minimum: 1 });
  const componentType = normalizeTextureEnum(value.componentType, TEXTURE_COMPONENT_TYPES, "Render Texture format.componentType", "unorm");
  const format = {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_FORMAT_SCHEMA, "Render Texture format"),
    formatId: requireTextureText(value.formatId, "Render Texture format.formatId"),
    aspects,
    componentType,
    channelCount: requireTextureInteger(value.channelCount, "Render Texture format.channelCount", { minimum: 1 }),
    blockWidth: requireTextureInteger(value.blockWidth ?? 1, "Render Texture format.blockWidth", { minimum: 1 }),
    blockHeight: requireTextureInteger(value.blockHeight ?? 1, "Render Texture format.blockHeight", { minimum: 1 }),
    bytesPerBlock: requireTextureInteger(value.bytesPerBlock, "Render Texture format.bytesPerBlock", { minimum: 1 }),
    filterable: requireTextureBoolean(value.filterable, "Render Texture format.filterable"),
    renderable: requireTextureBoolean(value.renderable, "Render Texture format.renderable"),
    storageWritable: requireTextureBoolean(value.storageWritable, "Render Texture format.storageWritable"),
    blendable: requireTextureBoolean(value.blendable, "Render Texture format.blendable"),
    metadata: normalizeMetadata(value.metadata, "Render Texture format")
  };
  if (format.channelCount > 4) throw new TypeError("Render Texture format.channelCount cannot exceed four.");
  const hasColor = aspects.includes("color");
  const hasDepth = aspects.includes("depth");
  const hasStencil = aspects.includes("stencil");
  if (hasColor && (hasDepth || hasStencil)) throw new TypeError("Render Texture format color and depth-stencil aspects cannot be mixed.");
  if (componentType === "depth" && (!hasDepth || hasStencil || hasColor)) throw new TypeError("Depth formats require only the depth aspect.");
  if (componentType === "depth-stencil" && (!hasDepth || !hasStencil || hasColor)) throw new TypeError("Depth-stencil formats require depth and stencil aspects.");
  if (["depth", "depth-stencil"].includes(componentType) !== (hasDepth || hasStencil)) {
    throw new TypeError("Render Texture format componentType must match its aspects.");
  }
  if (componentType === "compressed" && format.blockWidth === 1 && format.blockHeight === 1) {
    throw new TypeError("Compressed Render Texture formats require a multi-texel block.");
  }
  if (componentType !== "compressed" && (format.blockWidth !== 1 || format.blockHeight !== 1)) {
    throw new TypeError("Uncompressed Render Texture formats require a 1x1 block.");
  }
  if (format.blendable && (!hasColor || !format.renderable)) {
    throw new TypeError("Blendable Render Texture formats must be renderable color formats.");
  }
  if (format.storageWritable && !hasColor) throw new TypeError("Storage-writable Render Texture formats require a color aspect.");
  return format;
}

export function textureFormatLevelByteSize(formatInput, width, height, layers = 1, sampleCount = 1) {
  const format = normalizeTextureFormat(formatInput);
  const normalizedWidth = requireTextureInteger(width, "Texture level width", { minimum: 1 });
  const normalizedHeight = requireTextureInteger(height, "Texture level height", { minimum: 1 });
  const normalizedLayers = requireTextureInteger(layers, "Texture level layers", { minimum: 1 });
  const normalizedSamples = requireTexturePowerOfTwo(sampleCount, "Texture level sampleCount");
  const blocksWide = Math.ceil(normalizedWidth / format.blockWidth);
  const blocksHigh = Math.ceil(normalizedHeight / format.blockHeight);
  return safeProduct([blocksWide, blocksHigh, normalizedLayers, normalizedSamples, format.bytesPerBlock], "Render Texture level size");
}

export function normalizeTextureDescriptor(input = {}) {
  requireTextureObject(input, "Render Texture descriptor");
  rejectTextureFields(input, [
    "schema",
    "dimension",
    "width",
    "height",
    "depthOrLayers",
    "mipLevelCount",
    "sampleCount",
    "formatId",
    "usage",
    "metadata"
  ], "Render Texture descriptor");
  const value = canonicalTextureValue(input, "Render Texture descriptor");
  const dimension = normalizeTextureEnum(value.dimension, TEXTURE_DIMENSIONS, "Render Texture descriptor.dimension", "2d");
  const width = requireTextureInteger(value.width, "Render Texture descriptor.width", { minimum: 1 });
  const height = requireTextureInteger(value.height, "Render Texture descriptor.height", { minimum: 1 });
  const depthOrLayers = requireTextureInteger(value.depthOrLayers ?? (dimension === "cube" ? 6 : 1), "Render Texture descriptor.depthOrLayers", { minimum: 1 });
  const mipLevelCount = requireTextureInteger(value.mipLevelCount ?? 1, "Render Texture descriptor.mipLevelCount", { minimum: 1 });
  const sampleCount = requireTexturePowerOfTwo(value.sampleCount ?? 1, "Render Texture descriptor.sampleCount");
  const descriptor = {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_DESCRIPTOR_SCHEMA, "Render Texture descriptor"),
    dimension,
    width,
    height,
    depthOrLayers,
    mipLevelCount,
    sampleCount,
    formatId: requireTextureText(value.formatId, "Render Texture descriptor.formatId"),
    usage: normalizeTextureTextList(value.usage, TEXTURE_USAGES, "Render Texture descriptor.usage", { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render Texture descriptor")
  };
  if (dimension === "2d" && depthOrLayers !== 1) throw new TypeError("2D Render Textures require depthOrLayers equal to one.");
  if (dimension === "cube" && (width !== height || depthOrLayers !== 6)) throw new TypeError("Cube Render Textures require square dimensions and exactly six layers.");
  if (sampleCount > 1 && (dimension !== "2d" || mipLevelCount !== 1)) {
    throw new TypeError("Multisampled Render Textures must be 2D with exactly one mip level.");
  }
  if (sampleCount > 1 && descriptor.usage.includes("storage")) throw new TypeError("Multisampled Render Textures cannot use storage usage.");
  const maximumMipLevels = Math.floor(Math.log2(Math.max(width, height))) + 1;
  if (mipLevelCount > maximumMipLevels) throw new TypeError(`Render Texture descriptor.mipLevelCount cannot exceed ${maximumMipLevels}.`);
  if (descriptor.usage.includes("color-attachment") && descriptor.usage.includes("depth-stencil-attachment")) {
    throw new TypeError("One Render Texture cannot be both a color and depth-stencil attachment.");
  }
  return descriptor;
}

export function assertTextureFormatCompatibility(descriptorInput, formatInput) {
  const descriptor = normalizeTextureDescriptor(descriptorInput);
  const format = normalizeTextureFormat(formatInput);
  if (descriptor.formatId !== format.formatId) throw new TypeError("Render Texture descriptor formatId does not match its format record.");
  const hasColor = format.aspects.includes("color");
  const hasDepthStencil = format.aspects.includes("depth") || format.aspects.includes("stencil");
  if (descriptor.usage.includes("color-attachment") && (!hasColor || !format.renderable)) {
    throw new TypeError("Color attachment Render Textures require a renderable color format.");
  }
  if (descriptor.usage.includes("depth-stencil-attachment") && (!hasDepthStencil || !format.renderable)) {
    throw new TypeError("Depth-stencil attachment Render Textures require a renderable depth or depth-stencil format.");
  }
  if (descriptor.usage.includes("storage") && !format.storageWritable) {
    throw new TypeError("Storage Render Textures require a storage-writable format.");
  }
  if (descriptor.usage.includes("color-attachment") && hasDepthStencil) throw new TypeError("Depth formats cannot be color attachments.");
  if (descriptor.usage.includes("depth-stencil-attachment") && hasColor) throw new TypeError("Color formats cannot be depth-stencil attachments.");
  return true;
}

export function textureMipExtent(descriptorInput, mipLevel) {
  const descriptor = normalizeTextureDescriptor(descriptorInput);
  const level = requireTextureInteger(mipLevel, "Render Texture mipLevel");
  if (level >= descriptor.mipLevelCount) throw new TypeError(`Render Texture mipLevel ${level} is out of range.`);
  const divisor = 2 ** level;
  return {
    width: Math.max(1, Math.floor(descriptor.width / divisor)),
    height: Math.max(1, Math.floor(descriptor.height / divisor)),
    depthOrLayers: descriptor.depthOrLayers
  };
}

export function textureDescriptorByteSize(descriptorInput, formatInput) {
  const descriptor = normalizeTextureDescriptor(descriptorInput);
  const format = normalizeTextureFormat(formatInput);
  assertTextureFormatCompatibility(descriptor, format);
  let total = 0;
  for (let level = 0; level < descriptor.mipLevelCount; level += 1) {
    const extent = textureMipExtent(descriptor, level);
    total += textureFormatLevelByteSize(format, extent.width, extent.height, extent.depthOrLayers, descriptor.sampleCount);
    if (!Number.isSafeInteger(total)) throw new TypeError("Render Texture total size exceeds the portable safe-integer range.");
  }
  return total;
}

export function normalizeTextureRecord(input = {}) {
  requireTextureObject(input, "Render Texture record");
  rejectTextureFields(input, ["schema", "textureId", "identityId", "revision", "descriptor", "estimatedSizeBytes", "metadata"], "Render Texture record");
  const value = canonicalTextureValue(input, "Render Texture record");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_RECORD_SCHEMA, "Render Texture record"),
    textureId: requireTextureText(value.textureId, "Render Texture record.textureId"),
    identityId: requireTextureText(value.identityId, "Render Texture record.identityId"),
    revision: requireTextureInteger(value.revision ?? 0, "Render Texture record.revision"),
    descriptor: normalizeTextureDescriptor(value.descriptor),
    estimatedSizeBytes: requireTextureInteger(value.estimatedSizeBytes, "Render Texture record.estimatedSizeBytes", { minimum: 1 }),
    metadata: normalizeMetadata(value.metadata, "Render Texture record")
  };
}

export function assertTextureSubresourceRange(textureInput, {
  baseMipLevel = 0,
  mipLevelCount = 1,
  baseArrayLayer = 0,
  arrayLayerCount = 1,
  label = "Render Texture subresource range"
} = {}) {
  const texture = normalizeTextureRecord(textureInput);
  const firstMip = requireTextureInteger(baseMipLevel, `${label}.baseMipLevel`);
  const mipCount = requireTextureInteger(mipLevelCount, `${label}.mipLevelCount`, { minimum: 1 });
  const firstLayer = requireTextureInteger(baseArrayLayer, `${label}.baseArrayLayer`);
  const layerCount = requireTextureInteger(arrayLayerCount, `${label}.arrayLayerCount`, { minimum: 1 });
  if (firstMip + mipCount > texture.descriptor.mipLevelCount) throw new TypeError(`${label} exceeds Texture mip levels.`);
  if (firstLayer + layerCount > texture.descriptor.depthOrLayers) throw new TypeError(`${label} exceeds Texture array layers.`);
  return true;
}

function normalizeTextureView(input, { schema, label, idField, fields, normalize }) {
  requireTextureObject(input, label);
  rejectTextureFields(input, ["schema", idField, "identityId", ...fields, "metadata"], label);
  const value = canonicalTextureValue(input, label);
  return {
    schema: normalizeSchema(value.schema, schema, label),
    [idField]: requireTextureText(value[idField], `${label}.${idField}`),
    identityId: requireTextureText(value.identityId, `${label}.identityId`),
    ...normalize(value),
    metadata: normalizeMetadata(value.metadata, label)
  };
}

function normalizeMipRange(value, label) {
  return {
    baseMipLevel: requireTextureInteger(value.baseMipLevel ?? 0, `${label}.baseMipLevel`),
    mipLevelCount: requireTextureInteger(value.mipLevelCount ?? 1, `${label}.mipLevelCount`, { minimum: 1 })
  };
}

export function normalizeTexture2D(input = {}) {
  return normalizeTextureView(input, {
    schema: RENDER_TEXTURE_2D_SCHEMA,
    label: "Render Texture 2D view",
    idField: "texture2dId",
    fields: ["baseMipLevel", "mipLevelCount"],
    normalize: (value) => normalizeMipRange(value, "Render Texture 2D view")
  });
}

export function normalizeTextureCube(input = {}) {
  return normalizeTextureView(input, {
    schema: RENDER_TEXTURE_CUBE_SCHEMA,
    label: "Render Texture Cube view",
    idField: "textureCubeId",
    fields: ["baseMipLevel", "mipLevelCount"],
    normalize: (value) => normalizeMipRange(value, "Render Texture Cube view")
  });
}

export function normalizeTextureArray(input = {}) {
  return normalizeTextureView(input, {
    schema: RENDER_TEXTURE_ARRAY_SCHEMA,
    label: "Render Texture Array view",
    idField: "textureArrayId",
    fields: ["baseMipLevel", "mipLevelCount", "baseArrayLayer", "arrayLayerCount"],
    normalize(value) {
      return {
        ...normalizeMipRange(value, "Render Texture Array view"),
        baseArrayLayer: requireTextureInteger(value.baseArrayLayer ?? 0, "Render Texture Array view.baseArrayLayer"),
        arrayLayerCount: requireTextureInteger(value.arrayLayerCount, "Render Texture Array view.arrayLayerCount", { minimum: 1 })
      };
    }
  });
}

export function normalizeRenderTargetTexture(input = {}) {
  return normalizeTextureView(input, {
    schema: RENDER_TARGET_TEXTURE_SCHEMA,
    label: "Render Target Texture view",
    idField: "renderTargetTextureId",
    fields: ["mipLevel", "arrayLayer"],
    normalize(value) {
      return {
        mipLevel: requireTextureInteger(value.mipLevel ?? 0, "Render Target Texture view.mipLevel"),
        arrayLayer: requireTextureInteger(value.arrayLayer ?? 0, "Render Target Texture view.arrayLayer")
      };
    }
  });
}

export function normalizeDepthTexture(input = {}) {
  return normalizeTextureView(input, {
    schema: RENDER_DEPTH_TEXTURE_SCHEMA,
    label: "Render Depth Texture view",
    idField: "depthTextureId",
    fields: ["mipLevel", "baseArrayLayer", "arrayLayerCount", "aspect"],
    normalize(value) {
      return {
        mipLevel: requireTextureInteger(value.mipLevel ?? 0, "Render Depth Texture view.mipLevel"),
        baseArrayLayer: requireTextureInteger(value.baseArrayLayer ?? 0, "Render Depth Texture view.baseArrayLayer"),
        arrayLayerCount: requireTextureInteger(value.arrayLayerCount ?? 1, "Render Depth Texture view.arrayLayerCount", { minimum: 1 }),
        aspect: normalizeTextureEnum(value.aspect, ["depth", "depth-stencil", "stencil"], "Render Depth Texture view.aspect", "depth")
      };
    }
  });
}

export function normalizeShadowTexture(input = {}) {
  requireTextureObject(input, "Render Shadow Texture view");
  rejectTextureFields(input, ["schema", "shadowTextureId", "depthTextureId", "viewType", "metadata"], "Render Shadow Texture view");
  const value = canonicalTextureValue(input, "Render Shadow Texture view");
  return {
    schema: normalizeSchema(value.schema, RENDER_SHADOW_TEXTURE_SCHEMA, "Render Shadow Texture view"),
    shadowTextureId: requireTextureText(value.shadowTextureId, "Render Shadow Texture view.shadowTextureId"),
    depthTextureId: requireTextureText(value.depthTextureId, "Render Shadow Texture view.depthTextureId"),
    viewType: normalizeTextureEnum(value.viewType, TEXTURE_VIEW_TYPES, "Render Shadow Texture view.viewType", "2d"),
    metadata: normalizeMetadata(value.metadata, "Render Shadow Texture view")
  };
}

export function normalizeTextureMipLevel(input = {}) {
  requireTextureObject(input, "Render Texture mip level");
  rejectTextureFields(input, ["schema", "level", "width", "height", "depthOrLayers", "contentId", "metadata"], "Render Texture mip level");
  const value = canonicalTextureValue(input, "Render Texture mip level");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_MIP_LEVEL_SCHEMA, "Render Texture mip level"),
    level: requireTextureInteger(value.level, "Render Texture mip level.level"),
    width: requireTextureInteger(value.width, "Render Texture mip level.width", { minimum: 1 }),
    height: requireTextureInteger(value.height, "Render Texture mip level.height", { minimum: 1 }),
    depthOrLayers: requireTextureInteger(value.depthOrLayers, "Render Texture mip level.depthOrLayers", { minimum: 1 }),
    contentId: optionalTextureText(value.contentId, "Render Texture mip level.contentId"),
    metadata: normalizeMetadata(value.metadata, "Render Texture mip level")
  };
}

export function normalizeTextureMipmap(input = {}) {
  requireTextureObject(input, "Render Texture mipmap plan");
  rejectTextureFields(input, ["schema", "mipmapId", "identityId", "mode", "baseMipLevel", "levelCount", "levels", "metadata"], "Render Texture mipmap plan");
  const value = canonicalTextureValue(input, "Render Texture mipmap plan");
  if (!Array.isArray(value.levels) || value.levels.length === 0) throw new TypeError("Render Texture mipmap plan.levels must contain at least one level.");
  const levels = value.levels.map(normalizeTextureMipLevel).sort((left, right) => left.level - right.level);
  const levelNumbers = levels.map((level) => level.level);
  if (new Set(levelNumbers).size !== levels.length) throw new TypeError("Render Texture mipmap plan.levels cannot contain duplicate levels.");
  const baseMipLevel = requireTextureInteger(value.baseMipLevel ?? levels[0].level, "Render Texture mipmap plan.baseMipLevel");
  if (levels.some((level, index) => level.level !== baseMipLevel + index)) throw new TypeError("Render Texture mipmap plan.levels must be contiguous from baseMipLevel.");
  const levelCount = levels.length;
  if (value.levelCount !== undefined && value.levelCount !== levelCount) throw new TypeError("Render Texture mipmap plan.levelCount must match levels length.");
  const mode = normalizeTextureEnum(value.mode, MIPMAP_MODES, "Render Texture mipmap plan.mode", "source-provided");
  if (mode === "source-provided" && levels.some((level) => level.contentId === null)) {
    throw new TypeError("Source-provided Render Texture mip levels require contentId.");
  }
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_MIPMAP_SCHEMA, "Render Texture mipmap plan"),
    mipmapId: requireTextureText(value.mipmapId, "Render Texture mipmap plan.mipmapId"),
    identityId: requireTextureText(value.identityId, "Render Texture mipmap plan.identityId"),
    mode,
    baseMipLevel,
    levelCount,
    levels,
    metadata: normalizeMetadata(value.metadata, "Render Texture mipmap plan")
  };
}

export function normalizeTextureStream(input = {}) {
  requireTextureObject(input, "Render Texture stream request");
  rejectTextureFields(input, [
    "schema",
    "streamId",
    "identityId",
    "mipmapId",
    "baseMipLevel",
    "mipLevelCount",
    "baseArrayLayer",
    "arrayLayerCount",
    "queueId",
    "submissionId",
    "stagingBufferIdentityId",
    "stagingOffsetBytes",
    "stagingSizeBytes",
    "sourceId",
    "contentIds",
    "priority",
    "metadata"
  ], "Render Texture stream request");
  const value = canonicalTextureValue(input, "Render Texture stream request");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_STREAM_SCHEMA, "Render Texture stream request"),
    streamId: requireTextureText(value.streamId, "Render Texture stream request.streamId"),
    identityId: requireTextureText(value.identityId, "Render Texture stream request.identityId"),
    mipmapId: requireTextureText(value.mipmapId, "Render Texture stream request.mipmapId"),
    baseMipLevel: requireTextureInteger(value.baseMipLevel, "Render Texture stream request.baseMipLevel"),
    mipLevelCount: requireTextureInteger(value.mipLevelCount, "Render Texture stream request.mipLevelCount", { minimum: 1 }),
    baseArrayLayer: requireTextureInteger(value.baseArrayLayer ?? 0, "Render Texture stream request.baseArrayLayer"),
    arrayLayerCount: requireTextureInteger(value.arrayLayerCount ?? 1, "Render Texture stream request.arrayLayerCount", { minimum: 1 }),
    queueId: requireTextureText(value.queueId, "Render Texture stream request.queueId"),
    submissionId: requireTextureText(value.submissionId, "Render Texture stream request.submissionId"),
    stagingBufferIdentityId: requireTextureText(value.stagingBufferIdentityId, "Render Texture stream request.stagingBufferIdentityId"),
    stagingOffsetBytes: requireTextureInteger(value.stagingOffsetBytes ?? 0, "Render Texture stream request.stagingOffsetBytes"),
    stagingSizeBytes: requireTextureInteger(value.stagingSizeBytes, "Render Texture stream request.stagingSizeBytes", { minimum: 1 }),
    sourceId: requireTextureText(value.sourceId, "Render Texture stream request.sourceId"),
    contentIds: normalizeOrderedTextureTextList(value.contentIds, "Render Texture stream request.contentIds", { minimum: 1 }),
    priority: requireTextureInteger(value.priority ?? 0, "Render Texture stream request.priority"),
    metadata: normalizeMetadata(value.metadata, "Render Texture stream request")
  };
}

export function normalizeTextureStreamReceipt(input = {}) {
  requireTextureObject(input, "Render Texture stream receipt");
  rejectTextureFields(input, [
    "schema",
    "streamId",
    "identityId",
    "submissionId",
    "deviceId",
    "providerId",
    "providerVersion",
    "completed",
    "stagingBufferIdentityId",
    "stagingOffsetBytes",
    "stagingSizeBytes",
    "contentIds",
    "baseMipLevel",
    "mipLevelCount",
    "baseArrayLayer",
    "arrayLayerCount",
    "details"
  ], "Render Texture stream receipt");
  const value = canonicalTextureValue(input, "Render Texture stream receipt");
  if (value.completed !== true) throw new TypeError("Render Texture stream receipt.completed must be true.");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_STREAM_RECEIPT_SCHEMA, "Render Texture stream receipt"),
    streamId: requireTextureText(value.streamId, "Render Texture stream receipt.streamId"),
    identityId: requireTextureText(value.identityId, "Render Texture stream receipt.identityId"),
    submissionId: requireTextureText(value.submissionId, "Render Texture stream receipt.submissionId"),
    deviceId: requireTextureText(value.deviceId, "Render Texture stream receipt.deviceId"),
    providerId: requireTextureText(value.providerId, "Render Texture stream receipt.providerId"),
    providerVersion: optionalTextureText(value.providerVersion, "Render Texture stream receipt.providerVersion"),
    completed: true,
    stagingBufferIdentityId: requireTextureText(value.stagingBufferIdentityId, "Render Texture stream receipt.stagingBufferIdentityId"),
    stagingOffsetBytes: requireTextureInteger(value.stagingOffsetBytes, "Render Texture stream receipt.stagingOffsetBytes"),
    stagingSizeBytes: requireTextureInteger(value.stagingSizeBytes, "Render Texture stream receipt.stagingSizeBytes", { minimum: 1 }),
    contentIds: normalizeOrderedTextureTextList(value.contentIds, "Render Texture stream receipt.contentIds", { minimum: 1 }),
    baseMipLevel: requireTextureInteger(value.baseMipLevel, "Render Texture stream receipt.baseMipLevel"),
    mipLevelCount: requireTextureInteger(value.mipLevelCount, "Render Texture stream receipt.mipLevelCount", { minimum: 1 }),
    baseArrayLayer: requireTextureInteger(value.baseArrayLayer, "Render Texture stream receipt.baseArrayLayer"),
    arrayLayerCount: requireTextureInteger(value.arrayLayerCount, "Render Texture stream receipt.arrayLayerCount", { minimum: 1 }),
    details: canonicalTextureValue(value.details ?? {}, "Render Texture stream receipt.details")
  };
}

export function normalizeTextureFailure(input = {}) {
  requireTextureObject(input, "Render Texture failure");
  rejectTextureFields(input, ["code", "message", "details"], "Render Texture failure");
  const value = canonicalTextureValue(input, "Render Texture failure");
  return {
    code: requireTextureText(value.code, "Render Texture failure.code"),
    message: requireTextureText(value.message, "Render Texture failure.message"),
    details: canonicalTextureValue(value.details ?? {}, "Render Texture failure.details")
  };
}

export function normalizeStoredTextureStream(input = {}) {
  requireTextureObject(input, "Stored Render Texture stream");
  rejectTextureFields(input, ["schema", "request", "status", "providerReceipt", "failure"], "Stored Render Texture stream");
  const value = canonicalTextureValue(input, "Stored Render Texture stream");
  const status = normalizeTextureEnum(value.status, STREAM_STATUSES, "Stored Render Texture stream.status", "requested");
  const record = {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_STREAM_RECORD_SCHEMA, "Stored Render Texture stream"),
    request: normalizeTextureStream(value.request),
    status,
    providerReceipt: value.providerReceipt === undefined || value.providerReceipt === null ? null : normalizeTextureStreamReceipt(value.providerReceipt),
    failure: value.failure === undefined || value.failure === null ? null : normalizeTextureFailure(value.failure)
  };
  if (status === "requested" && (record.providerReceipt || record.failure)) throw new TypeError("Requested Render Texture stream cannot retain a receipt or failure.");
  if (status === "completed" && !record.providerReceipt) throw new TypeError("Completed Render Texture stream requires providerReceipt.");
  if (status === "completed" && record.failure) throw new TypeError("Completed Render Texture stream cannot retain failure.");
  if (status === "failed" && !record.failure) throw new TypeError("Failed Render Texture stream requires failure.");
  if (status === "failed" && record.providerReceipt) throw new TypeError("Failed Render Texture stream cannot retain providerReceipt.");
  return record;
}

export function normalizeTextureSubresource(input = {}) {
  requireTextureObject(input, "Render Texture subresource");
  rejectTextureFields(input, ["schema", "mipLevel", "arrayLayer"], "Render Texture subresource");
  const value = canonicalTextureValue(input, "Render Texture subresource");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_SUBRESOURCE_SCHEMA, "Render Texture subresource"),
    mipLevel: requireTextureInteger(value.mipLevel, "Render Texture subresource.mipLevel"),
    arrayLayer: requireTextureInteger(value.arrayLayer, "Render Texture subresource.arrayLayer")
  };
}

export function normalizeTextureSubresources(input = [], label = "Render Texture subresources") {
  if (!Array.isArray(input)) throw new TypeError(`${label} must be an array.`);
  const normalized = input.map(normalizeTextureSubresource).sort((left, right) => left.mipLevel - right.mipLevel || left.arrayLayer - right.arrayLayer);
  const keys = normalized.map((entry) => `${entry.mipLevel}:${entry.arrayLayer}`);
  if (new Set(keys).size !== keys.length) throw new TypeError(`${label} cannot contain duplicate subresources.`);
  return normalized;
}

export function textureSubresourcesForRange({ baseMipLevel, mipLevelCount, baseArrayLayer, arrayLayerCount }) {
  const result = [];
  for (let mipLevel = baseMipLevel; mipLevel < baseMipLevel + mipLevelCount; mipLevel += 1) {
    for (let arrayLayer = baseArrayLayer; arrayLayer < baseArrayLayer + arrayLayerCount; arrayLayer += 1) {
      result.push(normalizeTextureSubresource({ mipLevel, arrayLayer }));
    }
  }
  return result;
}

export function normalizeTextureResidency(input = {}) {
  requireTextureObject(input, "Render Texture residency");
  rejectTextureFields(input, ["schema", "identityId", "desired", "resident", "appliedStreamIds", "residencyRevision", "lastStreamId", "metadata"], "Render Texture residency");
  const value = canonicalTextureValue(input, "Render Texture residency");
  const appliedStreamIds = normalizeOrderedTextureTextList(value.appliedStreamIds, "Render Texture residency.appliedStreamIds");
  if (new Set(appliedStreamIds).size !== appliedStreamIds.length) throw new TypeError("Render Texture residency.appliedStreamIds cannot contain duplicates.");
  return {
    schema: normalizeSchema(value.schema, RENDER_TEXTURE_RESIDENCY_SCHEMA, "Render Texture residency"),
    identityId: requireTextureText(value.identityId, "Render Texture residency.identityId"),
    desired: normalizeTextureSubresources(value.desired, "Render Texture residency.desired"),
    resident: normalizeTextureSubresources(value.resident, "Render Texture residency.resident"),
    appliedStreamIds,
    residencyRevision: requireTextureInteger(value.residencyRevision ?? 0, "Render Texture residency.residencyRevision"),
    lastStreamId: optionalTextureText(value.lastStreamId, "Render Texture residency.lastStreamId"),
    metadata: normalizeMetadata(value.metadata, "Render Texture residency")
  };
}

export function normalizeTextureState(snapshot, { domain, fields, label, validate }) {
  requireTextureObject(snapshot, label);
  rejectTextureFields(snapshot, [...COMMON_STATE_KEYS, ...fields], label);
  const normalized = canonicalTextureValue(snapshot, label);
  if (normalized.domain !== domain) throw new TypeError(`${label}.domain must equal ${domain}.`);
  requireTextureInteger(normalized.sequence, `${label}.sequence`);
  validate?.(normalized);
  return normalized;
}

export function assertSortedTextureRecords(state, { collection, order, revision, normalizeRecord, idField, label }) {
  requireTextureObject(state[collection], `${label}.${collection}`);
  const records = Object.fromEntries(Object.entries(state[collection]).map(([key, record]) => {
    const normalized = normalizeRecord(record);
    const recordId = String(idField).split(".").reduce((value, field) => value?.[field], normalized);
    if (key !== recordId) throw new TypeError(`${label}.${collection} key ${key} does not match ${idField} ${recordId}.`);
    return [key, normalized];
  }));
  const expectedOrder = Object.keys(records).sort();
  if (JSON.stringify(state[order]) !== JSON.stringify(expectedOrder)) throw new TypeError(`${label}.${order} must match sorted ${collection} keys.`);
  requireTextureInteger(state[revision], `${label}.${revision}`);
  state[collection] = records;
  return state;
}

export function normalizeTextureRegistrySnapshot(snapshot, { domain, collection, order, revision, normalizeRecord, idField, label }) {
  return normalizeTextureState(snapshot, {
    domain,
    fields: [collection, order, revision],
    label,
    validate(state) {
      assertSortedTextureRecords(state, { collection, order, revision, normalizeRecord, idField, label });
    }
  });
}

export function normalizeTextureRegistrationCommand(input, field, normalizeRecord, label) {
  const value = normalizeTextureOperation(input, [field], label);
  return { operationId: value.operationId, [field]: normalizeRecord(value[field]) };
}

export const renderTextureEnums = Object.freeze({
  dimensions: TEXTURE_DIMENSIONS,
  usages: TEXTURE_USAGES,
  aspects: TEXTURE_ASPECTS,
  componentTypes: TEXTURE_COMPONENT_TYPES,
  viewTypes: TEXTURE_VIEW_TYPES,
  mipmapModes: MIPMAP_MODES,
  streamStatuses: STREAM_STATUSES
});
