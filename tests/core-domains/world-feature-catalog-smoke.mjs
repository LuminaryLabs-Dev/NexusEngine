import assert from "node:assert/strict";
import * as RootAPI from "../../src/index.js";
import {
  WORLD_FEATURE_KIT_METHODS,
  createCoreWorldDomain,
  createEngine
} from "../../src/index.js";

const expectedFactoryExports = Object.values({
  landform: ["createMountainFeatureKit", "createRidgeFeatureKit", "createHillFeatureKit", "createPlateauFeatureKit", "createCliffFeatureKit", "createEscarpmentFeatureKit", "createCanyonFeatureKit", "createValleyFeatureKit", "createPassFeatureKit", "createCaveOverhangFeatureKit"],
  hydrology: ["createWatershedFeatureKit", "createSpringFeatureKit", "createStreamFeatureKit", "createRiverFeatureKit", "createWaterfallFeatureKit", "createLakeFeatureKit", "createWetlandFeatureKit", "createFloodplainFeatureKit", "createDeltaFeatureKit", "createGlacierFeatureKit"],
  ecology: ["createBiomeRegionFeatureKit", "createForestFeatureKit", "createWoodlandFeatureKit", "createMeadowFeatureKit", "createGrasslandFeatureKit", "createShrublandFeatureKit", "createAlpineZoneFeatureKit", "createRiparianZoneFeatureKit", "createEcotoneFeatureKit", "createHabitatPatchFeatureKit"],
  settlement: ["createSettlementFeatureKit", "createDistrictFeatureKit", "createRoadFeatureKit", "createTrailFeatureKit", "createBridgeFeatureKit", "createTunnelFeatureKit", "createFarmParcelFeatureKit", "createLandingFieldFeatureKit", "createLandmarkFeatureKit", "createHarborFeatureKit"],
  atmosphere: ["createCloudLayerFeatureKit", "createCloudBankFeatureKit", "createFogBankFeatureKit", "createStormCellFeatureKit", "createWindCorridorFeatureKit", "createThermalColumnFeatureKit", "createDowndraftZoneFeatureKit", "createTurbulenceZoneFeatureKit", "createPrecipitationFeatureKit", "createVisibilityZoneFeatureKit"]
}).flat();
for (const name of expectedFactoryExports) assert.equal(typeof RootAPI[name], "function", `${name} should be exported`);
for (const name of ["createLandformFeatureDomain", "createHydrologyFeatureDomain", "createEcologyFeatureDomain", "createSettlementFeatureDomain", "createAtmosphereFeatureDomain", "createSemanticWorldFeatureKit"]) {
  assert.equal(typeof RootAPI[name], "function", `${name} should be exported`);
}

const expectedFamilies = Object.freeze({
  landform: ["mountain", "ridge", "hill", "plateau", "cliff", "escarpment", "canyon", "valley", "pass", "cave-overhang"],
  hydrology: ["watershed", "spring", "stream", "river", "waterfall", "lake", "wetland", "floodplain", "delta", "glacier"],
  ecology: ["biome-region", "forest", "woodland", "meadow", "grassland", "shrubland", "alpine-zone", "riparian-zone", "ecotone", "habitat-patch"],
  settlement: ["settlement", "district", "road", "trail", "bridge", "tunnel", "farm-parcel", "landing-field", "landmark", "harbor"],
  atmosphere: ["cloud-layer", "cloud-bank", "fog-bank", "storm-cell", "wind-corridor", "thermal-column", "downdraft-zone", "turbulence-zone", "precipitation", "visibility-zone"]
});

const engine = createEngine({ kits: [createCoreWorldDomain()] });
const features = engine.n.worldFeatures;
const familyApis = {
  landform: engine.n.landformFeatures,
  hydrology: engine.n.hydrologyFeatures,
  ecology: engine.n.ecologyFeatures,
  settlement: engine.n.settlementFeatures,
  atmosphere: engine.n.atmosphereFeatures
};

assert.equal(features.listFeatureTypes().length, 50);
for (const [family, expectedTypes] of Object.entries(expectedFamilies)) {
  const api = familyApis[family];
  assert.ok(api, `${family} domain should be installed`);
  assert.deepEqual(api.types, [...expectedTypes].sort());
  assert.equal(api.listKits().length, 10);
  for (const kit of api.listKits()) {
    assert.equal(kit.family, family);
    for (const method of WORLD_FEATURE_KIT_METHODS) assert.equal(typeof kit[method], "function", `${kit.type}.${method}`);
  }
}

features.registerFeature({
  id: "catalog-mountain",
  type: "mountain",
  definition: { center: { x: 0, z: 0 }, width: 1000, height: 500, variation: 0 }
});
features.registerFeature({
  id: "catalog-river",
  type: "river",
  definition: { path: [{ x: -500, z: 0 }, { x: 500, z: 0 }], width: 80, depth: 10 }
});
features.registerFeature({
  id: "catalog-forest",
  type: "forest",
  definition: { center: { x: 0, z: 0 }, radius: 600, density: 0.8 }
});
features.registerFeature({
  id: "catalog-town",
  type: "settlement",
  definition: { center: { x: 0, z: 0 }, radius: 300, settlementType: "town" }
});
features.registerFeature({
  id: "catalog-clouds",
  type: "cloud-layer",
  definition: { center: { x: 0, z: 0 }, radius: 2000, base: 700, top: 1400, density: 0.6 }
});

const cell = { id: "catalog-cell", bounds: { minX: -1000, minZ: -1000, maxX: 1000, maxZ: 1000 } };
const first = features.compileCell(cell, { baseFoundation: { elevation: 0 } });
assert.equal(first.cacheHit, false);
assert.equal(first.features.length, 5);
assert.equal(first.contributions.length, 5);
assert.ok(engine.n.worldFoundation.sampleElevation(cell.id, { x: 0, z: 0 }, features.getSamplers()) > 480);
const firstRevision = first.resolved.revision;

const second = features.compileCell(cell, { baseFoundation: { elevation: 0 } });
assert.equal(second.cacheHit, true);
assert.equal(second.resolved.revision, firstRevision);

features.registerFeature({
  id: "outside-meadow",
  type: "meadow",
  definition: { center: { x: 5000, z: 5000 }, radius: 200, density: 1 }
});
assert.equal(features.compileCell(cell, { baseFoundation: { elevation: 0 } }).cacheHit, true, "unrelated features must not invalidate the cell");

features.registerFeature({
  id: "inside-hill",
  type: "hill",
  definition: { center: { x: 100, z: 100 }, radius: 200, height: 50 }
});
assert.equal(features.compileCell(cell, { baseFoundation: { elevation: 0 } }).cacheHit, false, "intersecting features must invalidate the cell");
assert.equal(features.getCompilationCacheState().size, 1);
assert.equal(features.releaseCompiledCell(cell.id), true);
assert.equal(features.getCompilationCacheState().size, 0);

console.log("world feature catalog smoke passed");
