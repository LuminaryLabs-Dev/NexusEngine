import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  BUILD_SOURCE_RECORD_SCHEMA,
  requirePlainObject,
  requireText,
  sortedUnique
} from "../../../../contracts.js";

const SOURCE_KINDS = new Set(["crates-io", "git", "https-esm", "npm", "vendor-installer"]);
const MOVING_VERSION = /^(?:latest|next|main|master|head|\*|[~^<>]=?|workspace:|file:|link:)/i;

function exactVersion(value, label) {
  const version = requireText(value, label);
  if (MOVING_VERSION.test(version) || /\s|\|\|/.test(version)) {
    throw new TypeError(`${label} must be exact and immutable: ${version}.`);
  }
  return version;
}

export function normalizeBuildSourceRecord(input = {}) {
  requirePlainObject(input, "Build source record");
  const sourceKind = requireText(input.sourceKind, "Build source kind");
  if (!SOURCE_KINDS.has(sourceKind)) throw new RangeError(`Unsupported Build source kind: ${sourceKind}.`);
  const record = {
    schema: BUILD_SOURCE_RECORD_SCHEMA,
    id: requireText(input.id, "Build source id"),
    sourceKind,
    canonicalLocator: requireText(input.canonicalLocator, "Build source canonical locator"),
    exactVersion: exactVersion(input.exactVersion, "Build source version or commit"),
    integrity: input.integrity == null ? null : requireText(input.integrity, "Build source integrity"),
    license: input.license == null ? null : requireText(input.license, "Build source license"),
    requiredEnvironment: sortedUnique(input.requiredEnvironment ?? []),
    transitiveDependencies: sortedUnique(input.transitiveDependencies ?? []),
    provider: input.provider == null ? null : requireText(input.provider, "Build source provider"),
    substitution: input.substitution == null ? null : requireText(input.substitution, "Build source substitution"),
    resolutionStatus: String(input.resolutionStatus ?? "resolved"),
    package: input.package == null ? null : requireText(input.package, "Build source package")
  };
  if (record.resolutionStatus === "resolved" && (!record.integrity || !record.license)) {
    throw new TypeError(`Resolved Build source ${record.id} requires integrity and license.`);
  }
  if (sourceKind === "https-esm" && !/^https:\/\//.test(record.canonicalLocator)) {
    throw new TypeError(`HTTPS ESM source ${record.id} requires an https URL.`);
  }
  if (sourceKind === "git" && !/^[0-9a-f]{40,64}$/i.test(record.exactVersion)) {
    throw new TypeError(`Git source ${record.id} requires an exact commit hash.`);
  }
  return Object.freeze(record);
}

function packagePath(packageName) {
  return `node_modules/${packageName}`;
}

async function packageLicense(projectRoot, packageName) {
  try {
    const packageJson = JSON.parse(await readFile(path.join(projectRoot, "node_modules", packageName, "package.json"), "utf8"));
    return typeof packageJson.license === "string" ? packageJson.license : null;
  } catch {
    return null;
  }
}

export function createDependencySourceService() {
  async function discover(projectSource) {
    const packageFile = projectSource.files.find((file) => file.path === "package.json");
    if (!packageFile) return Object.freeze([]);
    const packageJson = JSON.parse(packageFile.bytes.toString("utf8"));
    const requested = Object.keys({
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.optionalDependencies ?? {})
    }).sort();
    if (requested.length === 0) return Object.freeze([]);
    const lockFile = projectSource.files.find((file) => file.path === "package-lock.json");
    if (!lockFile) {
      throw new Error("Projects with external npm dependencies require package-lock.json for immutable resolution.");
    }
    const lock = JSON.parse(lockFile.bytes.toString("utf8"));
    const lockPackages = lock.packages ?? {};
    const records = [];
    const queue = [...requested];
    const seen = new Set();

    while (queue.length) {
      const packageName = queue.shift();
      if (seen.has(packageName)) continue;
      seen.add(packageName);
      const entry = lockPackages[packagePath(packageName)];
      if (!entry?.version || !entry?.integrity || !entry?.resolved) {
        throw new Error(`Locked npm source is incomplete for ${packageName}.`);
      }
      if (/\/(?:latest|next)(?:\/|$)/i.test(entry.resolved)) {
        throw new Error(`Locked npm source uses a moving locator for ${packageName}.`);
      }
      const dependencies = Object.keys({
        ...(entry.dependencies ?? {}),
        ...(entry.optionalDependencies ?? {})
      }).sort();
      queue.push(...dependencies);
      const license = await packageLicense(projectSource.root, packageName);
      records.push(normalizeBuildSourceRecord({
        id: `npm:${packageName}@${entry.version}`,
        sourceKind: "npm",
        package: packageName,
        canonicalLocator: entry.resolved,
        exactVersion: entry.version,
        integrity: entry.integrity,
        license,
        transitiveDependencies: dependencies.map((dependency) => `npm:${dependency}`),
        requiredEnvironment: ["node"],
        resolutionStatus: license ? "resolved" : "license-unavailable"
      }));
    }

    return Object.freeze(records.sort((left, right) => left.id.localeCompare(right.id)));
  }

  return Object.freeze({ discover, normalize: normalizeBuildSourceRecord });
}

export default createDependencySourceService;
