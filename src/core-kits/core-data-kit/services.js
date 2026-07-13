import { createScopedSeed, createSeededRandom } from "../../foundation/seeded-random.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

function stableText(value, fallback, label) {
  const text = String(value ?? fallback ?? "").trim();
  if (!text) throw new TypeError(`${label} requires a non-empty value.`);
  return text;
}

function positiveInteger(value, fallback, label) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1) throw new TypeError(`${label} must be a positive integer.`);
  return number;
}

function canonicalize(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "bigint") return { $bigint: value.toString() };
    if (typeof value === "number" && !Number.isFinite(value)) return { $number: String(value) };
    if (typeof value === "undefined") return { $undefined: true };
    return value;
  }
  if (seen.has(value)) throw new TypeError("State digests cannot canonicalize cyclic values.");
  seen.add(value);
  let result;
  if (Array.isArray(value)) result = value.map((entry) => canonicalize(entry, seen));
  else if (value instanceof Date) result = { $date: value.toISOString() };
  else if (value instanceof Map) {
    result = { $map: [...value.entries()].map(([key, entry]) => [canonicalize(key, seen), canonicalize(entry, seen)]).sort(([left], [right]) => JSON.stringify(left).localeCompare(JSON.stringify(right))) };
  } else if (value instanceof Set) {
    result = { $set: [...value.values()].map((entry) => canonicalize(entry, seen)).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))) };
  } else {
    result = Object.fromEntries(Object.keys(value).sort().filter((key) => typeof value[key] !== "function" && typeof value[key] !== "symbol").map((key) => [key, canonicalize(value[key], seen)]));
  }
  seen.delete(value);
  return result;
}

function fnv1a64(text) {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, "0");
}

export function createDeterministicRandomService(config = {}) {
  const initialSeed = stableText(config.seed ?? config.worldSeed, "nexusengine", "World seed");
  const maxStreams = positiveInteger(config.maxStreams, 128, "maxStreams");
  const initialStreams = asList(config.streams ?? config.preloadStreams).map((entry) => typeof entry === "string" ? { id: entry } : { ...(entry ?? {}) });
  let worldSeed = initialSeed;
  let streams = new Map();

  function descriptor(record) {
    return Object.freeze({ id: record.id, seed: record.seed, draws: record.draws, lastUint32: record.lastUint32, state: record.rng.snapshot().state });
  }

  function createStream(streamId, options = {}) {
    const id = stableText(streamId, "default", "Random stream");
    const existing = streams.get(id);
    if (existing && options.replace !== true) return descriptor(existing);
    if (!existing && streams.size >= maxStreams) throw new RangeError(`Random stream limit ${maxStreams} reached.`);
    const seed = stableText(options.seed, createScopedSeed(worldSeed, id), "Random stream seed");
    const record = { id, seed, draws: 0, lastUint32: null, rng: createSeededRandom(seed) };
    streams.set(id, record);
    return descriptor(record);
  }

  function requireStream(streamId = "default") {
    const id = stableText(streamId, "default", "Random stream");
    if (!streams.has(id)) createStream(id);
    return streams.get(id);
  }

  function nextUint32(streamId = "default") {
    const record = requireStream(streamId);
    const value = record.rng.nextUint32();
    record.draws += 1;
    record.lastUint32 = value;
    return value;
  }

  function snapshot() {
    return {
      schema: "nexusengine.core-data.random/1",
      worldSeed,
      maxStreams,
      streams: [...streams.values()].sort((left, right) => left.id.localeCompare(right.id)).map((record) => ({ id: record.id, seed: record.seed, draws: record.draws, lastUint32: record.lastUint32, random: clone(record.rng.snapshot()) }))
    };
  }

  function loadSnapshot(value = {}) {
    if (value.schema !== "nexusengine.core-data.random/1") throw new TypeError("Unsupported Core Data random snapshot.");
    if (Number(value.maxStreams) !== maxStreams) throw new TypeError("Random snapshot maxStreams does not match this service.");
    const next = new Map();
    for (const entry of asList(value.streams)) {
      const id = stableText(entry?.id, null, "Snapshot stream");
      if (next.has(id)) throw new TypeError(`Random snapshot duplicates stream ${id}.`);
      const seed = stableText(entry?.seed ?? entry?.random?.seed, null, "Snapshot stream seed");
      const state = Number(entry?.random?.state);
      const draws = Number(entry?.draws ?? 0);
      if (!Number.isInteger(state) || state < 0 || state > 0xffffffff) throw new TypeError(`Random stream ${id} has invalid state.`);
      if (!Number.isInteger(draws) || draws < 0) throw new TypeError(`Random stream ${id} has invalid draw count.`);
      const rng = createSeededRandom(seed);
      rng.restore({ seed, state });
      next.set(id, { id, seed, draws, lastUint32: entry.lastUint32 == null ? null : Number(entry.lastUint32), rng });
    }
    worldSeed = stableText(value.worldSeed, initialSeed, "Snapshot world seed");
    streams = next;
    return snapshot();
  }

  function reset(options = {}) {
    worldSeed = stableText(options.seed ?? options.worldSeed, initialSeed, "World seed");
    streams = new Map();
    for (const preload of initialStreams) createStream(preload.id, preload);
    return snapshot();
  }

  const api = {
    getWorldSeed: () => worldSeed,
    setWorldSeed(seed) { worldSeed = stableText(seed, initialSeed, "World seed"); streams = new Map(); return snapshot(); },
    createStream,
    hasStream(streamId) { return streams.has(stableText(streamId, "default", "Random stream")); },
    getStream(streamId = "default") { return descriptor(requireStream(streamId)); },
    listStreams() { return [...streams.values()].sort((a, b) => a.id.localeCompare(b.id)).map(descriptor); },
    deleteStream(streamId) { return streams.delete(stableText(streamId, "default", "Random stream")); },
    nextUint32,
    next(streamId = "default") { return nextUint32(streamId) / 0x100000000; },
    range(streamId, min = 0, max = 1) {
      const low = Number(min); const high = Number(max);
      if (!Number.isFinite(low) || !Number.isFinite(high)) throw new TypeError("Random ranges require finite bounds.");
      return low + (high - low) * api.next(streamId);
    },
    int(streamId, min = 0, max = 1) {
      const low = Math.ceil(Number(min)); const high = Math.floor(Number(max));
      if (!Number.isFinite(low) || !Number.isFinite(high) || high < low) throw new TypeError("Random integer ranges require ordered finite bounds.");
      return low + Math.floor(api.next(streamId) * (high - low + 1));
    },
    bool(streamId, chance = 0.5) {
      const probability = Number(chance);
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new TypeError("Random chance must be between 0 and 1.");
      return api.next(streamId) < probability;
    },
    choose(streamId, items = []) {
      if (!Array.isArray(items)) throw new TypeError("Random choose expects an array.");
      return items.length ? items[Math.floor(api.next(streamId) * items.length) % items.length] : undefined;
    },
    shuffle(streamId, items = []) {
      if (!Array.isArray(items)) throw new TypeError("Random shuffle expects an array.");
      const output = [...items];
      for (let index = output.length - 1; index > 0; index -= 1) {
        const selected = Math.floor(api.next(streamId) * (index + 1));
        [output[index], output[selected]] = [output[selected], output[index]];
      }
      return output;
    },
    fork(parentStreamId, scopeId, options = {}) {
      const parent = requireStream(parentStreamId);
      const scope = stableText(scopeId, null, "Random stream scope");
      return createStream(options.id ?? `${parent.id}:${scope}`, { ...options, seed: createScopedSeed(parent.seed, scope) });
    },
    getState: snapshot,
    getSnapshot: snapshot,
    snapshot,
    loadSnapshot,
    reset
  };
  reset();
  return Object.freeze(api);
}

