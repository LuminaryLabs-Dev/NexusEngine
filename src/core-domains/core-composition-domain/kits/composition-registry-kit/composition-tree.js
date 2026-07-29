import { normalizeRegistrySnapshot } from "./registry.js";

export const COMPOSITION_TREE_SCHEMA = "nexusengine.composition-tree/1";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

function stableId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function registrySnapshot(value) {
  const snapshot = typeof value?.getSnapshot === "function" ? value.getSnapshot() : value;
  return normalizeRegistrySnapshot(snapshot, { allowTrustedSources: true });
}

function normalizeNode(input = {}, index = 0) {
  if (!isObject(input)) throw new TypeError(`Composition node ${index} must be an object.`);
  const kind = String(input.kind ?? "");
  if (kind !== "domain" && kind !== "kit") throw new TypeError(`Composition node ${input.id ?? index} has invalid kind ${kind}.`);
  return Object.freeze({
    id: stableId(input.id, `Composition node ${index}`),
    kind,
    registryId: stableId(input.registryId, `Composition node ${input.id ?? index} registryId`),
    parentNodeId: input.parentNodeId == null ? null : stableId(input.parentNodeId, `Composition node ${input.id ?? index} parentNodeId`),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : index,
    enabled: input.enabled !== false,
    labelOverride: input.labelOverride == null ? null : String(input.labelOverride),
    config: Object.freeze(clone(input.config ?? {}))
  });
}

export function normalizeCompositionTree(input = {}) {
  if (!isObject(input)) throw new TypeError("normalizeCompositionTree expects an object.");
  if (input.schema !== undefined && input.schema !== COMPOSITION_TREE_SCHEMA) throw new TypeError("Unsupported composition-tree schema.");
  const nodes = asList(input.nodes).map(normalizeNode);
  const rootNodeId = input.rootNodeId ?? nodes.find((node) => node.parentNodeId === null)?.id;
  return Object.freeze({
    schema: COMPOSITION_TREE_SCHEMA,
    id: stableId(input.id ?? "composition", "Composition tree"),
    revision: Math.max(0, Number(input.revision ?? 1)),
    registryHash: String(input.registryHash ?? ""),
    rootNodeId: stableId(rootNodeId, "Composition rootNodeId"),
    nodes: Object.freeze(nodes.map((node) => Object.freeze(clone(node))))
  });
}

function issue(code, nodeId, message, details = {}) {
  return Object.freeze({ code, nodeId: nodeId ?? null, message, ...clone(details) });
}

function valueTypeMatches(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isObject(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "null") return value === null;
  return typeof value === type;
}

