export const GENERAL_RIGID_OBJECT_SHAPE_PROFILE = Object.freeze({
  id: "general-rigid-object",
  preserve: {
    silhouette: true,
    borders: true,
    materialBoundaries: true,
    uvSeams: true,
    normals: true,
    vertexColors: true
  },
  targets: [
    { id: "full", ratio: 1, maximumDeviation: 0, mode: "source" },
    { id: "reduced", ratio: 0.4, maximumDeviation: 0.01, mode: "simplify" },
    { id: "proxy", ratio: 0.1, maximumDeviation: 0.04, mode: "simplify", options: { aggressive: true } }
  ]
});

export const HARD_SURFACE_OBJECT_SHAPE_PROFILE = Object.freeze({
  id: "hard-surface-object",
  preserve: {
    silhouette: true,
    borders: true,
    hardEdges: true,
    materialBoundaries: true,
    uvSeams: true,
    normals: true
  },
  targets: [
    { id: "full", ratio: 1, maximumDeviation: 0, mode: "source" },
    { id: "reduced", ratio: 0.55, maximumDeviation: 0.006, mode: "simplify" },
    { id: "proxy", ratio: 0.18, maximumDeviation: 0.025, mode: "simplify" }
  ]
});

export const ORGANIC_STATIC_OBJECT_SHAPE_PROFILE = Object.freeze({
  id: "organic-static-object",
  preserve: {
    silhouette: true,
    borders: false,
    materialBoundaries: false,
    uvSeams: true,
    normals: true
  },
  targets: [
    { id: "full", ratio: 1, maximumDeviation: 0, mode: "source" },
    { id: "reduced", ratio: 0.35, maximumDeviation: 0.015, mode: "simplify" },
    { id: "proxy", ratio: 0.08, maximumDeviation: 0.06, mode: "simplify", options: { aggressive: true } }
  ]
});

export const CORE_OBJECT_SHAPE_PROFILES = Object.freeze([
  GENERAL_RIGID_OBJECT_SHAPE_PROFILE,
  HARD_SURFACE_OBJECT_SHAPE_PROFILE,
  ORGANIC_STATIC_OBJECT_SHAPE_PROFILE
]);
