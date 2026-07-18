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

export const SKINNED_ORGANIC_PRODUCTION_SHAPE_PROFILE = Object.freeze({
  id: "skinned-organic-production",
  preserve: {
    silhouette: true,
    borders: true,
    materialBoundaries: true,
    uvSeams: true,
    normals: true,
    vertexColors: true,
    skinning: true,
    boneBoundaries: true,
    weightDiscontinuities: true,
    deformationZones: true
  },
  qualification: {
    mode: "safe-skinned",
    requireSkinning: true,
    preserveSkeleton: true,
    preserveSkinAttributes: true,
    poseSuiteVersion: "skinned-organic-production/1",
    structure: {
      maximumInfluences: 4,
      weightTolerance: 0.0001,
      requireProtectedVertices: true,
      requireSameVertexLayout: true,
      requireSameSkinAttributes: true
    },
    deformation: {
      enabled: true,
      maximumRmsError: 0.01,
      maximumSurfaceError: 0.03,
      maximumProtectedError: 0.005,
      sampleLimit: 256
    },
    silhouette: {
      enabled: true,
      minimumIoU: 0.95,
      gridSize: 40,
      poseLimit: 4
    }
  },
  targets: [
    {
      id: "full",
      ratio: 1,
      maximumDeviation: 0,
      mode: "source",
      qualification: { fallbackRatios: [] }
    },
    {
      id: "reduced",
      ratio: 0.4,
      maximumDeviation: 0.01,
      mode: "simplify",
      options: {
        partitionByDominantBone: true,
        preserveProtectedTriangles: true
      },
      qualification: {
        fallbackRatios: [0.55, 0.7, 1],
        deformation: {
          maximumRmsError: 0.01,
          maximumSurfaceError: 0.03,
          maximumProtectedError: 0.005
        },
        silhouette: { minimumIoU: 0.95 }
      }
    },
    {
      id: "proxy",
      ratio: 0.15,
      maximumDeviation: 0.04,
      mode: "simplify",
      options: {
        partitionByDominantBone: true,
        preserveProtectedTriangles: true,
        regularize: true
      },
      qualification: {
        fallbackRatios: [0.3, 0.5, 0.75, 1],
        deformation: {
          maximumRmsError: 0.02,
          maximumSurfaceError: 0.06,
          maximumProtectedError: 0.01
        },
        silhouette: { minimumIoU: 0.9 }
      }
    }
  ],
  metadata: {
    productionDefault: true,
    skeletonReduction: "experimental-only",
    intendedFor: ["skinned trees", "skinned static vegetation", "wind-deformed organic objects"]
  }
});

export const CORE_OBJECT_SHAPE_PROFILES = Object.freeze([
  GENERAL_RIGID_OBJECT_SHAPE_PROFILE,
  HARD_SURFACE_OBJECT_SHAPE_PROFILE,
  ORGANIC_STATIC_OBJECT_SHAPE_PROFILE,
  SKINNED_ORGANIC_PRODUCTION_SHAPE_PROFILE
]);
