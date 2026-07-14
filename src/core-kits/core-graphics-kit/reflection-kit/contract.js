const clone = value => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const uniqueStrings = values => Object.freeze([...new Set((values ?? []).filter(value => value != null).map(String))]);

export const REFLECTION_TECHNIQUES = Object.freeze([
  "environment-probe",
  "local-probe",
  "planar",
  "screen-space",
  "ray-traced"
]);

export const REFLECTION_UPDATE_MODES = Object.freeze([
  "static",
  "on-change",
  "interval",
  "every-frame"
]);

export const REFLECTION_CAPABILITIES = Object.freeze([
  "n:graphics:reflection",
  "n:graphics:reflection-descriptor",
  "n:graphics:reflection-policy",
  "n:graphics:reflection-negotiation",
  "n:graphics:reflection-frame-receipt"
]);

function vector3(value) {
  if (value == null) return null;
  const source = Array.isArray(value) ? value : [value.x, value.y, value.z];
  return Object.freeze([
    finite(source[0], 0),
    finite(source[1], 0),
    finite(source[2], 0)
  ]);
}

function bounds(value) {
  if (value == null) return null;
  return Object.freeze({ minimum: vector3(value.minimum ?? value.min), maximum: vector3(value.maximum ?? value.max) });
}

function resolution(value, fallback = 256) {
  if (typeof value === "number") {
    const size = Math.max(1, Math.floor(finite(value, fallback)));
    return Object.freeze({ width: size, height: size });
  }
  const source = value ?? {};
  return Object.freeze({
    width: Math.max(1, Math.floor(finite(source.width, fallback))),
    height: Math.max(1, Math.floor(finite(source.height, source.width ?? fallback)))
  });
}

export function createReflectionQualityBudget(config = {}) {
  return Object.freeze({
    maximumResolution: Math.max(1, Math.floor(finite(config.maximumResolution, 1024))),
    maximumDynamicProbes: Math.max(0, Math.floor(finite(config.maximumDynamicProbes, 4))),
    maximumUpdatesPerFrame: Math.max(0, Math.floor(finite(config.maximumUpdatesPerFrame, 1))),
    updateIntervalFrames: Math.max(1, Math.floor(finite(config.updateIntervalFrames, 1))),
    maximumGpuMilliseconds: Math.max(0, finite(config.maximumGpuMilliseconds, 2)),
    maximumMemoryBytes: Math.max(0, Math.floor(finite(config.maximumMemoryBytes, 64 * 1024 * 1024))),
    raysPerPixel: Math.max(0, finite(config.raysPerPixel, 1)),
    halfResolution: config.halfResolution === true,
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}

export function createReflectionDescriptor(config = {}) {
  const kind = String(config.kind ?? "environment-probe");
  if (!REFLECTION_TECHNIQUES.includes(kind)) {
    throw new TypeError(`Unsupported reflection technique: ${kind}`);
  }
  const updateMode = String(config.updateMode ?? (kind === "environment-probe" ? "static" : "on-change"));
  if (!REFLECTION_UPDATE_MODES.includes(updateMode)) {
    throw new TypeError(`Unsupported reflection update mode: ${updateMode}`);
  }
  return Object.freeze({
    id: String(config.id ?? `${kind}-reflection`),
    kind,
    revision: Math.max(0, Math.floor(finite(config.revision, 0))),
    enabled: config.enabled !== false,
    priority: finite(config.priority, 0),
    textureId: config.textureId == null ? null : String(config.textureId),
    updateMode,
    resolution: resolution(config.resolution, kind === "ray-traced" ? 512 : 256),
    position: vector3(config.position),
    bounds: bounds(config.bounds),
    plane: config.plane == null ? null : Object.freeze({
      normal: vector3(config.plane.normal ?? [0, 1, 0]),
      constant: finite(config.plane.constant, 0)
    }),
    influenceRadius: config.influenceRadius == null ? null : Math.max(0, finite(config.influenceRadius, 0)),
    boxProjection: config.boxProjection === true,
    materialIds: uniqueStrings(config.materialIds),
    layers: uniqueStrings(config.layers),
    qualityBudget: createReflectionQualityBudget(config.qualityBudget),
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}

export function createReflectionPolicyDescriptor(config = {}) {
  const preferredTechnique = String(config.preferredTechnique ?? "environment-probe");
  if (!REFLECTION_TECHNIQUES.includes(preferredTechnique)) {
    throw new TypeError(`Unsupported preferred reflection technique: ${preferredTechnique}`);
  }
  const fallbackOrder = uniqueStrings(
    (config.fallbackOrder ?? REFLECTION_TECHNIQUES)
      .filter(technique => technique !== preferredTechnique)
  );
  for (const technique of fallbackOrder) {
    if (!REFLECTION_TECHNIQUES.includes(technique)) {
      throw new TypeError(`Unsupported reflection fallback technique: ${technique}`);
    }
  }
  return Object.freeze({
    id: String(config.id ?? "default-reflection-policy"),
    revision: Math.max(0, Math.floor(finite(config.revision, 0))),
    preferredTechnique,
    fallbackOrder,
    required: config.required === true,
    allowDegraded: config.allowDegraded !== false,
    qualityBudget: createReflectionQualityBudget(config.qualityBudget),
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}
