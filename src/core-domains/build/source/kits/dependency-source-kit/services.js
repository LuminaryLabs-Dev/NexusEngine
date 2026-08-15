import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  BUILD_SOURCE_RECORD_SCHEMA,
  contentIntegrity,
  posixPath,
  requirePlainObject,
  requireText,
  stableJson,
  sortedUnique
} from "../../../contracts.js";

const SOURCE_KINDS = new Set(["crates-io", "git", "https-esm", "npm", "vendor-installer"]);
const MOVING_VERSION = /^(?:latest|next|main|master|head|\*|[~^<>]=?|workspace:|file:|link:)/i;
const EXACT_GIT_COMMIT = /^[0-9a-f]{40}$/i;

function exactVersion(value, label) {
  const version = requireText(value, label);
  if (MOVING_VERSION.test(version) || /\s|\|\|/.test(version)) {
    throw new TypeError(`${label} must be exact and immutable: ${version}.`);
  }
  return version;
}

export function parseLockedGitSource(value) {
  const resolved = String(value ?? "");
  const separator = resolved.lastIndexOf("#");
  if (separator <= 0) return null;
  const exactCommit = resolved.slice(separator + 1);
  if (!EXACT_GIT_COMMIT.test(exactCommit)) return null;

  const source = resolved.slice(0, separator);
  if (source.startsWith("git+https://")) {
    const locator = new URL(source.slice("git+".length));
    if (locator.username || locator.password || locator.search || locator.hash) return null;
    return Object.freeze({
      canonicalLocator: locator.href,
      exactCommit: exactCommit.toLowerCase()
    });
  }

  if (source.startsWith("git+ssh://")) {
    const locator = new URL(source.slice("git+".length));
    if (
      locator.hostname.toLowerCase() !== "github.com"
      || locator.username !== "git"
      || locator.password
      || locator.port
      || locator.search
      || locator.hash
    ) return null;
    return Object.freeze({
      canonicalLocator: `https://github.com${locator.pathname}`,
      exactCommit: exactCommit.toLowerCase()
    });
  }

  return null;
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
    package: input.package == null ? null : requireText(input.package, "Build source package"),
    packagePath: input.packagePath == null ? null : requireText(input.packagePath, "Build source package path")
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

async function packageMetadata(projectRoot, packageName) {
  try {
    return JSON.parse(await readFile(path.join(projectRoot, "node_modules", packageName, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

async function packageTreeIntegrity(projectRoot, packageName) {
  const root = path.join(projectRoot, "node_modules", packageName);
  const files = [];
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const pathname = path.join(directory, entry.name);
      const info = await lstat(pathname);
      if (info.isSymbolicLink()) throw new Error(`Installed package contains a symbolic link: ${packageName}.`);
      if (info.isDirectory()) await walk(pathname);
      else if (info.isFile()) files.push({
        path: posixPath(path.relative(root, pathname)),
        integrity: contentIntegrity(await readFile(pathname))
      });
    }
  }
  try {
    await walk(root);
    return contentIntegrity(stableJson(files));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
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
      if (!entry?.version || !entry?.resolved) {
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
      const installed = await packageMetadata(projectSource.root, packageName);
      const license = typeof entry.license === "string"
        ? entry.license
        : typeof installed?.license === "string" ? installed.license : null;
      const git = parseLockedGitSource(entry.resolved);
      if (git) {
        const integrity = await packageTreeIntegrity(projectSource.root, packageName);
        records.push(normalizeBuildSourceRecord({
          id: `git:${packageName}@${git.exactCommit}`,
          sourceKind: "git",
          package: packageName,
          packagePath: packagePath(packageName),
          canonicalLocator: git.canonicalLocator,
          exactVersion: git.exactCommit,
          integrity,
          license,
          transitiveDependencies: dependencies.map((dependency) => `npm:${dependency}`),
          requiredEnvironment: ["node"],
          resolutionStatus: integrity && license ? "resolved" : integrity ? "license-unavailable" : "integrity-unavailable"
        }));
        continue;
      }
      if (!/^https:\/\//.test(entry.resolved) || !entry.integrity) {
        throw new Error(`Locked npm source is not an exact registry artifact for ${packageName}.`);
      }
      records.push(normalizeBuildSourceRecord({
        id: `npm:${packageName}@${entry.version}`,
        sourceKind: "npm",
        package: packageName,
        packagePath: packagePath(packageName),
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
