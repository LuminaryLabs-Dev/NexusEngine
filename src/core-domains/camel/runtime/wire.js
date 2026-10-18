export const MAX_PACKET_BYTES = 1024 * 1024;
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
export function validateWire(value, {tags = true} = {}) {
  let nodes = 0;
  const active = new WeakSet();
  function visit(v, depth) {
    if (++nodes > 100000 || depth > 64) throw new TypeError('Camel value exceeds structural limits');
    if (v === null || typeof v === 'boolean' || typeof v === 'string') return;
    if (typeof v === 'number') {
      if (!Number.isFinite(v) || (Number.isInteger(v) && !Number.isSafeInteger(v))) throw new TypeError('Camel unsafe number');
      return;
    }
    if (typeof v !== 'object' || (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null)) throw new TypeError('Camel wire values must be serializable data');
    if (active.has(v)) throw new TypeError('Camel cyclic wire value');
    active.add(v);
    if (Object.hasOwn(v, '$camel')) {
      if (!tags) throw new TypeError('Camel value tags are not allowed here');
      const keys = Object.keys(v).sort().join(',');
      if (v.$camel === 'undefined' && keys === '$camel') {}
      else if (['reference', 'callback'].includes(v.$camel) && keys === '$camel,id' && typeof v.id === 'string' && v.id.length > 0 && v.id.length <= 256) {}
      else if (v.$camel === 'bigint' && keys === '$camel,value' && typeof v.value === 'string' && /^-?(0|[1-9][0-9]{0,18})$/.test(v.value) && BigInt(v.value) >= -(2n ** 63n) && BigInt(v.value) < 2n ** 63n) {}
      else throw new TypeError('Malformed Camel value tag');
    } else for (const key of Object.keys(v)) {
      if (forbidden.has(key)) throw new TypeError(`Unsafe Camel key: ${key}`);
      const descriptor = Object.getOwnPropertyDescriptor(v, key);
      if (!Object.hasOwn(descriptor, 'value')) throw new TypeError('Camel wire accessors are unsupported');
      visit(descriptor.value, depth + 1);
    }
    active.delete(v);
  }
  visit(value, 0);
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_PACKET_BYTES) throw new TypeError('Camel packet exceeds 1 MiB');
  return value;
}
