export function clonePortable(value, label = "value") {
  const visit = (entry, seen = new WeakSet()) => {
    if (entry === null || typeof entry === "string" || typeof entry === "boolean") return;
    if (typeof entry === "number") { if (Number.isFinite(entry)) return; throw new TypeError(`${label} must be JSON-portable.`); }
    if (typeof entry !== "object" || seen.has(entry) || Object.getPrototypeOf(entry) !== Object.prototype && !Array.isArray(entry)) throw new TypeError(`${label} must be JSON-portable.`);
    seen.add(entry);
    for (const child of Array.isArray(entry) ? entry : Object.values(entry)) visit(child, seen);
    seen.delete(entry);
  };
  visit(value);
  let encoded;
  try { encoded = JSON.stringify(value); } catch { throw new TypeError(`${label} must be JSON-portable.`); }
  if (encoded === undefined) throw new TypeError(`${label} must be JSON-portable.`);
  const decoded = JSON.parse(encoded);
  return decoded;
}

export function textId(value, label) {
  const result = String(value ?? "").trim();
  if (!result) throw new TypeError(`${label} requires a non-empty id.`);
  return result;
}

export function nonNegativeInteger(value, label) {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new TypeError(`${label} must be a non-negative safe integer.`);
  return result;
}
