import { createWorldFeatureFamilyDomain } from "../feature-family-domain-kit/index.js";
import {
  createSemanticWorldFeatureKit,
  finiteNumber,
  normalizeFeaturePath,
  sampleSemanticFeatureInfluence
} from "../../kits/semantic-feature-kit/index.js";

function areaDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    area: structuredClone(source.area ?? source.boundary ?? source.footprint ?? []),
    center: structuredClone(source.center ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 700)),
    edgeWidth: Math.max(1, finiteNumber(source.edgeWidth ?? source.transitionWidth, defaults.edgeWidth ?? 120)),
    density: Math.max(0, finiteNumber(source.density, defaults.density ?? 1)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function ecologyChannels(feature, materialKind = null) {
  const channels = {
    ecology: {
      kind: "world-feature-ecology",
      featureType: feature.type,
      definition: feature
    }
  };
  if (materialKind) {
    channels.material = {
      kind: materialKind,
      featureId: feature.id,
      density: feature.definition.density
    };
  }
  return channels;
}

function areaEcologyKit({ type, defaults, sampleKey = "density", materialKind = null, fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "ecology",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition: (source) => areaDefinition(source, defaults),
    sample(feature, point) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
      return influence * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    channels: (feature) => ecologyChannels(feature, materialKind),
    fidelity: fidelity ?? { near: "population-descriptor", middle: "cluster-descriptor", far: "biome-field", collision: "none" }
  });
}

export function createBiomeRegionFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "biome-region",
    family: "ecology",
    defaults: { radius: 1200, edgeWidth: 180, weight: 1, climateRules: {}, biome: "temperate", ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition(source) {
      const definition = areaDefinition(source, { radius: 1200, edgeWidth: 180 });
      definition.weight = Math.max(0, finiteNumber(source.weight, 1));
      definition.biome = String(source.biome ?? source.biomeId ?? "temperate");
      definition.climateRules = structuredClone(source.climateRules ?? {});
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.weight, 1)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
    },
    channels: (feature) => ecologyChannels(feature, "biome-material-region"),
    fidelity: { near: "biome-field", middle: "biome-field", far: "map-field", collision: "none" }
  });
}

export function createForestFeatureKit(config = {}) {
  return areaEcologyKit({ type: "forest", defaults: { radius: 900, edgeWidth: 150, density: 0.9, communities: [] }, materialKind: "forest-ground" })(config);
}

export function createWoodlandFeatureKit(config = {}) {
  return areaEcologyKit({ type: "woodland", defaults: { radius: 800, edgeWidth: 150, density: 0.48, species: [] }, materialKind: "woodland-ground" })(config);
}

export function createMeadowFeatureKit(config = {}) {
  return areaEcologyKit({ type: "meadow", defaults: { radius: 650, edgeWidth: 120, density: 0.8, floraMix: [] }, materialKind: "meadow-ground" })(config);
}

export function createGrasslandFeatureKit(config = {}) {
  return areaEcologyKit({ type: "grassland", defaults: { radius: 1100, edgeWidth: 180, density: 0.85, height: 0.65 }, materialKind: "grassland-ground" })(config);
}

export function createShrublandFeatureKit(config = {}) {
  return areaEcologyKit({ type: "shrubland", defaults: { radius: 700, edgeWidth: 130, density: 0.58, species: [] }, materialKind: "shrubland-ground" })(config);
}

