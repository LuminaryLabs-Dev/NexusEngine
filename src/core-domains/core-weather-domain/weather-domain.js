import { createCoreCapabilityKit } from "../../core-kits/core-capability-kit.js";
import {
  blendWeatherConditions,
  createWeatherConditions,
  createWeatherRegionDescriptor,
  createWeatherTendencies,
  finiteWeatherNumber,
  sampleWeatherRegions
} from "./contracts.js";

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function createInitialWeatherState(config = {}) {
  return {
    elapsed: Math.max(0, finiteWeatherNumber(config.elapsed)),
    revision: 0,
    conditions: createWeatherConditions(config.conditions ?? config.initialConditions),
    tendencies: createWeatherTendencies(config.tendencies),
    regions: Object.fromEntries((config.regions ?? []).map((region) => {
      const descriptor = createWeatherRegionDescriptor(region);
      return [descriptor.id, descriptor];
    })),
    lastSample: null
  };
}

function advanceConditions(conditionsInput, tendenciesInput, delta, forcing = {}) {
  const conditions = createWeatherConditions(conditionsInput);
  const tendencies = createWeatherTendencies(tendenciesInput);
  const dt = Math.max(0, finiteWeatherNumber(delta));
  const windForcing = forcing.wind ?? {};
  const next = {
    temperature: conditions.temperature + tendencies.temperaturePerSecond * dt,
    humidity: conditions.humidity + tendencies.humidityPerSecond * dt,
    pressure: conditions.pressure + tendencies.pressurePerSecond * dt,
    cloudiness: conditions.cloudiness + tendencies.cloudinessPerSecond * dt,
    visibility: conditions.visibility + tendencies.visibilityPerSecond * dt,
    wind: {
      x: conditions.wind.x + tendencies.windPerSecond.x * dt + finiteWeatherNumber(windForcing.x) * dt,
      y: conditions.wind.y + tendencies.windPerSecond.y * dt + finiteWeatherNumber(windForcing.y) * dt,
      z: conditions.wind.z + tendencies.windPerSecond.z * dt + finiteWeatherNumber(windForcing.z) * dt
    },
    precipitation: {
      type: forcing.precipitation?.type ?? conditions.precipitation.type,
      rate: conditions.precipitation.rate + tendencies.precipitationPerSecond * dt
    }
  };
  return blendWeatherConditions(next, forcing.conditions ?? forcing, forcing.blend ?? 1);
}

export function createWeatherDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-weather-domain",
    domain: "core-weather",
    domainPath: config.domainPath ?? "n:weather",
    apiName: config.apiName ?? "weather",
    purpose: "Dynamic renderer-neutral weather state, evolution, regional sampling, and snapshots.",
    owns: ["weather conditions", "weather evolution", "regional weather sampling", "wind", "humidity", "pressure", "precipitation"],
    doesNotOwn: ["world feature placement", "cloud meshes", "fog shaders", "renderer resources"],
    services: ["conditions", "evolution", "regional-sampling", "snapshot"],
    initialState: createInitialWeatherState(config),
    metadata: { ...(config.metadata ?? {}), coreDomain: true, deterministic: true, rendererAgnostic: true },
    createApi({ baseApi }) {
      const baseReset = baseApi.reset.bind(baseApi);
      const read = () => baseApi.getState();
      const commit = (patch, eventName = "updated") => baseApi.update(patch, eventName);

      function setConditions(input = {}) {
        const conditions = createWeatherConditions(input);
        commit({ conditions, revision: Number(read().revision ?? 0) + 1 }, "configured");
        return clone(conditions);
      }

      function patchConditions(patch = {}, blend = 1) {
        const conditions = blendWeatherConditions(read().conditions, patch, blend);
        commit({ conditions, revision: Number(read().revision ?? 0) + 1 }, "updated");
        return clone(conditions);
      }

      function setTendencies(input = {}) {
        const tendencies = createWeatherTendencies(input);
        commit({ tendencies, revision: Number(read().revision ?? 0) + 1 }, "configured");
        return clone(tendencies);
      }

      function registerRegion(input = {}) {
        const region = createWeatherRegionDescriptor(input);
        commit({
          regions: { ...(read().regions ?? {}), [region.id]: region },
          revision: Number(read().revision ?? 0) + 1
        }, "descriptorChanged");
        return clone(region);
      }

      function removeRegion(id) {
        const key = String(id);
        const state = read();
        if (!state.regions?.[key]) return false;
        const regions = { ...state.regions };
        delete regions[key];
        commit({ regions, revision: Number(state.revision ?? 0) + 1 }, "updated");
        return true;
      }

      function sample(point = {}) {
        const state = read();
        const conditions = sampleWeatherRegions(state.conditions, Object.values(state.regions ?? {}), point);
        commit({ lastSample: { point: clone(point), conditions: clone(conditions) } }, "updated");
        return clone(conditions);
      }

      function advance(delta = 0, forcing = {}) {
        const state = read();
        const dt = Math.max(0, finiteWeatherNumber(delta));
        const conditions = advanceConditions(state.conditions, state.tendencies, dt, forcing);
        const elapsed = Math.max(0, finiteWeatherNumber(state.elapsed) + dt);
        const revision = Number(state.revision ?? 0) + 1;
        commit({ elapsed, conditions, revision }, "updated");
        return getWeatherSnapshot();
      }

      function getWeatherSnapshot() {
        const state = read();
        return Object.freeze({
          elapsed: finiteWeatherNumber(state.elapsed),
          revision: Number(state.revision ?? 0),
          conditions: createWeatherConditions(state.conditions),
          tendencies: createWeatherTendencies(state.tendencies),
          regions: Object.freeze(Object.values(state.regions ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone))
        });
      }

      return {
        setConditions,
        patchConditions,
        getConditions() { return clone(read().conditions); },
        setTendencies,
        getTendencies() { return clone(read().tendencies); },
        registerRegion,
        removeRegion,
        getRegion(id) { return clone(read().regions?.[String(id)] ?? null); },
        listRegions() { return Object.values(read().regions ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
        sample,
        advance,
        getWeatherSnapshot,
        reset(payload = {}) {
          return baseReset({ ...payload, initialState: createInitialWeatherState({ ...config, ...(payload.config ?? {}) }) });
        }
      };
    },
    install(context) {
      context.engine.weather = context.engine.n.weather;
      userInstall?.(context);
    }
  });
}

export default createWeatherDomain;
