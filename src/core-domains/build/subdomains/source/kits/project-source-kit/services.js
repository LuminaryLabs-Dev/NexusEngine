import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import {
  assertInside,
  contentIntegrity,
  posixPath,
  requireText
} from "../../../../contracts.js";

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

  return Object.freeze({
    async read(project) {
      const root = path.resolve(requireText(project, "Project path"));
      const info = await lstat(root);
      if (!info.isDirectory()) throw new TypeError(`Build project is not a directory: ${root}.`);
      const files = [];
      await walkProject(root, root, { ignores }, files);
      return Object.freeze({
        root,
        files: Object.freeze(files),
        sourceFiles: Object.freeze(files.filter((file) => file.source))
      });
    },
    publicRecord(projectSource) {
      return Object.freeze({
        root: projectSource.root,
        files: Object.freeze(projectSource.files.map(({ absolutePath, bytes, ...file }) => file)),
        sourceFiles: Object.freeze(projectSource.sourceFiles.map(({ absolutePath, bytes, ...file }) => file))
      });
    }
  });
}

export default createProjectSourceService;