export function createCompletionService(config = {}) {
  const initialLedgers = config.ledgers ?? { default: config.completed ?? [] };
  const defaultRepeatable = Boolean(config.defaultRepeatable);
  let ledgers = new Map();

  function normalizeRecord(input = {}) {
    const id = stableText(input.id, null, "Completion record");
    return { id, count: Math.max(0, Math.floor(Number(input.count ?? (input.completed ? 1 : 0)) || 0)), completed: Boolean(input.completed ?? Number(input.count ?? 0) > 0), repeatable: Boolean(input.repeatable ?? defaultRepeatable), tags: [...new Set(asList(input.tags).map(String).filter(Boolean))], data: clone(input.data ?? input.payload ?? {}), firstCompletedTick: input.firstCompletedTick ?? null, lastCompletedTick: input.lastCompletedTick ?? null };
  }

  function seedRecords(value) {
    if (Array.isArray(value)) return value.map((entry) => typeof entry === "string" ? normalizeRecord({ id: entry, count: 1, completed: true }) : normalizeRecord(entry));
    if (Array.isArray(value?.records)) return value.records.map(normalizeRecord);
    if (Array.isArray(value?.completed)) return value.completed.map((id) => normalizeRecord({ id, count: 1, completed: true }));
    return [];
  }

  function createLedger(id, seed = []) {
    const key = stableText(id, "default", "Completion ledger");
    const existing = ledgers.get(key);
    if (existing) return existing;
    const ledger = { id: key, records: new Map(seedRecords(seed).map((record) => [record.id, record])) };
    ledgers.set(key, ledger);
    return ledger;
  }

  function requireLedger(id = "default") { return ledgers.get(String(id)) ?? createLedger(id); }
  function cloneRecord(record) { return clone(record ?? null); }

  function ensureRecord(id, options = {}, ledgerId = "default") {
    const ledger = requireLedger(ledgerId);
    const key = stableText(id, null, "Completion");
    const existing = ledger.records.get(key);
    if (existing) return cloneRecord(existing);
    const record = normalizeRecord({ id: key, repeatable: options.repeatable, tags: options.tags, data: options.data ?? options.payload });
    ledger.records.set(key, record);
    return cloneRecord(record);
  }

  function complete(id, options = {}, ledgerId = "default") {
    const ledger = requireLedger(ledgerId);
    const key = stableText(id, null, "Completion");
    let record = ledger.records.get(key);
    if (!record) {
      record = normalizeRecord({ id: key, repeatable: options.repeatable, tags: options.tags, data: options.data ?? options.payload });
      ledger.records.set(key, record);
    }
    if (record.completed && !record.repeatable && options.force !== true) return { ok: false, accepted: false, duplicate: true, completed: true, id: key, reason: "already-completed", record: cloneRecord(record) };
    const tick = options.tick ?? options.frame ?? null;
    record.count += 1; record.completed = true;
    if (typeof options.repeatable === "boolean") record.repeatable = options.repeatable;
    if (options.tags) record.tags = [...new Set([...record.tags, ...asList(options.tags).map(String)])];
    if (options.data || options.payload) record.data = { ...record.data, ...clone(options.data ?? options.payload) };
    if (record.firstCompletedTick == null) record.firstCompletedTick = tick;
    record.lastCompletedTick = tick;
    return { ok: true, accepted: true, duplicate: false, completed: true, id: key, record: cloneRecord(record) };
  }

  function ledgerSnapshot(ledger) { return { id: ledger.id, records: [...ledger.records.values()].sort((left, right) => left.id.localeCompare(right.id)).map(cloneRecord) }; }
  function snapshot() { return { schema: "nexusengine.core-data.completion/1", ledgers: Object.fromEntries([...ledgers.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([id, ledger]) => [id, ledgerSnapshot(ledger)])) }; }
  function loadSnapshot(value = {}) {
    if (value.schema !== "nexusengine.core-data.completion/1") throw new TypeError("Unsupported Core Data completion snapshot.");
    ledgers = new Map();
    for (const [id, ledgerValue] of Object.entries(value.ledgers ?? {})) createLedger(id, ledgerValue);
    if (!ledgers.size) createLedger("default");
    return snapshot();
  }
  function reset(value = {}) {
    ledgers = new Map();
    const source = value.ledgers ?? initialLedgers;
    for (const [id, seed] of Object.entries(source)) createLedger(id, seed);
    if (!ledgers.size) createLedger("default");
    return snapshot();
  }

  reset();
  return Object.freeze({
    createLedger: (id, seed) => ledgerSnapshot(createLedger(id, seed)),
    removeLedger(id) { return ledgers.delete(String(id)); },
    ensureRecord,
    complete,
    has(id, ledgerId = "default") { return Boolean(requireLedger(ledgerId).records.get(String(id))?.completed); },
    count(id, ledgerId = "default") { return requireLedger(ledgerId).records.get(String(id))?.count ?? 0; },
    get(id, ledgerId = "default") { return cloneRecord(requireLedger(ledgerId).records.get(String(id)) ?? null); },
    list(ledgerId = "default") { return [...requireLedger(ledgerId).records.values()].filter((record) => record.completed).map((record) => record.id).sort(); },
    getRecords(ledgerId = "default") { return [...requireLedger(ledgerId).records.values()].sort((left, right) => left.id.localeCompare(right.id)).map(cloneRecord); },
    resetLedger(ledgerId = "default", seed = []) { const key = stableText(ledgerId, "default", "Completion ledger"); ledgers.delete(key); return ledgerSnapshot(createLedger(key, seed)); },
    listLedgers() { return [...ledgers.keys()].sort(); },
    getState: snapshot,
    getSnapshot: snapshot,
    snapshot,
    loadSnapshot,
    reset
  });
}

