import {
  bytesToText,
  cloneBytes,
  createHeadlessWorkspaceSnapshot,
  createWorkspaceFile,
  deserializeWorkspaceFile,
  inferMediaType,
  normalizeWorkspacePath,
  normalizeWorkspacePrefix,
  normalizeWorkspaceSnapshot,
  serializeHeadlessWorkspaceSnapshot,
  textToBytes,
  toUint8Array
} from "./workspace-contract.js";

function missing(path) {
  return new Error(`Headless workspace file not found: ${path}`);
}

function normalizeInitialFiles(input = {}) {
  if (input.files && input.version) {
    const snapshot = normalizeWorkspaceSnapshot(input);
    return Object.entries(snapshot.files).map(([path, file]) => [path, deserializeWorkspaceFile(path, file)]);
  }
  return Object.entries(input).map(([path, value]) => [
    normalizeWorkspacePath(path),
    createWorkspaceFile(path, typeof value === "string" || value instanceof Uint8Array ? value : JSON.stringify(value, null, 2))
  ]);
}

export function createMemoryHeadlessRunWorkspace(options = {}) {
  const files = new Map();
  const initialFiles = options.version && options.files ? options : options.files ?? {};
  for (const [path, file] of normalizeInitialFiles(initialFiles)) {
    files.set(normalizeWorkspacePath(path), file);
  }

  const workspace = {
    kind: "memory",
    async read(path) {
      const normalized = normalizeWorkspacePath(path);
      const file = files.get(normalized);
      if (!file) throw missing(normalized);
      return cloneBytes(file.bytes);
    },
    async write(path, bytes, writeOptions = {}) {
      const normalized = normalizeWorkspacePath(path);
      files.set(normalized, createWorkspaceFile(normalized, toUint8Array(bytes), {
        mediaType: writeOptions.mediaType ?? inferMediaType(normalized),
        updatedAt: writeOptions.updatedAt ?? null
      }));
    },
    async writeBytes(path, bytes, writeOptions = {}) {
      return workspace.write(path, bytes, writeOptions);
    },
    async readText(path) {
      return bytesToText(await workspace.read(path));
    },
    async writeText(path, value, writeOptions = {}) {
      return workspace.write(path, textToBytes(value), { mediaType: writeOptions.mediaType ?? inferMediaType(path, "text/plain"), ...writeOptions });
    },
    async readJson(path) {
      return JSON.parse(await workspace.readText(path));
    },
    async writeJson(path, value, writeOptions = {}) {
      return workspace.writeText(path, JSON.stringify(value, null, 2), { mediaType: "application/json", ...writeOptions });
    },
    async exists(path) {
      return files.has(normalizeWorkspacePath(path));
    },
    async list(prefix = "") {
      const normalizedPrefix = normalizeWorkspacePrefix(prefix);
      return Array.from(files.keys())
        .filter((path) => !normalizedPrefix || path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`))
        .sort();
    },
    async delete(path) {
      files.delete(normalizeWorkspacePath(path));
    },
    async snapshot() {
      return createHeadlessWorkspaceSnapshot(files.entries());
    },
    async loadSnapshot(snapshot = {}) {
      files.clear();
      const next = normalizeWorkspaceSnapshot(snapshot);
      for (const [path, file] of Object.entries(next.files)) {
        files.set(normalizeWorkspacePath(path), deserializeWorkspaceFile(path, file));
      }
      return workspace;
    },
    async toTextBundle() {
      return serializeHeadlessWorkspaceSnapshot(await workspace.snapshot());
    }
  };

  return workspace;
}
