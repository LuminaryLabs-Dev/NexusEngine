import { createCoreCapabilityKit } from "../../../../../../core-kits/core-capability-kit.js";

function freezeKitMap(kits = []) {
  return Object.freeze(Object.fromEntries(kits.map((kit) => [kit.type, kit])));
}

export function createWorldFeatureFamilyDomain(config = {}, spec = {}) {
  const family = String(spec.family ?? "").trim();
  if (!family) throw new TypeError("World feature family domain requires a family id.");
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? spec.id ?? `n-world-${family}-feature-domain`,
    domain: config.domain ?? spec.domain ?? `core-world-${family}-features`,
    domainPath: config.domainPath ?? spec.domainPath ?? `n:world:features:${family}`,
    parentDomainPath: config.parentDomainPath ?? "n:world:features",
    apiName: config.apiName ?? spec.apiName ?? `${family}Features`,
    requires: [...(config.requires ?? []), "n:world:features"],
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
      const worldFeatures = engine.worldFeatures ?? engine.n?.worldFeatures;
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
      const apiName = config.apiName ?? spec.apiName ?? `${family}Features`;
      const aliasName = config.engineAlias ?? spec.engineAlias ?? apiName;
      context.engine[aliasName] = context.engine.n[apiName];
      userInstall?.(context);
    }
  });
}

export default createWorldFeatureFamilyDomain;
