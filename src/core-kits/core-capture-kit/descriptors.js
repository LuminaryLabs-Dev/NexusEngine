const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const NEXUS_CAPTURE_REQUEST_SCHEMA = "nexus-capture-request/1";
export const NEXUS_CAPTURE_JOB_SCHEMA = "nexus-capture-job/1";
export const NEXUS_CAPTURE_RESULT_SCHEMA = "nexus-capture-result/1";

export const CAPTURE_JOB_STATES = Object.freeze([
  "queued",
  "waiting-for-provider",
  "capturing",
  "ready",
  "failed",
  "cancelled"
]);

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function finite(value, fallback = 0, label = "value") {
  const next = Number(value ?? fallback);
  if (!Number.isFinite(next)) throw new TypeError(`${label} must be finite.`);
  return next;
}

function positiveInteger(value, fallback, label) {
  const next = Math.floor(finite(value, fallback, label));
  if (next < 1) throw new RangeError(`${label} must be at least 1.`);
  return next;
}

function uniqueTextList(value = [], label = "value") {
  const source = value == null ? [] : Array.isArray(value) ? value : [value];
  return Array.from(new Set(source.map((entry) => text(entry, null, label))));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (ArrayBuffer.isView(value)) return stableStringify(Array.from(value));
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function contentHash(value) {
  return hashText(stableStringify(value));
}

function normalizeAssetReference(value = {}, label = "capture asset") {
  if (typeof value === "string") return { assetId: text(value, null, `${label}.assetId`), kind: "asset", metadata: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an asset id or descriptor.`);
  }
  return {
    assetId: text(value.assetId ?? value.id, null, `${label}.assetId`),
    kind: text(value.kind, "asset", `${label}.kind`),
    metadata: clone(value.metadata ?? {})
  };
}

export function createCaptureRequest(input = {}) {
  const subject = input.subject ?? {};
  const viewSet = input.viewSet ?? input.views ?? {};
  const framing = input.framing ?? {};
  const output = input.output ?? {};
  const request = {
    schema: NEXUS_CAPTURE_REQUEST_SCHEMA,
    id: text(input.id, null, "capture request id"),
    subject: {
      objectId: text(subject.objectId, null, "capture subject objectId"),
      formId: subject.formId == null ? null : text(subject.formId, null, "capture subject formId")
    },
    viewSet: {
      pattern: text(viewSet.pattern ?? viewSet.mode, "around-subject", "capture view pattern"),
      azimuthCount: positiveInteger(viewSet.azimuthCount, 1, "capture azimuthCount"),
      elevations: (viewSet.elevations ?? [0]).map((entry, index) => finite(entry, 0, `capture elevations[${index}]`))
    },
    framing: {
      boundsSource: text(framing.boundsSource, "core-object", "capture framing boundsSource"),
      preserveGrounding: framing.preserveGrounding !== false && framing.preserveGroundAnchor !== false,
      padding: Math.max(0, finite(framing.padding, 0.08, "capture framing padding"))
    },
    observations: uniqueTextList(input.observations ?? input.channels ?? ["color", "opacity"], "capture observation"),
    output: {
      kind: text(output.kind, "atlas", "capture output kind"),
      frameSize: positiveInteger(output.frameSize, 256, "capture output frameSize")
    },
    providerId: input.providerId == null ? null : text(input.providerId, null, "capture providerId"),
    metadata: clone(input.metadata ?? {})
  };
  request.contentHash = contentHash(request);
  structuredClone(request);
  return Object.freeze(request);
}

export function createCaptureJob(input = {}) {
  const state = text(input.state, "queued", "capture job state");
  if (!CAPTURE_JOB_STATES.includes(state)) throw new TypeError(`Unsupported capture job state: ${state}`);
  const completed = Math.max(0, finite(input.progress?.completed, 0, "capture progress completed"));
  const total = Math.max(completed, finite(input.progress?.total, 1, "capture progress total"));
  const job = {
    schema: NEXUS_CAPTURE_JOB_SCHEMA,
    id: text(input.id, null, "capture job id"),
    requestId: text(input.requestId, null, "capture job requestId"),
    state,
    providerId: input.providerId == null ? null : text(input.providerId, null, "capture job providerId"),
    progress: {
      completed,
      total,
      ratio: total > 0 ? Math.min(1, completed / total) : 0
    },
    resultId: input.resultId == null ? null : text(input.resultId, null, "capture job resultId"),
    error: input.error == null ? null : clone(input.error),
    revision: Math.max(0, Math.floor(finite(input.revision, 0, "capture job revision")))
  };
  structuredClone(job);
  return Object.freeze(job);
}

export function createCaptureResult(input = {}, request = null) {
  const sourceRequest = request ? createCaptureRequest(request) : null;
  const observations = Object.fromEntries(Object.entries(input.observations ?? {}).map(([name, value]) => [
    text(name, null, "capture observation name"),
    normalizeAssetReference(value, `capture observation ${name}`)
  ]));
  const result = {
    schema: NEXUS_CAPTURE_RESULT_SCHEMA,
    id: text(input.id, `${sourceRequest?.id ?? input.requestId}:result`, "capture result id"),
    requestId: text(input.requestId, sourceRequest?.id, "capture result requestId"),
    objectId: text(input.objectId, sourceRequest?.subject?.objectId, "capture result objectId"),
    state: "ready",
    observations,
    frames: (input.frames ?? []).map((frame, index) => ({
      frameIndex: Math.max(0, Math.floor(finite(frame.frameIndex, index, "capture frameIndex"))),
      azimuthDegrees: finite(frame.azimuthDegrees, 0, "capture azimuthDegrees"),
      elevationDegrees: finite(frame.elevationDegrees, 0, "capture elevationDegrees"),
      atlasCell: Array.isArray(frame.atlasCell)
        ? [Math.floor(finite(frame.atlasCell[0], 0)), Math.floor(finite(frame.atlasCell[1], 0))]
        : [0, 0]
    })),
    metadata: clone(input.metadata ?? {})
  };
  if (sourceRequest) {
    for (const observation of sourceRequest.observations) {
      if (!result.observations[observation]) throw new TypeError(`Capture result is missing requested observation: ${observation}.`);
    }
  }
  result.contentHash = contentHash(result);
  structuredClone(result);
  return Object.freeze(result);
}

export function validateCaptureRequest(value) {
  const errors = [];
  try { createCaptureRequest(value); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}

export function validateCaptureResult(value, request = null) {
  const errors = [];
  try { createCaptureResult(value, request); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
  return { valid: errors.length === 0, errors };
}
