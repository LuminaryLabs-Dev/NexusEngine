import { defineEvent, defineResource } from "../ecs.js";
import { defineDomainServiceKit } from "../domain-service-kit.js";

const DEFAULT_EVENT_NAMES = Object.freeze([
  "configured",
  "updated",
  "reset",
  "snapshotLoaded",
  "descriptorChanged"
]);

function clone(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toPascal(slug) {
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toCamel(slug) {
  const pascal = toPascal(slug);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function normalizeDomain(domain) {
  if (typeof domain !== "string" || domain.trim().length === 0) {
    throw new TypeError("createCoreCapabilityKit requires a non-empty domain.");
  }
  const next = domain.trim().toLowerCase();
  if (!/^core-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(next)) {
    throw new TypeError(`Core capability domain must use a core-* slug: ${domain}`);
  }
  return next;
}

function createState(config, extra = {}) {
  const now = Number(extra.sequence ?? 0);
  return {
    id: config.id ?? `${config.domain}-state`,
    domain: config.domain,
    version: config.version ?? "0.0.3",
    config: clone(config.config ?? {}),
    descriptors: clone(config.descriptors ?? {}),
    policies: clone(config.policies ?? {}),
    adapters: Object.keys(config.adapters ?? {}),
    metadata: clone(config.metadata ?? {}),
    sequence: now,
    lastEvent: null,
    ...clone(config.initialState ?? {})
  };
}

function normalizeEvents(domain, eventNames = DEFAULT_EVENT_NAMES) {
  const prefix = domain.replaceAll("-", ".");
  return Object.fromEntries(
    eventNames.map((eventName) => [
      toPascal(eventName),
      defineEvent(`${prefix}.${eventName}`)
    ])
  );
}

function mergeState(state, patch = {}, eventName = "updated") {
  const next = {
    ...state,
    ...clone(patch),
    sequence: Number(state?.sequence ?? 0) + 1,
    lastEvent: eventName
  };
  if (patch.config) next.config = { ...(state.config ?? {}), ...clone(patch.config) };
  if (patch.descriptors) next.descriptors = { ...(state.descriptors ?? {}), ...clone(patch.descriptors) };
  if (patch.policies) next.policies = { ...(state.policies ?? {}), ...clone(patch.policies) };
  return next;
}

export function createCoreCapabilityDescriptor(domain, config = {}) {
  const normalizedDomain = normalizeDomain(domain);
  return Object.freeze({
    domain: normalizedDomain,
    id: config.id ?? `n-${normalizedDomain}-kit`,
    apiName: config.apiName ?? toCamel(normalizedDomain),
    version: config.version ?? "0.0.3",
    stability: config.stability ?? "stable-candidate",
    owns: Object.freeze([...(config.owns ?? [])]),
    doesNotOwn: Object.freeze([...(config.doesNotOwn ?? [])]),
    services: Object.freeze([...(config.services ?? [])]),
    adapters: Object.freeze(Object.keys(config.adapters ?? {})),
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}

export function createCoreCapabilityKit(config = {}) {
  const domain = normalizeDomain(config.domain);
  const apiName = config.apiName ?? toCamel(domain);
  const descriptor = createCoreCapabilityDescriptor(domain, { ...config, apiName });
  const State = defineResource(`${domain.replaceAll("-", ".")}.state`);
  const events = normalizeEvents(domain, config.eventNames);
  const stateConfig = { ...config, domain, apiName };

  return defineDomainServiceKit({
    id: config.id ?? `n-${domain}-kit`,
    domain,
    apiName,
    services: ["state", "descriptors", "config", ...(config.services ?? [])],
    stability: config.stability ?? "stable-candidate",
    version: config.version ?? "0.0.3",
    resources: { State, ...(config.resources ?? {}) },
    events: { ...events, ...(config.events ?? {}) },
    systems: config.systems ?? [],
    metadata: {
      purpose: config.purpose ?? `${domain} capability domain`,
      capabilityDomain: true,
      descriptor,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      world.setResource(State, createState(stateConfig));
      config.initWorld?.({ world, State, events, descriptor, config: stateConfig });
    },
    createApi({ engine, world }) {
      const getState = () => world.getResource(State);
      const setState = (next, eventName = "updated", payload = {}) => {
        world.setResource(State, next);
        const event = events[toPascal(eventName)] ?? events.Updated;
        if (event) world.emit(event, { domain, state: clone(next), ...clone(payload) });
        return next;
      };

      const api = {
        descriptor,
        getState,
        getSnapshot() {
          return clone(getState());
        },
        loadSnapshot(snapshot = {}) {
          const next = mergeState(createState(stateConfig), clone(snapshot), "snapshotLoaded");
          return setState(next, "snapshotLoaded");
        },
        reset(payload = {}) {
          return setState(createState({ ...stateConfig, ...(isObject(payload) ? payload : {}) }), "reset", { payload });
        },
        configure(patch = {}) {
          return setState(mergeState(getState(), { config: patch }, "configured"), "configured", { patch });
        },
        update(patch = {}, eventName = "updated") {
          return setState(mergeState(getState(), patch, eventName), eventName, { patch });
        },
        getConfig() {
          return clone(getState()?.config ?? {});
        },
        getDescriptors(type) {
          const descriptors = getState()?.descriptors ?? {};
          return type ? clone(descriptors[type] ?? {}) : clone(descriptors);
        },
        setDescriptor(type, id, descriptorValue = {}) {
          const state = getState();
          const descriptors = clone(state?.descriptors ?? {});
          descriptors[type] = { ...(descriptors[type] ?? {}), [id]: clone(descriptorValue) };
          return setState(mergeState(state, { descriptors }, "descriptorChanged"), "descriptorChanged", { type, id });
        },
        getPolicy(name) {
          return clone(getState()?.policies?.[name]);
        },
        emit(eventName, payload = {}) {
          const event = events[toPascal(eventName)] ?? events.Updated;
          if (!event) return null;
          world.emit(event, { domain, ...clone(payload) });
          return event;
        }
      };

      return typeof config.createApi === "function"
        ? { ...api, ...config.createApi({ engine, world, State, events, descriptor, baseApi: api }) }
        : api;
    }
  });
}
