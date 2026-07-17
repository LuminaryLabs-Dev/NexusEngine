import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const text = (value, fallback, label) => {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
};
const optionalText = (value) => value == null || value === "" ? null : String(value);
const clamp01 = (value, fallback = 0) => Math.max(0, Math.min(1, finite(value, fallback)));

function vector(value, length, fallback, label) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source) || source.length !== length) throw new TypeError(`${label} must contain ${length} values.`);
  return source.map((entry, index) => finite(entry, fallback[index] ?? 0));
}

function range(value, fallback, label) {
  const next = vector(value, 2, fallback, label);
  return next[0] <= next[1] ? next : [next[1], next[0]];
}

function uniqueTextList(value, fallback = []) {
  const source = value == null ? fallback : Array.isArray(value) ? value : [value];
  return [...new Set(source.map(String))].sort();
}

export const NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA = "nexus-foliage-descriptor/2";
export const NEXUS_FOLIAGE_CARD_FAMILY_SCHEMA = "nexus-foliage-card-family/1";
export const NEXUS_FOLIAGE_CLUSTER_SCHEMA = "nexus-foliage-cluster/1";
export const NEXUS_FOLIAGE_PLACEMENT_RECIPE_SCHEMA = "nexus-foliage-placement-recipe/1";

export function createFoliageCardFamilyDescriptor(input = {}) {
  const minimumSize = vector(input.size?.minimum, 2, [0.35, 0.35], "Foliage card minimum size");
  const maximumSize = vector(input.size?.maximum, 2, [1.4, 1.4], "Foliage card maximum size");
  const descriptor = {
    schema: NEXUS_FOLIAGE_CARD_FAMILY_SCHEMA,
    id: text(input.id, null, "Foliage card family id"),
    kind: text(input.kind, "broadleaf-cluster", "Foliage card family kind"),
    atlas: {
      assetId: optionalText(input.atlas?.assetId),
      frameId: optionalText(input.atlas?.frameId ?? input.frameId),
      uvRect: vector(input.atlas?.uvRect, 4, [0, 0, 1, 1], "Foliage atlas uvRect"),
      resolution: vector(input.atlas?.resolution, 2, [256, 256], "Foliage atlas resolution"),
      alphaChannel: text(input.atlas?.alphaChannel, "a", "Foliage alpha channel"),
      normalAssetId: optionalText(input.atlas?.normalAssetId),
      roughnessAssetId: optionalText(input.atlas?.roughnessAssetId),
      metadata: clone(input.atlas?.metadata ?? {})
    },
    size: {
      minimum: minimumSize,
      maximum: maximumSize,
      aspect: Math.max(0.01, finite(input.size?.aspect, maximumSize[0] / Math.max(0.01, maximumSize[1])))
    },
    alphaCutoff: clamp01(input.alphaCutoff, 0.38),
    doubleSided: input.doubleSided !== false,
    translucency: clamp01(input.translucency, 0.12),
    roughness: clamp01(input.roughness, 0.78),
    normalStrength: Math.max(0, finite(input.normalStrength, 0.45)),
    color: clone(input.color ?? { base: 0xffffff, accent: 0xdff5c8, dry: 0xb9a66a, shade: 0x547a45 }),
    wind: {
      mode: text(input.wind?.mode, "branch-relative", "Foliage card wind mode"),
      amplitude: Math.max(0, finite(input.wind?.amplitude, 0.08)),
      frequency: Math.max(0, finite(input.wind?.frequency, 0.7)),
      stiffness: clamp01(input.wind?.stiffness, 0.72),
      metadata: clone(input.wind?.metadata ?? {})
    },
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createFoliageClusterDescriptor(input = {}, index = 0) {
  const descriptor = {
    schema: NEXUS_FOLIAGE_CLUSTER_SCHEMA,
    id: text(input.id, `cluster-${index}`, "Foliage cluster id"),
    familyId: text(input.familyId, null, "Foliage cluster familyId"),
    mode: text(input.mode, "branch-cluster", "Foliage cluster mode"),
    count: Math.max(1, Math.floor(finite(input.count, 6))),
    position: vector(input.position, 3, [0, 0, 0], "Foliage cluster position"),
    extent: vector(input.extent, 3, [1, 1, 1], "Foliage cluster extent"),
    rotation: vector(input.rotation, 3, [0, 0, 0], "Foliage cluster rotation"),
    scale: range(input.scale, [0.85, 1.15], "Foliage cluster scale"),
    density: Math.max(0, finite(input.density, 1)),
    randomness: clamp01(input.randomness, 0.35),
    windScale: Math.max(0, finite(input.windScale, 1)),
    fidelity: {
      nearMultiplier: Math.max(0, finite(input.fidelity?.nearMultiplier, 1)),
      mediumMultiplier: Math.max(0, finite(input.fidelity?.mediumMultiplier, 0.52)),
      farMultiplier: Math.max(0, finite(input.fidelity?.farMultiplier, 0))
    },
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createFoliageDescriptor(input = {}) {
  const primaryCardInput = {
    id: input.card?.familyId ?? `${input.id ?? "foliage"}:primary-card`,
    kind: input.kind ?? "leaf-cluster",
    alphaCutoff: input.card?.alphaCutoff,
    doubleSided: input.card?.doubleSided,
    translucency: input.translucency,
    wind: input.wind,
    atlas: input.card?.atlas,
    size: input.card?.size,
    color: input.card?.color,
    metadata: input.card?.metadata
  };
  const cardFamilies = (input.cardFamilies?.length ? input.cardFamilies : [primaryCardInput])
    .map(createFoliageCardFamilyDescriptor);
  const familyIds = new Set(cardFamilies.map((entry) => entry.id));
  const clusters = (input.clusters ?? []).map(createFoliageClusterDescriptor);
  for (const cluster of clusters) {
    if (!familyIds.has(cluster.familyId)) throw new TypeError(`Foliage cluster ${cluster.id} references missing card family ${cluster.familyId}.`);
  }
  const descriptor = {
    schema: NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA,
    id: text(input.id, null, "Foliage id"),
    speciesId: input.speciesId == null ? null : String(input.speciesId),
    kind: text(input.kind, "leaf-cluster", "Foliage kind"),
    structure: clone(input.structure ?? { mode: "cluster", density: 1 }),
    card: {
      mode: text(input.card?.mode, "alpha-cutout", "Foliage card mode"),
      familyId: text(input.card?.familyId, cardFamilies[0].id, "Foliage primary card familyId"),
      crossedPlanes: Math.max(1, Math.floor(finite(input.card?.crossedPlanes, 2))),
      doubleSided: input.card?.doubleSided !== false,
      alphaCutoff: clamp01(input.card?.alphaCutoff, cardFamilies[0].alphaCutoff),
      metadata: clone(input.card?.metadata ?? {})
    },
    cardFamilies,
    clusters,
    density: Math.max(0, finite(input.density, 1)),
    translucency: clamp01(input.translucency, 0.12),
    wind: clone(input.wind ?? { mode: "branch-relative", amplitude: 0.08, frequency: 0.7, stiffness: 0.72 }),
    seasonalColors: clone(input.seasonalColors ?? { default: input.color ?? 0xffffff }),
    materialRegions: uniqueTextList(input.materialRegions, ["foliage"]),
    texture: clone(input.texture ?? { pattern: "soft-mottle", scale: 0.2, strength: 0.12 }),
    fidelity: clone(input.fidelity ?? {
      near: { mode: "cards", density: 1 },
      medium: { mode: "cards", density: 0.52 },
      far: { mode: "captured-impostor" },
      horizon: { mode: "captured-impostor" }
    }),
    metadata: clone(input.metadata ?? {})
  };
  if (!familyIds.has(descriptor.card.familyId)) throw new TypeError(`Foliage primary card family ${descriptor.card.familyId} is not registered.`);
  structuredClone(descriptor);
  return descriptor;
}

export function createFoliagePlacementRecipe(foliageInput, options = {}) {
  const foliage = createFoliageDescriptor(foliageInput);
  const recipe = {
    schema: NEXUS_FOLIAGE_PLACEMENT_RECIPE_SCHEMA,
    id: text(options.id, `${foliage.id}:placement`, "Foliage placement recipe id"),
    foliageId: foliage.id,
    speciesId: foliage.speciesId,
    cardFamilyIds: foliage.cardFamilies.map((entry) => entry.id),
    clusters: foliage.clusters,
    fidelity: clone(options.fidelity ?? foliage.fidelity),
    materialIntent: {
      mode: foliage.card.mode,
      alphaCutoff: foliage.card.alphaCutoff,
      doubleSided: foliage.card.doubleSided,
      translucency: foliage.translucency,
      materialRegions: foliage.materialRegions
    },
    metadata: clone(options.metadata ?? {})
  };
  structuredClone(recipe);
  return recipe;
}

export function createFoliageDomainKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-vegetation-foliage-domain-kit",
    domain: "core-vegetation-foliage",
    domainPath: config.domainPath ?? "n:object:vegetation:foliage",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationFoliage",
    version: config.version ?? "0.2.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object:vegetation"],
    provides: [
      ...(config.provides ?? []),
      "vegetation:foliage-descriptor",
      "vegetation:foliage-card-family",
      "vegetation:foliage-cluster",
      "vegetation:foliage-placement",
      "vegetation:foliage-wind"
    ],
    purpose: "Leaves, needles, fronds, blades, alpha-cutout card families, canopy clusters, translucency, fidelity intent, seasonal color, and wind response.",
    initialState: { foliage: {} },
    services: ["foliage-registry", "card-families", "cluster-recipes", "placement-recipes", "card-policy", "wind-response", "seasonal-color", "fidelity-intent"],
    createApi({ baseApi }) {
      const records = () => baseApi.getState()?.foliage ?? {};
      return {
        register(input) {
          const descriptor = createFoliageDescriptor(input);
          baseApi.update({ foliage: { ...records(), [descriptor.id]: descriptor } }, "descriptorChanged");
          return clone(descriptor);
        },
        get: (id) => clone(records()[String(id)] ?? null),
        list: () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone),
        createCardFamily: createFoliageCardFamilyDescriptor,
        createCluster: createFoliageClusterDescriptor,
        createPlacementRecipe,
        validate(value) {
          try { createFoliageDescriptor(value); return { valid: true, errors: [] }; }
          catch (error) { return { valid: false, errors: [error instanceof Error ? error.message : String(error)] }; }
        }
      };
    },
    metadata: {
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA,
      contractSchemas: [NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA, NEXUS_FOLIAGE_CARD_FAMILY_SCHEMA, NEXUS_FOLIAGE_CLUSTER_SCHEMA, NEXUS_FOLIAGE_PLACEMENT_RECIPE_SCHEMA]
    }
  });
}

export default createFoliageDomainKit;
