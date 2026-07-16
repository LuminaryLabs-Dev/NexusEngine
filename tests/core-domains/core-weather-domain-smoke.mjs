import assert from "node:assert/strict";
import {
  createCoreWeatherDomain,
  createEngine,
  createLayeredWeatherDomain,
  createWeatherDomain,
  createWeatherLayerDescriptor
} from "../../src/index.js";

assert.equal(createCoreWeatherDomain().length, 2);
const engine = createEngine({ kits: [
  createWeatherDomain({
    conditions: { humidity: 0.6, cloudiness: 0.45, wind: { x: 2, z: 1 } },
    tendencies: { cloudinessPerSecond: 0.001 }
  }),
  createLayeredWeatherDomain()
] });

assert.ok(engine.n.weather);
assert.ok(engine.n.layeredWeather);
assert.equal(engine.weather, engine.n.weather);
assert.equal(engine.layeredWeather, engine.n.layeredWeather);

engine.n.weather.registerRegion({
  id: "wet-valley",
  bounds: { minX: -100, minZ: -100, maxX: 100, maxZ: 100 },
  conditions: { humidity: 0.95, visibility: 1200 },
  blend: 1
});
assert.equal(engine.n.weather.sample({ x: 0, z: 0 }).humidity, 0.95);
assert.equal(engine.n.weather.sample({ x: 500, z: 500 }).humidity, 0.6);
const weatherSnapshot = engine.n.weather.advance(10);
assert.ok(weatherSnapshot.conditions.cloudiness > 0.45);

const layers = [
  { id: "ground-fog", kind: "ground-fog", base: 0, top: 140, coverage: 0.08, density: 0.12, minimumCoverage: 0.03, minimumDensity: 0.04 },
  { id: "low", kind: "low-cloud", base: 180, top: 500, coverage: 0.15, density: 0.22, minimumCoverage: 0.03, minimumDensity: 0.03 },
  { id: "mid", kind: "mid-cloud", base: 650, top: 1300, coverage: 0.18, density: 0.28, minimumCoverage: 0.025, minimumDensity: 0.025 },
  { id: "high", kind: "high-cloud", base: 1700, top: 2500, coverage: 0.12, density: 0.16, minimumCoverage: 0.02, minimumDensity: 0.015 },
  { id: "cirrus", kind: "cirrus", base: 2800, top: 3800, coverage: 0.1, density: 0.08, minimumCoverage: 0.015, minimumDensity: 0.01 }
];
engine.n.layeredWeather.replaceLayers(layers);
const layeredSnapshot = engine.n.layeredWeather.advance(0, weatherSnapshot);
assert.equal(layeredSnapshot.layers.length, 5);
for (const layer of layeredSnapshot.layers) {
  assert.ok(layer.coverage >= layer.minimumCoverage);
  assert.ok(layer.density >= layer.minimumDensity);
}
assert.equal(engine.n.layeredWeather.sampleAltitude(80)[0].id, "ground-fog");
assert.equal(engine.n.layeredWeather.sampleAltitude(3200)[0].id, "cirrus");
assert.equal(engine.n.layeredWeather.composeAtAltitude(3200).dominantLayerId, "cirrus");
assert.equal(createWeatherLayerDescriptor(layers[0]).kind, "ground-fog");

const snapshot = engine.n.layeredWeather.getSnapshot();
engine.n.layeredWeather.reset();
assert.equal(engine.n.layeredWeather.listLayers().length, 0);
engine.n.layeredWeather.loadSnapshot(snapshot);
assert.equal(engine.n.layeredWeather.listLayers().length, 5);

console.log("core weather and layered weather smoke passed");
