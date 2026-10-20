export const MATERIAL_TEXTURE_SLOTS = Object.freeze([
  "baseColor",
  "normal",
  "roughness",
  "ambientOcclusion",
  "emissive",
  "clearcoat",
  "packedMask"
]);

const clone = value => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = value => Math.max(0, Math.min(1, finite(value, 0)));

function vector2(value, fallback = [1, 1]) {
  if (Array.isArray(value)) return Object.freeze([finite(value[0], fallback[0]), finite(value[1], fallback[1])]);
  if (value && typeof value === "object") {
    return Object.freeze([finite(value.x, fallback[0]), finite(value.y, fallback[1])]);
  }
  if (value != null) {
    const scalar = finite(value, fallback[0]);
    return Object.freeze([scalar, scalar]);
  }
  return Object.freeze([...fallback]);
}

function positiveInteger(value, fallback) {
  const next = Math.floor(finite(value, fallback));
  return Math.max(1, next);
}

export function createTextureReference(value, defaults = {}) {
  if (value == null) return null;
  const source = typeof value === "string" ? { assetId: value } : value;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new TypeError("Material texture references must be asset ids or descriptor objects.");
  }
  const assetId = String(source.assetId ?? source.textureId ?? source.id ?? "").trim();
  if (!assetId) throw new TypeError("Material texture references require an assetId.");
  return Object.freeze({
    assetId,
    channel: String(source.channel ?? defaults.channel ?? "rgba"),
    colorSpace: source.colorSpace == null && defaults.colorSpace == null
      ? null
      : String(source.colorSpace ?? defaults.colorSpace),
    uvSet: Math.max(0, Math.floor(finite(source.uvSet, defaults.uvSet ?? 0))),
    sampler: Object.freeze(clone(source.sampler ?? defaults.sampler ?? {})),
    metadata: Object.freeze(clone(source.metadata ?? {}))
  });
}

function createTextureSlots(config = {}) {
  const source = config.textures ?? config.textureSlots ?? {};
  const baseColor = source.baseColor ?? source.albedo ?? source.color ?? config.textureId ?? null;
  return Object.freeze({
    baseColor: createTextureReference(baseColor, { colorSpace: "srgb" }),
    normal: createTextureReference(source.normal),
    roughness: createTextureReference(source.roughness, { channel: "r" }),
    ambientOcclusion: createTextureReference(source.ambientOcclusion ?? source.ao, { channel: "r", uvSet: 1 }),
    emissive: createTextureReference(source.emissive, { colorSpace: "srgb" }),
    clearcoat: createTextureReference(source.clearcoat, { channel: "r" }),
    packedMask: createTextureReference(source.packedMask ?? source.orm)
  });
}

function createUVMetadata(config = {}) {
  const source = config.uv ?? config.uvMetadata ?? {};
  return Object.freeze({
    set: Math.max(0, Math.floor(finite(source.set, 0))),
    scale: vector2(source.scale, [1, 1]),
    offset: vector2(source.offset, [0, 0]),
    rotation: finite(source.rotation, 0),
    wrapU: String(source.wrapU ?? "repeat"),
    wrapV: String(source.wrapV ?? "repeat"),
    texelDensity: source.texelDensity == null ? null : Math.max(0, finite(source.texelDensity, 0)),
    metadata: Object.freeze(clone(source.metadata ?? {}))
  });
}

function createTextureResolution(config = {}) {
  const source = config.textureResolution ?? config.resolution ?? null;
  if (source == null) return null;
  if (typeof source === "number") {
    const size = positiveInteger(source, 1);
    return Object.freeze({ width: size, height: size });
  }
  return Object.freeze({
    width: positiveInteger(source.width, 1),
    height: positiveInteger(source.height, source.width ?? 1)
  });
}

export function createMaterialDescriptor(config = {}) {
  const textures = createTextureSlots(config);
  return Object.freeze({
    id: config.id ?? "material",
    kind: config.kind ?? "standard",
    revision: Math.max(0, Math.floor(finite(config.revision, 0))),
    color: config.color ?? null,
    textureId: config.textureId ?? textures.baseColor?.assetId ?? null,
    textures,
    textureResolution: createTextureResolution(config),
    uv: createUVMetadata(config),
    roughness: config.roughness == null ? null : clamp01(config.roughness),
    metalness: config.metalness == null ? null : clamp01(config.metalness),
    clearcoat: config.clearcoat == null ? 0 : clamp01(config.clearcoat),
    clearcoatRoughness: config.clearcoatRoughness == null ? 0 : clamp01(config.clearcoatRoughness),
    normalScale: vector2(config.normalScale, [1, 1]),
    environmentIntensity: Math.max(0, finite(config.environmentIntensity, 1)),
    reflectionId: config.reflectionId == null ? null : String(config.reflectionId),
    transparent: config.transparent === true,
    opacity: config.opacity == null ? 1 : clamp01(config.opacity),
    transmission: config.transmission == null ? 0 : clamp01(config.transmission),
    ior: config.ior == null ? null : Math.max(1, finite(config.ior, 1.5)),
    thickness: config.thickness == null ? null : Math.max(0, finite(config.thickness, 0)),
    depthTest: config.depthTest !== false,
    depthWrite: config.depthWrite === true,
    blendMode: config.blendMode ?? "none",
    premultipliedAlpha: config.premultipliedAlpha === true,
    quality: config.quality ?? "default",
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}
