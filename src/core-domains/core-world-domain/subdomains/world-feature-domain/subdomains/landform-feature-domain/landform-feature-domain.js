import { createWorldFeatureFamilyDomain } from "../feature-family-domain-kit/index.js";
import {
  createLandformFeatureKits,
  createMountainDefinition,
  sampleMountainElevation
} from "./kits/landform-feature-kits.js";

export function createLandformFeatureDomain(config = {}) {
  return createWorldFeatureFamilyDomain(config, {
    family: "landform",
    id: "n-world-landform-feature-domain",
    domain: "core-world-landform-features",
    domainPath: "n:world:features:landform",
    apiName: "landformFeatures",
    engineAlias: "landformFeatures",
    purpose: "Landform feature contracts and deterministic compilers for physical-world foundation contributions.",
    owns: ["landform feature contracts", "landform definition validation", "landform foundation contributions", "landform fidelity requirements"],
    services: ["mountain", "ridge", "hill", "plateau", "cliff", "escarpment", "canyon", "valley", "pass", "cave-overhang"],
    createKits: createLandformFeatureKits,
    extendApi(kits) {
      return {
        createMountainDefinition,
        sampleMountainElevation,
        mountain: kits.mountain,
        canyon: kits.canyon,
        cliff: kits.cliff,
        plateau: kits.plateau
      };
    }
  });
}

export default createLandformFeatureDomain;
