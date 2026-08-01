import { FOUNDATION_BLEND_MODES } from "./contracts.js";
import { inspectPortableValue } from "../../portable.js";

export function validateFoundationContribution(value = {}) {
  const issues = [];
  for (const field of ["id", "featureId", "cellId"]) {
    if (typeof value?.[field] !== "string" || value[field].trim().length === 0) issues.push(`invalid-${field}`);
  }
  if (!FOUNDATION_BLEND_MODES.includes(value?.blendMode)) issues.push("invalid-blend-mode");
  if (!Number.isFinite(Number(value?.priority))) issues.push("invalid-priority");
  if (!Number.isFinite(Number(value?.version)) || Number(value.version) < 1) issues.push("invalid-version");
  if (!Array.isArray(value?.dependsOn)) issues.push("invalid-depends-on");
  if (!value?.channels || typeof value.channels !== "object" || Array.isArray(value.channels) || Object.keys(value.channels).length === 0) {
    issues.push("invalid-channels");
  }
  issues.push(...inspectPortableValue(value, { path: "foundationContribution" }).issues);
  return { valid: issues.length === 0, issues };
}

export function validateResolvedFoundation(value = {}) {
  const issues = [];
  if (value?.schema !== "nexusengine.world-foundation/1") issues.push("invalid-schema");
  if (typeof value?.cellId !== "string" || value.cellId.trim().length === 0) issues.push("invalid-cell-id");
  if (!Number.isFinite(Number(value?.revision)) || Number(value.revision) < 1) issues.push("invalid-revision");
  if (!Array.isArray(value?.contributionIds)) issues.push("invalid-contribution-ids");
  if (!value?.channels || typeof value.channels !== "object" || Array.isArray(value.channels)) issues.push("invalid-channels");
  issues.push(...inspectPortableValue(value, { path: "resolvedFoundation" }).issues);
  return { valid: issues.length === 0, issues };
}
