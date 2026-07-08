import { createHeadlessWorkspaceSnapshot, deserializeWorkspaceFile, inferMediaType, normalizeWorkspacePath, normalizeWorkspacePrefix, normalizeWorkspaceSnapshot, serializeHeadlessWorkspaceSnapshot, textToBytes, toUint8Array } from "./workspace-contract.js";

async function nodeModules() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  return { fs, path };
}

async function safePath(root, workspacePath) {
  const { path } = await nodeModules();
  const normalized = normalizeWorkspacePath(workspacePath);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, normalized);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new TypeError(`Headless workspace path escaped root: ${workspacePath}`);
  }
  return { resolved, normalized };
}

async function walk(root, current = "") {
  const { fs, path } = await nodeModules();
  const dir = path.join(root, current);
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const results = [];
  for (const entry of entries) {
    const relative = current ? `${current}/${entry.name}` : entry.name;
    if (entry.isDirectory()) results.push(...await walk(root, relative));
    if (entry.isFile()) results.push(relative);
  }
  return results.sort();
}

export function createFileHeadlessRunWorkspace(options = {}) {
  if (typeof options.root !== "string" || options.root.trim().length === 0) {
    throw new TypeError("createFileHeadlessRunWorkspace requires a root folder.");
  }
  const root = options.root;

  const workspace = {
    kind: "file",
    root,
    async read(path) {
      const { fs } = await nodeModules();
      const { resolved } = await safePath(root, path);
      return new Uint8Array(await fs.readFile(resolved));
    },
    async write(path, bytes) {
      const { fs, path: nodePath } = await nodeModules();
      const { resolved } = await safePath(root, path);
      await fs.mkdir(nodePath.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, toUint8Array(bytes));
    },
    async writeBytes(path, bytes) {
      return workspace.write(path, bytes);
    },
    async readText(path) {
      const bytes = await workspace.read(path);
      return new TextDecoder().decode(bytes);
    },
    async writeText(path, value) {
      return workspace.write(path, textToBytes(value));
    },
    async readJson(path) {
      return JSON.parse(await workspace.readText(path));
    },
    async writeJson(path, value) {
      return workspace.writeText(path, JSON.stringify(value, null, 2));
    },
    async exists(path) {
      const { fs } = await nodeModules();
      const { resolved } = await safePath(root, path);
      try {
        await fs.access(resolved);
        return true;
      } catch {
        return false;
      }
    },
    async list(prefix = "") {
      const normalizedPrefix = normalizeWorkspacePrefix(prefix);
      const entries = await walk(root);
      return entries.filter((entry) => !normalizedPrefix || entry === normalizedPrefix || entry.startsWith(`${normalizedPrefix}/`));
    },
    async delete(path) {
      const { fs } = await nodeModules();
      const { resolved } = await safePath(root, path);
      await fs.rm(resolved, { force: true, recursive: true });
    },
    async snapshot() {
      const files = new Map();
      for (const path of await workspace.list()) {
        files.set(path, { path, bytes: await workspace.read(path), mediaType: inferMediaType(path) });
      }
      return createHeadlessWorkspaceSnapshot(files.entries());
    },
    async loadSnapshot(snapshot = {}) {
      const { fs } = await nodeModules();
      await fs.mkdir(root, { recursive: true });
      const next = normalizeWorkspaceSnapshot(snapshot);
      for (const [path, file] of Object.entries(next.files)) {
        const decoded = deserializeWorkspaceFile(path, file);
        await workspace.write(path, decoded.bytes);
      }
      return workspace;
    },
    async toTextBundle() {
      return serializeHeadlessWorkspaceSnapshot(await workspace.snapshot());
    }
  };

  return workspace;
}
