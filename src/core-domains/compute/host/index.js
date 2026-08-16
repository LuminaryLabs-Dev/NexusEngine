import { nonEmptyText, portableClone, stringSet } from "../portable.js";

export const NEXUS_COMPUTE_HOST_PROFILE_SCHEMA = "nexus-compute-host-profile/1";

function orderedStringList(value = [], label = "compute values") {
  const source = value == null ? [] : Array.isArray(value) ? value : [value];
  const seen = new Set();
  const output = [];
  for (const entry of source) {
    const text = nonEmptyText(entry, label);
    if (!seen.has(text)) { seen.add(text); output.push(text); }
  }
  return Object.freeze(output);
}

function normalizeCapabilities(value = {}) {
  return Object.freeze({
    family: String(value.family ?? "cpu"),
    backend: String(value.backend ?? "javascript"),
    features: stringSet(value.features ?? [], "compute capability feature"),
    limits: Object.freeze({ ...(value.limits ?? {}) }),
    priority: Number.isFinite(Number(value.priority)) ? Number(value.priority) : 0
  });
}

export function describeComputeProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Compute provider must be an object.");
  const id = nonEmptyText(provider.id, "compute provider id");
  const source = typeof provider.getCapabilities === "function"
    ? provider.getCapabilities()
    : provider.capabilities ?? {};
  return Object.freeze({ id, ...normalizeCapabilities(source) });
}

export function createComputeHostProfile(input = {}) {
  return Object.freeze({
    schema: NEXUS_COMPUTE_HOST_PROFILE_SCHEMA,
    requiredFamily: input.requiredFamily == null ? null : String(input.requiredFamily),
    requiredBackend: input.requiredBackend == null ? null : String(input.requiredBackend),
    requiredFeatures: stringSet(input.requiredFeatures ?? [], "compute host required feature"),
    preferredBackends: orderedStringList(input.preferredBackends ?? [], "compute host preferred backend"),
    allowFallback: input.allowFallback !== false,
    metadata: portableClone(input.metadata ?? {}, "compute host profile metadata")
  });
}

export function computeProviderCompatible(provider, profile = {}) {
  const descriptor = describeComputeProvider(provider);
  const request = createComputeHostProfile(profile);
  if (request.requiredFamily && descriptor.family !== request.requiredFamily) return false;
  if (request.requiredBackend && descriptor.backend !== request.requiredBackend) return false;
  if (request.requiredFeatures.some((feature) => !descriptor.features.includes(feature))) return false;
  if (typeof provider.supports === "function" && !provider.supports(request)) return false;
  return true;
}

function providerScore(provider, profile) {
  const descriptor = describeComputeProvider(provider);
  const preferred = profile.preferredBackends.indexOf(descriptor.backend);
  const preference = preferred < 0 ? 0 : (profile.preferredBackends.length - preferred) * 1000;
  return preference + descriptor.priority;
}

export function createComputeHost(config = {}) {
  const providers = new Map();
  let selectedId = null;
  let sequence = 0;
  let descriptors = { buffers: {}, kernels: {}, graphs: {} };

  function registerProvider(provider) {
    const descriptor = describeComputeProvider(provider);
    if (typeof provider.executeGraph !== "function") {
      throw new TypeError(`Compute provider ${descriptor.id} requires executeGraph(request).`);
    }
    if (providers.has(descriptor.id) && providers.get(descriptor.id) !== provider) {
      throw new TypeError(`Compute provider id collision: ${descriptor.id}.`);
    }
    providers.set(descriptor.id, provider);
    provider.syncDescriptors?.(descriptors);
    return descriptor;
  }

  for (const provider of config.providers ?? []) registerProvider(provider);

  return Object.freeze({
    id: String(config.id ?? "compute-host"),
    capabilities: {
      family: "host",
      backend: "selector",
      features: ["provider-selection", "fallback", "portable-graph"],
      priority: Number(config.priority ?? 0)
    },
    initialize(context = {}) {
      for (const provider of providers.values()) provider.initialize?.(context);
    },
    syncDescriptors(next = {}) {
      descriptors = portableClone(next, "Compute Host descriptors");
      for (const provider of providers.values()) provider.syncDescriptors?.(descriptors);
    },
    registerProvider,
    removeProvider(id) {
      const key = String(id);
      const provider = providers.get(key);
      if (!provider) return false;
      provider.dispose?.();
      providers.delete(key);
      if (selectedId === key) selectedId = null;
      return true;
    },
    listProviders() {
      return Array.from(providers.values(), describeComputeProvider)
        .sort((a, b) => a.id.localeCompare(b.id));
    },
    selectProvider(profileInput = {}) {
      const profile = createComputeHostProfile(profileInput);
      const candidates = Array.from(providers.values())
        .filter((provider) => computeProviderCompatible(provider, profile))
        .sort((a, b) => {
          const score = providerScore(b, profile) - providerScore(a, profile);
          return score || String(a.id).localeCompare(String(b.id));
        });
      if (!candidates.length) {
        if (!profile.allowFallback) throw new Error("No compatible compute provider is available.");
        return null;
      }
      selectedId = candidates[0].id;
      return describeComputeProvider(candidates[0]);
    },
    getSelectedProvider() {
      return selectedId == null ? null : providers.get(selectedId) ?? null;
    },
    async executeGraph(request, profileInput = request?.context?.computeProfile ?? {}) {
      const profile = createComputeHostProfile(profileInput);
      let provider = selectedId == null ? null : providers.get(selectedId);
      if (!provider || !computeProviderCompatible(provider, profile)) {
        const selection = this.selectProvider(profile);
        provider = selection ? providers.get(selection.id) : null;
      }
      if (!provider) throw new Error("Compute Host cannot execute without a compatible provider.");
      sequence += 1;
      provider.syncDescriptors?.(descriptors);
      const result = await provider.executeGraph(request);
      return {
        ...result,
        providerId: String(result?.providerId ?? provider.id),
        metadata: {
          ...(result?.metadata ?? {}),
          computeHostSequence: sequence
        }
      };
    },
    reset() {
      selectedId = null;
      sequence = 0;
      for (const provider of providers.values()) provider.reset?.();
    },
    dispose() {
      for (const provider of providers.values()) provider.dispose?.();
      providers.clear();
      selectedId = null;
    }
  });
}
