import { createEngine } from "./engine.js";

function asList(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value.slice() : [value];
}

function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeTokenList(value, fieldName, ownerId) {
  return asList(value).map((entry) => {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      throw new TypeError(`Host ${ownerId} has an invalid ${fieldName} entry.`);
    }
    return entry;
  });
}

function assertNonEmptyString(value, fieldName, ownerName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${ownerName} requires a non-empty ${fieldName}.`);
  }
  return value;
}

function kitDomain(kit) {
  return kit.metadata?.domain ?? kit.domain ?? null;
}

function makeProviderIndex(host) {
  const providers = new Map();

  for (const token of host.provides) {
    if (!providers.has(token)) {
      providers.set(token, { id: host.id, kind: "host" });
    }
  }

  for (const kit of host.engine.kits ?? []) {
    providers.set(kit.id, { id: kit.id, kind: "kit" });
    for (const token of kit.provides ?? []) {
      providers.set(token, { id: kit.id, kind: "kit" });
    }
  }

  for (const record of host.adapterRecords) {
    providers.set(record.adapter.id, { id: record.adapter.id, kind: "adapter" });
    for (const token of record.adapter.provides ?? []) {
      providers.set(token, { id: record.adapter.id, kind: "adapter" });
    }
  }

  return providers;
}

function createRequireEdges(consumer, requires, providers) {
  return (requires ?? []).map((token) => {
    const provider = providers.get(token);
    return {
      from: provider?.id ?? null,
      to: consumer.id,
      type: "provides/requires",
      token,
      providerKind: provider?.kind ?? null,
      satisfied: Boolean(provider)
    };
  });
}

export function defineHostAdapter(config = {}) {
  const id = assertNonEmptyString(config.id, "id", "Host adapter");
  const domain = assertNonEmptyString(config.domain, "domain", `Host adapter ${id}`);

  for (const [fieldName, value] of [
    ["mount", config.mount],
    ["unmount", config.unmount],
    ["snapshot", config.snapshot]
  ]) {
    if (value !== undefined && typeof value !== "function") {
      throw new TypeError(`Host adapter ${id} has an invalid ${fieldName} callback.`);
    }
  }

  return Object.freeze({
    id,
    domain,
    provides: normalizeTokenList(config.provides, "provides", id),
    requires: normalizeTokenList(config.requires, "requires", id),
    mount: config.mount,
    unmount: config.unmount,
    snapshot: config.snapshot,
    metadata: Object.freeze({ ...(config.metadata ?? {}) })
  });
}

export function createHostGraphSnapshot(host) {
  if (!host || typeof host !== "object" || !host.engine || !Array.isArray(host.adapterRecords)) {
    throw new TypeError("createHostGraphSnapshot expects a Nexus.Host object.");
  }

  const providers = makeProviderIndex(host);
  const kits = {};
  const domains = {};
  const adapters = {};
  const edges = [];
  const diagnostics = [...host.diagnostics];

  for (const kit of host.engine.kits ?? []) {
    const domain = kitDomain(kit);
    kits[kit.id] = {
      domain,
      provides: [...(kit.provides ?? [])],
      requires: [...(kit.requires ?? [])],
      state: "ready"
    };
    if (domain) {
      domains[domain] = { owner: kit.id, kind: "kit", state: "ready" };
    }
    edges.push(...createRequireEdges({ id: kit.id }, kit.requires ?? [], providers));
  }

  for (const record of host.adapterRecords) {
    const adapter = record.adapter;
    const adapterSnapshot = adapter.snapshot
      ? adapter.snapshot({ host, engine: host.engine, adapter })
      : undefined;
    adapters[adapter.id] = {
      domain: adapter.domain,
      provides: [...adapter.provides],
      requires: [...adapter.requires],
      state: record.state,
      snapshot: cloneJson(adapterSnapshot)
    };
    domains[adapter.domain] = { owner: adapter.id, kind: "adapter", state: record.state };
    edges.push(...createRequireEdges({ id: adapter.id }, adapter.requires, providers));
  }

  return {
    id: host.id,
    revision: host.revision,
    lifecycle: { ...host.lifecycle },
    kits,
    domains,
    adapters,
    edges,
    diagnostics: cloneJson(diagnostics)
  };
}

export function createNexusHost(options = {}) {
  const id = options.id ?? "nexus-host";
  assertNonEmptyString(id, "id", "Nexus.Host");

  const {
    engine: providedEngine,
    kits = [],
    adapters = [],
    provides = [],
    revision = "host-revision-001",
    ...engineOptions
  } = options;

  const engine = providedEngine ?? createEngine(engineOptions);
  const host = {
    id,
    revision,
    engine,
    provides: normalizeTokenList(provides, "provides", id),
    adapterRecords: [],
    diagnostics: [],
    lifecycle: {
      state: "initializing",
      mountedAdapters: 0
    },
    installKit(kit, installOptions = options) {
      engine.installKit(kit, installOptions);
      return kit;
    },
    mountAdapter(adapterLike) {
      const adapter = defineHostAdapter(adapterLike);
      const providers = makeProviderIndex(host);
      const missing = adapter.requires.filter((token) => !providers.has(token));
      if (missing.length) {
        const message = `Host adapter ${adapter.id} requires missing token(s): ${missing.join(", ")}.`;
        host.diagnostics.push({ level: "error", adapterId: adapter.id, message, missing });
        throw new TypeError(message);
      }

      adapter.mount?.({ host, engine, adapter });
      const record = { adapter, state: "ready" };
      host.adapterRecords.push(record);
      host.lifecycle.mountedAdapters = host.adapterRecords.length;
      return adapter;
    },
    unmountAdapter(adapterId) {
      const index = host.adapterRecords.findIndex((record) => record.adapter.id === adapterId);
      if (index === -1) {
        return false;
      }
      const [record] = host.adapterRecords.splice(index, 1);
      record.adapter.unmount?.({ host, engine, adapter: record.adapter });
      host.lifecycle.mountedAdapters = host.adapterRecords.length;
      return true;
    },
    snapshot() {
      return createHostGraphSnapshot(host);
    }
  };

  for (const kit of asList(kits)) {
    host.installKit(kit, options);
  }

  for (const adapter of asList(adapters)) {
    host.mountAdapter(adapter);
  }

  host.lifecycle.state = "ready";
  return host;
}
