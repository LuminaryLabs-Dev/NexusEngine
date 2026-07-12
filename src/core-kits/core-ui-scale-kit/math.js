import {
  DEFAULT_UI_SCALE_POLICY,
  UI_SCALE_MODES
} from "../../core-domains/core-presentation-domain/contracts.js";

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function normalizeUIScalePolicy(input = {}) {
  const minimumScale = Math.max(0.01, finite(input.minimumScale, DEFAULT_UI_SCALE_POLICY.minimumScale));
  const maximumScale = Math.max(minimumScale, finite(input.maximumScale, DEFAULT_UI_SCALE_POLICY.maximumScale));
  return {
    referenceWidth: Math.max(1, finite(input.referenceWidth, DEFAULT_UI_SCALE_POLICY.referenceWidth)),
    referenceHeight: Math.max(1, finite(input.referenceHeight, DEFAULT_UI_SCALE_POLICY.referenceHeight)),
    mode: UI_SCALE_MODES.includes(input.mode) ? input.mode : DEFAULT_UI_SCALE_POLICY.mode,
    match: clamp(finite(input.match, DEFAULT_UI_SCALE_POLICY.match), 0, 1),
    constantScale: Math.max(0.01, finite(input.constantScale, DEFAULT_UI_SCALE_POLICY.constantScale)),
    minimumScale,
    maximumScale
  };
}

export function normalizeUIViewport(input = {}) {
  const source = input.frame?.viewport ?? input.viewport ?? input;
  return {
    width: Math.max(0, finite(source.width, 0)),
    height: Math.max(0, finite(source.height, 0))
  };
}

export function createUIScaleDescriptor(viewportInput = {}, policyInput = {}) {
  const viewport = normalizeUIViewport(viewportInput);
  const policy = normalizeUIScalePolicy(policyInput);
  const widthScale = viewport.width / policy.referenceWidth;
  const heightScale = viewport.height / policy.referenceHeight;
  let scale = policy.constantScale;
  if (policy.mode === "match-width") scale = widthScale;
  else if (policy.mode === "match-height") scale = heightScale;
  else if (policy.mode === "match-shortest-side") scale = Math.min(viewport.width, viewport.height) / Math.min(policy.referenceWidth, policy.referenceHeight);
  else if (policy.mode === "match-longest-side") scale = Math.max(viewport.width, viewport.height) / Math.max(policy.referenceWidth, policy.referenceHeight);
  else if (policy.mode === "expand") scale = Math.min(widthScale, heightScale);
  else if (policy.mode === "shrink") scale = Math.max(widthScale, heightScale);
  if (!Number.isFinite(scale) || scale <= 0) scale = policy.minimumScale;
  scale = clamp(scale, policy.minimumScale, policy.maximumScale);
  return {
    kind: "presentation-ui-scale",
    mode: policy.mode,
    scale,
    referenceWidth: policy.referenceWidth,
    referenceHeight: policy.referenceHeight,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height
  };
}
