export const NEXUS_COMPUTE_BUFFER_SCHEMA = "nexus-compute-buffer/1";
export const NEXUS_COMPUTE_KERNEL_SCHEMA = "nexus-compute-kernel/1";
export const NEXUS_COMPUTE_GRAPH_SCHEMA = "nexus-compute-graph/1";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function integer(value, fallback, label, minimum = 0) {
  const next = Number(value ?? fallback);
  if (!Number.isInteger(next) || next < minimum) {
    throw new TypeError(`${label} must be an integer greater than or equal to ${minimum}.`);
  }
  return next;
}

function stringList(value = [], label = "values") {
  const list = value == null ? [] : Array.isArray(value) ? value : [value];
  return Array.from(new Set(list.map((entry) => text(entry, null, label))));
}

function dispatch(value = {}) {
  const source = Array.isArray(value) ? { x: value[0], y: value[1], z: value[2] } : value;
  return {
    x: integer(source?.x, 1, "dispatch.x", 1),
    y: integer(source?.y, 1, "dispatch.y", 1),
    z: integer(source?.z, 1, "dispatch.z", 1)
  };
}

function registryHas(registry, type, id) {
  const source = registry?.[type];
  if (!source) return true;
  if (source instanceof Map) return source.has(id);
  if (Array.isArray(source)) return source.some((entry) => String(entry?.id) === id);
  return Object.prototype.hasOwnProperty.call(source, id);
}

export function createComputeBufferDescriptor(input = {}) {
  return Object.freeze({
    schema: NEXUS_COMPUTE_BUFFER_SCHEMA,
    id: text(input.id, null, "compute buffer id"),
    byteLength: integer(input.byteLength, 0, "compute buffer byteLength"),
    stride: integer(input.stride, 0, "compute buffer stride"),
    elementCount: integer(input.elementCount, 0, "compute buffer elementCount"),
    usage: Object.freeze(stringList(input.usage ?? ["storage"], "compute buffer usage")),
    initialData: clone(input.initialData ?? null),
    metadata: clone(input.metadata ?? {})
  });
}

export function createComputeKernelDescriptor(input = {}) {
  const workgroupSize = dispatch(input.workgroupSize ?? input.workgroup ?? {});
  return Object.freeze({
    schema: NEXUS_COMPUTE_KERNEL_SCHEMA,
    id: text(input.id, null, "compute kernel id"),
    entryPoint: text(input.entryPoint, "main", "compute kernel entryPoint"),
    language: text(input.language, "provider", "compute kernel language"),
    workgroupSize: Object.freeze(workgroupSize),
    metadata: clone(input.metadata ?? {})
  });
}

function normalizeNode(input = {}, index = 0) {
  return Object.freeze({
    id: text(input.id, `node-${index}`, "compute graph node id"),
    kernelId: text(input.kernelId, null, "compute graph node kernelId"),
    dependsOn: Object.freeze(stringList(input.dependsOn, "compute graph dependency")),
    reads: Object.freeze(stringList(input.reads, "compute graph read buffer")),
    writes: Object.freeze(stringList(input.writes, "compute graph write buffer")),
    dispatch: Object.freeze(dispatch(input.dispatch)),
    metadata: clone(input.metadata ?? {})
  });
}

export function orderComputeGraphNodes(nodes = []) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));

  for (const node of nodes) {
    for (const dependency of node.dependsOn) {
      if (!byId.has(dependency)) throw new TypeError(`Compute graph node ${node.id} depends on missing node ${dependency}.`);
      indegree.set(node.id, indegree.get(node.id) + 1);
      outgoing.get(dependency).push(node.id);
    }
  }

  const ready = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id).sort();
  const order = [];
  while (ready.length) {
    const id = ready.shift();
    order.push(id);
    for (const nextId of outgoing.get(id).slice().sort()) {
      indegree.set(nextId, indegree.get(nextId) - 1);
      if (indegree.get(nextId) === 0) {
        ready.push(nextId);
        ready.sort();
      }
    }
  }

  if (order.length !== nodes.length) throw new TypeError("Compute graph contains a dependency cycle.");
  return order;
}

export function createComputeGraphDescriptor(input = {}, registry = {}) {
  const nodes = (input.nodes ?? []).map(normalizeNode);
  if (!nodes.length) throw new TypeError("Compute graph requires at least one node.");
  const ids = new Set();
  for (const node of nodes) {
    if (ids.has(node.id)) throw new TypeError(`Duplicate compute graph node id: ${node.id}.`);
    ids.add(node.id);
    if (!registryHas(registry, "kernels", node.kernelId)) {
      throw new TypeError(`Compute graph node ${node.id} references missing kernel ${node.kernelId}.`);
    }
    for (const bufferId of [...node.reads, ...node.writes]) {
      if (!registryHas(registry, "buffers", bufferId)) {
        throw new TypeError(`Compute graph node ${node.id} references missing buffer ${bufferId}.`);
      }
    }
  }
  const executionOrder = orderComputeGraphNodes(nodes);
  return Object.freeze({
    schema: NEXUS_COMPUTE_GRAPH_SCHEMA,
    id: text(input.id, null, "compute graph id"),
    nodes: Object.freeze(nodes),
    executionOrder: Object.freeze(executionOrder),
    metadata: clone(input.metadata ?? {})
  });
}

export function validateComputeGraphDescriptor(value, registry = {}) {
  const errors = [];
  try {
    createComputeGraphDescriptor(value, registry);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}