export function createAlpineZoneFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "alpine-zone",
    family: "ecology",
    defaults: { radius: 100000, edgeWidth: 1, density: 1, elevationRange: [1800, 9000], exposure: 0.7, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition(source) {
      const definition = areaDefinition(source, { radius: 100000, edgeWidth: 1 });
      const range = Array.isArray(source.elevationRange) ? source.elevationRange : [source.minimumElevation ?? 1800, source.maximumElevation ?? 9000];
      definition.elevationRange = Object.freeze([finiteNumber(range[0], 1800), finiteNumber(range[1], 9000)]);
      definition.exposure = Math.max(0, finiteNumber(source.exposure, 0.7));
      return definition;
    },
    sample(feature, point, context = {}) {
      const [minimum, maximum] = feature.definition.elevationRange;
      const height = finiteNumber(context.height ?? point.y);
      if (height < minimum || height > maximum) return 0;
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius"] });
    },
    channels: (feature) => ecologyChannels(feature, "alpine-ground"),
    fidelity: { near: "biome-field", middle: "biome-field", far: "map-field", collision: "none" }
  });
}

export function createRiparianZoneFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "riparian-zone",
    family: "ecology",
    defaults: { width: 140, density: 0.9, waterFeature: null, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition(source) {
      const width = Math.max(1, finiteNumber(source.width, 140));
      return {
        ...source,
        path: normalizeFeaturePath(source.path, source.center),
        width,
        halfWidth: width * 0.5,
        density: Math.max(0, finiteNumber(source.density, 0.9)),
        waterFeature: source.waterFeature == null ? null : String(source.waterFeature)
      };
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.density, 0.9)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
    },
    channels: (feature) => ecologyChannels(feature, "riparian-ground"),
    fidelity: { near: "population-descriptor", middle: "cluster-descriptor", far: "biome-field", collision: "none" }
  });
}

export function createEcotoneFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "ecotone",
    family: "ecology",
    defaults: { radius: 800, edgeWidth: 220, blend: 0.5, fromBiome: "unknown", toBiome: "unknown", ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition(source) {
      const definition = areaDefinition(source, { radius: 800, edgeWidth: 220 });
      definition.fromBiome = String(source.fromBiome ?? "unknown");
      definition.toBiome = String(source.toBiome ?? "unknown");
      definition.blend = Math.max(0, Math.min(1, finiteNumber(source.blend, 0.5)));
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.blend, 0.5)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
    },
    channels: (feature) => ecologyChannels(feature, "ecotone-material-blend"),
    fidelity: { near: "biome-field", middle: "biome-field", far: "map-field", collision: "none" }
  });
}

export function createHabitatPatchFeatureKit(config = {}) {
  return areaEcologyKit({ type: "habitat-patch", defaults: { radius: 500, edgeWidth: 90, suitability: 0.8, speciesRules: {} }, sampleKey: "suitability" })(config);
}

export function createEcologyFeatureKits(config = {}) {
  return [
    createBiomeRegionFeatureKit(config.biomeRegion ?? config["biome-region"] ?? {}),
    createForestFeatureKit(config.forest ?? {}),
    createWoodlandFeatureKit(config.woodland ?? {}),
    createMeadowFeatureKit(config.meadow ?? {}),
    createGrasslandFeatureKit(config.grassland ?? {}),
    createShrublandFeatureKit(config.shrubland ?? {}),
    createAlpineZoneFeatureKit(config.alpineZone ?? config["alpine-zone"] ?? {}),
    createRiparianZoneFeatureKit(config.riparianZone ?? config["riparian-zone"] ?? {}),
    createEcotoneFeatureKit(config.ecotone ?? {}),
    createHabitatPatchFeatureKit(config.habitatPatch ?? config["habitat-patch"] ?? {})
  ];
}

export function createEcologyFeatureDomain(config = {}) {
  return createWorldFeatureFamilyDomain(config, {
    family: "ecology",
    id: "n-world-ecology-feature-domain",
    domain: "core-world-ecology-features",
    domainPath: "n:world:features:ecology",
    apiName: "ecologyFeatures",
    purpose: "Ecology feature contracts for biomes, vegetation communities, transitions, and habitat suitability.",
    services: ["biome-region", "forest", "woodland", "meadow", "grassland", "shrubland", "alpine-zone", "riparian-zone", "ecotone", "habitat-patch"],
    createKits: createEcologyFeatureKits
  });
}

export default createEcologyFeatureDomain;
