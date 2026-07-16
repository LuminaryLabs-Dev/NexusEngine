const clone = (value) => value === undefined ? undefined : structuredClone(value);

function stableId(value, fallback, label) {
  const id = String(value ?? fallback ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  return id;
}

function positiveInteger(value, fallback, label) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1) throw new TypeError(`${label} must be a positive integer.`);
  return number;
}

function vector3(value, fallback = [0, 0, 0]) {
  const source = Array.isArray(value) ? value : [value?.x, value?.y, value?.z];
  return [0, 1, 2].map((index) => Number.isFinite(Number(source[index])) ? Number(source[index]) : Number(fallback[index] ?? 0));
}

function normalizeInstance(input = {}, cellId, index) {
  const matrix = Array.isArray(input.matrix) && input.matrix.length === 16 ? input.matrix.map(Number) : null;
  if (matrix && matrix.some((value) => !Number.isFinite(value))) throw new TypeError("Instance matrices require 16 finite values.");
  const position = vector3(input.position ?? (matrix ? [matrix[12], matrix[13], matrix[14]] : null));
  const scale = vector3(input.scale, [1, 1, 1]);
  const half = scale.map((value) => Math.abs(value) * 0.5);
  const bounds = input.bounds?.min && input.bounds?.max
    ? { min: vector3(input.bounds.min), max: vector3(input.bounds.max) }
    : { min: position.map((value, axis) => value - half[axis]), max: position.map((value, axis) => value + half[axis]) };
  return {
    id: stableId(input.id, `${cellId}:${index}`, "Instance"),
    cellId,
    matrix,
    position,
    scale,
    bounds,
    metadata: clone(input.metadata ?? {})
  };
}

function unionBounds(instances) {
  if (!instances.length) return null;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const instance of instances) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], instance.bounds.min[axis]);
      max[axis] = Math.max(max[axis], instance.bounds.max[axis]);
    }
  }
  const center = min.map((value, axis) => (value + max[axis]) * 0.5);
  return { min, max, center, radius: Math.hypot(max[0] - center[0], max[1] - center[1], max[2] - center[2]) };
}

function sameInstance(left, right) {
  if (!left || !right || left.id !== right.id) return false;
  return JSON.stringify(left) === JSON.stringify(right);
}

function changedRanges(previous, next, span) {
  const ranges = [];
  let start = null;
  for (let index = 0; index < span; index += 1) {
    const changed = !sameInstance(previous[index], next[index]);
    if (changed && start == null) start = index;
    if (!changed && start != null) { ranges.push({ start, count: index - start }); start = null; }
  }
  if (start != null) ranges.push({ start, count: span - start });
  return ranges;
}

function flattenCells(record) {
  return [...record.cells.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([, instances]) => instances);
}

function createBatchRecord(options = {}) {
  return {
    id: stableId(options.id, null, "Instance batch"),
    assetId: stableId(options.assetId, options.id, "Instance batch asset"),
    materialId: options.materialId == null ? null : String(options.materialId),
    capacity: positiveInteger(options.capacity, 1, "Instance batch capacity"),
    updateMode: options.updateMode === "full" ? "full" : "incremental",
    metadata: clone(options.metadata ?? {}),
    cells: new Map(),
    previousInstances: [],
    releasedInstanceIds: new Set(),
    revision: 0,
    dirty: true,
    lastFlush: null
  };
}

function descriptor(record) {
  const requested = flattenCells(record);
  return Object.freeze({
    kind: "instance-batch",
    id: record.id,
    assetId: record.assetId,
    materialId: record.materialId,
    capacity: record.capacity,
    updateMode: record.updateMode,
    revision: record.revision,
    requestedCount: requested.length,
    activeCount: Math.min(record.capacity, requested.length),
    overflowCount: Math.max(0, requested.length - record.capacity),
    cellIds: Object.freeze([...record.cells.keys()].sort()),
    bounds: clone(unionBounds(requested.slice(0, record.capacity))),
    metadata: clone(record.metadata)
  });
}

