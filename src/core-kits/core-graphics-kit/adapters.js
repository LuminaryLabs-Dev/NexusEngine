const clone = value => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const uniqueStrings = values => Object.freeze([...new Set((values ?? []).filter(value => value != null).map(String))]);

export const GRAPHICS_ADAPTER_RESULT_STATES = Object.freeze(["accepted", "degraded", "rejected"]);

export function createGraphicsCapabilityProfile(input = {}) {
  const source = input?.capabilities ?? input ?? {};
  return Object.freeze({
    ...clone(source),
    reflectionTechniques: uniqueStrings(source.reflectionTechniques ?? source.reflections ?? []),
    maximumTextureSize: Math.max(0, Math.floor(finite(source.maximumTextureSize, 0))),
    maximumReflectionResolution: Math.max(0, Math.floor(finite(source.maximumReflectionResolution, 0))),
    supportsAsyncCompute: source.supportsAsyncCompute === true,
    supportsRayTracing: source.supportsRayTracing === true,
    metadata: Object.freeze(clone(source.metadata ?? {}))
  });
}

export function createGraphicsUpdateCost(input = {}) {
  return Object.freeze({
    cpuMilliseconds: Math.max(0, finite(input.cpuMilliseconds ?? input.cpuMs, 0)),
    gpuMilliseconds: Math.max(0, finite(input.gpuMilliseconds ?? input.gpuMs, 0)),
    memoryBytes: Math.max(0, Math.floor(finite(input.memoryBytes, 0))),
    drawCalls: Math.max(0, Math.floor(finite(input.drawCalls, 0))),
    probeUpdates: Math.max(0, Math.floor(finite(input.probeUpdates, 0)))
  });
}

export function createGraphicsVisibleFrameReceipt(input = {}) {
  const adapterId = String(input.adapterId ?? "graphics-adapter");
  const frameId = String(input.frameId ?? `frame:${Math.max(0, Math.floor(finite(input.frame, 0)))}`);
  return Object.freeze({
    id: String(input.id ?? `${adapterId}:${frameId}:visible`),
    adapterId,
    frameId,
    visible: input.visible !== false,
    resultId: input.resultId == null ? null : String(input.resultId),
    materialRevision: Math.max(0, Math.floor(finite(input.materialRevision, 0))),
    reflectionRevision: Math.max(0, Math.floor(finite(input.reflectionRevision, 0))),
    renderGraphVersion: input.renderGraphVersion == null ? null : String(input.renderGraphVersion),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function createGraphicsAdapterResult(input = {}) {
  const requestedTechnique = input.requestedTechnique == null ? null : String(input.requestedTechnique);
  const acceptedTechnique = input.acceptedTechnique == null ? null : String(input.acceptedTechnique);
  const inferredStatus = acceptedTechnique == null
    ? "rejected"
    : requestedTechnique && acceptedTechnique !== requestedTechnique
      ? "degraded"
      : "accepted";
  const status = String(input.status ?? inferredStatus);
  if (!GRAPHICS_ADAPTER_RESULT_STATES.includes(status)) {
    throw new TypeError(`Unsupported graphics adapter result status: ${status}`);
  }
  const fallback = input.fallback ?? (
    status === "degraded"
      ? { from: requestedTechnique, to: acceptedTechnique, reason: "unsupported-technique" }
      : null
  );
  return Object.freeze({
    id: String(input.id ?? `${input.adapterId ?? "graphics-adapter"}:${input.requestId ?? "request"}:result`),
    requestId: input.requestId == null ? null : String(input.requestId),
    adapterId: String(input.adapterId ?? "graphics-adapter"),
    status,
    requestedTechnique,
    acceptedTechnique,
    fallback: fallback == null ? null : Object.freeze(clone(fallback)),
    updateCost: createGraphicsUpdateCost(input.updateCost),
    materialRevision: Math.max(0, Math.floor(finite(input.materialRevision, 0))),
    reflectionRevision: Math.max(0, Math.floor(finite(input.reflectionRevision, 0))),
    reasons: uniqueStrings(input.reasons),
    visibleFrameReceipt: input.visibleFrameReceipt == null
      ? null
      : createGraphicsVisibleFrameReceipt(input.visibleFrameReceipt),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export const normalizeGraphicsAdapterResult = createGraphicsAdapterResult;

export function negotiateGraphicsReflection(request = {}, capabilities = {}) {
  const profile = createGraphicsCapabilityProfile(capabilities);
  const requestedTechnique = String(request.preferredTechnique ?? request.requestedTechnique ?? "environment-probe");
  const candidates = uniqueStrings([
    requestedTechnique,
    ...(request.fallbackOrder ?? request.preferredTechniques ?? [])
  ]);
  const available = new Set(profile.reflectionTechniques);
  const acceptedTechnique = candidates.find(technique => available.has(technique)) ?? null;
  const status = acceptedTechnique == null
    ? "rejected"
    : acceptedTechnique === requestedTechnique
      ? "accepted"
      : "degraded";
  const reasons = status === "accepted"
    ? []
    : status === "degraded"
      ? ["requested-technique-unavailable"]
      : ["no-supported-reflection-technique"];
  return createGraphicsAdapterResult({
    ...request,
    adapterId: request.adapterId ?? capabilities.id ?? "graphics-adapter",
    status,
    requestedTechnique,
    acceptedTechnique,
    fallback: status === "degraded"
      ? { from: requestedTechnique, to: acceptedTechnique, reason: reasons[0] }
      : null,
    reasons
  });
}

export function createGraphicsAdapterBoundary(config = {}) {
  const id = String(config.id ?? "graphics-adapter");
  const capabilities = createGraphicsCapabilityProfile(config.capabilities);
  return Object.freeze({
    id,
    kind: config.kind ?? "headless",
    capabilities,
    negotiate(request = {}) {
      const result = typeof config.negotiate === "function"
        ? config.negotiate(clone(request), capabilities)
        : negotiateGraphicsReflection({ ...request, adapterId: id }, capabilities);
      return createGraphicsAdapterResult({ ...result, adapterId: result?.adapterId ?? id });
    },
    render: typeof config.render === "function" ? config.render : () => null,
    createFrameReceipt(input = {}) {
      return createGraphicsVisibleFrameReceipt({ ...input, adapterId: id });
    },
    dispose: typeof config.dispose === "function" ? config.dispose : () => true,
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}