function validateSchemaValue(value, schema = {}, path = "config") {
  const errors = [];
  const types = asList(schema.type).filter(Boolean);
  if (types.length && !types.some((type) => valueTypeMatches(value, type))) {
    return [{ path, code: "type", expected: types, actual: Array.isArray(value) ? "array" : value === null ? "null" : typeof value }];
  }
  if (schema.enum && !schema.enum.some((entry) => JSON.stringify(entry) === JSON.stringify(value))) errors.push({ path, code: "enum", allowed: clone(schema.enum) });
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push({ path, code: "minimum", minimum: schema.minimum });
    if (schema.maximum !== undefined && value > schema.maximum) errors.push({ path, code: "maximum", maximum: schema.maximum });
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push({ path, code: "minLength", minLength: schema.minLength });
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push({ path, code: "maxLength", maxLength: schema.maxLength });
    if (schema.pattern !== undefined && !(new RegExp(schema.pattern)).test(value)) errors.push({ path, code: "pattern", pattern: schema.pattern });
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push({ path, code: "minItems", minItems: schema.minItems });
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push({ path, code: "maxItems", maxItems: schema.maxItems });
    if (schema.items) value.forEach((entry, index) => errors.push(...validateSchemaValue(entry, schema.items, `${path}[${index}]`)));
  }
  if (isObject(value)) {
    const properties = schema.properties ?? {};
    for (const required of asList(schema.required)) if (!(required in value)) errors.push({ path: `${path}.${required}`, code: "required" });
    for (const [key, entry] of Object.entries(value)) {
      if (properties[key]) errors.push(...validateSchemaValue(entry, properties[key], `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push({ path: `${path}.${key}`, code: "additionalProperties" });
      else if (isObject(schema.additionalProperties)) errors.push(...validateSchemaValue(entry, schema.additionalProperties, `${path}.${key}`));
    }
  }
  return errors;
}

function topology(tree) {
  const byId = new Map();
  const children = new Map();
  const errors = [];
  for (const node of tree.nodes) {
    if (byId.has(node.id)) errors.push(issue("duplicate-node-id", node.id, `Duplicate composition node id ${node.id}.`));
    else byId.set(node.id, node);
  }
  const roots = tree.nodes.filter((node) => node.parentNodeId === null);
  if (roots.length !== 1) errors.push(issue("root-count", null, `Composition requires exactly one root; found ${roots.length}.`));
  if (!byId.has(tree.rootNodeId)) errors.push(issue("missing-root", tree.rootNodeId, `Root node ${tree.rootNodeId} does not exist.`));
  else if (byId.get(tree.rootNodeId).parentNodeId !== null) errors.push(issue("root-has-parent", tree.rootNodeId, "The root node cannot have a parent."));
  if (roots.length === 1 && roots[0].id !== tree.rootNodeId) errors.push(issue("root-mismatch", tree.rootNodeId, `rootNodeId does not identify the only root ${roots[0].id}.`));
  for (const node of tree.nodes) {
    if (node.parentNodeId !== null && !byId.has(node.parentNodeId)) errors.push(issue("orphan-node", node.id, `Node ${node.id} references missing parent ${node.parentNodeId}.`));
    if (node.parentNodeId !== null) children.set(node.parentNodeId, [...(children.get(node.parentNodeId) ?? []), node]);
  }
  const colors = new Map();
  function visit(node) {
    if (colors.get(node.id) === "gray") { errors.push(issue("node-cycle", node.id, `Composition contains a cycle at ${node.id}.`)); return; }
    if (colors.get(node.id) === "black") return;
    colors.set(node.id, "gray");
    for (const child of children.get(node.id) ?? []) visit(child);
    colors.set(node.id, "black");
  }
  for (const node of tree.nodes) visit(node);
  for (const list of children.values()) list.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  return { byId, children, roots, errors };
}

function dependencyGraph(activeKitNodes, kitById) {
  const errors = [];
  const byRegistryId = new Map(activeKitNodes.map((node) => [node.registryId, node]));
  const providers = new Map();
  for (const node of activeKitNodes) {
    const kit = kitById.get(node.registryId);
    for (const token of kit?.provides ?? []) providers.set(token, [...(providers.get(token) ?? []), node].sort((a, b) => a.id.localeCompare(b.id)));
  }
  const edges = new Map(activeKitNodes.map((node) => [node.id, new Set()]));
  for (const node of activeKitNodes) {
    const kit = kitById.get(node.registryId);
    for (const token of kit?.requires ?? []) {
      const provider = (providers.get(token) ?? [])[0];
      if (!provider) errors.push(issue("missing-capability", node.id, `Kit ${node.registryId} requires unavailable capability ${token}.`, { token }));
      else if (provider.id !== node.id) edges.get(provider.id).add(node.id);
    }
    for (const composedId of kit?.composes ?? []) {
      const child = byRegistryId.get(composedId);
      if (!child) errors.push(issue("missing-composed-kit", node.id, `Kit ${node.registryId} composes missing kit ${composedId}.`, { registryId: composedId }));
      else if (child.id !== node.id) edges.get(child.id).add(node.id);
    }
  }
  const indegree = new Map(activeKitNodes.map((node) => [node.id, 0]));
  for (const targets of edges.values()) for (const target of targets) indegree.set(target, indegree.get(target) + 1);
  const queue = activeKitNodes.filter((node) => indegree.get(node.id) === 0).sort((a, b) => a.registryId.localeCompare(b.registryId) || a.id.localeCompare(b.id));
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node.id);
    for (const target of [...edges.get(node.id)].sort()) {
      indegree.set(target, indegree.get(target) - 1);
      if (indegree.get(target) === 0) {
        queue.push(activeKitNodes.find((entry) => entry.id === target));
        queue.sort((a, b) => a.registryId.localeCompare(b.registryId) || a.id.localeCompare(b.id));
      }
    }
  }
  const cyclic = activeKitNodes.map((node) => node.id).filter((id) => !order.includes(id)).sort();
  if (cyclic.length) errors.push(issue("dependency-cycle", cyclic[0], `Kit dependency cycle includes ${cyclic.join(", ")}.`, { nodeIds: cyclic }));
  return { providers, edges, order: [...order, ...cyclic], errors };
}

function effectiveEnabled(node, byId) {
  let current = node;
  const visited = new Set();
  while (current) {
    if (!current.enabled) return false;
    if (visited.has(current.id)) return false;
    visited.add(current.id);
    current = current.parentNodeId == null ? null : byId.get(current.parentNodeId);
  }
  return true;
}

export function validateCompositionTree(input, registry) {
  let tree;
  let snapshot;
  try {
    tree = normalizeCompositionTree(input);
    snapshot = registrySnapshot(registry);
  } catch (error) {
    return Object.freeze({
      schema: "nexusengine.composition-tree-validation/1",
      ok: false,
      errors: [issue("normalization-failed", null, error.message)],
      warnings: [],
      tree: null,
      registryHash: null
    });
  }
  const graph = topology(tree);
  const errors = [...graph.errors];
  const warnings = [];
  const domains = new Map(snapshot.domains.map((record) => [record.id, record]));
  const kits = new Map(snapshot.kits.map((record) => [record.id, record]));
  const placedKits = new Map();
  if (tree.registryHash && tree.registryHash !== snapshot.contentHash) errors.push(issue("registry-hash-mismatch", null, "Composition registryHash does not match the active registry.", { expected: snapshot.contentHash, actual: tree.registryHash }));
  if (!tree.registryHash) warnings.push(issue("registry-hash-missing", null, "Composition has no registryHash and should be re-applied."));
  for (const node of tree.nodes) {
    const record = node.kind === "domain" ? domains.get(node.registryId) : kits.get(node.registryId);
    if (!record) { errors.push(issue("unknown-registry-reference", node.id, `Unknown ${node.kind} registry reference ${node.registryId}.`)); continue; }
    const parent = node.parentNodeId == null ? null : graph.byId.get(node.parentNodeId);
    const parentRecord = parent?.kind === "domain" ? domains.get(parent.registryId) : null;
    if (node.kind === "kit") {
      if ((graph.children.get(node.id) ?? []).length) errors.push(issue("kit-has-children", node.id, `Kit node ${node.id} cannot contain children.`));
      if (placedKits.has(node.registryId)) errors.push(issue("duplicate-kit-placement", node.id, `Kit ${node.registryId} is already placed at ${placedKits.get(node.registryId)}.`));
      else placedKits.set(node.registryId, node.id);
      if (!parent || parent.kind !== "domain" || parentRecord?.domainPath !== record.domainPath) {
        errors.push(issue("kit-boundary-mismatch", node.id, `Kit ${record.id} must be attached directly to its owning domain ${record.domainPath}.`, { domainPath: record.domainPath }));
      }
      if (["unsupported", "retired", "blocked"].includes(record.status)) errors.push(issue("unsupported-kit-status", node.id, `Kit ${record.id} has unsupported status ${record.status}.`, { status: record.status }));
    } else {
      if (node.id === tree.rootNodeId) {
        if (node.parentNodeId !== null) errors.push(issue("root-domain-parent", node.id, "Root domain cannot have a parent."));
      } else if (!parent || parent.kind !== "domain") {
        errors.push(issue("domain-parent-kind", node.id, `Domain ${record.id} must be nested under a domain.`));
      } else if (record.parentDomainPath) {
        if (parentRecord?.domainPath !== record.parentDomainPath) errors.push(issue("domain-boundary-mismatch", node.id, `Domain ${record.domainPath} requires parent ${record.parentDomainPath}.`, { parentDomainPath: record.parentDomainPath }));
      } else if (parent.id !== tree.rootNodeId) {
        errors.push(issue("top-level-domain-nesting", node.id, `Top-level domain ${record.domainPath} may only be placed below the composition root.`));
      }
      const responsibilities = record.ownedMeaning.join(" ").toLowerCase();
      const forbiddenTerms = ["browser", "dom ", "renderer implementation", "gpu device", "host process"];
      const privileged = ["host-domain", "renderer-domain", "adapter-boundary"].includes(record.metadata?.kind) || record.metadata?.hostBoundary === true;
      if (!privileged && forbiddenTerms.some((term) => responsibilities.includes(term))) errors.push(issue("forbidden-domain-responsibility", node.id, `Reusable domain ${record.id} assigns host, browser, renderer, or GPU responsibility to itself.`));
    }
    for (const configError of validateSchemaValue(node.config, record.settingsSchema)) {
      errors.push(issue("invalid-node-config", node.id, `Configuration for ${record.id} is invalid at ${configError.path}.`, { validation: configError }));
    }
  }
  const activeKits = tree.nodes.filter((node) => node.kind === "kit" && kits.has(node.registryId) && effectiveEnabled(node, graph.byId));
  const dependencies = dependencyGraph(activeKits, kits);
  errors.push(...dependencies.errors);
  return Object.freeze({
    schema: "nexusengine.composition-tree-validation/1",
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    tree,
    registryHash: snapshot.contentHash,
    activeKitNodeIds: Object.freeze(activeKits.map((node) => node.id).sort()),
    installOrderNodeIds: Object.freeze(dependencies.order)
  });
}

function descendantsOf(nodeId, children) {
  const result = [];
  const queue = [...(children.get(nodeId) ?? [])];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    queue.push(...(children.get(node.id) ?? []));
  }
  return result;
}

export function planCompositionTree(input, registry, options = {}) {
  const validation = validateCompositionTree(input, registry);
  if (!validation.ok) return Object.freeze({
    schema: "nexusengine.composition-tree-plan/1",
    ok: false,
    scopeNodeId: options.scopeNodeId ?? input?.rootNodeId ?? null,
    errors: validation.errors,
    warnings: validation.warnings,
    order: [],
    selectedNodeIds: []
  });
  const tree = validation.tree;
  const snapshot = registrySnapshot(registry);
  const kits = new Map(snapshot.kits.map((record) => [record.id, record]));
  const graph = topology(tree);
  const scopeNodeId = options.scopeNodeId ?? tree.rootNodeId;
  const scope = graph.byId.get(scopeNodeId);
  if (!scope) return Object.freeze({ schema: "nexusengine.composition-tree-plan/1", ok: false, scopeNodeId, errors: [issue("unknown-scope", scopeNodeId, `Unknown composition scope ${scopeNodeId}.`)], warnings: [], order: [], selectedNodeIds: [] });
  if (!effectiveEnabled(scope, graph.byId)) return Object.freeze({ schema: "nexusengine.composition-tree-plan/1", ok: false, scopeNodeId, errors: [issue("disabled-scope", scopeNodeId, `Composition scope ${scopeNodeId} is disabled.`)], warnings: [], order: [], selectedNodeIds: [] });
  const activeKits = tree.nodes.filter((node) => node.kind === "kit" && effectiveEnabled(node, graph.byId));
  const allByRegistryId = new Map(activeKits.map((node) => [node.registryId, node]));
  const providers = new Map();
  for (const node of activeKits) for (const token of kits.get(node.registryId).provides) providers.set(token, [...(providers.get(token) ?? []), node].sort((a, b) => a.id.localeCompare(b.id)));
  const selected = new Map();
  const scopedNodes = scope.kind === "kit" ? [scope] : descendantsOf(scope.id, graph.children).filter((node) => node.kind === "kit");
  for (const node of scopedNodes) if (effectiveEnabled(node, graph.byId)) selected.set(node.id, node);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of [...selected.values()]) {
      const kit = kits.get(node.registryId);
      for (const token of kit.requires) {
        const provider = (providers.get(token) ?? [])[0];
        if (provider && !selected.has(provider.id)) { selected.set(provider.id, provider); changed = true; }
      }
      for (const composedId of kit.composes) {
        const composed = allByRegistryId.get(composedId);
        if (composed && !selected.has(composed.id)) { selected.set(composed.id, composed); changed = true; }
      }
    }
  }
  const dependencyPlan = dependencyGraph([...selected.values()], kits);
  const orderedNodes = dependencyPlan.order.map((id) => selected.get(id)).filter(Boolean);
  const order = orderedNodes.map((node, index) => {
    const kit = kits.get(node.registryId);
    return Object.freeze({
      index,
      nodeId: node.id,
      registryId: kit.id,
      domainPath: kit.domainPath,
      apiName: kit.apiName,
      config: Object.freeze({ ...clone(kit.defaults), ...clone(node.config) }),
      source: Object.freeze(clone(kit.source)),
      trustedProvider: kit.source.trusted === true && Boolean(kit.source.exportName),
      preview: kit.preview == null ? null : Object.freeze(clone(kit.preview))
    });
  });
  return Object.freeze({
    schema: "nexusengine.composition-tree-plan/1",
    ok: dependencyPlan.errors.length === 0,
    scopeNodeId,
    scopeKind: scope.kind,
    registryHash: snapshot.contentHash,
    selectedNodeIds: Object.freeze([...selected.keys()].sort()),
    order: Object.freeze(order),
    errors: Object.freeze(dependencyPlan.errors),
    warnings: validation.warnings
  });
}

export function createCompositionHierarchyService(registry) {
  return Object.freeze({
    normalize: normalizeCompositionTree,
    validate: (tree) => validateCompositionTree(tree, registry),
    plan: (tree, options = {}) => planCompositionTree(tree, registry, options),
    children(tree, nodeId) {
      const normalized = normalizeCompositionTree(tree);
      return normalized.nodes.filter((node) => node.parentNodeId === nodeId).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    },
    getSnapshot(tree) { return normalizeCompositionTree(tree); }
  });
}
