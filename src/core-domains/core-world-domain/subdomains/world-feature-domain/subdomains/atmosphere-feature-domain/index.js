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
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 900)),
    edgeWidth: Math.max(1, finiteNumber(source.edgeWidth ?? source.transitionWidth, defaults.edgeWidth ?? 160)),
    intensity: Math.max(0, finiteNumber(source.intensity, defaults.intensity ?? 1)),
    altitude: structuredClone(source.altitude ?? defaults.altitude ?? { minimum: 0, maximum: 1000 }),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function centerDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    center: structuredClone(source.center ?? source.position ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 160)),
    intensity: Math.max(0, finiteNumber(source.intensity, defaults.intensity ?? 1)),
    altitude: structuredClone(source.altitude ?? defaults.altitude ?? { minimum: 0, maximum: 1000 }),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function atmosphereChannels(feature) {
  return {
    atmosphere: {
      kind: "world-feature-atmosphere",
      featureType: feature.type,
      definition: feature
    }
  };
}

function altitudeInfluence(feature, point = {}, context = {}) {
  const altitude = feature.definition.altitude ?? {};
  const minimum = finiteNumber(altitude.minimum ?? altitude.min ?? feature.definition.base, Number.NEGATIVE_INFINITY);
  const maximum = finiteNumber(altitude.maximum ?? altitude.max ?? feature.definition.top, Number.POSITIVE_INFINITY);
  const height = finiteNumber(context.altitude ?? point.y, minimum);
  return height >= minimum && height <= maximum ? 1 : 0;
}

function areaAtmosphereKit({ type, defaults, sampleKey = "intensity", fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "atmosphere",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition: (source) => areaDefinition(source, defaults),
    sample(feature, point, context) {
      const spatial = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
      return spatial * altitudeInfluence(feature, point, context) * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    channels: atmosphereChannels,
    fidelity: fidelity ?? { near: "volume-descriptor", middle: "field-descriptor", far: "weather-map", collision: "none" }
  });
}

export function createCloudLayerFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "cloud-layer",
    family: "atmosphere",
    defaults: { radius: 100000, edgeWidth: 1, base: 800, top: 1600, coverage: 0.55, density: 0.65, intensity: 1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition(source) {
      const base = finiteNumber(source.base ?? source.altitude?.minimum, 800);
      const top = Math.max(base + 1, finiteNumber(source.top ?? source.altitude?.maximum, 1600));
      return {
        ...areaDefinition(source, { radius: 100000, edgeWidth: 1, intensity: 1 }),
        base,
        top,
        altitude: { minimum: base, maximum: top },
        coverage: Math.max(0, Math.min(1, finiteNumber(source.coverage, 0.55))),
        density: Math.max(0, finiteNumber(source.density, 0.65))
      };
    },
    sample(feature, point, context) {
      const spatial = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius"] });
      return spatial * altitudeInfluence(feature, point, context) * finiteNumber(feature.definition.density, 0.65);
    },
    channels: atmosphereChannels,
    fidelity: { near: "volume-descriptor", middle: "volume-descriptor", far: "weather-map", collision: "none" }
  });
}

export function createCloudBankFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "cloud-bank", defaults: { radius: 1200, edgeWidth: 220, altitude: { minimum: 500, maximum: 1200 }, density: 0.7, intensity: 0.7 }, sampleKey: "density" })(config);
}

export function createFogBankFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "fog-bank", defaults: { radius: 800, edgeWidth: 180, altitude: { minimum: 0, maximum: 180 }, humidity: 0.9, attenuation: 0.75, intensity: 0.75 }, sampleKey: "attenuation", fidelity: { near: "volume-descriptor", middle: "field-descriptor", far: "none", collision: "none" } })(config);
}

export function createStormCellFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "storm-cell", defaults: { radius: 1400, edgeWidth: 240, altitude: { minimum: 200, maximum: 4000 }, intensity: 1, lifetime: 900 }, sampleKey: "intensity" })(config);
}

