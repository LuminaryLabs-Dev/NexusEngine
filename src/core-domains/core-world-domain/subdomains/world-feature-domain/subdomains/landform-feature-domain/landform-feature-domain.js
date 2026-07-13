import { createCoreCapabilityKit } from "../../../../../../core-kits/core-capability-kit.js";
import { createMountainFeatureKit } from "./kits/mountain-feature-kit/index.js";
import { createCanyonFeatureKit } from "./kits/canyon-feature-kit/index.js";
import { createCliffFeatureKit } from "./kits/cliff-feature-kit/index.js";
import { createPlateauFeatureKit } from "./kits/plateau-feature-kit/index.js";

export function createLandformFeatureDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-world-landform-feature-domain",
    domain: "core-world-landform-features",
    domainPath: config.domainPath ?? "n:world:features:landform",
    parentDomainPath: config.parentDomainPath ?? "n:world:features",
    apiName: config.apiName ?? "landformFeatures",
    requires: [...(config.requires ?? []), "n:world:features"],
    purpose: "Landform feature contracts and deterministic compilers for world foundation contributions.",
    owns: ["landform feature contracts", "landform definition validation", "landform foundation contributions", "landform fidelity requirements"],
    doesNotOwn: ["resolved foundation", "renderer meshes", "generic graphics LOD policy"],
    services: ["mountain", "canyon-contract", "cliff-contract", "plateau-contract"],
    initialState: { registeredTypes: {} },
    metadata: { ...(config.metadata ?? {}), childDomain: true, deterministic: true, rendererAgnostic: true },
    createApi({ engine, baseApi }) {
      const mountain = createMountainFeatureKit(config.mountain ?? {});
      const canyon = createCanyonFeatureKit(config.canyon ?? {});
      const cliff = createCliffFeatureKit(config.cliff ?? {});
      const plateau = createPlateauFeatureKit(config.plateau ?? {});
      const worldFeatures = engine.worldFeatures ?? engine.n?.worldFeatures;
      if (!worldFeatures) throw new Error("Landform Feature Domain requires World Feature Domain.");
      const mountainDescriptor = worldFeatures.registerFeatureType(mountain.type, mountain);
      baseApi.update({
        registeredTypes: {
          mountain: mountainDescriptor,
          canyon,
          cliff,
          plateau
        }
      }, "configured");
      const api = {
        mountain,
        canyon,
        cliff,
        plateau,
        createMountainDefinition: mountain.normalize,
        sampleMountainElevation: mountain.sample
      };
      return api;
    },
    install(context) {
      context.engine.landformFeatures = context.engine.n.landformFeatures;
      userInstall?.(context);
    }
  });
}

export default createLandformFeatureDomain;
