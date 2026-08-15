import { canonicalizePortableValue } from "../contracts/portable-value.js";

export const SURFACE_CONTRACT_SCHEMA = "nexusengine.render-surface-contract/1";
export const SURFACE_REGISTRY_RECORD_SCHEMA = "nexusengine.render-surface-registry-record/1";
export const SURFACE_DEFINE_COMMAND_SCHEMA = "nexusengine.render-surface-define-command/1";
export const SURFACE_REPLACE_COMMAND_SCHEMA = "nexusengine.render-surface-replace-command/1";
export const SURFACE_REMOVE_COMMAND_SCHEMA = "nexusengine.render-surface-remove-command/1";

const COMMON_STATE_KEYS = Object.freeze([
  "id",
  "domain",
  "version",
  "config",
  "descriptors",
  "policies",
  "adapters",
  "metadata",
  "sequence",
  "lastEvent",
  "operationReceipts",
  "receiptBaseline",
  "records",
  "order",
  "recordRevisions",
  "surfaceRevision"
]);

const COLOR_SPACES = Object.freeze(["display-p3", "extended-srgb", "rec2020", "srgb"]);
const ALPHA_MODES = Object.freeze(["inherit", "opaque", "postmultiplied", "premultiplied"]);
const SAMPLE_COUNTS = Object.freeze([1, 2, 4, 8, 16]);