export function createWindCorridorFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "wind-corridor",
    family: "atmosphere",
    defaults: { width: 600, speed: 12, lift: 0, altitude: { minimum: 200, maximum: 2200 }, direction: { x: 1, y: 0, z: 0 }, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition(source) {
      const width = Math.max(1, finiteNumber(source.width, 600));
      return {
        ...source,
        path: normalizeFeaturePath(source.path, source.center),
        width,
        halfWidth: width * 0.5,
        speed: Math.max(0, finiteNumber(source.speed, 12)),
        lift: finiteNumber(source.lift, 0),
        direction: structuredClone(source.direction ?? { x: 1, y: 0, z: 0 }),
        altitude: structuredClone(source.altitude ?? { minimum: 200, maximum: 2200 }),
        sharpness: Math.max(0.05, finiteNumber(source.sharpness, 1.4))
      };
    },
    sample(feature, point, context) {
      const spatial = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
      return spatial * altitudeInfluence(feature, point, context) * finiteNumber(feature.definition.speed, 12);
    },
    channels: atmosphereChannels,
    fidelity: { near: "vector-field", middle: "vector-field", far: "route-map", collision: "none" }
  });
}

export function createThermalColumnFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "thermal-column",
    family: "atmosphere",
    defaults: { radius: 180, lift: 4, altitude: { minimum: 0, maximum: 1800 }, intensity: 1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition(source) {
      const definition = centerDefinition(source, { radius: 180, intensity: 1, altitude: { minimum: 0, maximum: 1800 } });
      definition.lift = Math.max(0, finiteNumber(source.lift, 4));
      return definition;
    },
    sample(feature, point, context) {
      return finiteNumber(feature.definition.lift, 4)
        * altitudeInfluence(feature, point, context)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: atmosphereChannels,
    fidelity: { near: "vector-field", middle: "vector-field", far: "map-marker", collision: "none" }
  });
}

export function createDowndraftZoneFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "downdraft-zone", defaults: { radius: 500, edgeWidth: 100, altitude: { minimum: 200, maximum: 2400 }, sinkRate: 5, intensity: 5 }, sampleKey: "sinkRate" })(config);
}

export function createTurbulenceZoneFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "turbulence-zone", defaults: { radius: 650, edgeWidth: 120, altitude: { minimum: 0, maximum: 3000 }, strength: 0.7, frequency: 1, intensity: 0.7 }, sampleKey: "strength" })(config);
}

export function createPrecipitationFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "precipitation", defaults: { radius: 1100, edgeWidth: 180, altitude: { minimum: 0, maximum: 3200 }, precipitationType: "rain", rate: 0.6, intensity: 0.6 }, sampleKey: "rate" })(config);
}

export function createVisibilityZoneFeatureKit(config = {}) {
  return areaAtmosphereKit({ type: "visibility-zone", defaults: { radius: 1200, edgeWidth: 220, altitude: { minimum: 0, maximum: 4000 }, range: 1800, attenuation: 0.5, intensity: 0.5 }, sampleKey: "attenuation" })(config);
}

export function createAtmosphereFeatureKits(config = {}) {
  return [
    createCloudLayerFeatureKit(config.cloudLayer ?? config["cloud-layer"] ?? {}),
    createCloudBankFeatureKit(config.cloudBank ?? config["cloud-bank"] ?? {}),
    createFogBankFeatureKit(config.fogBank ?? config["fog-bank"] ?? {}),
    createStormCellFeatureKit(config.stormCell ?? config["storm-cell"] ?? {}),
    createWindCorridorFeatureKit(config.windCorridor ?? config["wind-corridor"] ?? {}),
    createThermalColumnFeatureKit(config.thermalColumn ?? config["thermal-column"] ?? {}),
    createDowndraftZoneFeatureKit(config.downdraftZone ?? config["downdraft-zone"] ?? {}),
    createTurbulenceZoneFeatureKit(config.turbulenceZone ?? config["turbulence-zone"] ?? {}),
    createPrecipitationFeatureKit(config.precipitation ?? {}),
    createVisibilityZoneFeatureKit(config.visibilityZone ?? config["visibility-zone"] ?? {})
  ];
}

export function createAtmosphereFeatureDomain(config = {}) {
  return createWorldFeatureFamilyDomain(config, {
    family: "atmosphere",
    id: "n-world-atmosphere-feature-domain",
    domain: "core-world-atmosphere-features",
    domainPath: "n:world:features:atmosphere",
    apiName: "atmosphereFeatures",
    purpose: "Atmosphere feature contracts for cloud volumes, fog, storms, airflow, precipitation, and visibility.",
    services: ["cloud-layer", "cloud-bank", "fog-bank", "storm-cell", "wind-corridor", "thermal-column", "downdraft-zone", "turbulence-zone", "precipitation", "visibility-zone"],
    createKits: createAtmosphereFeatureKits
  });
}

export default createAtmosphereFeatureDomain;
