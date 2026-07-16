const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function stableText(value, fallback, label) {
  const text = String(value ?? fallback ?? "").trim();
  if (!text) throw new TypeError(`${label} requires a non-empty value.`);
  return text;
}

function positiveInteger(value, fallback, label, minimum = 1) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < minimum) throw new TypeError(`${label} must be an integer >= ${minimum}.`);
  return number;
}

function coordinateId(x, z) { return `${Number(x)}:${Number(z)}`; }

function coordinateFrom(value) {
  if (typeof value === "string") {
    const [x, z] = value.split(":").map(Number);
    if (Number.isFinite(x) && Number.isFinite(z)) return { x, z, id: coordinateId(x, z) };
  }
  const x = finite(value?.x ?? value?.cellX, 0);
  const z = finite(value?.z ?? value?.cellZ, 0);
  return { x, z, id: String(value?.id ?? coordinateId(x, z)) };
}

function stableHash(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createWorldPatchPreparationController(config = {}) {
  const id = stableText(config.id, null, "World patch preparation controller");
  const patchSize = positiveInteger(config.patchSize, 192, "Patch size");
  const retainRadius = positiveInteger(config.retainRadius, 2, "Retain radius", 0);
  const prefetchDistance = positiveInteger(config.prefetchDistance, 1, "Prefetch distance", 0);
  const cacheLimit = positiveInteger(config.cacheLimit, 64, "Cache limit");
  const generationBudget = positiveInteger(config.generationBudget, 2, "Generation budget");
  const activationBudget = positiveInteger(config.activationBudget, 2, "Activation budget");
  const generatorVersion = stableText(config.generatorVersion, "v1", "Generator version");
  const settingsHash = stableText(config.settingsHash, "default", "Settings hash");
  let generator = typeof config.generatePatch === "function" ? config.generatePatch : null;
  let executor = config.executor ?? null;
  let sequence = 0;
  let focus = { position: { x: 0, z: 0 }, velocity: { x: 0, z: 0 }, forward: { x: 0, z: 1 }, center: { x: 0, z: 0 } };
  const records = new Map();
  const queue = [];
  const queued = new Set();
  const inflight = new Set();
  const desired = new Set();
  const ready = [];
  const released = new Set();
  const diagnostics = [];

  function cacheKey(x, z) { return `${id}:${generatorVersion}:${settingsHash}:${x}:${z}`; }
  function getOrCreate(value) {
    const coordinate = coordinateFrom(value);
    let record = records.get(coordinate.id);
    if (!record) {
      record = { ...coordinate, cacheKey: cacheKey(coordinate.x, coordinate.z), status: "missing", patch: null, priority: Infinity, reason: "unknown", lastTouched: ++sequence, error: null };
      records.set(record.id, record);
    }
    record.lastTouched = ++sequence;
    return record;
  }

  function enqueue(record, options = {}) {
    record.priority = Math.min(record.priority, finite(options.priority, 0));
    record.reason = String(options.reason ?? record.reason ?? "requested");
    if (record.patch) {
      if (desired.has(record.id) && !ready.includes(record.id)) ready.push(record.id);
      return record;
    }
    if (!queued.has(record.id) && !inflight.has(record.id)) { queued.add(record.id); queue.push(record.id); record.status = "requested"; }
    return record;
  }

  function request(xOrCell, zOrOptions, maybeOptions) {
    const value = typeof xOrCell === "object" ? xOrCell : { x: xOrCell, z: zOrOptions };
    const options = typeof xOrCell === "object" ? (zOrOptions ?? {}) : (maybeOptions ?? {});
    return clone(enqueue(getOrCreate(value), options));
  }

  function setFocus(next = {}) {
    const position = { x: finite(next.position?.x ?? next.x), z: finite(next.position?.z ?? next.z) };
    const velocity = { x: finite(next.velocity?.x), z: finite(next.velocity?.z) };
    const sourceForward = next.forward ?? (Math.hypot(velocity.x, velocity.z) > 1e-8 ? velocity : focus.forward);
    const length = Math.hypot(finite(sourceForward.x), finite(sourceForward.z)) || 1;
    const forward = { x: finite(sourceForward.x) / length, z: finite(sourceForward.z) / length };
    focus = { position, velocity, forward, center: { x: Math.floor(position.x / patchSize), z: Math.floor(position.z / patchSize) } };
    return clone(focus);
  }

  function updateDesired(cells = []) {
    const next = new Set();
    for (const cell of cells) {
      const record = getOrCreate(cell);
      next.add(record.id);
      enqueue(record, { priority: cell.priority ?? 0, reason: cell.reason ?? "active" });
    }
    if (prefetchDistance > 0) {
      for (let step = 1; step <= prefetchDistance; step += 1) {
        const x = focus.center.x + Math.round(focus.forward.x * step);
        const z = focus.center.z + Math.round(focus.forward.z * step);
        const record = getOrCreate({ x, z });
        next.add(record.id);
        enqueue(record, { priority: 100 + step, reason: "prefetch" });
      }
    }
    for (const idValue of desired) if (!next.has(idValue)) release(idValue);
    desired.clear();
    for (const idValue of next) desired.add(idValue);
    evict();
    return getStats();
  }

  function runRecord(record) {
    if (!generator) throw new Error(`World patch preparation controller ${id} has no generator.`);
    const requestValue = { controllerId: id, requestId: `${id}:${++sequence}`, patchId: record.id, cacheKey: record.cacheKey, x: record.x, z: record.z, patchSize, generatorVersion, settingsHash, priority: record.priority, reason: record.reason };
    const run = typeof executor === "function" ? executor : executor?.run?.bind(executor);
    return run ? run(requestValue, generator) : generator(requestValue);
  }

  function completeRecord(record, patch) {
    if (!patch || typeof patch !== "object") throw new TypeError(`Patch generator returned no descriptor for ${record.id}.`);
    record.patch = patch;
    record.status = desired.has(record.id) ? "ready" : "cached";
    record.priority = Infinity;
    record.error = null;
    record.lastTouched = ++sequence;
    if (desired.has(record.id) && !ready.includes(record.id)) ready.push(record.id);
  }

  function startRecord(record) {
    queued.delete(record.id);
    inflight.add(record.id);
    record.status = "generating";
    try {
      const output = runRecord(record);
      if (output && typeof output.then === "function") {
        output.then((patch) => completeRecord(record, patch)).catch((error) => {
          record.status = "error"; record.error = String(error?.message ?? error); diagnostics.push({ patchId: record.id, type: "generation-error", message: record.error });
        }).finally(() => { inflight.delete(record.id); evict(); });
      } else {
        completeRecord(record, output);
        inflight.delete(record.id);
      }
    } catch (error) {
      inflight.delete(record.id);
      record.status = "error";
      record.error = String(error?.message ?? error);
      diagnostics.push({ patchId: record.id, type: "generation-error", message: record.error });
    }
  }

  function pump(options = {}) {
    const maximum = positiveInteger(options.maximum, generationBudget, "Generation maximum");
    queue.sort((leftId, rightId) => (records.get(leftId)?.priority ?? Infinity) - (records.get(rightId)?.priority ?? Infinity) || leftId.localeCompare(rightId));
    let started = 0;
    while (started < maximum && queue.length) {
      const record = records.get(queue.shift());
      if (!record || record.patch || inflight.has(record.id)) continue;
      startRecord(record); started += 1;
    }
    return { started, queued: queue.length, inflight: inflight.size };
  }

  function prime(xOrCell, zOrPatch, maybePatch) {
    const value = typeof xOrCell === "object" ? xOrCell : { x: xOrCell, z: zOrPatch };
    const patch = typeof xOrCell === "object" ? zOrPatch : maybePatch;
    const record = getOrCreate(value);
    completeRecord(record, patch);
    return record.id;
  }

  function release(idOrCell) {
    const record = records.get(typeof idOrCell === "string" ? idOrCell : coordinateFrom(idOrCell).id);
    if (!record) return false;
    desired.delete(record.id);
    released.add(record.id);
    const distance = Math.max(Math.abs(record.x - focus.center.x), Math.abs(record.z - focus.center.z));
    record.status = distance <= retainRadius ? "retained" : "cached";
    record.lastTouched = ++sequence;
    return true;
  }

  function takeReady(options = {}) {
    const maximum = positiveInteger(options.maximum, activationBudget, "Activation maximum");
    const output = [];
    while (output.length < maximum && ready.length) {
      const record = records.get(ready.shift());
      if (!record?.patch || !desired.has(record.id)) continue;
      record.status = "active";
      output.push({ id: record.id, key: record.cacheKey, x: record.x, z: record.z, patch: record.patch });
    }
    return output;
  }

  function takeReleased() { const output = [...released].sort(); released.clear(); return output; }

  function evict() {
    const candidates = [...records.values()].filter((record) => !desired.has(record.id) && !inflight.has(record.id)).sort((a, b) => a.lastTouched - b.lastTouched);
    while (records.size > cacheLimit && candidates.length) records.delete(candidates.shift().id);
  }

  function getStats() {
    const statuses = {};
    for (const record of records.values()) statuses[record.status] = (statuses[record.status] ?? 0) + 1;
    return { id, patchSize, retainRadius, prefetchDistance, cacheLimit, generationBudget, activationBudget, generatorVersion, settingsHash, focus: clone(focus), desired: desired.size, cached: records.size, ready: ready.length, queued: queue.length, inflight: inflight.size, statuses, diagnostics: diagnostics.slice(-16).map(clone) };
  }

  function getSnapshot() {
    return { schema: "nexusengine.core-world.patch-preparation/1", id, config: { patchSize, retainRadius, prefetchDistance, cacheLimit, generationBudget, activationBudget, generatorVersion, settingsHash }, focus: clone(focus), desiredPatchIds: [...desired].sort(), cachedPatchIds: [...records.keys()].sort(), cacheDigest: stableHash([...records.values()].map((record) => `${record.cacheKey}:${record.status}`).sort().join("|")), stats: getStats() };
  }

  function loadSnapshot(snapshot = {}) {
    if (snapshot.schema !== "nexusengine.core-world.patch-preparation/1" || snapshot.id !== id) throw new TypeError("Unsupported Core World patch-preparation snapshot.");
    reset();
    setFocus(snapshot.focus ?? {});
    return getSnapshot();
  }

  function reset() {
    records.clear(); queue.length = 0; queued.clear(); inflight.clear(); desired.clear(); ready.length = 0; released.clear(); diagnostics.length = 0; sequence = 0;
    focus = { position: { x: 0, z: 0 }, velocity: { x: 0, z: 0 }, forward: { x: 0, z: 1 }, center: { x: 0, z: 0 } };
    return getSnapshot();
  }

  return Object.freeze({
    id,
    setGenerator(next) { if (typeof next !== "function") throw new TypeError("setGenerator expects a function."); generator = next; return true; },
    setExecutor(next) { if (next != null && typeof next !== "function" && typeof next?.run !== "function") throw new TypeError("setExecutor expects a function an object with run or null."); executor = next; return true; },
    setFocus,
    request,
    updateDesired,
    pump,
    prime,
    release,
    takeReady,
    takeReleased,
    getPatch(idValue) { return records.get(String(idValue))?.patch ?? null; },
    hasPatch(idValue) { return Boolean(records.get(String(idValue))?.patch); },
    getStats,
    getState: getSnapshot,
    getSnapshot,
    snapshot: getSnapshot,
    loadSnapshot,
    reset
  });
}
