export function createMaterialDescriptor(config = {}) {
  return Object.freeze({
    id: config.id ?? "material",
    kind: config.kind ?? "standard",
    color: config.color ?? null,
    textureId: config.textureId ?? null,
    roughness: config.roughness ?? null,
    metalness: config.metalness ?? null,
    transparent: config.transparent === true,
    opacity: config.opacity == null ? 1 : Number(config.opacity),
    transmission: config.transmission == null ? 0 : Number(config.transmission),
    ior: config.ior == null ? null : Number(config.ior),
    thickness: config.thickness == null ? null : Number(config.thickness),
    depthTest: config.depthTest !== false,
    depthWrite: config.depthWrite === true,
    blendMode: config.blendMode ?? "none",
    premultipliedAlpha: config.premultipliedAlpha === true,
    quality: config.quality ?? "default",
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}
