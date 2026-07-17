import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const text = (value, fallback, label) => {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
};

export const NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA = "nexus-foliage-descriptor/1";

export function createFoliageDescriptor(input = {}) {
  const descriptor = {
    schema: NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA,
    id: text(input.id, null, "Foliage id"),
    speciesId: input.speciesId == null ? null : String(input.speciesId),
    kind: text(input.kind, "leaf-cluster", "Foliage kind"),
    structure: clone(input.structure ?? { mode: "cluster", density: 1 }),
    card: {
      mode: text(input.card?.mode, "alpha-cutout", "Foliage card mode"),
      crossedPlanes: Math.max(1, Math.floor(finite(input.card?.crossedPlanes, 2))),
      doubleSided: input.card?.doubleSided !== false,
      alphaCutoff: Math.max(0, Math.min(1, finite(input.card?.alphaCutoff, 0.38))),
      metadata: clone(input.card?.metadata ?? {})
    },
    density: Math.max(0, finite(input.density, 1)),
    translucency: Math.max(0, Math.min(1, finite(input.translucency, 0.12))),
    wind: clone(input.wind ?? { mode: "branch-relative", amplitude: 0.08, frequency: 0.7, stiffness: 0.72 }),
    seasonalColors: clone(input.seasonalColors ?? { default: input.color ?? 0xffffff }),
    materialRegions: [...new Set((input.materialRegions ?? ["foliage"]).map(String))].sort(),
    texture: clone(input.texture ?? { pattern: "soft-mottle", scale: 0.2, strength: 0.12 }),
    metadata: clone(input.metadata ?? {})
  };
  structuredClone(descriptor);
  return descriptor;
}

export function createFoliageDomainKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-vegetation-foliage-domain-kit",
    domain: "core-vegetation-foliage",
    domainPath: config.domainPath ?? "n:object:vegetation:foliage",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationFoliage",
    version: config.version ?? "0.1.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object:vegetation"],
    provides: [...(config.provides ?? []), "vegetation:foliage-descriptor", "vegetation:foliage-wind"],
    purpose: "Leaves, needles, fronds, blades, canopy clusters, cards, translucency, seasonal color, and wind-response intent.",
    initialState: { foliage: {} },
    services: ["foliage-registry", "card-policy", "wind-response", "seasonal-color"],
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
        validate(value) {
          try { createFoliageDescriptor(value); return { valid: true, errors: [] }; }
          catch (error) { return { valid: false, errors: [error instanceof Error ? error.message : String(error)] }; }
        }
      };
    },
    metadata: { rendererAgnostic: true, deterministic: true, contractSchema: NEXUS_FOLIAGE_DESCRIPTOR_SCHEMA }
  });
}

export default createFoliageDomainKit;
