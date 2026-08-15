import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  assertInside,
  contentIntegrity,
  posixPath,
  requireText
} from "../../../contracts.js";

const DEFAULT_IGNORES = Object.freeze([
  ".git",
  ".nexusengine",
  "coverage",
  "dist",
  "node_modules"
]);

const SOURCE_EXTENSIONS = new Set([
  ".cjs", ".cts", ".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"
]);

function repositoryPath(value, label) {
  const input = String(value ?? "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
  if (!input || input.startsWith("/") || input.split("/").includes("..") || /[*?[\]{}]/.test(input)) {
    throw new TypeError(`${label} must be an exact repository-relative file or directory path: ${value}.`);
  }
  return input.replace(/\/$/, "");
}

function buildConfig(files) {
  const packageFile = files.find((file) => file.path === "package.json");
  if (!packageFile) return Object.freeze({ include: Object.freeze([]), entries: Object.freeze({}) });
  const packageJson = JSON.parse(packageFile.bytes.toString("utf8"));
  const input = packageJson.nexusengineBuild ?? {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("package.json nexusengineBuild must be an object.");
  }
  const include = [...new Set((input.include ?? []).map((value) => repositoryPath(value, "nexusengineBuild.include")))].sort();
  const entries = Object.freeze(Object.fromEntries(Object.entries(input.entries ?? {}).sort(([left], [right]) => left.localeCompare(right)).map(([target, entry]) => [
    String(target),
    repositoryPath(entry, `nexusengineBuild.entries.${target}`)
  ])));
  return Object.freeze({ include: Object.freeze(include), entries });
}

function selectedByInclude(filePath, includes) {
  return includes.some((entry) => filePath === entry || filePath.startsWith(`${entry}/`));
}

async function walkProject(root, directory, options, output) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (options.ignores.has(entry.name)) continue;
    const pathname = assertInside(root, path.join(directory, entry.name), "Project entry");
    const relativePath = posixPath(path.relative(root, pathname));
    if (entry.isSymbolicLink()) {
      throw new Error(`Build projects cannot contain symbolic links: ${relativePath}.`);
    }
    if (entry.isDirectory()) {
      await walkProject(root, pathname, options, output);
      continue;
    }
    if (!entry.isFile()) continue;
    const info = await lstat(pathname);
    const bytes = await readFile(pathname);
    output.push(Object.freeze({
      path: relativePath,
      absolutePath: pathname,
      size: info.size,
      mode: info.mode & 0o777,
      integrity: contentIntegrity(bytes),
      source: SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
      bytes
    }));
  }
}

export function createProjectSourceService(config = {}) {
  const ignores = new Set([...(config.ignores ?? DEFAULT_IGNORES)]);

  function targetEntry(projectSource, target) {
    const configured = projectSource.buildConfig.entries[String(target)] ?? null;
    if (!configured) return null;
    const file = projectSource.files.find((candidate) => candidate.path === configured);
    if (!file?.source) throw new Error(`Configured Build target entry is not an included source file: ${target} -> ${configured}.`);
    return configured;
  }

  return Object.freeze({
    async read(project) {
      const root = path.resolve(requireText(project, "Project path"));
      const info = await lstat(root);
      if (!info.isDirectory()) throw new TypeError(`Build project is not a directory: ${root}.`);
      const integrityFiles = [];
      await walkProject(root, root, { ignores }, integrityFiles);
      const normalizedConfig = buildConfig(integrityFiles);
      const required = ["package.json", "package-lock.json", ...Object.values(normalizedConfig.entries)];
      const includes = [...new Set([...normalizedConfig.include, ...required])];
      const files = normalizedConfig.include.length
        ? integrityFiles.filter((file) => selectedByInclude(file.path, includes))
        : integrityFiles;
      for (const include of normalizedConfig.include) {
        if (!files.some((file) => selectedByInclude(file.path, [include]))) {
          throw new Error(`Configured Build include path does not exist: ${include}.`);
        }
      }
      for (const [target, entry] of Object.entries(normalizedConfig.entries)) {
        if (!files.some((file) => file.path === entry && file.source)) {
          throw new Error(`Configured Build target entry is not an included source file: ${target} -> ${entry}.`);
        }
      }
      return Object.freeze({
        root,
        files: Object.freeze(files),
        sourceFiles: Object.freeze(files.filter((file) => file.source)),
        integrityFiles: Object.freeze(integrityFiles),
        buildConfig: normalizedConfig
      });
    },
    publicRecord(projectSource) {
      return Object.freeze({
        root: projectSource.root,
        buildConfig: projectSource.buildConfig,
        integrityFileCount: projectSource.integrityFiles.length,
        files: Object.freeze(projectSource.files.map(({ absolutePath, bytes, ...file }) => file)),
        sourceFiles: Object.freeze(projectSource.sourceFiles.map(({ absolutePath, bytes, ...file }) => file))
      });
    },
    targetEntry
  });
}

export default createProjectSourceService;
