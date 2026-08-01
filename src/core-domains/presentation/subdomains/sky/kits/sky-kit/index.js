import { createDomainKit } from "../../../../../domain-kit.js";

export const CORE_SKYBOX_KIT_VERSION = "0.0.4";

const DEFAULT_SHADER_MODEL = "shader-sky-dome";

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function clamp01(value, fallback = 0) {
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.max(0, Math.min(1, next));
}

function positiveNumber(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function normalizeColor(value, fallback = "#ffffff") {
  if (typeof value !== "string" || value.trim().length === 0) return fallback;
  const next = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(next) || /^#[0-9a-f]{6}$/i.test(next) || /^#[0-9a-f]{8}$/i.test(next)) {
    return next;
  }
  return fallback;
}

function normalizeVector3(value = {}, fallback = { x: 0, y: 1, z: 0 }) {
  const x = Number(value.x ?? fallback.x ?? 0);
  const y = Number(value.y ?? fallback.y ?? 1);
  const z = Number(value.z ?? fallback.z ?? 0);
  const length = Math.hypot(x, y, z) || 1;
  return { x: x / length, y: y / length, z: z / length };
}

function normalizeDrift(value = {}) {
  return {
    x: Number(value.x ?? 0),
    y: Number(value.y ?? 0),
    speed: Number(value.speed ?? 0)
  };
}

export function createSkyboxGradientDescriptor(config = {}) {
  return {
    id: config.id ?? "default-gradient",
    type: "sky-gradient",
    topColor: normalizeColor(config.topColor, "#1c2f72"),
    midColor: normalizeColor(config.midColor, "#5a7ed8"),
    horizonColor: normalizeColor(config.horizonColor, "#f8c77a"),
    lowerColor: normalizeColor(config.lowerColor, "#120914"),
    curve: positiveNumber(config.curve, 1.4),
    horizonPower: positiveNumber(config.horizonPower, 1.0),
    stops: clone(config.stops ?? [])
  };
}

export function createSkyboxHorizonDescriptor(config = {}) {
  return {
    id: config.id ?? "default-horizon",
    type: "horizon-band",
    height: clamp01(config.height, 0.18),
    softness: clamp01(config.softness, 0.42),
    glow: clamp01(config.glow, 0.35),
    glowColor: normalizeColor(config.glowColor, "#ffd18a"),
    atmosphericPerspective: clamp01(config.atmosphericPerspective, 0.28)
  };
}

export function createSkyboxCloudLayerDescriptor(config = {}) {
  return {
    id: config.id ?? "default-cloud-layer",
    type: "cloud-layer",
    shape: config.shape ?? "painted-cumulus",
    coverage: clamp01(config.coverage, 0.42),
    density: clamp01(config.density, 0.55),
    scale: positiveNumber(config.scale, 1.0),
    altitude: clamp01(config.altitude, 0.42),
    softness: clamp01(config.softness, 0.58),
    bandHeight: clamp01(config.bandHeight, 0.22),
    highlightColor: normalizeColor(config.highlightColor, "#fff5d8"),
    shadowColor: normalizeColor(config.shadowColor, "#c6a4cf"),
    drift: normalizeDrift(config.drift)
  };
}

export function createSkyboxCelestialDescriptor(config = {}) {
  return {
    id: config.id ?? "default-celestial",
    type: "celestial",
    sun: config.sun === false ? null : {
      color: normalizeColor(config.sun?.color, "#ffd37a"),
      direction: normalizeVector3(config.sun?.direction, { x: -0.35, y: 0.42, z: -0.84 }),
      intensity: positiveNumber(config.sun?.intensity, 1.0),
      diskSize: positiveNumber(config.sun?.diskSize, 0.055),
      glowSize: positiveNumber(config.sun?.glowSize, 0.22)
    },
    moon: config.moon ? {
      color: normalizeColor(config.moon.color, "#d7e6ff"),
      direction: normalizeVector3(config.moon.direction, { x: 0.45, y: 0.52, z: -0.65 }),
      intensity: positiveNumber(config.moon.intensity, 0.5),
      diskSize: positiveNumber(config.moon.diskSize, 0.04)
    } : null,
    stars: config.stars ? {
      density: clamp01(config.stars.density, 0.3),
      color: normalizeColor(config.stars.color, "#eef6ff"),
      twinkle: clamp01(config.stars.twinkle, 0.15)
    } : null,
    accents: clone(config.accents ?? [])
  };
}