export function createInstanceBatchService(config = {}) {
  const initialBatches = Array.isArray(config.batches) ? config.batches : [];
  let batches = new Map();

  function createBatch(options = {}) {
    const id = stableId(options.id, null, "Instance batch");
    const existing = batches.get(id);
    if (existing && options.replace !== true) return descriptor(existing);
    const record = createBatchRecord(options);
    batches.set(record.id, record);
    return descriptor(record);
  }

  function requireBatch(batchId) {
    const record = batches.get(stableId(batchId, null, "Instance batch"));
    if (!record) throw new RangeError(`Unknown instance batch: ${batchId}.`);
    return record;
  }

  function replaceCell(batchId, cellIdInput, descriptors = []) {
    const record = requireBatch(batchId);
    const cellId = stableId(cellIdInput, null, "Instance cell");
    if (!Array.isArray(descriptors)) throw new TypeError("replaceCell expects an array of instance descriptors.");
    const next = descriptors.map((entry, index) => normalizeInstance(entry, cellId, index));
    const previous = record.cells.get(cellId) ?? [];
    const nextIds = new Set(next.map((entry) => entry.id));
    for (const instance of previous) if (!nextIds.has(instance.id)) record.releasedInstanceIds.add(instance.id);
    record.cells.set(cellId, next);
    record.revision += 1;
    record.dirty = true;
    return { batchId: record.id, cellId, requestedCount: next.length, descriptor: descriptor(record) };
  }

  function removeCell(batchId, cellIdInput) {
    const record = requireBatch(batchId);
    const cellId = stableId(cellIdInput, null, "Instance cell");
    const previous = record.cells.get(cellId);
    if (!previous) return false;
    for (const instance of previous) record.releasedInstanceIds.add(instance.id);
    record.cells.delete(cellId);
    record.revision += 1;
    record.dirty = true;
    return true;
  }

  function retainCells(batchId, cellIds = []) {
    const record = requireBatch(batchId);
    const keep = new Set(cellIds.map(String));
    for (const cellId of [...record.cells.keys()]) if (!keep.has(cellId)) removeCell(record.id, cellId);
    return descriptor(record);
  }

  function flush(batchId) {
    const record = requireBatch(batchId);
    const requested = flattenCells(record);
    const instances = requested.slice(0, record.capacity);
    const overflowInstances = requested.slice(record.capacity);
    const span = Math.max(record.previousInstances.length, instances.length);
    const ranges = record.dirty ? (record.updateMode === "full" && span > 0 ? [{ start: 0, count: span }] : changedRanges(record.previousInstances, instances, span)) : [];
    const result = {
      schema: "nexusengine.core-graphics.instance-batch-flush/1",
      batchId: record.id,
      revision: record.revision,
      requestedCount: requested.length,
      activeCount: instances.length,
      overflowCount: overflowInstances.length,
      instances: record.updateMode === "full" ? clone(instances) : [],
      writes: ranges.map((range) => ({ ...range, instances: clone(instances.slice(range.start, range.start + range.count)) })),
      changedRanges: clone(ranges),
      releasedInstanceIds: [...record.releasedInstanceIds].sort(),
      bounds: clone(unionBounds(instances)),
      overflowInstances: clone(overflowInstances)
    };
    record.previousInstances = clone(instances);
    record.releasedInstanceIds.clear();
    record.dirty = false;
    record.lastFlush = clone(result);
    return result;
  }

  function getSnapshot() {
    return {
      schema: "nexusengine.core-graphics.instance-batches/1",
      batches: [...batches.values()].sort((a, b) => a.id.localeCompare(b.id)).map((record) => ({
        id: record.id,
        assetId: record.assetId,
        materialId: record.materialId,
        capacity: record.capacity,
        updateMode: record.updateMode,
        metadata: clone(record.metadata),
        revision: record.revision,
        cells: [...record.cells.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cellId, instances]) => ({ cellId, instances: clone(instances) })),
        previousInstances: clone(record.previousInstances),
        lastFlush: clone(record.lastFlush)
      }))
    };
  }

  function loadSnapshot(snapshot = {}) {
    if (snapshot.schema !== "nexusengine.core-graphics.instance-batches/1") throw new TypeError("Unsupported Core Graphics instance-batch snapshot.");
    batches = new Map();
    for (const batch of snapshot.batches ?? []) {
      const record = createBatchRecord(batch);
      record.revision = Math.max(0, Math.floor(Number(batch.revision) || 0));
      for (const cell of batch.cells ?? []) record.cells.set(String(cell.cellId), (cell.instances ?? []).map((entry, index) => normalizeInstance(entry, String(cell.cellId), index)));
      record.previousInstances = clone(batch.previousInstances ?? []);
      record.lastFlush = clone(batch.lastFlush ?? null);
      record.dirty = false;
      batches.set(record.id, record);
    }
    return getSnapshot();
  }

  function reset(payload = {}) {
    batches = new Map();
    for (const batch of payload.batches ?? initialBatches) createBatch(batch);
    return getSnapshot();
  }

  reset();
  return Object.freeze({
    createBatch,
    removeBatch(id) { return batches.delete(String(id)); },
    hasBatch(id) { return batches.has(String(id)); },
    getBatch(id) { return descriptor(requireBatch(id)); },
    listBatches() { return [...batches.values()].sort((a, b) => a.id.localeCompare(b.id)).map(descriptor); },
    replaceCell,
    removeCell,
    retainCells,
    flush,
    getReleasedInstanceIds(id) { return [...requireBatch(id).releasedInstanceIds].sort(); },
    getDescriptor(id) { return descriptor(requireBatch(id)); },
    getState: getSnapshot,
    getSnapshot,
    snapshot: getSnapshot,
    loadSnapshot,
    reset
  });
}
