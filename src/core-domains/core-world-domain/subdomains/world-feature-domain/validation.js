import { WORLD_FEATURE_LIFECYCLE_STATES } from "./contracts.js";
import { inspectPortableValue } from "../../portable.js";

export function validateWorldFeatureDefinition(value = {}) {
  const issues = [];
  for (const field of ["id", "type", "seed"]) {
    if (typeof value?.[field] !== "string" || value[field].trim().length === 0) issues.push(`invalid-${field}`);
  }
  if (!WORLD_FEATURE_LIFECYCLE_STATES.includes(value?.lifecycle)) issues.push("invalid-lifecycle");
  if (!Number.isFinite(Number(value?.priority))) issues.push("invalid-priority");
  if (!Number.isFinite(Number(value?.version)) || Number(value.version) < 1) issues.push("invalid-version");
  if (!Array.isArray(value?.dependsOn)) issues.push("invalid-depends-on");
  if (!value?.fidelity || typeof value.fidelity !== "object") issues.push("invalid-fidelity");
  issues.push(...inspectPortableValue(value, { path: "worldFeature" }).issues);
  return { valid: issues.length === 0, issues };
}