export function createSkyboxAtmosphereDescriptor(config = {}) {
  return {
    id: config.id ?? "default-atmosphere",
    type: "atmosphere-haze",
    haze: clamp01(config.haze, 0.24),
    fogColor: normalizeColor(config.fogColor, "#8fa8ff"),
    fogDensity: Math.max(0, Number(config.fogDensity ?? 0.012)),
    exposure: positiveNumber(config.exposure, 1.0),
    saturation: positiveNumber(config.saturation, 1.0),
    scatter: clamp01(config.scatter, 0.2)
  };
}

export function createSkyboxCompositionDescriptor(config = {}) {
  const cloudLayers = (config.cloudLayers ?? config.clouds ?? [createSkyboxCloudLayerDescriptor()]).map(createSkyboxCloudLayerDescriptor);
  return {
    id: config.id ?? "skybox-composition",
    type: "skybox-composition",
    renderModel: config.renderModel ?? DEFAULT_SHADER_MODEL,
    cameraFollow: config.cameraFollow !== false,
    dome: {
      radius: positiveNumber(config.dome?.radius ?? config.radius, 900),
      segments: Math.max(8, Number(config.dome?.segments ?? 48)),
      rings: Math.max(4, Number(config.dome?.rings ?? 24)),
      depthWrite: config.dome?.depthWrite === true ? true : false,
      depthTest: config.dome?.depthTest === true ? true : false
    },
    quality: config.quality ?? "high",
    gradient: createSkyboxGradientDescriptor(config.gradient),
    horizon: createSkyboxHorizonDescriptor(config.horizon),
    cloudLayers,
    celestial: createSkyboxCelestialDescriptor(config.celestial),
    atmosphere: createSkyboxAtmosphereDescriptor(config.atmosphere),
    shader: {
      model: config.shader?.model ?? DEFAULT_SHADER_MODEL,
      uniforms: clone(config.shader?.uniforms ?? {}),
      extensionSlots: clone(config.shader?.extensionSlots ?? ["gradient", "horizon", "cloudLayers", "celestial", "atmosphere", "postColor"])
    },
    metadata: clone(config.metadata ?? {})
  };
}

export function createSkyboxPreset(config = {}) {
  const id = String(config.id ?? "").trim();
  if (!id) throw new TypeError("Skybox preset requires an id.");
  return {
    id,
    label: config.label ?? id,
    family: config.family ?? "generic",
    tags: [...(config.tags ?? [])],
    composition: createSkyboxCompositionDescriptor({ id: `${id}-composition`, ...(config.composition ?? config) }),
    metadata: clone(config.metadata ?? {})
  };
}

export function createSkyboxRenderDescriptor(presetOrComposition = {}) {
  const composition = presetOrComposition.composition
    ? presetOrComposition.composition
    : createSkyboxCompositionDescriptor(presetOrComposition);
  return {
    id: presetOrComposition.id ?? composition.id ?? "skybox-render-descriptor",
    kind: "skybox",
    type: composition.renderModel,
    cameraFollow: composition.cameraFollow,
    dome: clone(composition.dome),
    quality: composition.quality,
    gradient: clone(composition.gradient),
    horizon: clone(composition.horizon),
    cloudLayers: clone(composition.cloudLayers),
    celestial: clone(composition.celestial),
    atmosphere: clone(composition.atmosphere),
    shader: clone(composition.shader),
    metadata: clone(composition.metadata ?? {})
  };
}

function createPresetMap(presets = []) {
  const entries = Array.isArray(presets)
    ? presets.map((preset) => [preset.id, createSkyboxPreset(preset)])
    : Object.entries(presets).map(([id, preset]) => [id, createSkyboxPreset({ id, ...preset })]);
  return Object.fromEntries(entries);
}

function resolvePresetId(presets, presetId) {
  if (presetId && presets[presetId]) return presetId;
  return null;
}

