import { createDomainKit } from "../../../../../domain-kit.js";

function freezeKitMap(kits = []) {
  return Object.freeze(Object.fromEntries(kits.map((kit) => [kit.type, kit])));
}

export function createWorldFeatureFamilyDomain(config = {}, spec = {}) {
  const family = String(spec.family ?? "").trim();
  if (!family) throw new TypeError("World feature family domain requires a family id.");
  const userInstall = config.install;
  return createDomainKit({
    ...config,
    id: config.id ?? spec.id ?? `${family}-feature-kit`,
    domain: config.domain ?? spec.domain ?? `${family}-feature`,
    domainPath: config.domainPath ?? spec.domainPath ?? `n:world:feature:${family}`,
    parentDomainPath: config.parentDomainPath ?? "n:world:feature",
    apiName: config.apiName ?? spec.apiName ?? `${family}Feature`,
    requires: [...(config.requires ?? []), "n:world:feature"],
    purpose: config.purpose ?? spec.purpose ?? `${family} world feature contracts and deterministic compilers.`,
    owns: config.owns ?? spec.owns ?? [`${family} feature contracts`, `${family} feature compilation`, `${family} feature fidelity requirements`],
    doesNotOwn: config.doesNotOwn ?? spec.doesNotOwn ?? ["resolved foundation", "renderer meshes", "GPU resources", "generic graphics LOD policy", "game-specific feature instances"],
    services: config.services ?? spec.services ?? [],
    initialState: { family, registeredTypes: {} },
    metadata: {
      ...(spec.metadata ?? {}),
      ...(config.metadata ?? {}),
      childDomain: true,
      featureFamily: family,
      deterministic: true,
      rendererAgnostic: true
    },
    createApi({ engine, baseApi }) {
      const worldFeatures = engine.n?.worldFeature;
      if (!worldFeatures) throw new Error(`${family} Feature Domain requires World Feature Domain.`);
      const created = typeof spec.createKits === "function" ? spec.createKits(config) : [];
      const kits = freezeKitMap(created);
      const registeredTypes = {};
      for (const kit of Object.values(kits)) {
        registeredTypes[kit.type] = worldFeatures.registerFeatureType(kit.type, kit);
      }
      baseApi.update({ family, registeredTypes }, "configured");
      const api = {
        family,
        types: Object.freeze(Object.keys(kits).sort()),
        kits,
        getKit(type) { return kits[String(type)] ?? null; },
        listKits() { return Object.values(kits); },
        ...kits
      };
      return typeof spec.extendApi === "function" ? { ...api, ...spec.extendApi(kits, { engine, baseApi, config }) } : api;
    },
    install(context) {
      userInstall?.(context);
    }
  });
}

export default createWorldFeatureFamilyDomain;
