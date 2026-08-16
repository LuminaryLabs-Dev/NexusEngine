export const NEXUS_GPU_HOST_SCHEMA = "nexus-gpu-host/1";
export const NEXUS_GPU_RESOURCE_SCHEMA = "nexus-gpu-resource/1";

const RESOURCE_STATES = new Set(["allocated", "writing", "ready", "reading", "in-use", "available", "invalid"]);
const RESOURCE_TYPES = new Set(["buffer", "texture"]);

function nonEmptyText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new TypeError(`${label} must be a non-empty string.`);
  return text;
}

function clonePortable(value, label = "value") {
  if (value == null) return value;
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    throw new TypeError(`${label} must be portable/cloneable: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function stringSet(value = [], label = "value") {
  const source = value == null ? [] : Array.isArray(value) ? value : [value];
  return Object.freeze([...new Set(source.map((entry) => nonEmptyText(entry, label)))].sort());
}

function normalizeDeviceDescriptor(input = {}, fallbackBackend = "unknown") {
  return Object.freeze({
    id: nonEmptyText(input.id ?? `${fallbackBackend}-gpu-device`, "GPU device id"),
    backend: nonEmptyText(input.backend ?? fallbackBackend, "GPU backend"),
    generation: Math.max(0, Number(input.generation ?? 0) || 0),
    state: String(input.state ?? "ready"),
    features: stringSet(input.features ?? [], "GPU device feature"),
    limits: Object.freeze({ ...(clonePortable(input.limits ?? {}, "GPU device limits")) }),
    metadata: Object.freeze({ ...(clonePortable(input.metadata ?? {}, "GPU device metadata")) })
  });
}

export function createGPUHostProfile(input = {}) {
  return Object.freeze({
    requiredBackend: input.requiredBackend == null ? null : String(input.requiredBackend),
    requiredFeatures: stringSet(input.requiredFeatures ?? [], "GPU host required feature"),
    compute: input.compute !== false,
    render: input.render !== false,
    metadata: Object.freeze({ ...(clonePortable(input.metadata ?? {}, "GPU host profile metadata")) })
  });
}

export function createGPUResourceDescriptor(input = {}) {
  const type = String(input.type ?? "buffer");
  if (!RESOURCE_TYPES.has(type)) throw new TypeError(`Unsupported GPU resource type: ${type}.`);
  const state = String(input.state ?? "allocated");
  if (!RESOURCE_STATES.has(state)) throw new TypeError(`Unsupported GPU resource state: ${state}.`);
  return Object.freeze({
    schema: NEXUS_GPU_RESOURCE_SCHEMA,
    id: nonEmptyText(input.id, "GPU resource id"),
    deviceId: input.deviceId == null ? null : nonEmptyText(input.deviceId, "GPU resource device id"),
    type,
    revision: Math.max(0, Number(input.revision ?? 0) || 0),
    usage: stringSet(input.usage ?? [], "GPU resource usage"),
    byteLength: Math.max(0, Number(input.byteLength ?? 0) || 0),
    format: input.format == null ? null : String(input.format),
    size: input.size == null ? null : clonePortable(input.size, "GPU resource size"),
    residency: input.residency === false ? "nonresident" : String(input.residency ?? "resident"),
    state,
    owner: input.owner == null ? null : String(input.owner),
    metadata: Object.freeze({ ...(clonePortable(input.metadata ?? {}, "GPU resource metadata")) })
  });
}

function mergedUsage(a = [], b = []) {
  return stringSet([...a, ...b], "GPU resource usage");
}

function portableResource(record) {
  return Object.freeze({
    schema: NEXUS_GPU_RESOURCE_SCHEMA,
    id: record.id,
    deviceId: record.deviceId,
    type: record.type,
    revision: record.revision,
    usage: Object.freeze([...record.usage]),
    byteLength: record.byteLength,
    format: record.format,
    size: record.size == null ? null : clonePortable(record.size, "GPU resource size"),
    residency: record.residency,
    state: record.state,
    owner: record.owner,
    references: Object.freeze(Object.fromEntries([...record.references.entries()].sort(([a], [b]) => a.localeCompare(b)))),
    metadata: Object.freeze({ ...record.metadata })
  });
}

export function createGPUHost(config = {}) {
  let provider = null;
  let device = null;
  let sequence = 0;
  const resources = new Map();
  let lossRecord = null;

  function attachProvider(nextProvider) {
    if (!nextProvider || typeof nextProvider !== "object") throw new TypeError("GPU Host provider must be an object.");
    if (typeof nextProvider.ensureDevice !== "function") throw new TypeError("GPU Host provider requires ensureDevice(profile).");
    if (typeof nextProvider.ensureResource !== "function") throw new TypeError("GPU Host provider requires ensureResource(descriptor, initialData).");
    if (typeof nextProvider.resolveResource !== "function") throw new TypeError("GPU Host provider requires resolveResource(resourceId).");
    provider = nextProvider;
    nextProvider.setLossHandler?.((record) => {
      lossRecord = Object.freeze({
        reason: String(record?.reason ?? record?.message ?? "device-lost"),
        message: String(record?.message ?? record?.reason ?? "GPU device lost."),
        sequence: ++sequence
      });
      if (device) device = Object.freeze({ ...device, state: "lost" });
      for (const entry of resources.values()) {
        entry.state = "invalid";
        entry.residency = "nonresident";
        entry.owner = null;
      }
      config.onDeviceLost?.(lossRecord);
    });
    return nextProvider;
  }

  if (config.provider) attachProvider(config.provider);

  async function ensureDevice(profileInput = {}) {
    if (!provider) throw new Error("GPU Host requires an attached provider before acquiring a device.");
    const profile = createGPUHostProfile(profileInput);
    const described = normalizeDeviceDescriptor(await provider.ensureDevice(profile), provider.backend ?? "unknown");
    if (profile.requiredBackend && described.backend !== profile.requiredBackend) {
      throw new Error(`GPU Host requires ${profile.requiredBackend}, received ${described.backend}.`);
    }
    for (const feature of profile.requiredFeatures) {
      if (!described.features.includes(feature)) throw new Error(`GPU Host device ${described.id} is missing required feature ${feature}.`);
    }
    device = described;
    return device;
  }

  async function ensureResource(input = {}, initialData = null) {
    const currentDevice = device ?? await ensureDevice(config.profile ?? {});
    const id = nonEmptyText(input.id, "GPU resource id");
    const existing = resources.get(id);
    const requested = createGPUResourceDescriptor({ ...input, deviceId: currentDevice.id });
    if (existing && existing.deviceId !== currentDevice.id) {
      existing.state = "invalid";
      existing.residency = "nonresident";
    }
    const usage = mergedUsage(existing?.usage ?? [], requested.usage);
    const descriptor = createGPUResourceDescriptor({
      ...requested,
      deviceId: currentDevice.id,
      usage,
      revision: existing?.revision ?? requested.revision,
      state: existing?.state === "invalid" ? "allocated" : existing?.state ?? requested.state,
      residency: "resident"
    });
    const nativeChange = await provider.ensureResource(descriptor, initialData);
    const revision = Math.max(
      descriptor.revision,
      Number(existing?.revision ?? -1) + (nativeChange?.reallocated ? 1 : existing ? 0 : 1)
    );
    const record = existing ?? { references: new Map() };
    Object.assign(record, {
      id: descriptor.id,
      deviceId: currentDevice.id,
      type: descriptor.type,
      revision,
      usage: [...usage],
      byteLength: descriptor.byteLength,
      format: descriptor.format,
      size: descriptor.size == null ? null : clonePortable(descriptor.size, "GPU resource size"),
      residency: "resident",
      state: record.state === "invalid" ? "allocated" : record.state ?? "allocated",
      owner: record.owner ?? null,
      metadata: { ...descriptor.metadata }
    });
    resources.set(id, record);
    sequence += 1;
    return portableResource(record);
  }

  function resource(id) {
    const key = String(id);
    const record = resources.get(key);
    if (!record) throw new Error(`Unknown GPU resource: ${key}.`);
    return record;
  }

  function assertResident(record) {
    if (record.residency !== "resident" || record.state === "invalid") {
      throw new Error(`GPU resource ${record.id} is not resident/valid.`);
    }
  }

  function beginWrite(id, owner) {
    const record = resource(id);
    assertResident(record);
    if (["writing", "reading", "in-use"].includes(record.state)) {
      throw new Error(`GPU resource ${record.id} cannot begin write from state ${record.state}.`);
    }
    record.state = "writing";
    record.owner = nonEmptyText(owner, "GPU resource writer");
    sequence += 1;
    return portableResource(record);
  }

  function completeWrite(id, owner) {
    const record = resource(id);
    if (record.state !== "writing" || record.owner !== String(owner)) {
      throw new Error(`GPU resource ${record.id} is not being written by ${owner}.`);
    }
    record.state = "ready";
    record.owner = null;
    record.revision += 1;
    sequence += 1;
    return portableResource(record);
  }

  function beginRead(id, owner) {
    const record = resource(id);
    assertResident(record);
    if (record.state === "writing") throw new Error(`GPU resource ${record.id} is still being written.`);
    const key = nonEmptyText(owner, "GPU resource reader");
    record.references.set(key, (record.references.get(key) ?? 0) + 1);
    record.state = "in-use";
    record.owner = null;
    sequence += 1;
    return portableResource(record);
  }

  function completeRead(id, owner) {
    const record = resource(id);
    const key = nonEmptyText(owner, "GPU resource reader");
    const count = record.references.get(key) ?? 0;
    if (count <= 0) throw new Error(`GPU resource ${record.id} has no active read for ${key}.`);
    if (count === 1) record.references.delete(key);
    else record.references.set(key, count - 1);
    record.state = [...record.references.values()].some((value) => value > 0) ? "in-use" : "available";
    sequence += 1;
    return portableResource(record);
  }

  function retainResource(id, consumer) {
    const record = resource(id);
    const key = nonEmptyText(consumer, "GPU resource consumer");
    record.references.set(key, (record.references.get(key) ?? 0) + 1);
    sequence += 1;
    return portableResource(record);
  }

  function releaseResource(id, consumer, { destroyWhenUnused = false } = {}) {
    const record = resource(id);
    const key = nonEmptyText(consumer, "GPU resource consumer");
    const count = record.references.get(key) ?? 0;
    if (count > 1) record.references.set(key, count - 1);
    else record.references.delete(key);
    const referenced = [...record.references.values()].some((value) => value > 0);
    if (!referenced && destroyWhenUnused) {
      provider?.releaseResource?.(record.id);
      resources.delete(record.id);
      sequence += 1;
      return null;
    }
    sequence += 1;
    return portableResource(record);
  }

  function evictResource(id) {
    const record = resource(id);
    if ([...record.references.values()].some((value) => value > 0)) {
      throw new Error(`GPU resource ${record.id} cannot be evicted while referenced.`);
    }
    provider?.releaseResource?.(record.id);
    resources.delete(record.id);
    sequence += 1;
    return true;
  }

  function invalidate(reason = "manual-invalidation") {
    lossRecord = Object.freeze({ reason: String(reason), message: String(reason), sequence: ++sequence });
    provider?.invalidate?.(reason);
    if (device) device = Object.freeze({ ...device, state: "lost" });
    for (const record of resources.values()) {
      record.state = "invalid";
      record.residency = "nonresident";
      record.owner = null;
    }
    return snapshot();
  }

  async function restore(profileInput = {}) {
    if (!provider) throw new Error("GPU Host cannot restore without a provider.");
    const nextDevice = normalizeDeviceDescriptor(
      typeof provider.restore === "function"
        ? await provider.restore(createGPUHostProfile(profileInput))
        : await provider.ensureDevice(createGPUHostProfile(profileInput)),
      provider.backend ?? "unknown"
    );
    device = nextDevice;
    lossRecord = null;
    for (const record of resources.values()) {
      record.deviceId = nextDevice.id;
      record.state = "invalid";
      record.residency = "nonresident";
      record.owner = null;
    }
    sequence += 1;
    return device;
  }

  function snapshot() {
    return Object.freeze({
      schema: NEXUS_GPU_HOST_SCHEMA,
      id: String(config.id ?? "gpu-host"),
      sequence,
      provider: provider ? String(provider.id ?? provider.backend ?? "gpu-provider") : null,
      device: device ? { ...device, features: [...device.features], limits: { ...device.limits }, metadata: { ...device.metadata } } : null,
      resources: Object.freeze([...resources.values()].map(portableResource).sort((a, b) => a.id.localeCompare(b.id))),
      loss: lossRecord ? { ...lossRecord } : null
    });
  }

  return Object.freeze({
    id: String(config.id ?? "gpu-host"),
    attachProvider,
    ensureDevice,
    ensureResource,
    getDeviceDescriptor: () => device,
    getResource(id) { const record = resources.get(String(id)); return record ? portableResource(record) : null; },
    listResources: () => [...resources.values()].map(portableResource).sort((a, b) => a.id.localeCompare(b.id)),
    beginWrite,
    completeWrite,
    beginRead,
    completeRead,
    retainResource,
    releaseResource,
    evictResource,
    invalidate,
    restore,
    snapshot,
    providerAccess() {
      if (!provider) throw new Error("GPU Host has no provider attached.");
      return Object.freeze({
        backend: String(provider.backend ?? "unknown"),
        resolveResource: (id) => provider.resolveResource(String(id)),
        resolveResourceView: (id, descriptor) => provider.resolveResourceView?.(String(id), descriptor) ?? null,
        getDevice: () => provider.getDevice?.() ?? null,
        getAdapter: () => provider.getAdapter?.() ?? null,
        getQueue: () => provider.getQueue?.() ?? provider.getDevice?.()?.queue ?? null
      });
    },
    dispose() {
      provider?.dispose?.();
      resources.clear();
      provider = null;
      device = null;
      lossRecord = null;
      sequence = 0;
    }
  });
}

export { createWebGPUHostProvider } from "./webgpu/index.js";
