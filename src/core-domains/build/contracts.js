import { createHash } from "node:crypto";
import path from "node:path";

export const BUILD_REQUEST_SCHEMA = "nexusengine.build-request/1";
export const BUILD_SOURCE_RECORD_SCHEMA = "nexusengine.build-source-record/1";
export const KIT_IR_SCHEMA = "nexusengine.kit-ir/1";
export const EXECUTION_IR_SCHEMA = "nexusengine.execution-ir/1";
export const BUILD_CLASSIFICATION_SCHEMA = "nexusengine.build-classification/1";
export const BUILD_TARGET_PROVIDER_SCHEMA = "nexusengine.build-target-provider/1";
export const BUILD_PLAN_SCHEMA = "nexusengine.build-plan/1";
export const BUILD_ARTIFACT_SCHEMA = "nexusengine.build-artifact/1";
export const BUILD_RECEIPT_SCHEMA = "nexusengine.build-receipt/1";
export const BUILD_STATE_SCHEMA = "nexusengine.build-state/1";

export const BUILD_PROFILES = Object.freeze([
  "compatible",
  "development",
  "native-preferred",
  "strict-native"
]);

export const BUILD_EXECUTION_MODES = Object.freeze([
  "javascript",
  "native",
  "native-adapter",
  "unsupported"
]);

export function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, stableValue(value[key])])
  );
}

export function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function contentIntegrity(value) {
  return `sha256:${sha256(value)}`;
}

export function requireText(value, label) {
  const result = String(value ?? "").trim();
  if (!result) throw new TypeError(`${label} requires a non-empty value.`);
  return result;
}

export function requirePlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value;
}

export function sortedUnique(values = []) {
  return [...new Set(values.map((value) => requireText(value, "List item")))].sort();
}

export function normalizeBuildProfile(value = "native-preferred") {
  const profile = requireText(value, "Build profile");
  if (!BUILD_PROFILES.includes(profile)) {
    throw new RangeError(`Unknown Build profile: ${profile}.`);
  }
  return profile;
}

export function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function assertInside(parent, candidate, label) {
  if (!isInside(parent, candidate)) {
    throw new RangeError(`${label} escapes its allowed root: ${candidate}.`);
  }
  return path.resolve(candidate);
}

export function assertOutside(parent, candidate, label) {
  if (isInside(parent, candidate)) {
    throw new RangeError(`${label} must remain outside the source project: ${candidate}.`);
  }
  return path.resolve(candidate);
}

export function posixPath(value) {
  return String(value).split(path.sep).join("/");
}

export function errorRecord(error, phase = "unknown") {
  return Object.freeze({
    phase,
    name: String(error?.name ?? "Error"),
    message: String(error?.message ?? error),
    code: error?.code == null ? null : String(error.code)
  });
}
