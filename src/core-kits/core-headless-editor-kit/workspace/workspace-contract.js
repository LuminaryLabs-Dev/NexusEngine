import { HEADLESS_EDITOR_WORKSPACE_SNAPSHOT_VERSION } from "../constants.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizeWorkspacePath(path) {
  if (typeof path !== "string" || path.trim().length === 0) {
    throw new TypeError("Headless workspace paths must be non-empty strings.");
  }
  const trimmed = path.trim().replaceAll("\\", "/");
  if (trimmed.startsWith("/") || /^[a-zA-Z]:\//.test(trimmed)) {
    throw new TypeError(`Headless workspace paths must be virtual relative paths: ${path}`);
  }
  const parts = [];
  for (const part of trimmed.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") throw new TypeError(`Headless workspace paths cannot traverse upward: ${path}`);
    parts.push(part);
  }
  if (parts.length === 0) throw new TypeError(`Headless workspace path resolved empty: ${path}`);
  return parts.join("/");
}

export function normalizeWorkspacePrefix(prefix = "") {
  if (!prefix) return "";
  return normalizeWorkspacePath(prefix).replace(/\/$/, "");
}

export function inferMediaType(path, fallback = "application/octet-stream") {
  const normalized = String(path).toLowerCase();
  if (normalized.endsWith(".json")) return "application/json";
  if (normalized.endsWith(".md") || normalized.endsWith(".markdown")) return "text/markdown";
  if (normalized.endsWith(".txt") || normalized.endsWith(".log")) return "text/plain";
  if (normalized.endsWith(".html")) return "text/html";
  if (normalized.endsWith(".svg")) return "image/svg+xml";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";
  return fallback;
}

export function isTextMediaType(mediaType = "") {
  return mediaType.startsWith("text/") || mediaType === "application/json" || mediaType === "image/svg+xml";
}

export function toUint8Array(value) {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  if (typeof value === "string") return encoder.encode(value);
  throw new TypeError("Workspace write expects Uint8Array, ArrayBuffer, ArrayBuffer view, or string.");
}

export function bytesToText(bytes) {
  return decoder.decode(bytes);
}

export function textToBytes(text) {
  return encoder.encode(String(text));
}

export function cloneBytes(bytes) {
  return new Uint8Array(bytes);
}

export function bytesToBase64(bytes) {
  if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}

export function base64ToBytes(value) {
  if (globalThis.Buffer) return new Uint8Array(globalThis.Buffer.from(value, "base64"));
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function createWorkspaceFile(path, value, options = {}) {
  const normalizedPath = normalizeWorkspacePath(path);
  const bytes = toUint8Array(value);
  const mediaType = options.mediaType ?? inferMediaType(normalizedPath);
  return Object.freeze({
    path: normalizedPath,
    bytes,
    mediaType,
    updatedAt: options.updatedAt ?? null
  });
}

export function serializeWorkspaceFile(file) {
  const mediaType = file.mediaType ?? inferMediaType(file.path);
  if (isTextMediaType(mediaType)) {
    return {
      encoding: "utf8",
      content: bytesToText(file.bytes),
      mediaType
    };
  }
  return {
    encoding: "base64",
    content: bytesToBase64(file.bytes),
    mediaType
  };
}

export function deserializeWorkspaceFile(path, file = {}) {
  const normalizedPath = normalizeWorkspacePath(path);
  const encoding = file.encoding ?? "utf8";
  const bytes = encoding === "base64" ? base64ToBytes(file.content ?? "") : textToBytes(file.content ?? "");
  return createWorkspaceFile(normalizedPath, bytes, { mediaType: file.mediaType ?? inferMediaType(normalizedPath) });
}

export function createHeadlessWorkspaceSnapshot(files = []) {
  const entries = Array.from(files).sort(([a], [b]) => a.localeCompare(b));
  return {
    version: HEADLESS_EDITOR_WORKSPACE_SNAPSHOT_VERSION,
    files: Object.fromEntries(entries.map(([path, file]) => [normalizeWorkspacePath(path), serializeWorkspaceFile(file)]))
  };
}

export function normalizeWorkspaceSnapshot(snapshot = {}) {
  if (typeof snapshot === "string") return normalizeWorkspaceSnapshot(JSON.parse(snapshot));
  if (!isObject(snapshot) || !isObject(snapshot.files)) {
    throw new TypeError("Headless workspace snapshot must contain a files object.");
  }
  return {
    version: snapshot.version ?? HEADLESS_EDITOR_WORKSPACE_SNAPSHOT_VERSION,
    files: { ...snapshot.files }
  };
}

export function serializeHeadlessWorkspaceSnapshot(snapshot = {}) {
  return JSON.stringify(normalizeWorkspaceSnapshot(snapshot), null, 2);
}
