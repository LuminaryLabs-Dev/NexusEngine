import { createCoreCapabilityKit } from "../core-capability-kit.js";

export const CORE_SKYBOX_KIT_VERSION = "0.0.3";

const DEFAULT_SHADER_MODEL = "shader-sky-dome";
const DEFAULT_PRESET_ID = "clear-day";

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
  const id = config.id ?? DEFAULT_PRESET_ID;
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

export const CORE_SKYBOX_PRESETS = Object.freeze({
  "clear-day": createSkyboxPreset({
    id: "clear-day",
    label: "Clear Day",
    family: "day",
    tags: ["clear", "generic", "baseline"],
    gradient: { topColor: "#1f62c9", midColor: "#6aa4ff", horizonColor: "#f4d89a", lowerColor: "#102030" },
    horizon: { height: 0.18, softness: 0.42, glow: 0.2, glowColor: "#f6d99a" },
    clouds: [{ id: "soft-high-clouds", coverage: 0.22, density: 0.38, scale: 1.4, altitude: 0.62, softness: 0.76, bandHeight: 0.2 }],
    atmosphere: { haze: 0.14, fogColor: "#8fbaff", fogDensity: 0.004, exposure: 1.0 }
  }),
  "golden-horizon": createSkyboxPreset({
    id: "golden-horizon",
    label: "Golden Horizon",
    family: "dawn",
    tags: ["warm", "horizon", "sunrise"],
    gradient: { topColor: "#241052", midColor: "#6d4cab", horizonColor: "#ffb56d", lowerColor: "#120914" },
    horizon: { height: 0.2, softness: 0.55, glow: 0.55, glowColor: "#ffd37a" },
    clouds: [{ id: "painted-low-clouds", coverage: 0.48, density: 0.58, scale: 1.25, altitude: 0.36, softness: 0.62, bandHeight: 0.24, highlightColor: "#fff4da", shadowColor: "#c79bca", drift: { x: 0.012, y: 0, speed: 0.01 } }],
    atmosphere: { haze: 0.35, fogColor: "#6d4cab", fogDensity: 0.012, exposure: 1.06, saturation: 1.1 }
  }),
  "deep-night": createSkyboxPreset({
    id: "deep-night",
    label: "Deep Night",
    family: "night",
    tags: ["night", "stars", "cool"],
    gradient: { topColor: "#03051a", midColor: "#11164a", horizonColor: "#283060", lowerColor: "#05030e" },
    horizon: { height: 0.15, softness: 0.48, glow: 0.12, glowColor: "#7f91ff" },
    clouds: [{ id: "thin-night-clouds", coverage: 0.2, density: 0.24, scale: 1.8, altitude: 0.58, softness: 0.8, bandHeight: 0.16, highlightColor: "#aebaff", shadowColor: "#25254b" }],
    celestial: { sun: false, moon: { color: "#d7e6ff", direction: { x: 0.32, y: 0.61, z: -0.72 }, intensity: 0.72 }, stars: { density: 0.66, twinkle: 0.25 } },
    atmosphere: { haze: 0.18, fogColor: "#182052", fogDensity: 0.008, exposure: 0.82, saturation: 0.9 }
  }),
  "storm-front": createSkyboxPreset({
    id: "storm-front",
    label: "Storm Front",
    family: "storm",
    tags: ["storm", "dark", "weather"],
    gradient: { topColor: "#151823", midColor: "#303647", horizonColor: "#6a6270", lowerColor: "#090a11" },
    horizon: { height: 0.16, softness: 0.38, glow: 0.12, glowColor: "#95a0b2" },
    clouds: [{ id: "heavy-storm-layer", coverage: 0.78, density: 0.82, scale: 0.86, altitude: 0.46, softness: 0.45, bandHeight: 0.36, highlightColor: "#87909e", shadowColor: "#1a1d28", drift: { x: 0.03, y: 0, speed: 0.02 } }],
    atmosphere: { haze: 0.44, fogColor: "#3b4354", fogDensity: 0.02, exposure: 0.86, saturation: 0.75 }
  }),
  "rift-energy": createSkyboxPreset({
    id: "rift-energy",
    label: "Rift Energy",
    family: "fantasy",
    tags: ["rift", "energy", "stylized"],
    gradient: { topColor: "#130329", midColor: "#40207a", horizonColor: "#67dfff", lowerColor: "#05010c" },
    horizon: { height: 0.22, softness: 0.5, glow: 0.62, glowColor: "#8fe8ff" },
    clouds: [{ id: "rift-cloud-band", shape: "streaked-cumulus", coverage: 0.52, density: 0.62, scale: 1.1, altitude: 0.4, softness: 0.5, bandHeight: 0.25, highlightColor: "#d8fbff", shadowColor: "#5b37a3", drift: { x: 0.018, y: 0.004, speed: 0.018 } }],
    celestial: { sun: { color: "#8fe8ff", direction: { x: -0.26, y: 0.36, z: -0.9 }, intensity: 1.15, diskSize: 0.04, glowSize: 0.34 }, accents: [{ kind: "rift-arc", color: "#a98cff", intensity: 0.7 }] },
    atmosphere: { haze: 0.38, fogColor: "#40207a", fogDensity: 0.016, exposure: 1.05, saturation: 1.2 }
  })
});

function createPresetMap(presets = CORE_SKYBOX_PRESETS) {
  const entries = Array.isArray(presets)
    ? presets.map((preset) => [preset.id, createSkyboxPreset(preset)])
    : Object.entries(presets).map(([id, preset]) => [id, createSkyboxPreset({ id, ...preset })]);
  return Object.fromEntries(entries);
}

function resolvePresetId(presets, presetId) {
  if (presetId && presets[presetId]) return presetId;
  if (presets[DEFAULT_PRESET_ID]) return DEFAULT_PRESET_ID;
  return Object.keys(presets)[0];
}

export function createCoreSkyboxKit(config = {}) {
  const presets = createPresetMap(config.presets ?? CORE_SKYBOX_PRESETS);
  const activePresetId = resolvePresetId(presets, config.activePresetId ?? config.presetId ?? DEFAULT_PRESET_ID);
  const activePreset = presets[activePresetId];

  return createCoreCapabilityKit({
    ...config,
    domain: "core-skybox",
    apiName: config.apiName ?? "coreSkybox",
    purpose: "Renderer-agnostic skybox composition descriptors, preset registry, shader uniform descriptors, camera-follow policy, and atmosphere handoff state.",
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
      render: createSkyboxRenderDescriptor(activePreset)
    },
    config: {
      cameraFollow: config.cameraFollow !== false,
      quality: config.quality ?? activePreset.composition.quality,
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
        const presetMap = getPresetMap();
        const nextPresetId = resolvePresetId(presetMap, presetId);
        const preset = presetMap[nextPresetId];
        const render = createSkyboxRenderDescriptor(preset);
        return baseApi.update({
          config: { activePresetId: nextPresetId },
          descriptors: {
            activePresetId: nextPresetId,
            activePreset: preset,
            render,
            ...(extraPatch.descriptors ?? {})
          },
          ...extraPatch
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
          const presetMap = { ...getPresetMap(), [normalized.id]: normalized };
          const activeId = options.activate ? normalized.id : getActivePresetId();
          return updateActive(activeId, { descriptors: { presets: presetMap } }, "presetRegistered");
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
            descriptors: {
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
          return clone(baseApi.getDescriptors().activeComposition ?? this.getActivePreset()?.composition);
        },
        getRenderDescriptor() {
          return clone(baseApi.getDescriptors("render"));
        }
      };
    }
  });
}
