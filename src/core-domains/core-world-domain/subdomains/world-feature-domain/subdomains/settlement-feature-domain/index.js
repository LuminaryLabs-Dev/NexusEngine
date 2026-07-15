import { createWorldFeatureFamilyDomain } from "../feature-family-domain-kit/index.js";
import {
  createSemanticWorldFeatureKit,
  finiteNumber,
  normalizeFeaturePath,
  sampleSemanticFeatureInfluence
} from "../../kits/semantic-feature-kit/index.js";

function centerDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    center: structuredClone(source.center ?? source.position ?? source.crossing ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 300)),
    density: Math.max(0, finiteNumber(source.density, defaults.density ?? 1)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function areaDefinition(source = {}, defaults = {}) {
  return {
    ...source,
    area: structuredClone(source.area ?? source.boundary ?? source.footprint ?? source.parcel ?? []),
    center: structuredClone(source.center ?? { x: 0, z: 0 }),
    radius: Math.max(1, finiteNumber(source.radius ?? source.extent, defaults.radius ?? 400)),
    edgeWidth: Math.max(1, finiteNumber(source.edgeWidth ?? source.transitionWidth, defaults.edgeWidth ?? 60)),
    density: Math.max(0, finiteNumber(source.density, defaults.density ?? 1)),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.2))
  };
}

function pathDefinition(source = {}, defaults = {}) {
  const width = Math.max(1, finiteNumber(source.width, defaults.width ?? 12));
  return {
    ...source,
    path: normalizeFeaturePath(source.path ?? source.centerline, source.center),
    width,
    halfWidth: width * 0.5,
    grade: finiteNumber(source.grade, defaults.grade ?? 0),
    sharpness: Math.max(0.05, finiteNumber(source.sharpness, defaults.sharpness ?? 1.5))
  };
}

function settlementChannels(feature, options = {}) {
  const channels = {
    settlement: {
      kind: "world-feature-settlement",
      featureType: feature.type,
      definition: feature
    }
  };
  if (options.materialKind) {
    channels.material = {
      kind: options.materialKind,
      featureId: feature.id,
      class: feature.definition.class ?? feature.definition.type ?? feature.type
    };
  }
  if (options.collisionKind) {
    channels.collision = {
      kind: options.collisionKind,
      featureId: feature.id,
      featureType: feature.type,
      clearance: feature.definition.clearance ?? null
    };
  }
  return channels;
}

function areaSettlementKit({ type, defaults, sampleKey = "density", materialKind = null, collisionKind = null, fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "settlement",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition: (source) => areaDefinition(source, defaults),
    sample(feature, point) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
      return influence * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    channels: (feature) => settlementChannels(feature, { materialKind, collisionKind }),
    fidelity: fidelity ?? { near: "feature-mesh", middle: "cluster-descriptor", far: "landmark-impostor", collision: collisionKind ? "detailed" : "none" }
  });
}

function pathSettlementKit({ type, defaults, materialKind, collisionKind = null, sampleKey = "width", fidelity }) {
  return (config = {}) => createSemanticWorldFeatureKit({
    type,
    family: "settlement",
    defaults: { ...defaults, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition: (source) => pathDefinition(source, defaults),
    sample(feature, point) {
      const influence = sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
      return influence * finiteNumber(feature.definition[sampleKey], defaults[sampleKey] ?? 1);
    },
    channels: (feature) => settlementChannels(feature, { materialKind, collisionKind }),
    fidelity: fidelity ?? { near: "feature-mesh", middle: "ribbon-descriptor", far: "map-line", collision: collisionKind ? "detailed" : "none" }
  });
}

export function createSettlementFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "settlement",
    family: "settlement",
    defaults: { radius: 520, density: 0.75, settlementType: "village", extent: 520, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "extent"],
    normalizeDefinition(source) {
      const definition = centerDefinition(source, { radius: 520, density: 0.75 });
      definition.settlementType = String(source.settlementType ?? source.type ?? "village");
      definition.populationClass = String(source.populationClass ?? definition.settlementType);
      return definition;
    },
    sample(feature, point) {
      return finiteNumber(feature.definition.density, 0.75)
        * sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: (feature) => settlementChannels(feature, { materialKind: "settlement-ground", collisionKind: "settlement-footprint" }),
    fidelity: { near: "feature-mesh", middle: "cluster-descriptor", far: "skyline-impostor", collision: "detailed" }
  });
}

export function createDistrictFeatureKit(config = {}) {
  return areaSettlementKit({ type: "district", defaults: { radius: 280, edgeWidth: 30, density: 0.8, purpose: "residential" }, materialKind: "district-ground", collisionKind: "district-footprint" })(config);
}

export const createRoadFeatureKit = pathSettlementKit({
  type: "road",
  defaults: { width: 14, grade: 0, class: "local" },
  materialKind: "road-surface",
  collisionKind: "road-surface",
  fidelity: { near: "feature-mesh", middle: "ribbon-descriptor", far: "map-line", collision: "foundation" }
});

export const createTrailFeatureKit = pathSettlementKit({
  type: "trail",
  defaults: { width: 3, grade: 0, class: "footpath" },
  materialKind: "trail-surface",
  collisionKind: "trail-surface",
  fidelity: { near: "feature-mesh", middle: "ribbon-descriptor", far: "map-line", collision: "foundation" }
});

