import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";
import {
  composeWeatherLayers,
  createWeatherConditions,
  createWeatherLayerDescriptor,
  evolveWeatherLayer,
  finiteWeatherNumber,
  sampleWeatherLayerAtAltitude
} from "../../contracts.js";

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function normalizeLayerMap(inputs = []) {
  return Object.fromEntries((inputs ?? []).map((input) => {
    const layer = createWeatherLayerDescriptor(input);
    return [layer.id, layer];
  }));
}

function sortedLayers(layers = {}) {
  return Object.values(layers)
    .map(createWeatherLayerDescriptor)
    .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id));
}

function createLayeredSnapshot(layers, elapsed, revision, weatherSnapshot = {}) {
  const conditions = createWeatherConditions(weatherSnapshot.conditions);
  const evolved = sortedLayers(layers).map((layer) => evolveWeatherLayer(layer, elapsed, conditions));
  return Object.freeze({
    elapsed: Math.max(0, finiteWeatherNumber(elapsed)),
    revision: Number(revision ?? 0),
    weatherRevision: Number(weatherSnapshot.revision ?? 0),
    conditions,
    layers: Object.freeze(evolved),
    altitudeBands: Object.freeze(evolved.map((layer) => Object.freeze({ id: layer.id, kind: layer.kind, base: layer.base, top: layer.top })))
  });
}

function createInitialLayeredWeatherState(config = {}) {
  const layers = normalizeLayerMap(config.layers ?? []);
  const elapsed = Math.max(0, finiteWeatherNumber(config.elapsed));
  const revision = 0;
  return {
    elapsed,
    revision,
    layers,
    lastSnapshot: createLayeredSnapshot(layers, elapsed, revision, { conditions: config.conditions })
  };
}

export function createLayeredWeatherDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-layered-weather-domain",
    domain: "core-layered-weather",
    domainPath: config.domainPath ?? "n:weather:layered",
    parentDomainPath: config.parentDomainPath ?? "n:weather",
    apiName: config.apiName ?? "layeredWeather",
    requires: [...(config.requires ?? []), "n:weather"],
    purpose: "Altitude-layered weather descriptors, evolution, sampling, composition, and snapshots.",
    owns: ["weather layers", "altitude blending", "layer composition", "layer evolution snapshots"],
    doesNotOwn: ["world feature placement", "weather-region authority", "renderer shaders", "GPU resources"],
    services: ["layer-definition", "layer-evolution", "altitude-sampling", "layer-composition", "snapshot"],
    initialState: createInitialLayeredWeatherState(config),
    metadata: { ...(config.metadata ?? {}), coreDomain: true, childDomain: true, deterministic: true, rendererAgnostic: true },
    createApi({ engine, baseApi }) {
      const weather = engine.weather ?? engine.n?.weather;
      if (!weather) throw new Error("Layered Weather Domain requires Weather Domain.");
      const baseReset = baseApi.reset.bind(baseApi);
      const read = () => baseApi.getState();
      const commit = (patch, eventName = "updated") => baseApi.update(patch, eventName);

      function registerLayer(input = {}) {
        const layer = createWeatherLayerDescriptor(input);
        const state = read();
        const layers = { ...(state.layers ?? {}), [layer.id]: layer };
        const revision = Number(state.revision ?? 0) + 1;
        const lastSnapshot = createLayeredSnapshot(layers, state.elapsed, revision, weather.getWeatherSnapshot());
        commit({ layers, revision, lastSnapshot }, "descriptorChanged");
        return clone(layer);
      }

      function replaceLayers(inputs = []) {
        const state = read();
        const layers = normalizeLayerMap(inputs);
        const revision = Number(state.revision ?? 0) + 1;
        const lastSnapshot = createLayeredSnapshot(layers, state.elapsed, revision, weather.getWeatherSnapshot());
        commit({ layers, revision, lastSnapshot }, "descriptorChanged");
        return listLayers();
      }

      function updateLayer(id, patch = {}) {
        const key = String(id);
        const current = read().layers?.[key];
        if (!current) throw new RangeError(`Unknown weather layer: ${key}.`);
        return registerLayer({ ...current, ...patch, id: key, profile: { ...(current.profile ?? {}), ...(patch.profile ?? {}) } });
      }

      function removeLayer(id) {
        const key = String(id);
        const state = read();
        if (!state.layers?.[key]) return false;
        const layers = { ...state.layers };
        delete layers[key];
        const revision = Number(state.revision ?? 0) + 1;
        const lastSnapshot = createLayeredSnapshot(layers, state.elapsed, revision, weather.getWeatherSnapshot());
        commit({ layers, revision, lastSnapshot }, "updated");
        return true;
      }

      function listLayers() {
        return sortedLayers(read().layers ?? {}).map(clone);
      }

      function advance(delta = 0, weatherSnapshot = null) {
        const state = read();
        const sourceWeather = weatherSnapshot ?? weather.getWeatherSnapshot();
        const elapsed = Math.max(
          Math.max(0, finiteWeatherNumber(state.elapsed) + Math.max(0, finiteWeatherNumber(delta))),
          Math.max(0, finiteWeatherNumber(sourceWeather.elapsed))
        );
        const revision = Number(state.revision ?? 0) + 1;
        const lastSnapshot = createLayeredSnapshot(state.layers ?? {}, elapsed, revision, sourceWeather);
        commit({ elapsed, revision, lastSnapshot }, "updated");
        return clone(lastSnapshot);
      }

      function getLayeredSnapshot() {
        const state = read();
        return clone(state.lastSnapshot ?? createLayeredSnapshot(state.layers ?? {}, state.elapsed, state.revision, weather.getWeatherSnapshot()));
      }

      function sampleAltitude(altitude = 0) {
        const snapshot = getLayeredSnapshot();
        return Object.freeze(snapshot.layers.map((layer) => Object.freeze({
          id: layer.id,
          kind: layer.kind,
          influence: sampleWeatherLayerAtAltitude(layer, altitude),
          coverage: layer.coverage,
          density: layer.density
        })).filter((entry) => entry.influence > 0));
      }

      function composeAtAltitude(altitude = 0) {
        return composeWeatherLayers(getLayeredSnapshot().layers, altitude);
      }

      return {
        registerLayer,
        replaceLayers,
        updateLayer,
        removeLayer,
        getLayer(id) { return clone(read().layers?.[String(id)] ?? null); },
        listLayers,
        advance,
        getLayeredSnapshot,
        sampleAltitude,
        composeAtAltitude,
        reset(payload = {}) {
          return baseReset({ ...payload, initialState: createInitialLayeredWeatherState({ ...config, ...(payload.config ?? {}) }) });
        }
      };
    },
    install(context) {
      context.engine.layeredWeather = context.engine.n.layeredWeather;
      userInstall?.(context);
    }
  });
}

export default createLayeredWeatherDomain;