export function createSkyDescriptorKit(config = {}) {
  const presets = createPresetMap(config.presets ?? []);
  const activePresetId = resolvePresetId(presets, config.activePresetId ?? config.presetId);
  const activePreset = activePresetId ? presets[activePresetId] : null;
  const activeComposition = activePreset?.composition ?? createSkyboxCompositionDescriptor(config.composition);

  return createDomainKit({
    ...config,
    manifestId: "sky-descriptor-kit",
    id: config.id ?? "sky-descriptor-kit",
    domain: "sky",
    domainPath: config.domainPath ?? "n:presentation:sky",
    parentDomainPath: config.parentDomainPath ?? "n:presentation",
    apiName: config.apiName ?? "sky",
    purpose: "Renderer-agnostic sky composition descriptors, caller-supplied preset registry, shader uniform descriptors, camera-follow policy, and atmosphere handoff state.",
    owns: [
      "skybox preset registry",
      "skybox composition descriptors",
      "camera-follow sky descriptors",
      "shader uniform descriptors",
      "atmosphere and fog recommendations",
      "extension slots for art-direction sky kits"
    ],
    doesNotOwn: [
      "renderer implementation",
      "Three.js or WebGL material instances",
      "camera controls",
      "terrain",
      "weather gameplay",
      "time-of-day simulation"
    ],
    services: ["preset-registry", "composition", "render-descriptor", "camera-follow", "shader-uniforms", ...(config.services ?? [])],
    descriptors: {
      ...(config.descriptors ?? {}),
      presets,
      activePresetId,
      activePreset,
      activeComposition,
      render: createSkyboxRenderDescriptor(activeComposition)
    },
    config: {
      cameraFollow: config.cameraFollow !== false,
      quality: config.quality ?? activeComposition.quality,
      activePresetId,
      extensionPolicy: config.extensionPolicy ?? "descriptor-slots"
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      extensionReady: true,
      composableChildren: [
        "sky-gradient-kit",
        "horizon-band-kit",
        "cloud-layer-kit",
        "celestial-kit",
        "atmosphere-haze-kit",
        "sky-weather-kit",
        "sky-biome-kit",
        "sky-preset-registry-kit"
      ]
    },
    createApi({ baseApi }) {
      function getPresetMap() {
        return baseApi.getDescriptors("presets") ?? {};
      }

      function getActivePresetId() {
        return baseApi.getDescriptors().activePresetId ?? baseApi.getConfig().activePresetId;
      }

      function updateActive(presetId, extraPatch = {}, eventName = "updated") {
        const presetMap = extraPatch.descriptors?.presets ?? getPresetMap();
        const nextPresetId = resolvePresetId(presetMap, presetId);
        if (!nextPresetId) throw new RangeError(`Unknown skybox preset: ${presetId}`);
        const preset = presetMap[nextPresetId];
        const render = createSkyboxRenderDescriptor(preset);
        return baseApi.update({
          ...extraPatch,
          config: { ...(extraPatch.config ?? {}), activePresetId: nextPresetId },
          descriptors: {
            ...(extraPatch.descriptors ?? {}),
            activePresetId: nextPresetId,
            activePreset: preset,
            activeComposition: preset.composition,
            render
          }
        }, eventName);
      }

      return {
        listPresets() {
          return Object.values(getPresetMap()).map(clone);
        },
        getPreset(id) {
          return clone(getPresetMap()[id]);
        },
        getActivePreset() {
          return clone(getPresetMap()[getActivePresetId()]);
        },
        setPreset(id) {
          if (!getPresetMap()[id]) {
            throw new RangeError(`Unknown skybox preset: ${id}`);
          }
          return updateActive(id, {}, "presetChanged");
        },
        registerPreset(preset, options = {}) {
          const normalized = createSkyboxPreset(preset);
          const existing = getPresetMap()[normalized.id];
          if (existing && JSON.stringify(existing) !== JSON.stringify(normalized)) {
            throw new Error(`Skybox preset ${normalized.id} already exists with different content.`);
          }
          const presetMap = { ...getPresetMap(), [normalized.id]: normalized };
          if (options.activate) {
            return updateActive(normalized.id, { descriptors: { presets: presetMap } }, "presetRegistered");
          }
          return baseApi.update({ descriptors: { presets: presetMap } }, "presetRegistered");
        },
        compose(parts = {}, options = {}) {
          const composition = createSkyboxCompositionDescriptor({
            id: options.id ?? "custom-skybox-composition",
            cameraFollow: baseApi.getConfig().cameraFollow,
            quality: baseApi.getConfig().quality,
            ...parts
          });
          const render = createSkyboxRenderDescriptor(composition);
          return baseApi.update({
            config: { activePresetId: null },
            descriptors: {
              activePresetId: null,
              activePreset: null,
              activeComposition: composition,
              render
            }
          }, "compositionChanged");
        },
        setCameraFollow(cameraFollow = true) {
          const render = baseApi.getDescriptors("render");
          return baseApi.update({
            config: { cameraFollow: Boolean(cameraFollow) },
            descriptors: {
              render: { ...render, cameraFollow: Boolean(cameraFollow) }
            }
          }, "cameraFollowChanged");
        },
        setShaderUniforms(uniforms = {}) {
          const render = baseApi.getDescriptors("render");
          return baseApi.update({
            descriptors: {
              render: {
                ...render,
                shader: {
                  ...(render.shader ?? {}),
                  uniforms: { ...(render.shader?.uniforms ?? {}), ...clone(uniforms) }
                }
              }
            }
          }, "shaderUniformsChanged");
        },
        getComposition() {
          return clone(baseApi.getDescriptors().activeComposition);
        },
        getRenderDescriptor() {
          return clone(baseApi.getDescriptors("render"));
        }
      };
    }
  });
}