export function createBridgeFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "bridge",
    family: "settlement",
    defaults: { radius: 80, span: 60, width: 10, bridgeType: "beam", clearance: 12, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["span", "radius"],
    normalizeDefinition(source) {
      const definition = centerDefinition({ ...source, center: source.crossing ?? source.center }, { radius: finiteNumber(source.span, 60) * 0.5 });
      definition.span = Math.max(1, finiteNumber(source.span, 60));
      definition.width = Math.max(1, finiteNumber(source.width, 10));
      definition.bridgeType = String(source.bridgeType ?? source.type ?? "beam");
      definition.clearance = Math.max(0, finiteNumber(source.clearance, 12));
      return definition;
    },
    sample(feature, point) {
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: (feature) => settlementChannels(feature, { materialKind: "bridge-deck", collisionKind: "structure-mesh" }),
    fidelity: { near: "feature-mesh", middle: "structure-impostor", far: "map-marker", collision: "detailed" }
  });
}

export function createTunnelFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "tunnel",
    family: "settlement",
    defaults: { width: 16, clearance: 12, tunnelType: "road", ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "path",
    extentKeys: ["halfWidth"],
    normalizeDefinition(source) {
      const definition = pathDefinition({ ...source, path: source.path ?? source.portals }, { width: 16 });
      definition.portals = structuredClone(source.portals ?? [definition.path[0], definition.path.at(-1)]);
      definition.clearance = Math.max(1, finiteNumber(source.clearance, 12));
      definition.tunnelType = String(source.tunnelType ?? source.type ?? "road");
      return definition;
    },
    sample(feature, point) {
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "path", extentKeys: ["halfWidth"] });
    },
    channels: (feature) => settlementChannels(feature, { materialKind: "tunnel-portal", collisionKind: "void-volume" }),
    fidelity: { near: "feature-mesh", middle: "portal-impostor", far: "map-marker", collision: "detailed" },
    metadata: { heightfieldRepresentable: false }
  });
}

export function createFarmParcelFeatureKit(config = {}) {
  return areaSettlementKit({ type: "farm-parcel", defaults: { radius: 320, edgeWidth: 18, density: 1, crop: "mixed", pattern: "rows" }, materialKind: "cultivated-ground" })(config);
}

export function createLandingFieldFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "landing-field",
    family: "settlement",
    defaults: { radius: 130, edgeWidth: 18, clearance: 35, slopeLimit: 0.12, density: 1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius", "edgeWidth"],
    normalizeDefinition(source) {
      const definition = areaDefinition(source, { radius: 130, edgeWidth: 18, density: 1 });
      definition.clearance = Math.max(0, finiteNumber(source.clearance, 35));
      definition.slopeLimit = Math.max(0, finiteNumber(source.slopeLimit, 0.12));
      return definition;
    },
    sample(feature, point) {
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "auto", extentKeys: ["radius", "edgeWidth"] });
    },
    channels: (feature) => settlementChannels(feature, { materialKind: "landing-field-ground", collisionKind: "landing-surface" }),
    fidelity: { near: "feature-mesh", middle: "surface-descriptor", far: "map-marker", collision: "foundation" }
  });
}

export function createLandmarkFeatureKit(config = {}) {
  return createSemanticWorldFeatureKit({
    type: "landmark",
    family: "settlement",
    defaults: { radius: 40, visibility: 3000, landmarkType: "tower", density: 1, ...(config.defaults?.definition ?? config.defaults ?? {}) },
    geometry: "auto",
    extentKeys: ["radius"],
    normalizeDefinition(source) {
      const definition = centerDefinition(source, { radius: 40, density: 1 });
      definition.visibility = Math.max(0, finiteNumber(source.visibility, 3000));
      definition.landmarkType = String(source.landmarkType ?? source.type ?? "tower");
      return definition;
    },
    sample(feature, point) {
      return sampleSemanticFeatureInfluence(feature.definition, point, { geometry: "center", extentKeys: ["radius"] });
    },
    channels: (feature) => settlementChannels(feature, { collisionKind: "structure-mesh" }),
    fidelity: { near: "feature-mesh", middle: "structure-impostor", far: "landmark-impostor", collision: "detailed" }
  });
}

export function createHarborFeatureKit(config = {}) {
  return areaSettlementKit({ type: "harbor", defaults: { radius: 260, edgeWidth: 40, density: 0.8, capacity: 20, harborType: "river" }, materialKind: "harbor-ground", collisionKind: "harbor-structure" })(config);
}

export function createSettlementFeatureKits(config = {}) {
  return [
    createSettlementFeatureKit(config.settlement ?? {}),
    createDistrictFeatureKit(config.district ?? {}),
    createRoadFeatureKit(config.road ?? {}),
    createTrailFeatureKit(config.trail ?? {}),
    createBridgeFeatureKit(config.bridge ?? {}),
    createTunnelFeatureKit(config.tunnel ?? {}),
    createFarmParcelFeatureKit(config.farmParcel ?? config["farm-parcel"] ?? {}),
    createLandingFieldFeatureKit(config.landingField ?? config["landing-field"] ?? {}),
    createLandmarkFeatureKit(config.landmark ?? {}),
    createHarborFeatureKit(config.harbor ?? {})
  ];
}

export function createSettlementFeatureDomain(config = {}) {
  return createWorldFeatureFamilyDomain(config, {
    family: "settlement",
    id: "n-world-settlement-feature-domain",
    domain: "core-world-settlement-features",
    domainPath: "n:world:features:settlement",
    apiName: "settlementFeatures",
    purpose: "Settlement feature contracts for habitation, networks, agriculture, navigation landmarks, and landing areas.",
    services: ["settlement", "district", "road", "trail", "bridge", "tunnel", "farm-parcel", "landing-field", "landmark", "harbor"],
    createKits: createSettlementFeatureKits
  });
}

export default createSettlementFeatureDomain;