const KITS = Object.freeze({
  "render-surface-kit": Object.freeze({
    api: "renderSurfaces",
    token: "render:surface",
    domain: "render-surface",
    label: "Render surface",
    schema: "nexusengine.render-surface-descriptor/1",
    fields: Object.freeze(["kind", "width", "height", "pixelRatio", "colorSpace", "visible"]),
    requires: Object.freeze(["n:render", "render:provider-contract", "render:device-contract"]),
    provides: Object.freeze(["n:render:surface", "render:surface"])
  }),
  "window-surface-kit": Object.freeze({
    api: "renderWindowSurfaces",
    token: "render:window-surface",
    domain: "render-window-surface",
    label: "Window surface",
    schema: "nexusengine.render-window-surface-descriptor/1",
    fields: Object.freeze(["surfaceId", "resizable", "transparent"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:window-surface"])
  }),
  "offscreen-surface-kit": Object.freeze({
    api: "renderOffscreenSurfaces",
    token: "render:offscreen-surface",
    domain: "render-offscreen-surface",
    label: "Offscreen surface",
    schema: "nexusengine.render-offscreen-surface-descriptor/1",
    fields: Object.freeze(["surfaceId", "layers", "sampleCount", "usage"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:offscreen-surface"])
  }),
  "swapchain-surface-kit": Object.freeze({
    api: "renderSwapchainSurfaces",
    token: "render:swapchain-surface",
    domain: "render-swapchain-surface",
    label: "Swapchain surface",
    schema: "nexusengine.render-swapchain-surface-descriptor/1",
    fields: Object.freeze(["surfaceId", "deviceId", "formatId", "imageCount", "presentMode", "alphaMode"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:surface-format", "render:device-lifecycle"]),
    provides: Object.freeze(["render:swapchain-surface"])
  }),
  "viewport-kit": Object.freeze({
    api: "renderViewports",
    token: "render:viewport",
    domain: "render-viewport",
    label: "Viewport",
    schema: "nexusengine.render-viewport-descriptor/1",
    fields: Object.freeze(["surfaceId", "units", "x", "y", "width", "height", "minDepth", "maxDepth"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:viewport"])
  }),
  "scissor-kit": Object.freeze({
    api: "renderScissors",
    token: "render:scissor",
    domain: "render-scissor",
    label: "Scissor",
    schema: "nexusengine.render-scissor-descriptor/1",
    fields: Object.freeze(["surfaceId", "units", "x", "y", "width", "height", "enabled"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:scissor"])
  }),
  "resize-kit": Object.freeze({
    api: "renderResizeIntents",
    token: "render:resize",
    domain: "render-resize",
    label: "Resize intent",
    schema: "nexusengine.render-resize-intent/1",
    fields: Object.freeze(["surfaceId", "width", "height", "pixelRatio", "reason"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:resize"])
  }),
  "fullscreen-kit": Object.freeze({
    api: "renderFullscreenIntents",
    token: "render:fullscreen",
    domain: "render-fullscreen",
    label: "Fullscreen intent",
    schema: "nexusengine.render-fullscreen-intent/1",
    fields: Object.freeze(["surfaceId", "action", "mode"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:fullscreen"])
  }),
  "surface-format-kit": Object.freeze({
    api: "renderSurfaceFormats",
    token: "render:surface-format",
    domain: "render-surface-format",
    label: "Surface format",
    schema: "nexusengine.render-surface-format/1",
    fields: Object.freeze(["colorFormat", "depthStencilFormat", "colorSpace", "alphaMode", "sampleCount", "hdr"]),
    requires: Object.freeze(["n:render:surface", "render:surface", "render:device-contract"]),
    provides: Object.freeze(["render:surface-format"])
  })
});

function normalizeSignedZero(value) {
  if (Array.isArray(value)) return value.map(normalizeSignedZero);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeSignedZero(value[key])]));
  }
  return Object.is(value, -0) ? 0 : value;
}

function canonicalSurfaceValue(value, label) {
  try {
    return normalizeSignedZero(canonicalizePortableValue(value, label));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-portable: ${error.message}`);
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

function rejectFields(value, allowedFields, label) {
  const allowed = new Set(allowedFields);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key)).sort();
  if (unknown.length) throw new TypeError(`${label} contains unknown fields: ${unknown.join(", ")}.`);
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

function requireIdentifier(value, label) {
  const id = requireText(value, label);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(id) || Object.hasOwn(Object.prototype, id)) {
    throw new TypeError(`${label} must be a safe portable identifier.`);
  }
  return id;
}

function normalizeToken(value, label) {
  const token = requireText(value, label).toLowerCase();
  if (!/^[a-z0-9]+(?:[.:/_-][a-z0-9]+)*$/.test(token)) throw new TypeError(`${label} must be a portable token.`);
  return token;
}

function finite(value, label, fallback) {
  const next = value === undefined ? fallback : value;
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return Object.is(next, -0) ? 0 : next;
}

function positiveInteger(value, label, fallback) {
  const next = value === undefined ? fallback : value;
  if (!Number.isSafeInteger(next) || next <= 0) throw new TypeError(`${label} must be a positive safe integer.`);
  return next;
}

function nonnegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${label} must be a nonnegative safe integer.`);
  return value;
}

function positiveNumber(value, label, fallback) {
  const next = finite(value, label, fallback);
  if (next <= 0) throw new TypeError(`${label} must be greater than zero.`);
  return next;
}

function boolean(value, label, fallback) {
  const next = value === undefined ? fallback : value;
  if (typeof next !== "boolean") throw new TypeError(`${label} must be boolean.`);
  return next;
}

function enumValue(value, allowed, label, fallback) {
  const next = value === undefined ? fallback : value;
  if (!allowed.includes(next)) throw new TypeError(`${label} must be one of: ${allowed.join(", ")}.`);
  return next;
}

function normalizeSchema(value, schema, label) {
  const next = value === undefined ? schema : value;
  if (next !== schema) throw new TypeError(`${label}.schema must equal ${schema}.`);
  return next;
}

function normalizeMetadata(value, label) {
  const next = value ?? {};
  requireObject(next, label);
  return canonicalSurfaceValue(next, label);
}

function normalizeUsage(value, label) {
  const allowed = ["color-attachment", "copy-destination", "copy-source", "depth-stencil-attachment", "sampled", "storage"];
  const next = value ?? ["color-attachment"];
  if (!Array.isArray(next) || next.length === 0) throw new TypeError(`${label} must be a non-empty array.`);
  const normalized = next.map((entry, index) => enumValue(entry, allowed, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} cannot contain duplicates.`);
  return normalized.sort();
}

function normalizeRegion(value, label, includeDepth = false) {
  const units = enumValue(value.units, ["normalized", "pixels"], `${label}.units`, "normalized");
  const x = finite(value.x, `${label}.x`, 0);
  const y = finite(value.y, `${label}.y`, 0);
  const width = positiveNumber(value.width, `${label}.width`, units === "normalized" ? 1 : undefined);
  const height = positiveNumber(value.height, `${label}.height`, units === "normalized" ? 1 : undefined);
  if (x < 0 || y < 0) throw new TypeError(`${label} coordinates cannot be negative.`);
  if (units === "normalized") {
    if (x + width > 1 || y + height > 1) throw new TypeError(`${label} normalized bounds must remain within [0, 1].`);
  } else if (![x, y, width, height].every(Number.isSafeInteger)) {
    throw new TypeError(`${label} pixel coordinates and dimensions must be safe integers.`);
  }
  const result = { units, x, y, width, height };
  if (includeDepth) {
    result.minDepth = finite(value.minDepth, `${label}.minDepth`, 0);
    result.maxDepth = finite(value.maxDepth, `${label}.maxDepth`, 1);
    if (result.minDepth < 0 || result.maxDepth > 1 || result.maxDepth <= result.minDepth) {
      throw new TypeError(`${label} depth requires 0 <= minDepth < maxDepth <= 1.`);
    }
  }
  return result;
}

export function surfaceKitDefinition(kitId) {
  const definition = KITS[kitId];
  if (!definition) throw new TypeError(`Unknown Render Surface Kit ${kitId}.`);
  return definition;
}

export function listSurfaceKitDefinitions() {
  return Object.entries(KITS).map(([kitId, definition]) => Object.freeze({ kitId, ...definition }));
}

export function normalizeSurfaceIdentifier(value, label = "Render Surface identifier") {
  return requireIdentifier(value, label);
}

export function normalizeSurfaceDescriptor(kitId, input = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(input, `${definition.label} descriptor`);
  rejectFields(input, ["schema", "id", ...definition.fields, "metadata"], `${definition.label} descriptor`);
  const value = canonicalSurfaceValue(input, `${definition.label} descriptor`);
  const result = {
    schema: normalizeSchema(value.schema, definition.schema, `${definition.label} descriptor`),
    id: requireIdentifier(value.id, `${definition.label} descriptor.id`)
  };

  if (kitId === "render-surface-kit") {
    result.kind = enumValue(value.kind, ["offscreen", "swapchain", "window", "xr"], "Render surface kind");
    result.width = positiveInteger(value.width, "Render surface width");
    result.height = positiveInteger(value.height, "Render surface height");
    result.pixelRatio = positiveNumber(value.pixelRatio, "Render surface pixelRatio", 1);
    result.colorSpace = enumValue(value.colorSpace, COLOR_SPACES, "Render surface colorSpace", "srgb");
    result.visible = boolean(value.visible, "Render surface visible", true);
  } else if (kitId === "window-surface-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Window surface surfaceId");
    result.resizable = boolean(value.resizable, "Window surface resizable", true);
    result.transparent = boolean(value.transparent, "Window surface transparent", false);
  } else if (kitId === "offscreen-surface-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Offscreen surface surfaceId");
    result.layers = positiveInteger(value.layers, "Offscreen surface layers", 1);
    result.sampleCount = enumValue(value.sampleCount, SAMPLE_COUNTS, "Offscreen surface sampleCount", 1);
    result.usage = normalizeUsage(value.usage, "Offscreen surface usage");
  } else if (kitId === "swapchain-surface-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Swapchain surface surfaceId");
    result.deviceId = requireIdentifier(value.deviceId, "Swapchain surface deviceId");
    result.formatId = requireIdentifier(value.formatId, "Swapchain surface formatId");
    result.imageCount = positiveInteger(value.imageCount, "Swapchain surface imageCount", 2);
    if (result.imageCount < 2 || result.imageCount > 8) throw new TypeError("Swapchain surface imageCount must be between 2 and 8.");
    result.presentMode = enumValue(value.presentMode, ["fifo", "immediate", "mailbox"], "Swapchain surface presentMode", "fifo");
    result.alphaMode = enumValue(value.alphaMode, ALPHA_MODES, "Swapchain surface alphaMode", "opaque");
  } else if (kitId === "viewport-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Viewport surfaceId");
    Object.assign(result, normalizeRegion(value, "Viewport", true));
  } else if (kitId === "scissor-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Scissor surfaceId");
    Object.assign(result, normalizeRegion(value, "Scissor"));
    result.enabled = boolean(value.enabled, "Scissor enabled", true);
  } else if (kitId === "resize-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Resize intent surfaceId");
    result.width = positiveInteger(value.width, "Resize intent width");
    result.height = positiveInteger(value.height, "Resize intent height");
    result.pixelRatio = positiveNumber(value.pixelRatio, "Resize intent pixelRatio", 1);
    result.reason = enumValue(value.reason, ["device", "host", "layout", "user"], "Resize intent reason", "host");
  } else if (kitId === "fullscreen-kit") {
    result.surfaceId = requireIdentifier(value.surfaceId, "Fullscreen intent surfaceId");
    result.action = enumValue(value.action, ["enter", "exit"], "Fullscreen intent action");
    result.mode = enumValue(value.mode, ["borderless", "exclusive", "immersive"], "Fullscreen intent mode", "borderless");
  } else if (kitId === "surface-format-kit") {
    result.colorFormat = normalizeToken(value.colorFormat, "Surface format colorFormat");
    result.depthStencilFormat = value.depthStencilFormat === null || value.depthStencilFormat === undefined
      ? null
      : normalizeToken(value.depthStencilFormat, "Surface format depthStencilFormat");
    result.colorSpace = enumValue(value.colorSpace, COLOR_SPACES, "Surface format colorSpace", "srgb");
    result.alphaMode = enumValue(value.alphaMode, ALPHA_MODES, "Surface format alphaMode", "opaque");
    result.sampleCount = enumValue(value.sampleCount, SAMPLE_COUNTS, "Surface format sampleCount", 1);
    result.hdr = boolean(value.hdr, "Surface format hdr", false);
  }

  result.metadata = normalizeMetadata(value.metadata, `${definition.label} descriptor.metadata`);
  return result;
}

export function normalizeSurfaceRegistryRecord(kitId, input = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(input, `${definition.label} registry record`);
  rejectFields(input, ["schema", "descriptor", "revision"], `${definition.label} registry record`);
  const value = canonicalSurfaceValue(input, `${definition.label} registry record`);
  return {
    schema: normalizeSchema(value.schema, SURFACE_REGISTRY_RECORD_SCHEMA, `${definition.label} registry record`),
    descriptor: normalizeSurfaceDescriptor(kitId, value.descriptor),
    revision: positiveInteger(value.revision, `${definition.label} registry record.revision`)
  };
}

export function normalizeSurfaceDefineCommand(kitId, command = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(command, `${definition.label} define command`);
  rejectFields(command, ["schema", "operationId", "descriptor"], `${definition.label} define command`);
  const value = canonicalSurfaceValue(command, `${definition.label} define command`);
  return {
    schema: normalizeSchema(value.schema, SURFACE_DEFINE_COMMAND_SCHEMA, `${definition.label} define command`),
    operationId: requireIdentifier(value.operationId, `${definition.label} define command.operationId`),
    descriptor: normalizeSurfaceDescriptor(kitId, value.descriptor)
  };
}

export function normalizeSurfaceReplaceCommand(kitId, command = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(command, `${definition.label} replace command`);
  rejectFields(command, ["schema", "operationId", "expectedRevision", "descriptor"], `${definition.label} replace command`);
  const value = canonicalSurfaceValue(command, `${definition.label} replace command`);
  return {
    schema: normalizeSchema(value.schema, SURFACE_REPLACE_COMMAND_SCHEMA, `${definition.label} replace command`),
    operationId: requireIdentifier(value.operationId, `${definition.label} replace command.operationId`),
    expectedRevision: positiveInteger(value.expectedRevision, `${definition.label} replace command.expectedRevision`),
    descriptor: normalizeSurfaceDescriptor(kitId, value.descriptor)
  };
}

export function normalizeSurfaceRemoveCommand(kitId, command = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(command, `${definition.label} remove command`);
  rejectFields(command, ["schema", "operationId", "id", "expectedRevision"], `${definition.label} remove command`);
  const value = canonicalSurfaceValue(command, `${definition.label} remove command`);
  return {
    schema: normalizeSchema(value.schema, SURFACE_REMOVE_COMMAND_SCHEMA, `${definition.label} remove command`),
    operationId: requireIdentifier(value.operationId, `${definition.label} remove command.operationId`),
    id: requireIdentifier(value.id, `${definition.label} remove command.id`),
    expectedRevision: positiveInteger(value.expectedRevision, `${definition.label} remove command.expectedRevision`)
  };
}

function normalizeSurfaceReceiptResult(kitId, input, label) {
  requireObject(input, label);
  const value = canonicalSurfaceValue(input, label);
  if (Object.hasOwn(value, "created")) {
    rejectFields(value, ["record", "created"], label);
    return {
      record: normalizeSurfaceRegistryRecord(kitId, value.record),
      created: boolean(value.created, `${label}.created`)
    };
  }
  if (Object.hasOwn(value, "changed")) {
    rejectFields(value, ["record", "changed"], label);
    return {
      record: normalizeSurfaceRegistryRecord(kitId, value.record),
      changed: boolean(value.changed, `${label}.changed`)
    };
  }
  if (Object.hasOwn(value, "removed")) {
    rejectFields(value, ["id", "removed", "tombstoneRevision"], label);
    if (value.removed !== true) throw new TypeError(`${label}.removed must be true.`);
    return {
      id: requireIdentifier(value.id, `${label}.id`),
      removed: true,
      tombstoneRevision: positiveInteger(value.tombstoneRevision, `${label}.tombstoneRevision`)
    };
  }
  throw new TypeError(`${label} must be a define, replace, or remove result.`);
}

export function normalizeSurfaceSnapshot(kitId, snapshot = {}) {
  const definition = surfaceKitDefinition(kitId);
  requireObject(snapshot, `${definition.label} snapshot`);
  rejectFields(snapshot, COMMON_STATE_KEYS, `${definition.label} snapshot`);
  const value = canonicalSurfaceValue(snapshot, `${definition.label} snapshot`);
  if (value.domain !== definition.domain) throw new TypeError(`${definition.label} snapshot.domain must equal ${definition.domain}.`);
  value.id = requireText(value.id, `${definition.label} snapshot.id`);
  value.version = requireText(value.version, `${definition.label} snapshot.version`);
  for (const field of ["config", "descriptors", "policies", "metadata", "records", "recordRevisions"]) {
    requireObject(value[field], `${definition.label} snapshot.${field}`);
  }
  if (!Array.isArray(value.adapters)) throw new TypeError(`${definition.label} snapshot.adapters must be an array.`);
  value.adapters = value.adapters.map((entry, index) => requireText(entry, `${definition.label} snapshot.adapters[${index}]`));
  if (new Set(value.adapters).size !== value.adapters.length) throw new TypeError(`${definition.label} snapshot.adapters cannot contain duplicates.`);
  value.sequence = nonnegativeInteger(value.sequence, `${definition.label} snapshot.sequence`);
  value.receiptBaseline = nonnegativeInteger(value.receiptBaseline, `${definition.label} snapshot.receiptBaseline`);
  if (value.sequence < value.receiptBaseline) throw new TypeError(`${definition.label} snapshot.sequence cannot be below receiptBaseline.`);
  if (value.lastEvent !== null && typeof value.lastEvent !== "string") throw new TypeError(`${definition.label} snapshot.lastEvent must be null or a string.`);

  const normalizedRevisions = {};
  for (const id of Object.keys(value.recordRevisions).sort()) {
    const normalizedId = requireIdentifier(id, `${definition.label} snapshot.recordRevisions key`);
    normalizedRevisions[normalizedId] = positiveInteger(value.recordRevisions[id], `${definition.label} snapshot.recordRevisions.${id}`);
  }
  value.recordRevisions = normalizedRevisions;

  const normalizedRecords = {};
  for (const id of Object.keys(value.records).sort()) {
    requireIdentifier(id, `${definition.label} snapshot record key`);
    const record = normalizeSurfaceRegistryRecord(kitId, value.records[id]);
    if (record.descriptor.id !== id) throw new TypeError(`${definition.label} snapshot record key ${id} must match descriptor.id.`);
    if (value.recordRevisions[id] !== record.revision) {
      throw new TypeError(`${definition.label} snapshot record ${id} must match recordRevisions.`);
    }
    normalizedRecords[id] = record;
  }
  value.records = normalizedRecords;
  const expectedOrder = Object.keys(normalizedRecords).sort();
  if (!Array.isArray(value.order) || JSON.stringify(value.order) !== JSON.stringify(expectedOrder)) {
    throw new TypeError(`${definition.label} snapshot.order must contain every descriptor ID in sorted order.`);
  }
  value.order = expectedOrder;
  value.surfaceRevision = nonnegativeInteger(value.surfaceRevision, `${definition.label} snapshot.surfaceRevision`);
  const revisionValues = Object.values(value.recordRevisions);
  const largestRecordRevision = revisionValues.length ? Math.max(...revisionValues) : 0;
  if (value.surfaceRevision < largestRecordRevision || value.surfaceRevision < revisionValues.length) {
    throw new TypeError(`${definition.label} snapshot.surfaceRevision cannot be below retained record history.`);
  }
  if (value.surfaceRevision > value.sequence) throw new TypeError(`${definition.label} snapshot.surfaceRevision cannot exceed snapshot.sequence.`);
  if (value.surfaceRevision < value.receiptBaseline) throw new TypeError(`${definition.label} snapshot.surfaceRevision cannot be below receiptBaseline.`);

  if (!Object.hasOwn(value, "operationReceipts")) throw new TypeError(`${definition.label} snapshot.operationReceipts is required.`);
  const receipts = value.operationReceipts;
  requireObject(receipts, `${definition.label} snapshot.operationReceipts`);
  const normalizedReceipts = {};
  const receiptRevisions = new Set();
  for (const operationId of Object.keys(receipts).sort()) {
    requireIdentifier(operationId, `${definition.label} operation receipt key`);
    const receipt = receipts[operationId];
    requireObject(receipt, `${definition.label} operation receipt ${operationId}`);
    rejectFields(receipt, ["schema", "operationId", "requestHash", "kitId", "revision", "result"], `${definition.label} operation receipt ${operationId}`);
    if (receipt.schema !== "nexusengine.operation-receipt/1") throw new TypeError(`${definition.label} operation receipt ${operationId} has an invalid schema.`);
    if (requireIdentifier(receipt.operationId, `${definition.label} operation receipt.operationId`) !== operationId) {
      throw new TypeError(`${definition.label} operation receipt key ${operationId} must match receipt.operationId.`);
    }
    if (typeof receipt.requestHash !== "string" || !/^sha256:[0-9a-f]{64}$/.test(receipt.requestHash)) {
      throw new TypeError(`${definition.label} operation receipt ${operationId}.requestHash must be a SHA-256 integrity string.`);
    }
    receipt.kitId = requireText(receipt.kitId, `${definition.label} operation receipt ${operationId}.kitId`);
    receipt.revision = positiveInteger(receipt.revision, `${definition.label} operation receipt ${operationId}.revision`);
    if (receipt.revision > value.sequence) throw new TypeError(`${definition.label} operation receipt ${operationId}.revision cannot exceed snapshot.sequence.`);
    if (receipt.revision <= value.receiptBaseline) throw new TypeError(`${definition.label} operation receipt ${operationId}.revision must exceed receiptBaseline.`);
    if (receiptRevisions.has(receipt.revision)) throw new TypeError(`${definition.label} operation receipts cannot share revision ${receipt.revision}.`);
    receiptRevisions.add(receipt.revision);
    if (!Object.hasOwn(receipt, "result")) throw new TypeError(`${definition.label} operation receipt ${operationId}.result is required.`);
    receipt.result = normalizeSurfaceReceiptResult(kitId, receipt.result, `${definition.label} operation receipt ${operationId}.result`);
    const resultId = receipt.result.record?.descriptor.id ?? receipt.result.id;
    const resultRevision = receipt.result.record?.revision ?? receipt.result.tombstoneRevision;
    if (resultRevision > receipt.revision) {
      throw new TypeError(`${definition.label} operation receipt ${operationId}.result revision cannot exceed receipt.revision.`);
    }
    if (!value.recordRevisions[resultId] || resultRevision > value.recordRevisions[resultId]) {
      throw new TypeError(`${definition.label} operation receipt ${operationId}.result exceeds retained record history.`);
    }
    normalizedReceipts[operationId] = canonicalSurfaceValue(receipt, `${definition.label} operation receipt ${operationId}`);
  }
  const expectedReceiptCount = value.sequence - value.receiptBaseline;
  if (receiptRevisions.size !== expectedReceiptCount) {
    throw new TypeError(`${definition.label} snapshot.operationReceipts must cover every revision after receiptBaseline.`);
  }
  for (let revision = value.receiptBaseline + 1; revision <= value.sequence; revision += 1) {
    if (!receiptRevisions.has(revision)) throw new TypeError(`${definition.label} snapshot.operationReceipts is missing revision ${revision}.`);
  }
  const receiptResults = Object.values(normalizedReceipts).map((receipt) => receipt.result);
  const semanticReceiptCount = receiptResults.filter((result) => result.created === true || result.changed === true || result.removed === true).length;
  if (value.surfaceRevision !== value.receiptBaseline + semanticReceiptCount) {
    throw new TypeError(`${definition.label} snapshot.surfaceRevision must match semantic operation receipts.`);
  }
  for (const [id, revision] of Object.entries(value.recordRevisions)) {
    const liveRecord = value.records[id];
    const matchingHistory = receiptResults.some((result) => {
      if (liveRecord) {
        const changedRecord = result.created === true || result.changed === true;
        return changedRecord && sameSurfaceValue(result.record, liveRecord);
      }
      return result.removed === true && result.id === id && result.tombstoneRevision === revision;
    });
    if ((!liveRecord || revision > 1) && !matchingHistory) {
      throw new TypeError(`${definition.label} snapshot record history for ${id} lacks a matching operation receipt.`);
    }
  }
  value.operationReceipts = normalizedReceipts;
  return value;
}

export function assertSurfaceSnapshotIdentity(kitId, snapshot, current, installedKitId) {
  const definition = surfaceKitDefinition(kitId);
  if (snapshot.id !== current.id) throw new TypeError(`${definition.label} snapshot.id must equal ${current.id}.`);
  if (snapshot.version !== current.version) throw new TypeError(`${definition.label} snapshot.version must equal ${current.version}.`);
  for (const field of ["config", "descriptors", "policies", "adapters", "metadata"]) {
    if (!sameSurfaceValue(snapshot[field], current[field])) {
      throw new TypeError(`${definition.label} snapshot.${field} must match the installed Kit.`);
    }
  }
  if (snapshot.receiptBaseline !== current.receiptBaseline) {
    throw new TypeError(`${definition.label} snapshot.receiptBaseline must equal ${current.receiptBaseline}.`);
  }
  for (const [operationId, receipt] of Object.entries(snapshot.operationReceipts)) {
    if (receipt.kitId !== installedKitId) throw new TypeError(`${definition.label} operation receipt ${operationId}.kitId must equal ${installedKitId}.`);
  }
  return snapshot;
}

export function validateSurfaceReferenceSemantics(kitId, descriptorInput, surfaceInput, formatInput = null) {
  if (kitId === "render-surface-kit" || kitId === "surface-format-kit") return true;
  const descriptor = normalizeSurfaceDescriptor(kitId, descriptorInput);
  const surface = normalizeSurfaceDescriptor("render-surface-kit", surfaceInput);

  if (descriptor.surfaceId !== surface.id) throw new TypeError(`${surfaceKitDefinition(kitId).label} surfaceId does not match the referenced Render surface.`);
  if (kitId === "window-surface-kit") {
    if (surface.kind !== "window") throw new TypeError("Window surface requires a base Render surface of kind window.");
  } else if (kitId === "offscreen-surface-kit") {
    if (surface.kind !== "offscreen") throw new TypeError("Offscreen surface requires a base Render surface of kind offscreen.");
  } else if (kitId === "swapchain-surface-kit") {
    if (!["swapchain", "xr"].includes(surface.kind)) throw new TypeError("Swapchain surface requires a base Render surface of kind swapchain or xr.");
    const format = normalizeSurfaceDescriptor("surface-format-kit", formatInput);
    if (descriptor.formatId !== format.id) throw new TypeError("Swapchain surface formatId does not match the referenced Surface format.");
    if (format.colorSpace !== surface.colorSpace) throw new TypeError("Swapchain Surface format colorSpace must match its base Render surface.");
  } else if ((kitId === "viewport-kit" || kitId === "scissor-kit") && descriptor.units === "pixels") {
    if (descriptor.x + descriptor.width > surface.width || descriptor.y + descriptor.height > surface.height) {
      throw new TypeError(`${surfaceKitDefinition(kitId).label} pixel bounds exceed the referenced Render surface.`);
    }
  } else if (kitId === "fullscreen-kit") {
    const expectedKind = descriptor.mode === "immersive" ? "xr" : "window";
    if (surface.kind !== expectedKind) throw new TypeError(`Fullscreen mode ${descriptor.mode} requires a base Render surface of kind ${expectedKind}.`);
  }
  return true;
}

export function inspectSurfaceDescriptor(kitId, input) {
  const definition = surfaceKitDefinition(kitId);
  try {
    return Object.freeze({ schema: definition.schema, valid: true, value: normalizeSurfaceDescriptor(kitId, input), errors: Object.freeze([]) });
  } catch (error) {
    return Object.freeze({
      schema: definition.schema,
      valid: false,
      value: null,
      errors: Object.freeze([Object.freeze({ code: "invalid-render-surface-descriptor", message: error.message })])
    });
  }
}

export function sameSurfaceValue(left, right) {
  return JSON.stringify(canonicalSurfaceValue(left, "Render Surface value")) === JSON.stringify(canonicalSurfaceValue(right, "Render Surface value"));
}

export function surfaceKitContract(kitId) {
  const definition = surfaceKitDefinition(kitId);
  return Object.freeze({
    schema: SURFACE_CONTRACT_SCHEMA,
    descriptorSchema: definition.schema,
    registryRecordSchema: SURFACE_REGISTRY_RECORD_SCHEMA,
    defineCommandSchema: SURFACE_DEFINE_COMMAND_SCHEMA,
    replaceCommandSchema: SURFACE_REPLACE_COMMAND_SCHEMA,
    removeCommandSchema: SURFACE_REMOVE_COMMAND_SCHEMA,
    kitId,
    api: definition.api,
    capabilityToken: definition.token,
    exactOnceCommands: true,
    expectedRevision: true,
    sortedOrder: true,
    currentReferenceValidation: true,
    rawGenericMutationMethods: false,
    snapshotHistory: "configured-baseline-plus-complete-receipt-replay",
    incompatibleParentMutation: "reject-until-dependent-records-are-removed",
    providerExecutionOwnedExternally: true,
    hostHandlesOwnedExternally: true,
    referenceValidation: kitId === "render-surface-kit" || kitId === "surface-format-kit"
      ? "self-contained"
      : "installed-public-capabilities",
    providerConsumesValidatedRecords: true,
    hostTransitionsOwnedExternally: kitId === "window-surface-kit" || kitId === "fullscreen-kit"
  });
}
