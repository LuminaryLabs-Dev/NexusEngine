import { createWorldFeatureFamilyDomain } from "../feature-family-domain-kit/index.js";
import {
  createSemanticWorldFeatureKit,
  finiteNumber,
  normalizeFeaturePath,
  sampleSemanticFeatureInfluence
} from "../../kits/semantic-feature-kit/index.js";

function pathDefinition(source = {}, defaults = {}) {
  const width = Math.max(1, finiteNumber(source.width, defaults.width ?? 40));
  return {
    ...source,
    path: normalizeFeaturePath(source.path ?? source.centerline ?? source.network, source.center ?? source.source),
    width,
    halfWidth: width * 0.5,
    depth: Math.max(0, finiteNumber(source.depth, defaults.depth ?? 0)),
    flow: Math.max(0, finiteNumber(source.flow ?? source.discharge, defaults.flow ?? 1)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.5))
  };
}

function centerDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    center: structuredClone(source.center ?? source.point ?? source.source ?? source.mouth ?? source.edge ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 80)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function areaDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    area: structuredClone(source.area ?? source.boundary ?? source.basin ?? source.footprint ?? []),
    center: structuredClone(source.center ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 500)),
    edgeWidth: Math.max(1, finiteNumber(source.edgeWidth ?? source.transitionWidth, defaults.edgeWidth ?? 80)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function hydrologyChannels(feature, options = {}) {
  const channels = {
    hydrology: {
      kind: "world-feature-hydrology",
      featureType: feature.type,
      definition: feature
    }
  };
  if (options.elevation) {
    channels.elevation = {
      kind: "world-feature-field",
      featureType: feature.type,
      definition: feature
    };
  }
  if (options.material !== false) {
    channels.material = {
      kind: options.materialKind ?? `${feature.type}-surface`,
      featureId: feature.id,
      wetness: finiteNumber(feature.definition.saturation ?? feature.definition.flow, 1)
    };
  }
  if (options.collision) {
    channels.collision = {
      kind: options.collisionKind ?? "water-volume",
      featureId: feature.id,
      featureType: feature.type
    };
  }
  return channels;
}

function pathHydrologyKit({ type, defaults, blendMode = "overlay", elevation = false, collision = false, sampleKey = "flow", fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "hydrology",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition: (source) => pathDefinition(source, defaults),
    sample(feature, point) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
      return influence * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    blendMode,
    channels: (feature) => hydrologyChannels(feature, { elevation, collision }),
    fidelity: fidelity ?? { near: "feature-mesh", middle: "descriptor", far: "map-field", collision: collision ? "detailed" : "none" }
  });
}

function areaHydrologyKit({ type, defaults, sampleKey, collision = false, fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "hydrology",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition: (source) => areaDefinition(source, defaults),
    sample(feature, point) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
      return influence * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    blendMode: "overlay",
    channels: (feature) => hydrologyChannels(feature, { collision }),
    fidelity: fidelity ?? { near: "feature-mesh", middle: "descriptor", far: "map-field", collision: collision ? "detailed" : "none" }
  });
}

export function createWatershedFeatureKit(config = {}) {
  return areaHydrologyKit({ type: "watershed", defaults: { radius: 1800, edgeWidth: 160, runoff: 1 }, sampleKey: "runoff", fidelity: { near: "field", middle: "field", far: "map-field", collision: "none" } })(config);
}

export function createSpringFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "spring",
    family: "hydrology",
    defaults: { radius: 45, discharge: 1, temperature: 0.5, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition: (source) => ({ ...centerDefinition(source, { radius: 45 }), discharge: Math.max(0, finiteNumber(source.discharge, 1)) }),
    sample(feature, point) {
      return finiteNumber(feature.definition.discharge, 1)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: (feature) => hydrologyChannels(feature, { collision: false }),
    fidelity: { near: "feature-mesh", middle: "marker", far: "map-marker", collision: "none" }
  });
}

export const createStreamFeatureKit = pathHydrologyKit({
  type: "stream",
  defaults: { width: 18, depth: 2, flow: 0.6, sharpness: 1.8 },
  blendMode: "subtract",
  elevation: true,
  collision: true,
  sampleKey: "depth"
});

