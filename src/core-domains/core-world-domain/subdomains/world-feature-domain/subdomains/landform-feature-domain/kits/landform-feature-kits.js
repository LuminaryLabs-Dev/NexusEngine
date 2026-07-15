import {
  createSemanticWorldFeatureKit,
  finiteNumber,
  normalizeFeaturePath,
  sampleSemanticFeatureInfluence
} from "../../../kits/semantic-feature-kit/index.js";

function normalizePathDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    path: normalizeFeaturePath(source.path, source.center ?? source.position),
    width: Math.max(1, finiteNumber(source.width ?? source.radius * 2, defaults.width ?? 1000)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 2)),
    materialZones: structuredClone(source.materialZones ?? defaults.materialZones ?? []),
    cliffThreshold: Math.max(0, finiteNumber(source.cliffThreshold, defaults.cliffThreshold ?? 0.72))
  };
}

function normalizeCenterDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    center: {
      x: finiteNumber(source.center?.x ?? source.position?.x),
      y: finiteNumber(source.center?.y ?? source.position?.y),
      z: finiteNumber(source.center?.z ?? source.position?.z)
    },
    radius: Math.max(1, finiteNumber(source.radius ?? source.width * 0.5, defaults.radius ?? 500)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 2))
  };
}

function landformChannels(feature, { elevation = true, collisionKind = "foundation-heightfield", materialKind = null } = {}) {
  const channels = {
    landform: {
      kind: "world-feature-landform",
      featureType: feature.type,
      definition: feature
    },
    collision: {
      kind: collisionKind,
      featureId: feature.id,
      featureType: feature.type,
      fidelity: feature.fidelity.collision
    }
  };
  if (elevation) {
    channels.elevation = {
      kind: "world-feature-field",
      featureType: feature.type,
      definition: feature
    };
  }
  channels.material = {
    kind: materialKind ?? `${feature.type}-material-zones`,
    featureId: feature.id,
    zones: feature.definition.materialZones ?? []
  };
  return channels;
}

function variationFactor(feature, point) {
  const amount = Math.max(0, Math.min(0.45, finiteNumber(feature.definition.variation, 0)));
  if (amount <= 0) return 1;
  let hash = 2166136261;
  for (const character of String(feature.seed ?? feature.id)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return 1 - amount * 0.5
    + Math.sin((finiteNumber(point.x) + finiteNumber(point.z)) * 0.0017 + (hash >>> 0) * 1e-5) * amount * 0.5;
}

export function sampleMountainElevation(definitionInput = {}, point = {}) {
  const feature = definitionInput?.type === "mountain" && definitionInput.definition
    ? definitionInput
    : createMountainDefinition({ id: definitionInput?.id ?? "mountain-sample", definition: definitionInput });
  const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
  return finiteNumber(feature.definition.height, 100) * influence * variationFactor(feature, point);
}

export function createMountainDefinition(input = {}) {
  return createMountainFeatureKit().normalize(input);
}

export function createMountainFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "mountain",
    family: "landform",
    defaults: { width: 1000, height: 100, sharpness: 2.5, variation: 0, cliffThreshold: 0.72, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition(source) {
      const definition = normalizePathDefinition(source, { width: 1000, sharpness: 2.5 });
      definition.halfWidth = definition.width * 0.5;
      definition.height = Math.max(0, finiteNumber(source.height, 100));
      definition.variation = Math.max(0, Math.min(0.45, finiteNumber(source.variation, 0)));
      return definition;
    },
    sample: sampleMountainElevation,
    blendMode: "add",
    channels: (feature) => landformChannels(feature),
    fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "foundation" },
    metadata: (feature) => ({ cliffThreshold: feature.definition.cliffThreshold })
  });
}

function createPathElevationKit({ type, defaults, blendMode = "add", sampleValue, fidelity, metadata }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "landform",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition(source) {
      const definition = normalizePathDefinition(source, defaults);
      definition.halfWidth = definition.width * 0.5;
      return definition;
    },
    sample(feature, point, context) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
      return influence * finiteNumber(sampleValue(feature.definition, feature, context), 0);
    },
    blendMode,
    channels: (feature) => landformChannels(feature),
    fidelity,
    metadata
  });
}

export const createRidgeFeatureKit = createPathElevationKit({
  type: "ridge",
  defaults: { width: 700, height: 180, sharpness: 2.8, asymmetry: 0 },
  sampleValue: (definition) => definition.height,
  fidelity: { near: "foundation-field", middle: "foundation-field", far: "silhouette", collision: "foundation" }
});

export function createHillFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "hill",
    family: "landform",
    defaults: { radius: 450, height: 90, sharpness: 2, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition: (source) => ({ ...normalizeCenterDefinition(source, { radius: 450, sharpness: 2 }), height: Math.max(0, finiteNumber(source.height, 90)) }),
    sample(feature, point) {
      return finiteNumber(feature.definition.height, 90)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    blendMode: "add",
    channels: (feature) => landformChannels(feature),
    fidelity: { near: "foundation-field", middle: "foundation-field", far: "silhouette", collision: "foundation" }
  });
}

