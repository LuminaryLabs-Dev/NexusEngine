import {
  DEFAULT_PRESENTATION_OUTPUT_POLICY,
  PRESENTATION_FRAME_MODES
} from "../../core-domains/core-presentation-domain/contracts.js";

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const positive = (value, fallback = 1) => Math.max(0, finite(value, fallback));
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function normalizePresentationSurface(input = {}) {
  const cssWidth = positive(input.cssWidth ?? input.width, 0);
  const cssHeight = positive(input.cssHeight ?? input.height, 0);
  const pixelRatio = Math.max(0.01, finite(input.pixelRatio, 1));
  const sourceInsets = input.safeInsets ?? {};
  const safeInsets = {
    top: positive(sourceInsets.top, 0),
    right: positive(sourceInsets.right, 0),
    bottom: positive(sourceInsets.bottom, 0),
    left: positive(sourceInsets.left, 0)
  };
  return {
    surfaceId: String(input.surfaceId ?? "main"),
    cssWidth,
    cssHeight,
    pixelRatio,
    safeInsets,
    orientation: input.orientation ?? (cssWidth >= cssHeight ? "landscape" : "portrait"),
    fullscreen: input.fullscreen === true,
    visible: input.visible !== false
  };
}

export function normalizePresentationPolicy(input = {}) {
  const frameMode = PRESENTATION_FRAME_MODES.includes(input.frameMode)
    ? input.frameMode
    : DEFAULT_PRESENTATION_OUTPUT_POLICY.frameMode;
  const minimumRenderScale = Math.max(0.01, finite(input.minimumRenderScale, DEFAULT_PRESENTATION_OUTPUT_POLICY.minimumRenderScale));
  const maximumRenderScale = Math.max(minimumRenderScale, finite(input.maximumRenderScale, DEFAULT_PRESENTATION_OUTPUT_POLICY.maximumRenderScale));
  return {
    referenceAspect: Math.max(0.01, finite(input.referenceAspect, DEFAULT_PRESENTATION_OUTPUT_POLICY.referenceAspect)),
    frameMode,
    renderScale: clamp(finite(input.renderScale, DEFAULT_PRESENTATION_OUTPUT_POLICY.renderScale), minimumRenderScale, maximumRenderScale),
    minimumRenderScale,
    maximumRenderScale,
    maximumPixelRatio: Math.max(0.1, finite(input.maximumPixelRatio, DEFAULT_PRESENTATION_OUTPUT_POLICY.maximumPixelRatio)),
    barColor: typeof input.barColor === "string" ? input.barColor : DEFAULT_PRESENTATION_OUTPUT_POLICY.barColor
  };
}

export function calculateSafeRect(surfaceInput = {}) {
  const surface = normalizePresentationSurface(surfaceInput);
  const width = Math.max(0, surface.cssWidth - surface.safeInsets.left - surface.safeInsets.right);
  const height = Math.max(0, surface.cssHeight - surface.safeInsets.top - surface.safeInsets.bottom);
  return {
    x: Math.min(surface.cssWidth, surface.safeInsets.left),
    y: Math.min(surface.cssHeight, surface.safeInsets.top),
    width,
    height
  };
}

function centerRect(container, width, height) {
  return {
    x: container.x + (container.width - width) * 0.5,
    y: container.y + (container.height - height) * 0.5,
    width,
    height
  };
}

export function calculateViewport(containerInput = {}, policyInput = {}) {
  const container = {
    x: finite(containerInput.x, 0),
    y: finite(containerInput.y, 0),
    width: positive(containerInput.width, 0),
    height: positive(containerInput.height, 0)
  };
  const policy = normalizePresentationPolicy(policyInput);
  if (container.width <= 0 || container.height <= 0) return { ...container, width: 0, height: 0 };
  const aspect = policy.referenceAspect;
  const currentAspect = container.width / container.height;

  if (policy.frameMode === "native" || policy.frameMode === "stretch") return { ...container };
  if (policy.frameMode === "width") return centerRect(container, container.width, container.width / aspect);
  if (policy.frameMode === "height") return centerRect(container, container.height * aspect, container.height);
  if (policy.frameMode === "cover") {
    return currentAspect > aspect
      ? centerRect(container, container.width, container.width / aspect)
      : centerRect(container, container.height * aspect, container.height);
  }
  return currentAspect > aspect
    ? centerRect(container, container.height * aspect, container.height)
    : centerRect(container, container.width, container.width / aspect);
}

export function intersectRects(left, right) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const rightEdge = Math.min(left.x + left.width, right.x + right.width);
  const bottomEdge = Math.min(left.y + left.height, right.y + right.height);
  return {
    x,
    y,
    width: Math.max(0, rightEdge - x),
    height: Math.max(0, bottomEdge - y)
  };
}

export function calculateBars(surfaceRect, viewport) {
  return {
    top: Math.max(0, viewport.y - surfaceRect.y),
    right: Math.max(0, surfaceRect.x + surfaceRect.width - (viewport.x + viewport.width)),
    bottom: Math.max(0, surfaceRect.y + surfaceRect.height - (viewport.y + viewport.height)),
    left: Math.max(0, viewport.x - surfaceRect.x)
  };
}

export function calculateRenderSize(surfaceInput = {}, policyInput = {}) {
  const surface = normalizePresentationSurface(surfaceInput);
  const policy = normalizePresentationPolicy(policyInput);
  const pixelRatio = Math.min(surface.pixelRatio, policy.maximumPixelRatio) * policy.renderScale;
  return {
    scale: policy.renderScale,
    pixelRatio,
    pixelWidth: Math.max(0, Math.round(surface.cssWidth * pixelRatio)),
    pixelHeight: Math.max(0, Math.round(surface.cssHeight * pixelRatio))
  };
}

export function createPresentationDescriptor(surfaceInput = {}, policyInput = {}, revision = 0) {
  const surface = normalizePresentationSurface(surfaceInput);
  const policy = normalizePresentationPolicy(policyInput);
  const surfaceRect = { x: 0, y: 0, width: surface.cssWidth, height: surface.cssHeight };
  const safeRect = calculateSafeRect(surface);
  const fitRect = policy.frameMode === "safe-contain" ? safeRect : surfaceRect;
  const viewport = calculateViewport(fitRect, policy);
  const visibleViewport = intersectRects(surfaceRect, viewport);
  const naturalAspect = viewport.height > 0 ? viewport.width / viewport.height : policy.referenceAspect;
  return {
    kind: "presentation-output",
    surface,
    policy,
    safeRect,
    frame: {
      mode: policy.frameMode,
      aspect: policy.referenceAspect,
      viewport,
      visibleViewport,
      bars: calculateBars(surfaceRect, viewport),
      barColor: policy.barColor
    },
    render: calculateRenderSize(surface, policy),
    cameraAspect: policy.frameMode === "native" ? naturalAspect : policy.referenceAspect,
    revision: Math.max(0, Math.floor(finite(revision, 0)))
  };
}
