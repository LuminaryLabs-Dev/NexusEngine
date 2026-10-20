export const PRESENTATION_FRAME_MODES = Object.freeze([
  "native",
  "contain",
  "cover",
  "width",
  "height",
  "stretch",
  "safe-contain"
]);

export const UI_SCALE_MODES = Object.freeze([
  "constant",
  "match-width",
  "match-height",
  "match-shortest-side",
  "match-longest-side",
  "expand",
  "shrink"
]);


export const DEFAULT_PRESENTATION_OUTPUT_POLICY = Object.freeze({
  referenceAspect: 16 / 9,
  frameMode: "native",
  renderScale: 1,
  minimumRenderScale: 0.5,
  maximumRenderScale: 1,
  maximumPixelRatio: 2,
  barColor: "#000000"
});

export const DEFAULT_UI_SCALE_POLICY = Object.freeze({
  referenceWidth: 1920,
  referenceHeight: 1080,
  mode: "match-shortest-side",
  match: 0.5,
  constantScale: 1,
  minimumScale: 0.5,
  maximumScale: 2
});
