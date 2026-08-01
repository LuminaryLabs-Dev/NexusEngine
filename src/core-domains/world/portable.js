function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function inspectPortableValue(value, options = {}) {
  const issues = [];
  const seen = new WeakSet();
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 48;

  function visit(entry, path, depth) {
    if (depth > maxDepth) {
      issues.push(`${path}:max-depth-exceeded`);
      return;
    }
    if (entry === null || typeof entry === "string" || typeof entry === "boolean") return;
    if (typeof entry === "number") {
      if (!Number.isFinite(entry)) issues.push(`${path}:non-finite-number`);
      return;
    }
    if (entry === undefined) {
      issues.push(`${path}:undefined`);
      return;
    }
    if (["function", "symbol", "bigint"].includes(typeof entry)) {
      issues.push(`${path}:unsupported-${typeof entry}`);
      return;
    }
    if (ArrayBuffer.isView(entry) || entry instanceof ArrayBuffer || entry instanceof Map || entry instanceof Set || entry instanceof Date) {
      issues.push(`${path}:unsupported-${entry.constructor?.name ?? "object"}`);
      return;
    }
    if (!Array.isArray(entry) && !isPlainObject(entry)) {
      issues.push(`${path}:non-plain-object`);
      return;
    }
    if (seen.has(entry)) {
      issues.push(`${path}:cyclic-reference`);
      return;
    }
    seen.add(entry);
    if (Array.isArray(entry)) {
      entry.forEach((item, index) => visit(item, `${path}[${index}]`, depth + 1));
    } else {
      for (const [key, item] of Object.entries(entry)) visit(item, `${path}.${key}`, depth + 1);
    }
    seen.delete(entry);
  }

  visit(value, options.path ?? "$", 0);
  return { portable: issues.length === 0, issues };
}

export function assertPortableValue(value, label = "value") {
  const inspection = inspectPortableValue(value, { path: label });
  if (!inspection.portable) {
    throw new TypeError(`${label} must be a portable plain-data value: ${inspection.issues.join(", ")}`);
  }
  return value;
}

export function clonePortableValue(value, label = "value") {
  assertPortableValue(value, label);
  return structuredClone(value);
}

export function portableError(error, fallbackCode = "world-provider-error") {
  return {
    code: String(error?.code ?? fallbackCode),
    name: String(error?.name ?? "Error"),
    message: String(error?.message ?? error ?? "Unknown error")
  };
}
