import {
  CORE_COMPOSITION_REGISTRY_SCHEMA,
  hashRegistryValue,
  mergeRegistrySnapshots,
  normalizeBundleRegistryRecord,
  normalizeDomainRegistryRecord,
  normalizeKitRegistryRecord,
  normalizeRegistrySnapshot
} from "./registry.js";
import { planCompositionTree } from "./composition-tree.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

function sameValue(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

const RUNTIME_SOURCE_ID = "runtime-registry";

function configSnapshot(config = {}) {
  if (config.schema) return normalizeRegistrySnapshot(config, { allowTrustedSources: true });
  const content = { kits: asList(config.kits), domains: asList(config.domains), bundles: asList(config.bundles) };
  return normalizeRegistrySnapshot({
    schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
    revision: 0,
    registryId: config.registryId ?? RUNTIME_SOURCE_ID,
    sources: [{ registryId: RUNTIME_SOURCE_ID, package: "runtime-registry", version: "0.0.0", contentHash: hashRegistryValue(content), trusted: false }],
    kits: content.kits.map((kit) => ({ ...kit, source: { ...(kit.source ?? {}), registryId: kit.source?.registryId ?? RUNTIME_SOURCE_ID } })),
    domains: content.domains.map((domain) => ({ ...domain, sourceRegistryId: domain.sourceRegistryId ?? RUNTIME_SOURCE_ID })),
    bundles: content.bundles.map((bundle) => ({ ...bundle, sourceRegistryId: bundle.sourceRegistryId ?? RUNTIME_SOURCE_ID }))
  });
}

export function createKitRegistryService(config = {}) {
  const initial = configSnapshot(config);
  let kits = new Map(); let domains = new Map(); let bundles = new Map(); let sources = new Map(); let revision = 0;
  let protectedIds = new Set(); let protectedDomainPaths = new Set();

  function ensureRuntimeSource() {
    if (!sources.has(RUNTIME_SOURCE_ID)) sources.set(RUNTIME_SOURCE_ID, Object.freeze({
      registryId: RUNTIME_SOURCE_ID,
      package: "runtime-registry",
      version: "0.0.0",
      contentHash: "runtime-mutable",
      trusted: false,
      metadata: Object.freeze({})
    }));
  }

  function register(map, value, normalize, label, replace = false) {
    ensureRuntimeSource();
    const normalized = normalize(value);
    const existing = map.get(normalized.id);
    if (existing && sameValue(existing, normalized)) return clone(existing);
    if (existing && protectedIds.has(normalized.id)) throw new TypeError(`Core ${label.toLowerCase()} ${normalized.id} cannot be replaced.`);
    if (existing && !replace) throw new TypeError(`${label} id collision: ${normalized.id}`);
    if (label === "Domain") {
      const pathCollision = [...domains.values()].find((domain) => domain.domainPath === normalized.domainPath && domain.id !== normalized.id);
      if (pathCollision) throw new TypeError(`Domain path collision: ${normalized.domainPath}`);
      if (protectedDomainPaths.has(normalized.domainPath) && existing?.domainPath !== normalized.domainPath) throw new TypeError(`Core domain path ${normalized.domainPath} cannot be replaced.`);
    }
    map.set(normalized.id, normalized); revision += 1; return clone(normalized);
  }
  function sortedValues(map) { return [...map.values()].sort((left, right) => left.id.localeCompare(right.id)).map(clone); }
  function snapshot() {
    return normalizeRegistrySnapshot({
      schema: CORE_COMPOSITION_REGISTRY_SCHEMA,
      revision,
      registryId: initial.registryId,
      sources: [...sources.values()].map(clone),
      kits: sortedValues(kits),
      domains: sortedValues(domains),
      bundles: sortedValues(bundles)
    }, { allowTrustedSources: true });
  }
  function loadSnapshot(value = {}) {
    const normalized = normalizeRegistrySnapshot(value, { allowTrustedSources: true });
    kits = new Map(normalized.kits.map((record) => [record.id, record]));
    domains = new Map(normalized.domains.map((record) => [record.id, record]));
    bundles = new Map(normalized.bundles.map((record) => [record.id, record]));
    sources = new Map(normalized.sources.map((record) => [record.registryId, record]));
    revision = normalized.revision;
    protectedIds = new Set([...normalized.domains, ...normalized.kits, ...normalized.bundles].filter((record) => {
      const sourceId = record.sourceRegistryId ?? record.source?.registryId;
      return sources.get(sourceId)?.trusted === true;
    }).map((record) => record.id));
    protectedDomainPaths = new Set(normalized.domains.filter((record) => protectedIds.has(record.id)).map((record) => record.domainPath));
    return snapshot();
  }
  function reset(value = initial) {
    return loadSnapshot(value.schema ? value : configSnapshot(value));
  }

  reset();
  return Object.freeze({
    normalizeKitManifest: (value) => normalizeKitRegistryRecord(value, { defaultSourceId: RUNTIME_SOURCE_ID, allowTrustedSource: false }),
    normalizeDomainManifest: (value) => normalizeDomainRegistryRecord({ ...value, sourceRegistryId: value.sourceRegistryId ?? RUNTIME_SOURCE_ID }),
    normalizeBundleManifest: (value) => normalizeBundleRegistryRecord({ ...value, sourceRegistryId: value.sourceRegistryId ?? RUNTIME_SOURCE_ID }),
    registerKit: (value, options = {}) => register(kits, value, (entry) => normalizeKitRegistryRecord(entry, { defaultSourceId: RUNTIME_SOURCE_ID, allowTrustedSource: false }), "Kit", options.replace === true),
    registerDomain: (value, options = {}) => register(domains, value, (entry) => normalizeDomainRegistryRecord({ ...entry, sourceRegistryId: entry.sourceRegistryId ?? RUNTIME_SOURCE_ID }), "Domain", options.replace === true),
    registerBundle: (value, options = {}) => register(bundles, value, (entry) => normalizeBundleRegistryRecord({ ...entry, sourceRegistryId: entry.sourceRegistryId ?? RUNTIME_SOURCE_ID }), "Bundle", options.replace === true),
    registerRegistry(value = {}, options = {}) {
      if (options.replace === true) throw new TypeError("Imported registries cannot replace existing records.");
      const merged = mergeRegistrySnapshots(snapshot(), value);
      loadSnapshot(merged);
      return { kits: clone(merged.kits), domains: clone(merged.domains), bundles: clone(merged.bundles), snapshot: clone(merged) };
    },
    removeKit(id) { if (protectedIds.has(String(id))) throw new TypeError(`Core kit ${id} cannot be removed.`); const removed = kits.delete(String(id)); if (removed) revision += 1; return removed; },
    removeDomain(id) { if (protectedIds.has(String(id))) throw new TypeError(`Core domain ${id} cannot be removed.`); const removed = domains.delete(String(id)); if (removed) revision += 1; return removed; },
    removeBundle(id) { if (protectedIds.has(String(id))) throw new TypeError(`Core bundle ${id} cannot be removed.`); const removed = bundles.delete(String(id)); if (removed) revision += 1; return removed; },
    getKit: (id) => clone(kits.get(String(id)) ?? null),
    getDomain: (id) => clone(domains.get(String(id)) ?? null),
    getBundle: (id) => clone(bundles.get(String(id)) ?? null),
    listKits: () => sortedValues(kits),
    listDomains: () => sortedValues(domains),
    listBundles: () => sortedValues(bundles),
    listSources: () => [...sources.values()].sort((a, b) => a.registryId.localeCompare(b.registryId)).map(clone),
    findProviders(token) { return sortedValues(kits).filter((kit) => kit.provides.includes(String(token))); },
    findConsumers(token) { return sortedValues(kits).filter((kit) => kit.requires.includes(String(token))); },
    search(query = "") {
      const text = String(query).trim().toLowerCase();
      if (!text) return sortedValues(kits);
      return sortedValues(kits).filter((kit) => [kit.id, kit.domain, kit.domainPath, kit.apiName, ...kit.requires, ...kit.provides].filter(Boolean).some((value) => String(value).toLowerCase().includes(text)));
    },
    getState: snapshot,
    getSnapshot: snapshot,
    snapshot,
    loadSnapshot,
    reset
  });
}

function stronglyConnectedComponents(nodes, edges) {
  let index = 0; const stack = []; const indexes = new Map(); const lowLinks = new Map(); const onStack = new Set(); const components = [];
  function visit(node) {
    indexes.set(node, index); lowLinks.set(node, index); index += 1; stack.push(node); onStack.add(node);
    for (const target of edges.get(node) ?? []) {
      if (!indexes.has(target)) { visit(target); lowLinks.set(node, Math.min(lowLinks.get(node), lowLinks.get(target))); }
      else if (onStack.has(target)) lowLinks.set(node, Math.min(lowLinks.get(node), indexes.get(target)));
    }
    if (lowLinks.get(node) === indexes.get(node)) {
      const component = []; let current;
      do { current = stack.pop(); onStack.delete(current); component.push(current); } while (current !== node);
      components.push(component.sort());
    }
  }
  for (const node of nodes) if (!indexes.has(node)) visit(node);
  return components;
}

export function createCapabilityGraphService(registry) {
  if (!registry?.listKits) throw new TypeError("Capability graph requires a kit registry service.");
  function build() {
    const kits = registry.listKits();
    const byId = new Map(kits.map((kit) => [kit.id, kit]));
    const providers = new Map();
    for (const kit of kits) for (const token of kit.provides) providers.set(token, [...(providers.get(token) ?? []), kit.id].sort());
    const edges = new Map(kits.map((kit) => [kit.id, new Set()]));
    const missing = [];
    for (const kit of kits) {
      for (const token of kit.requires) {
        const candidates = providers.get(token) ?? [];
        if (!candidates.length) { missing.push({ kitId: kit.id, token }); continue; }
        for (const providerId of candidates) if (providerId !== kit.id) edges.get(providerId).add(kit.id);
      }
      for (const composedId of kit.composes) if (byId.has(composedId) && composedId !== kit.id) edges.get(composedId).add(kit.id);
    }
    const nodes = kits.map((kit) => kit.id).sort();
    const components = stronglyConnectedComponents(nodes, edges);
    const cycles = components.filter((component) => component.length > 1 || (component.length === 1 && edges.get(component[0])?.has(component[0])));
    const indegree = new Map(nodes.map((node) => [node, 0]));
    for (const targets of edges.values()) for (const target of targets) indegree.set(target, (indegree.get(target) ?? 0) + 1);
    const queue = nodes.filter((node) => indegree.get(node) === 0).sort(); const order = [];
    while (queue.length) {
      const node = queue.shift(); order.push(node);
      for (const target of [...(edges.get(node) ?? [])].sort()) {
        indegree.set(target, indegree.get(target) - 1);
        if (indegree.get(target) === 0) { queue.push(target); queue.sort(); }
      }
    }
    return {
      schema: "nexusengine.core-composition.capabilities/1",
      revision: registry.getSnapshot().revision,
      nodes,
      edges: Object.fromEntries(nodes.map((node) => [node, [...(edges.get(node) ?? [])].sort()])),
      providers: Object.fromEntries([...providers.entries()].sort(([a], [b]) => a.localeCompare(b))),
      missing: missing.sort((a, b) => a.kitId.localeCompare(b.kitId) || a.token.localeCompare(b.token)),
      cycles,
      order,
      valid: missing.length === 0 && cycles.length === 0 && order.length === nodes.length
    };
  }
  return Object.freeze({
    build,
    getState: build,
    getSnapshot: build,
    snapshot: build,
    providersFor(token) { return clone(build().providers[String(token)] ?? []); },
    explainKit(id) {
      const kit = registry.getKit(id); if (!kit) return null;
      const graph = build();
      return { kit, dependencies: kit.requires.map((token) => ({ token, providers: graph.providers[token] ?? [] })), dependents: Object.entries(graph.edges).filter(([, targets]) => targets.includes(kit.id)).map(([source]) => source).sort(), missing: graph.missing.filter((entry) => entry.kitId === kit.id) };
    }
  });
}

export function createCompositionPlanningService(registry, capabilities) {
  if (!registry?.getKit || !capabilities?.build) throw new TypeError("Composition planning requires registry and capability graph services.");
  function requestedKitIds(request = {}) {
    const selected = new Set(asList(request.kits).map(String));
    for (const domainId of asList(request.domains)) {
      const domain = registry.getDomain(domainId); if (!domain) throw new RangeError(`Unknown composition domain: ${domainId}`);
      for (const kit of registry.listKits()) {
        if (kit.domainPath === domain.domainPath || kit.domainPath.startsWith(`${domain.domainPath}:`)) selected.add(kit.id);
      }
    }
    for (const bundleId of asList(request.bundles)) {
      const bundle = registry.getBundle(bundleId); if (!bundle) throw new RangeError(`Unknown composition bundle: ${bundleId}`);
      for (const kitId of bundle.kits) selected.add(kitId);
      for (const domainId of bundle.domains) {
        const domain = registry.getDomain(domainId); if (!domain) throw new RangeError(`Bundle ${bundleId} references unknown domain ${domainId}.`);
        for (const kit of registry.listKits()) {
          if (kit.domainPath === domain.domainPath || kit.domainPath.startsWith(`${domain.domainPath}:`)) selected.add(kit.id);
        }
      }
    }
    return [...selected].sort();
  }
  function plan(request = {}, options = {}) {
    const graph = capabilities.build(); const selected = new Set(requestedKitIds(request)); const missing = []; const rejected = [];
    const allowedStatuses = options.allowedStatuses == null ? null : new Set(asList(options.allowedStatuses).map(String));
    let changed = true;
    while (changed) {
      changed = false;
      for (const kitId of [...selected].sort()) {
        const kit = registry.getKit(kitId);
        if (!kit) { missing.push({ kitId, reason: "unknown-kit" }); continue; }
        if (allowedStatuses && !allowedStatuses.has(kit.status)) rejected.push({ kitId, status: kit.status, reason: "status-not-allowed" });
        for (const token of kit.requires) {
          const candidates = graph.providers[token] ?? [];
          const providerId = candidates.find((candidate) => selected.has(candidate)) ?? candidates[0];
          if (!providerId) missing.push({ kitId, token, reason: "missing-provider" });
          else if (!selected.has(providerId)) { selected.add(providerId); changed = true; }
        }
        for (const composedId of kit.composes) {
          if (!registry.getKit(composedId)) missing.push({ kitId, composedId, reason: "unknown-composed-kit" });
          else if (!selected.has(composedId)) { selected.add(composedId); changed = true; }
        }
      }
    }
    const selectedIds = [...selected].sort();
    const ordered = graph.order.filter((id) => selected.has(id));
    const unresolvedOrder = selectedIds.filter((id) => !ordered.includes(id));
    const cycles = graph.cycles.filter((cycle) => cycle.some((id) => selected.has(id)));
    const dedupe = (entries) => [...new Map(entries.map((entry) => [JSON.stringify(entry), entry])).values()];
    const result = { schema: "nexusengine.core-composition.plan/1", requested: requestedKitIds(request), selected: selectedIds, order: [...ordered, ...unresolvedOrder], missing: dedupe(missing), rejected: dedupe(rejected), cycles, ok: missing.length === 0 && rejected.length === 0 && cycles.length === 0 };
    return Object.freeze(clone(result));
  }
  return Object.freeze({
    plan,
    planTree(tree, options = {}) { return planCompositionTree(tree, registry, options); },
    validate(request = {}, options = {}) {
      const result = plan(request, options);
      if (!result.ok && options.throwOnError === true) throw new Error(`Composition plan rejected: ${JSON.stringify({ missing: result.missing, rejected: result.rejected, cycles: result.cycles })}`);
      return result;
    },
    getSnapshot(request = {}, options = {}) { return plan(request, options); }
  });
}

export function createCompositionHealthService(registry, capabilities) {
  return Object.freeze({
    getSnapshot() {
      const graph = capabilities.build(); const registrySnapshot = registry.getSnapshot(); const statusCounts = {};
      for (const kit of registrySnapshot.kits) statusCounts[kit.status] = (statusCounts[kit.status] ?? 0) + 1;
      return { schema: "nexusengine.core-composition.health/1", revision: registrySnapshot.revision, kits: registrySnapshot.kits.length, domains: registrySnapshot.domains.length, bundles: registrySnapshot.bundles.length, statusCounts, missingDependencies: graph.missing.length, cycles: graph.cycles.length, healthy: graph.valid };
    }
  });
}
