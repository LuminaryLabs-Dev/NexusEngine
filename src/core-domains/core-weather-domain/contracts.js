const PRECIPITATION_TYPES = new Set(["none", "rain", "snow", "sleet", "hail"]);

export const WEATHER_LAYER_KINDS = Object.freeze([
  "ground-fog",
  "low-cloud",
  "mid-cloud",
  "high-cloud",
  "cirrus",
  "cloud",
  "fog"
]);

export function finiteWeatherNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampWeather01(value) {
  return Math.max(0, Math.min(1, finiteWeatherNumber(value)));
}

function clone(value, fallback) {
  return structuredClone(value ?? fallback);
}

export function createWeatherVector(input = {}, fallback = {}) {
  const source = Array.isArray(input)
    ? { x: input[0], y: input[1], z: input[2] }
    : input;
  return Object.freeze({
    x: finiteWeatherNumber(source?.x, finiteWeatherNumber(fallback.x)),
    y: finiteWeatherNumber(source?.y, finiteWeatherNumber(fallback.y)),
    z: finiteWeatherNumber(source?.z, finiteWeatherNumber(fallback.z))
  });
}

export function createWeatherConditions(input = {}) {
  const precipitationInput = typeof input.precipitation === "string"
    ? { type: input.precipitation }
    : input.precipitation ?? {};
  const precipitationType = String(precipitationInput.type ?? "none");
  if (!PRECIPITATION_TYPES.has(precipitationType)) {
    throw new TypeError(`Unsupported precipitation type: ${precipitationType}.`);
  }
  return Object.freeze({
    temperature: finiteWeatherNumber(input.temperature, 18),
    humidity: clampWeather01(input.humidity ?? 0.55),
    pressure: Math.max(0, finiteWeatherNumber(input.pressure, 101325)),
    cloudiness: clampWeather01(input.cloudiness ?? 0.5),
    visibility: Math.max(0, finiteWeatherNumber(input.visibility, 10000)),
    wind: createWeatherVector(input.wind, { x: 0, y: 0, z: 0 }),
    precipitation: Object.freeze({
      type: precipitationType,
      rate: Math.max(0, finiteWeatherNumber(precipitationInput.rate, 0))
    })
  });
}

export function createWeatherTendencies(input = {}) {
  return Object.freeze({
    temperaturePerSecond: finiteWeatherNumber(input.temperaturePerSecond),
    humidityPerSecond: finiteWeatherNumber(input.humidityPerSecond),
    pressurePerSecond: finiteWeatherNumber(input.pressurePerSecond),
    cloudinessPerSecond: finiteWeatherNumber(input.cloudinessPerSecond),
    visibilityPerSecond: finiteWeatherNumber(input.visibilityPerSecond),
    precipitationPerSecond: finiteWeatherNumber(input.precipitationPerSecond),
    windPerSecond: createWeatherVector(input.windPerSecond)
  });
}

export function normalizeWeatherBounds(input = {}) {
  if ([input.minX, input.minZ, input.maxX, input.maxZ].every((value) => Number.isFinite(Number(value)))) {
    return Object.freeze({
      minX: Number(input.minX),
      minZ: Number(input.minZ),
      maxX: Number(input.maxX),
      maxZ: Number(input.maxZ)
    });
  }
  const center = input.center ?? input.position ?? {};
  const radius = Math.max(0, finiteWeatherNumber(input.radius ?? input.extent, 0));
  const x = finiteWeatherNumber(center.x);
  const z = finiteWeatherNumber(center.z);
  return Object.freeze({ minX: x - radius, minZ: z - radius, maxX: x + radius, maxZ: z + radius });
}

export function createWeatherRegionDescriptor(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new TypeError("Weather region requires a stable id.");
  return Object.freeze({
    id,
    bounds: normalizeWeatherBounds(input.bounds ?? input),
    priority: finiteWeatherNumber(input.priority),
    blend: clampWeather01(input.blend ?? 1),
    conditions: Object.freeze(clone(input.conditions, {})),
    metadata: Object.freeze(clone(input.metadata, {}))
  });
}

function pointInBounds(point = {}, bounds = {}) {
  const x = finiteWeatherNumber(point.x);
  const z = finiteWeatherNumber(point.z);
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}

function lerp(left, right, amount) {
  return left + (right - left) * amount;
}

export function blendWeatherConditions(baseInput = {}, overrideInput = {}, amount = 1) {
  const base = createWeatherConditions(baseInput);
  const override = overrideInput ?? {};
  const t = clampWeather01(amount);
  const windOverride = override.wind ?? base.wind;
  const precipitationOverride = override.precipitation ?? base.precipitation;
  const next = {
    temperature: lerp(base.temperature, finiteWeatherNumber(override.temperature, base.temperature), t),
    humidity: lerp(base.humidity, clampWeather01(override.humidity ?? base.humidity), t),
    pressure: lerp(base.pressure, Math.max(0, finiteWeatherNumber(override.pressure, base.pressure)), t),
    cloudiness: lerp(base.cloudiness, clampWeather01(override.cloudiness ?? base.cloudiness), t),
    visibility: lerp(base.visibility, Math.max(0, finiteWeatherNumber(override.visibility, base.visibility)), t),
    wind: {
      x: lerp(base.wind.x, finiteWeatherNumber(windOverride.x, base.wind.x), t),
      y: lerp(base.wind.y, finiteWeatherNumber(windOverride.y, base.wind.y), t),
      z: lerp(base.wind.z, finiteWeatherNumber(windOverride.z, base.wind.z), t)
    },
    precipitation: {
      type: t >= 0.5 ? String(precipitationOverride.type ?? base.precipitation.type) : base.precipitation.type,
      rate: lerp(base.precipitation.rate, Math.max(0, finiteWeatherNumber(precipitationOverride.rate, base.precipitation.rate)), t)
    }
  };
  return createWeatherConditions(next);
}