export function createStateDigestService(config = {}) {
  const maxRecords = positiveInteger(config.maxRecords, 128, "maxRecords");
  let records = [];
  function canonical(value) { return JSON.stringify(canonicalize(value)); }
  function digest(value, metadata = {}) {
    const canonicalValue = canonical(value);
    const result = Object.freeze({ algorithm: "fnv1a64", digest: fnv1a64(canonicalValue), bytes: new TextEncoder().encode(canonicalValue).length, metadata: clone(metadata) });
    records = [...records, result].slice(-maxRecords);
    return result;
  }
  function snapshot() { return { schema: "nexusengine.core-data.digest/1", algorithm: "fnv1a64", maxRecords, records: clone(records) }; }
  function loadSnapshot(value = {}) {
    if (value.schema !== "nexusengine.core-data.digest/1" || value.algorithm !== "fnv1a64") throw new TypeError("Unsupported Core Data digest snapshot.");
    records = asList(value.records).slice(-maxRecords).map(clone);
    return snapshot();
  }
  return Object.freeze({
    canonicalize: (value) => clone(canonicalize(value)),
    canonical,
    digest,
    verify(value, expected) { const expectedDigest = typeof expected === "string" ? expected : expected?.digest; const actual = digest(value, { verification: true }); return { ok: actual.digest === expectedDigest, expected: expectedDigest, actual }; },
    getRecords: () => clone(records),
    getState: snapshot,
    getSnapshot: snapshot,
    snapshot,
    loadSnapshot,
    reset() { records = []; return snapshot(); }
  });
}
