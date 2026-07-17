import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const text = (value, fallback, label) => {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
};
const clamp01 = (value, fallback = 0) => Math.max(0, Math.min(1, finite(value, fallback)));

function vector(value, length, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== length) throw new TypeError(`${label} must contain ${length} values.`);
  return source.map((entry, index) => finite(entry, fallback[index] ?? 0));
}

function uniqueTextList(value, fallback = []) {
  const source = value == null ? fallback : Array.isArray(value) ? value : [value];
  return [...new Set(source.map(String))].sort();
}

export const NEXUS_TREE_STRUCTURE_SCHEMA = "nexus-tree-structure/2";
export const NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA = "nexus-tree-canopy-composition/1";

export function createTreeCanopyComposition(input = {}, defaults = {}) {
  const averageHeight = Math.max(0.01, finite(defaults.averageHeight, 10));
  const averageWidth = Math.max(0.01, finite(defaults.averageWidth, averageHeight * 0.4));
  const descriptor = {
    schema: NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA,
    id: text(input.id, `${defaults.id ?? "tree"}:canopy`, "Tree canopy composition id"),
    kind: text(input.kind, "cluster", "Tree canopy kind"),
    height: Math.max(0.01, finite(input.height, averageHeight * 0.32)),
    radius: Math.max(0.01, finite(input.radius, averageWidth * 0.5)),
    foliageIds: uniqueTextList(input.foliageIds ?? input.foliageId, []),
    anchors: (input.anchors ?? []).map((anchor, index) => ({
      id: text(anchor.id, `anchor-${index}`, "Tree canopy anchor id"),
      position: vector(anchor.position, 3, [0, averageHeight * 0.75, 0], "Tree canopy anchor position"),
      rotation: vector(anchor.rotation, 3, [0, 0, 0], "Tree canopy anchor rotation"),
      scale: vector(anchor.scale, 3, [1, 1, 1], "Tree canopy anchor scale"),
      foliageId: anchor.foliageId == null ? null : String(anchor.foliageId),
      mode: text(anchor.mode, "branch-cluster", "Tree canopy anchor mode"),
      metadata: clone(anchor.metadata ?? {})
    })),
    clusterCount: Math.max(0, Math.floor(finite(input.clusterCount, 12))),
    layerCount: Math.max(1, Math.floor(finite(input.layerCount, 3))),
    edgeIrregularity: clamp01(input.edgeIrregularity, 0.38),
    hangingFoliage: clamp01(input.hangingFoliage, 0.08),
    deadwood: clamp01(input.deadwood, 0.04),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createTreeStructureDescriptor(input = {}) {
  const averageHeight = Math.max(0.01, finite(input.averageHeight, 10));
  const averageWidth = Math.max(0.01, finite(input.averageWidth, averageHeight * 0.4));
  const id = text(input.id, null, "Tree structure id");
  const canopy = createTreeCanopyComposition(input.canopy ?? {}, { id, averageHeight, averageWidth });
  const descriptor = {
    schema: NEXUS_TREE_STRUCTURE_SCHEMA,
    id,
    speciesId: text(input.speciesId, null, "Tree speciesId"),
    shape: text(input.shape, "broad-canopy", "Tree shape"),
    averageHeight,
    averageWidth,
    roots: clone(input.roots ?? { kind: "root-flare", depth: averageHeight * 0.08, spread: averageWidth * 0.35 }),
    trunk: clone(input.trunk ?? { radius: averageWidth * 0.08, taper: 0.68, radialSegments: 10, heightSegments: 3 }),
    branches: clone(input.branches ?? { kind: "distributed", levels: 3, forkProbability: 0.35, primaryCount: 4, secondaryCount: 8 }),
    canopy,
    foliage: {
      ids: uniqueTextList(input.foliage?.ids ?? canopy.foliageIds, canopy.foliageIds),
      compositionId: text(input.foliage?.compositionId, canopy.id, "Tree foliage compositionId"),
      nearDensity: Math.max(0, finite(input.foliage?.nearDensity, 1)),
      mediumDensity: Math.max(0, finite(input.foliage?.mediumDensity, 0.52)),
      windScale: Math.max(0, finite(input.foliage?.windScale, 1)),
      metadata: clone(input.foliage?.metadata ?? {})
    },
    growthStages: clone(input.growthStages ?? { seedling: 0.2, juvenile: 0.55, mature: 1, old: 1.05 }),
    states: clone(input.states ?? ["standing", "damaged", "dead", "fallen"]),
    breakage: clone(input.breakage ?? { trunk: [0.18, 0.45, 0.72], branches: true }),
    collision: clone(input.collision ?? { kind: "trunk", radiusScale: 1, heightScale: 1 }),
    fidelity: clone(input.fidelity ?? {}),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createTreeShapeRecipe(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  return {
    schema: "nexus-tree-shape-recipe/2",
    id: options.id ?? `${tree.id}:shape-recipe`,
    speciesId: tree.speciesId,
    source: {
      roots: tree.roots,
      trunk: tree.trunk,
      branches: tree.branches,
      canopy: tree.canopy,
      foliage: tree.foliage,
      regions: ["roots", "trunk", "branches", "foliage"]
    },
    targets: [
      { id: "near", mode: "source", ratio: 1, preserve: ["silhouette", "regions", "ground-anchor", "foliage-cards"] },
      { id: "medium", mode: "simplify", ratio: options.mediumRatio ?? 0.34, preserve: ["silhouette", "regions", "ground-anchor", "foliage-cards"] }
    ],
    metadata: clone(options.metadata ?? {})
  };
}

export function createTreeFidelityProfile(treeInput, options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  return {
    id: options.id ?? `${tree.id}:fidelity`,
    version: options.version ?? 1,
    identity: { preserveSilhouette: true, preserveGrounding: true, preserveMajorStructure: true, preserveMaterialResponse: true },
    forms: [
      {
        id: "near",
        fidelity: "near-mesh",
        builderId: options.shapeBuilderId ?? "object-shape-form",
        required: true,
        order: 0,
        minimumProjectedSize: options.nearPixels ?? 360,
        metadata: { foliageDensity: options.nearFoliageDensity ?? tree.foliage.nearDensity }
      },
      {
        id: "medium",
        fidelity: "medium-mesh",
        builderId: options.shapeBuilderId ?? "object-shape-form",
        required: true,
        order: 1,
        minimumProjectedSize: options.mediumPixels ?? 150,
        maximumProjectedSize: options.mediumMaximumPixels ?? 390,
        metadata: { foliageDensity: options.mediumFoliageDensity ?? tree.foliage.mediumDensity }
      },
      { id: "far", fidelity: "multi-angle-impostor", builderId: "captured-form", required: true, order: 2, minimumProjectedSize: options.farPixels ?? 18, maximumProjectedSize: options.farMaximumPixels ?? 170, capture: createTreeCaptureRequest(tree, "far", options) },
      { id: "horizon", fidelity: "horizon-impostor", builderId: "captured-form", required: true, order: 3, minimumProjectedSize: 0, maximumProjectedSize: options.horizonPixels ?? 24, capture: createTreeCaptureRequest(tree, "horizon", options) }
    ],
    change: { mode: "dither-crossfade", duration: options.transitionDuration ?? 0.35, hysteresis: options.hysteresis ?? 0.16, stableFrames: options.stableFrames ?? 2 },
    metadata: { speciesId: tree.speciesId, foliageIds: tree.foliage.ids, canopyCompositionId: tree.canopy.id, ...(clone(options.metadata ?? {})) }
  };
}

export function createTreeCaptureRequest(treeInput, kind = "far", options = {}) {
  const tree = createTreeStructureDescriptor(treeInput);
  const horizon = kind === "horizon";
  return {
    providerId: options.captureProviderId ?? null,
    viewSet: { pattern: "around-subject", azimuthCount: horizon ? 1 : (options.azimuthCount ?? 8), elevations: horizon ? [options.horizonElevation ?? 6] : (options.elevations ?? [0, 12]) },
    framing: { boundsSource: "core-object", preserveGrounding: true, padding: options.capturePadding ?? 0.05 },
    observations: options.observations ?? ["color", "opacity"],
    output: { kind: "atlas", frameSize: horizon ? (options.horizonFrameSize ?? 128) : (options.frameSize ?? 256) },
    metadata: { treeId: tree.id, speciesId: tree.speciesId, foliageIds: tree.foliage.ids, canopyCompositionId: tree.canopy.id, form: kind }
  };
}

export function createTreeDomainKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-vegetation-tree-domain-kit",
    domain: "core-vegetation-tree",
    domainPath: config.domainPath ?? "n:object:vegetation:tree",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationTree",
    version: config.version ?? "0.2.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object:vegetation"],
    provides: [...(config.provides ?? []), "vegetation:tree-structure", "vegetation:tree-canopy", "vegetation:tree-fidelity"],
    purpose: "Tree roots, trunks, branches, canopy composition, foliage references, growth, damage, collision intent, and default Shape/Fidelity/Capture recipes.",
    initialState: { trees: {} },
    services: ["tree-registry", "canopy-composition", "shape-recipes", "fidelity-profiles", "capture-requests"],
    createApi({ baseApi }) {
      const records = () => baseApi.getState()?.trees ?? {};
      return {
        register(input) {
          const descriptor = createTreeStructureDescriptor(input);
          baseApi.update({ trees: { ...records(), [descriptor.id]: descriptor } }, "descriptorChanged");
          return clone(descriptor);
        },
        get: (id) => clone(records()[String(id)] ?? null),
        list: () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone),
        createCanopyComposition: createTreeCanopyComposition,
        createShapeRecipe: createTreeShapeRecipe,
        createFidelityProfile: createTreeFidelityProfile,
        createCaptureRequest: createTreeCaptureRequest,
        validate(value) {
          try { createTreeStructureDescriptor(value); return { valid: true, errors: [] }; }
          catch (error) { return { valid: false, errors: [error instanceof Error ? error.message : String(error)] }; }
        }
      };
    },
    metadata: {
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: NEXUS_TREE_STRUCTURE_SCHEMA,
      contractSchemas: [NEXUS_TREE_STRUCTURE_SCHEMA, NEXUS_TREE_CANOPY_COMPOSITION_SCHEMA]
    }
  });
}

export default createTreeDomainKit;
