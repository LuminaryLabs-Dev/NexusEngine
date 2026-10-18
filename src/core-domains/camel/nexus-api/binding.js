import {validateWire} from '../runtime/wire.js';
const unsafe = new Set(['__proto__', 'prototype', 'constructor']);
const fail = (code, message) => Object.assign(new Error(message), {code});
export function createNexusBinding(engine, {allowCalls = [], maxEvents = 1024, maxReferences = 1024} = {}) {
  if (typeof engine?.n?.apis !== 'function' || typeof engine?.n?.api !== 'function') throw fail('CAMEL_REGISTRY', 'An installed Nexus API registry is required');
  if (!Array.isArray(allowCalls) || allowCalls.some(value => typeof value !== 'string')) throw new TypeError('Camel allowCalls must contain exact grant strings');
  for (const [name, value] of Object.entries({maxEvents, maxReferences})) if (!Number.isSafeInteger(value) || value < 1 || value > 65536) throw new TypeError(`Invalid Camel ${name}`);
  const grants = new Set(allowCalls), resources = new Map(), identities = new WeakMap(), subscriptions = new Map(), events = [];
  const namespace = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  let sequence = 0, disposed = false, overflow = false;
  function live() {if (disposed) throw fail('CAMEL_DISPOSED', 'Binding disposed');}
  function retain(value) {
    live();
    if (identities.has(value)) return {$camel: 'reference', id: identities.get(value)};
    if (resources.size >= maxReferences) throw fail('CAMEL_REFERENCE_LIMIT', 'Camel reference limit exceeded');
    const id = `resource:${namespace}:${++sequence}`;
    resources.set(id, value);
    identities.set(value, id);
    return {$camel: 'reference', id};
  }
  function encodeInner(value, seen, depth) {
    if (depth > 64) throw fail('CAMEL_VALUE', 'Camel value nesting exceeds 64');
    if (value === undefined) return {$camel: 'undefined'};
    if (typeof value === 'bigint') {
      if (value < -(2n ** 63n) || value >= 2n ** 63n) throw fail('CAMEL_VALUE', 'Integer exceeds Camel i64 range');
      return {$camel: 'bigint', value: String(value)};
    }
    if (typeof value === 'number' && (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) throw fail('CAMEL_VALUE', 'Unsafe/non-finite JavaScript number');
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
    if (typeof value === 'symbol') throw fail('CAMEL_VALUE', 'JavaScript symbols cannot cross the Camel boundary');
    if (typeof value === 'function' || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) return retain(value);
    if (seen.has(value)) throw fail('CAMEL_VALUE', 'Cyclic values require an explicit Nexus resource');
    seen.add(value);
    const result = Array.isArray(value) ? value.map(item => encodeInner(item, seen, depth + 1)) : Object.fromEntries(Object.keys(value).map(key => {
      if (key === '$camel' || unsafe.has(key)) throw fail('CAMEL_VALUE', `Reserved key: ${key}`);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!Object.hasOwn(descriptor, 'value')) throw fail('CAMEL_VALUE', 'Accessors require an explicit Nexus resource');
      return [key, encodeInner(descriptor.value, seen, depth + 1)];
    }));
    seen.delete(value);
    return result;
  }
  function encode(value) {live(); return validateWire(encodeInner(value, new WeakSet(), 0));}
  function decodeInner(value) {
    if (value && typeof value === 'object') {
      if (value.$camel === 'callback') return (...args) => {
        if (disposed) return;
        if (events.length >= maxEvents) {overflow = true; return;}
        try {events.push(validateWire({callbackId: value.id, args: args.map(encode)}));} catch {overflow = true;}
      };
      if (value.$camel === 'reference') {
        if (!resources.has(value.id)) throw fail('CAMEL_REFERENCE', 'Unknown or expired resource');
        return resources.get(value.id);
      }
      if (value.$camel === 'undefined') return undefined;
      if (value.$camel === 'bigint') return BigInt(value.value);
      if (Array.isArray(value)) return value.map(decodeInner);
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeInner(item)]));
    }
    return value;
  }
  function decode(value) {live(); validateWire(value); return decodeInner(value);}
  function publicRecord(name) {
    const record = engine.n.api(name);
    if (!record) throw fail('CAMEL_UNKNOWN_API', `Unknown API ${name}`);
    if (record.visibility !== 'public') throw fail('CAMEL_VISIBILITY', `API ${name} is not public`);
    if (!record.available) throw fail('CAMEL_UNAVAILABLE', `API ${name} unavailable`);
    return record;
  }
  function target(name, path) {
    publicRecord(name);
    let owner = engine.n[name], value = owner;
    for (const key of path) {
      if (typeof key !== 'string' || unsafe.has(key) || value === null || value === undefined || !Object.prototype.hasOwnProperty.call(value, key)) throw fail('CAMEL_UNKNOWN_MEMBER', `Unknown public member ${name}.${path.join('.')}`);
      owner = value;
      value = value[key];
    }
    return {owner, value};
  }
  function cleanupOf(result) {return typeof result === 'function' ? result : typeof result?.unsubscribe === 'function' ? () => result.unsubscribe() : null;}
  return {
    discover() {live(); return validateWire(engine.n.apis().filter(record => record.visibility === 'public').map(record => ({...record})));},
    async call(packet) {
      live();
      validateWire(packet);
      if (!Array.isArray(packet) || packet.length < 1 || packet.length > 4) throw fail('CAMEL_CALL', 'Expected API name, member path, argument array and optional operation');
      const [name, path = [], args = [], op = 'call'] = packet;
      if (typeof name !== 'string' || !name || !Array.isArray(path) || path.length > 32 || path.some(key => typeof key !== 'string' || unsafe.has(key)) || !Array.isArray(args) || !['get', 'call', 'subscribe'].includes(op)) throw fail('CAMEL_CALL', 'Invalid Camel API call packet');
      if (name === 'camel' && !['discover', 'status', 'capabilities'].includes(path[0])) throw fail('CAMEL_REENTRANCY', 'Nested Camel lifecycle operations are not supported');
      const key = `${name}.${path.join('.')}:${op}`;
      if (!grants.has(key)) throw fail('CAMEL_PERMISSION', `Call not granted: ${key}`);
      const {owner, value} = target(name, path);
      if (op === 'get') return encode(value);
      if (typeof value !== 'function') throw fail('CAMEL_CALL', 'Member is not callable');
      if (op === 'subscribe' && !args.some(arg => arg?.$camel === 'callback')) throw fail('CAMEL_SUBSCRIPTION', 'Subscription requires a callback reference');
      const result = await Reflect.apply(value, owner, args.map(decode));
      if (op === 'subscribe') {
        const cleanup = cleanupOf(result);
        if (!cleanup) throw fail('CAMEL_SUBSCRIPTION', 'Subscription returned no disposable resource');
        if (disposed) {cleanup(); throw fail('CAMEL_DISPOSED', 'Subscription completed after disposal');}
        try {
          const reference = retain(result);
          if (subscriptions.has(reference.id)) throw fail('CAMEL_SUBSCRIPTION', 'Subscription resource is already retained');
          subscriptions.set(reference.id, cleanup);
          return reference;
        } catch (error) {cleanup(); throw error;}
      }
      return encode(result);
    },
    poll() {live(); if (overflow) throw fail('CAMEL_EVENT_OVERFLOW', 'Callback queue exceeded its capacity or contains unsupported data'); return events.splice(0);},
    release(id) {
      live();
      if (typeof id !== 'string' || !resources.has(id)) return false;
      const resource = resources.get(id), cleanup = subscriptions.get(id);
      subscriptions.delete(id);
      resources.delete(id);
      identities.delete(resource);
      cleanup?.();
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const errors = [];
      for (const cleanup of subscriptions.values()) try {cleanup();} catch (error) {errors.push(error);}
      subscriptions.clear();
      resources.clear();
      events.length = 0;
      if (errors.length) throw new AggregateError(errors, 'Camel subscription cleanup failed');
    },
    encode, decode,
    capabilities() {return {sharedInstance: true, lateRegistration: true, resourceReferences: true, pushSubscriptions: true, maxEvents, maxReferences};}
  };
}
