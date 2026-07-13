const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const unique = (values) => [...new Set(values)];

function stableId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function sameValue(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

function normalizeKitManifest(input = {}) {
  const id = stableId(input.id, "Kit manifest");
  const domain = String(input.domain ?? id.replace(/-(domain-)?kit$/, "")).trim() || id;
  return Object.freeze({
    id,
    version: String(input.version ?? "0.0.0"),
    status: String(input.status ?? input.stability ?? "experimental"),
    kind: String(input.kind ?? input.type ?? "domain-service-kit"),
    domain,
    domainPath: String(input.domainPath ?? `n:${domain}`),
    apiName: input.apiName == null ? null : String(input.apiName),
    requires: Object.freeze(unique(asList(input.requires).map(String)).sort()),
    provides: Object.freeze(unique(asList(input.provides).map(String)).sort()),
    composes: Object.freeze(unique(asList(input.composes ?? input.children).map(String)).sort()),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

function normalizeDomainManifest(input = {}) {
  const id = stableId(input.id, "Domain manifest");
  return Object.freeze({ id, label: String(input.label ?? id), domainPath: String(input.domainPath ?? `n:${id}`), kits: Object.freeze(unique(asList(input.kits).map(String)).sort()), metadata: Object.freeze(clone(input.metadata ?? {})) });
}

function normalizeBundleManifest(input = {}) {
  const id = stableId(input.id, "Bundle manifest");
  return Object.freeze({ id, label: String(input.label ?? id), domains: Object.freeze(unique(asList(input.domains).map(String)).sort()), kits: Object.freeze(unique(asList(input.kits).map(String)).sort()), metadata: Object.freeze(clone(input.metadata ?? {})) });
}

export function createKitRegistryService(config = {}) {
  const initial = { kits: asList(config.kits).map(normalizeKitManifest), domains: asList(config.domains).map(normalizeDomainManifest), bundles: asList(config.bundles).map(normalizeBundleManifest) };
  let kits = new Map(); let domains = new Map(); let bundles = new Map(); let revision = 0;

  function register(map, value, normalize, label, replace = false) {
    const normalized = normalize(value);
    const existing = map.get(normalized.id);
    if (existing && sameValue(existing, normalized)) return clone(existing);
    if (existing && !replace) throw new TypeError(`${label} id collision: ${normalized.id}`);
    map.set(normalized.id, normalized); revision += 1; return clone(normalized);
  }
  function sortedValues(map) { return [...map.values()].sort((left, right) => left.id.localeCompare(right.id)).map(clone); }
  function snapshot() { return { schema: "nexusengine.core-composition.registry/1", revision, kits: sortedValues(kits), domains: sortedValues(domains), bundles: sortedValues(bundles) }; }
  function loadSnapshot(value = {}) {
    if (value.schema !== "nexusengine.core-composition.registry/1") throw new TypeError("Unsupported Core Composition registry snapshot.");
    kits = new Map(); domains = new Map(); bundles = new Map();
    for (const kit of asList(value.kits)) register(kits, kit, normalizeKitManifest, "Kit", true);
    for (const domain of asList(value.domains)) register(domains, domain, normalizeDomainManifest, "Domain", true);
    for (const bundle of asList(value.bundles)) register(bundles, bundle, normalizeBundleManifest, "Bundle", true);
    revision = Math.max(0, Number(value.revision ?? revision)); return snapshot();
  }
  function reset(value = initial) {
    kits = new Map(); domains = new Map(); bundles = new Map(); revision = 0;
    for (const kit of asList(value.kits)) register(kits, kit, normalizeKitManifest, "Kit", true);
    for (const domain of asList(value.domains)) register(domains, domain, normalizeDomainManifest, "Domain", true);
    for (const bundle of asList(value.bundles)) register(bundles, bundle, normalizeBundleManifest, "Bundle", true);
    return snapshot();
  }

  reset();
  return Object.freeze({
    normalizeKitManifest,
    normalizeDomainManifest,
    normalizeBundleManifest,
    registerKit: (value, options = {}) => register(kits, value, normalizeKitManifest, "Kit", options.replace === true),
    registerDomain: (value, options = {}) => register(domains, value, normalizeDomainManifest, "Domain", options.replace === true),
    registerBundle: (value, options = {}) => register(bundles, value, normalizeBundleManifest, "Bundle", options.replace === true),
    registerRegistry(value = {}, options = {}) {
      const results = { kits: [], domains: [], bundles: [] };
      for (const kit of asList(value.kits)) results.kits.push(register(kits, kit, normalizeKitManifest, "Kit", options.replace === true));
      for (const domain of asList(value.domains)) results.domains.push(register(domains, domain, normalizeDomainManifest, "Domain", options.replace === true));
      for (const bundle of asList(value.bundles)) results.bundles.push(register(bundles, bundle, normalizeBundleManifest, "Bundle", options.replace === true));
      return results;
    },
    removeKit(id) { const removed = kits.delete(String(id)); if (removed) revision += 1; return removed; },
    removeDomain(id) { const removed = domains.delete(String(id)); if (removed) revision += 1; return removed; },
    removeBundle(id) { const removed = bundles.delete(String(id)); if (removed) revision += 1; return removed; },
    getKit: (id) => clone(kits.get(String(id)) ?? null),
    getDomain: (id) => clone(domains.get(String(id)) ?? null),
    getBundle: (id) => clone(bundles.get(String(id)) ?? null),
    listKits: () => sortedValues(kits),
    listDomains: () => sortedValues(domains),
    listBundles: () => sortedValues(bundles),
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
      for (const kitId of domain.kits) selected.add(kitId);
    }
    for (const bundleId of asList(request.bundles)) {
      const bundle = registry.getBundle(bundleId); if (!bundle) throw new RangeError(`Unknown composition bundle: ${bundleId}`);
      for (const kitId of bundle.kits) selected.add(kitId);
      for (const domainId of bundle.domains) {
        const domain = registry.getDomain(domainId); if (!domain) throw new RangeError(`Bundle ${bundleId} references unknown domain ${domainId}.`);
        for (const kitId of domain.kits) selected.add(kitId);
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