export function sampleWeatherRegions(globalConditions = {}, regions = [], point = {}) {
  return [...regions]
    .map(createWeatherRegionDescriptor)
    .filter((region) => pointInBounds(point, region.bounds))
    .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id))
    .reduce((conditions, region) => blendWeatherConditions(conditions, region.conditions, region.blend), createWeatherConditions(globalConditions));
}

export function createWeatherLayerDescriptor(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new TypeError("Weather layer requires a stable id.");
  const kind = String(input.kind ?? input.type ?? "cloud");
  if (!WEATHER_LAYER_KINDS.includes(kind)) throw new TypeError(`Unsupported weather layer kind: ${kind}.`);
  const base = finiteWeatherNumber(input.base ?? input.altitude?.minimum ?? input.altitude?.min, 0);
  const top = Math.max(base + 1, finiteWeatherNumber(input.top ?? input.altitude?.maximum ?? input.altitude?.max, base + 1));
  const coverage = clampWeather01(input.coverage ?? 0.5);
  const density = Math.max(0, finiteWeatherNumber(input.density, 0.5));
  return Object.freeze({
    id,
    kind,
    base,
    top,
    priority: finiteWeatherNumber(input.priority),
    enabled: input.enabled !== false,
    coverage,
    density,
    minimumCoverage: clampWeather01(input.minimumCoverage ?? input.minCoverage ?? 0),
    minimumDensity: Math.max(0, finiteWeatherNumber(input.minimumDensity ?? input.minDensity, 0)),
    opacity: clampWeather01(input.opacity ?? 1),
    weatherCoupling: clampWeather01(input.weatherCoupling ?? 0.2),
    windCoupling: clampWeather01(input.windCoupling ?? 0.15),
    wind: createWeatherVector(input.wind),
    offset: Object.freeze({
      x: finiteWeatherNumber(input.offset?.x ?? input.offset?.[0]),
      z: finiteWeatherNumber(input.offset?.z ?? input.offset?.y ?? input.offset?.[1])
    }),
    evolution: Object.freeze({
      frequency: Math.max(0, finiteWeatherNumber(input.evolution?.frequency, 0)),
      phase: finiteWeatherNumber(input.evolution?.phase),
      coverageAmplitude: Math.max(0, finiteWeatherNumber(input.evolution?.coverageAmplitude, 0)),
      densityAmplitude: Math.max(0, finiteWeatherNumber(input.evolution?.densityAmplitude, 0))
    }),
    profile: Object.freeze(clone(input.profile, {})),
    metadata: Object.freeze(clone(input.metadata, {}))
  });
}

export function sampleWeatherLayerAtAltitude(layerInput = {}, altitude = 0) {
  const layer = createWeatherLayerDescriptor(layerInput);
  if (!layer.enabled) return 0;
  const y = finiteWeatherNumber(altitude);
  if (y < layer.base || y > layer.top) return 0;
  const normalized = (y - layer.base) / Math.max(1, layer.top - layer.base);
  const edge = Math.min(0.45, Math.max(0.08, finiteWeatherNumber(layer.profile.edge, 0.18)));
  const lower = clampWeather01(normalized / edge);
  const upper = clampWeather01((1 - normalized) / edge);
  const smooth = (value) => value * value * (3 - 2 * value);
  return smooth(lower) * smooth(upper);
}

export function evolveWeatherLayer(layerInput = {}, elapsed = 0, conditionsInput = {}) {
  const layer = createWeatherLayerDescriptor(layerInput);
  const conditions = createWeatherConditions(conditionsInput);
  const time = Math.max(0, finiteWeatherNumber(elapsed));
  const wave = layer.evolution.frequency > 0
    ? Math.sin(time * layer.evolution.frequency + layer.evolution.phase)
    : 0;
  const coupledCloudiness = (conditions.cloudiness - 0.5) * 2 * layer.weatherCoupling;
  const coverage = Math.max(
    layer.minimumCoverage,
    clampWeather01(layer.coverage + wave * layer.evolution.coverageAmplitude + coupledCloudiness)
  );
  const density = Math.max(
    layer.minimumDensity,
    layer.density + wave * layer.evolution.densityAmplitude + coupledCloudiness * 0.25
  );
  return Object.freeze({
    ...layer,
    coverage,
    density,
    offset: Object.freeze({
      x: layer.offset.x + (layer.wind.x + conditions.wind.x * layer.windCoupling) * time,
      z: layer.offset.z + (layer.wind.z + conditions.wind.z * layer.windCoupling) * time
    })
  });
}

export function composeWeatherLayers(layerInputs = [], altitude = 0) {
  const layers = layerInputs
    .map((layer) => ({ layer: createWeatherLayerDescriptor(layer), influence: sampleWeatherLayerAtAltitude(layer, altitude) }))
    .filter((entry) => entry.layer.enabled && entry.influence > 0)
    .sort((left, right) => left.layer.priority - right.layer.priority || left.layer.id.localeCompare(right.layer.id));
  const totalWeight = layers.reduce((sum, entry) => sum + entry.influence, 0);
  const weighted = (selector) => totalWeight <= 0
    ? 0
    : layers.reduce((sum, entry) => sum + selector(entry.layer) * entry.influence, 0) / totalWeight;
  return Object.freeze({
    altitude: finiteWeatherNumber(altitude),
    layerIds: Object.freeze(layers.map((entry) => entry.layer.id)),
    coverage: weighted((layer) => layer.coverage),
    density: weighted((layer) => layer.density),
    opacity: weighted((layer) => layer.opacity),
    dominantLayerId: layers.at(-1)?.layer.id ?? null
  });
}
