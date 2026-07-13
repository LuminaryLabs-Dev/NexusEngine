import { clonePortableValue, inspectPortableValue } from "../../../../portable.js";

export function createFoundationDefinition(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new TypeError("Foundation definition requires a stable id.");
  const descriptor = clonePortableValue(input.descriptor ?? input, "foundation-definition");
  const validation = inspectPortableValue(descriptor, { path: "foundationDefinition" });
  if (!validation.portable) throw new TypeError(`Foundation definition must be portable: ${validation.issues.join(", ")}`);
  return Object.freeze({
    id,
    kind: String(input.kind ?? "foundation"),
    version: Math.max(1, Math.floor(Number(input.version) || 1)),
    descriptor: Object.freeze(descriptor)
  });
}