export function createPlateauFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "plateau",
    family: "landform",
    defaults: { radius: 650, height: 140, edgeWidth: 180, sharpness: 1.6, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition(source) {
      const definition = normalizeCenterDefinition(source, { radius: 650, sharpness: 1.6 });
      definition.height = finiteNumber(source.height, 140);
      definition.edgeWidth = Math.max(1, finiteNumber(source.edgeWidth, 180));
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.height, 140)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    blendMode: "add",
    channels: (feature) => landformChannels(feature),
    fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "foundation" }
  });
}

export const createCliffFeatureKit = createPathElevationKit({
  type: "cliff",
  defaults: { width: 180, height: 160, sharpness: 5, faceAngle: 82 },
  sampleValue: (definition) => definition.height,
  fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "detailed" },
  metadata: (feature) => ({ faceAngle: finiteNumber(feature.definition.faceAngle, 82), meshRequired: true })
});

export const createEscarpmentFeatureKit = createPathElevationKit({
  type: "escarpment",
  defaults: { width: 420, offset: 120, sharpness: 2.6, falloff: 260 },
  sampleValue: (definition) => definition.offset,
  fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "foundation" }
});

export const createCanyonFeatureKit = createPathElevationKit({
  type: "canyon",
  defaults: { width: 620, depth: 260, floorWidth: 90, sharpness: 3.5 },
  blendMode: "subtract",
  sampleValue: (definition) => definition.depth,
  fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "detailed" },
  metadata: (feature) => ({ floorWidth: finiteNumber(feature.definition.floorWidth, 90), wallMeshRequired: true })
});

export const createValleyFeatureKit = createPathElevationKit({
  type: "valley",
  defaults: { width: 1200, depth: 140, sharpness: 1.4 },
  blendMode: "subtract",
  sampleValue: (definition) => definition.depth,
  fidelity: { near: "foundation-field", middle: "foundation-field", far: "silhouette", collision: "foundation" }
});

export function createPassFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "pass",
    family: "landform",
    defaults: { radius: 480, width: 620, cutDepth: 180, sharpness: 2, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "width"],
    normalizeDefinition(source) {
      const definition = normalizeCenterDefinition(source, { radius: finiteNumber(source.width, 620) * 0.5, sharpness: 2 });
      definition.cutDepth = Math.max(0, finiteNumber(source.cutDepth ?? source.depth, 180));
      definition.axis = structuredClone(source.axis ?? { x: 1, z: 0 });
      definition.saddleHeight = finiteNumber(source.saddleHeight, 0);
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.cutDepth, 180)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    blendMode: "subtract",
    channels: (feature) => landformChannels(feature),
    fidelity: { near: "foundation-field", middle: "foundation-field", far: "silhouette", collision: "foundation" }
  });
}

export function createCaveOverhangFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "cave-overhang",
    family: "landform",
    defaults: { radius: 120, depth: 180, clearance: 24, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "depth"],
    normalizeDefinition(source) {
      const definition = normalizeCenterDefinition({ ...source, center: source.portal ?? source.center }, { radius: 120, sharpness: 1 });
      definition.portal = structuredClone(source.portal ?? definition.center);
      definition.depth = Math.max(1, finiteNumber(source.depth, 180));
      definition.clearance = Math.max(1, finiteNumber(source.clearance, 24));
      definition.volume = structuredClone(source.volume ?? { kind: "tunnel", depth: definition.depth, clearance: definition.clearance });
      return definition;
    },
    sample(feature, point) {
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    blendMode: "overlay",
    channels(feature) {
      return landformChannels(feature, { elevation: false, collisionKind: "void-volume", materialKind: "exposed-rock-volume" });
    },
    fidelity: { near: "feature-mesh", middle: "portal-impostor", far: "none", collision: "detailed" },
    metadata: { meshRequired: true, heightfieldRepresentable: false }
  });
}

export function createLandformFeatureKits(config = {}) {
  return [
    createMountainFeatureKit(config.mountain ?? {}),
    createRidgeFeatureKit(config.ridge ?? {}),
    createHillFeatureKit(config.hill ?? {}),
    createPlateauFeatureKit(config.plateau ?? {}),
    createCliffFeatureKit(config.cliff ?? {}),
    createEscarpmentFeatureKit(config.escarpment ?? {}),
    createCanyonFeatureKit(config.canyon ?? {}),
    createValleyFeatureKit(config.valley ?? {}),
    createPassFeatureKit(config.pass ?? {}),
    createCaveOverhangFeatureKit(config.caveOverhang ?? config["cave-overhang"] ?? {})
  ];
}