export const createRiverFeatureKit = pathHydrologyKit({
  type: "river",
  defaults: { width: 90, depth: 8, flow: 1, sharpness: 1.6 },
  blendMode: "subtract",
  elevation: true,
  collision: true,
  sampleKey: "depth"
});

export function createWaterfallFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "waterfall",
    family: "hydrology",
    defaults: { radius: 80, drop: 40, flow: 1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition(source) {
      const definition = centerDefinition({ ...source, center: source.edge ?? source.center }, { radius: 80 });
      definition.drop = Math.max(0, finiteNumber(source.drop, 40));
      definition.flow = Math.max(0, finiteNumber(source.flow, 1));
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.flow, 1)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: (feature) => hydrologyChannels(feature, { collision: true }),
    fidelity: { near: "feature-mesh", middle: "impostor", far: "mist-marker", collision: "detailed" },
    metadata: (feature) => ({ drop: feature.definition.drop })
  });
}

export function createLakeFeatureKit(config = {}) {
  return areaHydrologyKit({
    type: "lake",
    defaults: { radius: 600, edgeWidth: 100, level: 0, depth: 30 },
    sampleKey: "depth",
    collision: true,
    fidelity: { near: "feature-mesh", middle: "surface", far: "map-field", collision: "water-volume" }
  })(config);
}

export function createWetlandFeatureKit(config = {}) {
  return areaHydrologyKit({ type: "wetland", defaults: { radius: 500, edgeWidth: 120, saturation: 0.9 }, sampleKey: "saturation" })(config);
}

export function createFloodplainFeatureKit(config = {}) {
  return areaHydrologyKit({ type: "floodplain", defaults: { radius: 900, edgeWidth: 180, frequency: 0.5 }, sampleKey: "frequency" })(config);
}

export function createDeltaFeatureKit(config = {}) {
  return areaHydrologyKit({ type: "delta", defaults: { radius: 700, edgeWidth: 130, deposition: 0.7 }, sampleKey: "deposition" })(config);
}

export function createGlacierFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "glacier",
    family: "hydrology",
    defaults: { radius: 900, edgeWidth: 180, thickness: 80, meltRate: 0.1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition: (source) => ({ ...areaDefinition(source, { radius: 900, edgeWidth: 180 }), thickness: Math.max(0, finiteNumber(source.thickness, 80)), meltRate: Math.max(0, finiteNumber(source.meltRate, 0.1)) }),
    sample(feature, point) {
      return finiteNumber(feature.definition.thickness, 80)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
    },
    blendMode: "add",
    channels(feature) {
      return {
        ...hydrologyChannels(feature, { elevation: true, collision: true, collisionKind: "ice-volume" }),
        material: { kind: "glacier-surface", featureId: feature.id, meltRate: feature.definition.meltRate }
      };
    },
    fidelity: { near: "feature-mesh", middle: "foundation-field", far: "silhouette", collision: "detailed" }
  });
}

export function createHydrologyFeatureKits(config = {}) {
  return [
    createWatershedFeatureKit(config.watershed ?? {}),
    createSpringFeatureKit(config.spring ?? {}),
    createStreamFeatureKit(config.stream ?? {}),
    createRiverFeatureKit(config.river ?? {}),
    createWaterfallFeatureKit(config.waterfall ?? {}),
    createLakeFeatureKit(config.lake ?? {}),
    createWetlandFeatureKit(config.wetland ?? {}),
    createFloodplainFeatureKit(config.floodplain ?? {}),
    createDeltaFeatureKit(config.delta ?? {}),
    createGlacierFeatureKit(config.glacier ?? {})
  ];
}

export function createHydrologyFeatureDomain(config = {}) {
  return createWorldFeatureFamilyDomain(config, {
    family: "hydrology",
    id: "n-world-hydrology-feature-domain",
    domain: "core-world-hydrology-features",
    domainPath: "n:world:features:hydrology",
    apiName: "hydrologyFeatures",
    purpose: "Hydrology feature contracts for drainage, flowing water, standing water, saturation, sediment, and ice.",
    services: ["watershed", "spring", "stream", "river", "waterfall", "lake", "wetland", "floodplain", "delta", "glacier"],
    createKits: createHydrologyFeatureKits
  });
}

export default createHydrologyFeatureDomain;
