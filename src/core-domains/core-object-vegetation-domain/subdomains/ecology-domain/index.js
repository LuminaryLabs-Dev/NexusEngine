import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";
import {
  scoreVegetationSuitability,
  selectVegetationSpecies
} from "../../../../core-kits/core-vegetation-kit/contracts.js";

export function createVegetationEcologyKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-vegetation-ecology-domain-kit",
    domain: "core-vegetation-ecology",
    domainPath: config.domainPath ?? "n:object:vegetation:ecology",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationEcology",
    version: config.version ?? "0.1.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object:vegetation"],
    provides: [...(config.provides ?? []), "vegetation:ecology-score", "vegetation:ecology-selection"],
    purpose: "Renderer-neutral vegetation suitability scoring and deterministic species selection for World placement consumers.",
    services: ["suitability", "selection"],
    createApi() {
      return {
        score: scoreVegetationSuitability,
        select: selectVegetationSpecies
      };
    },
    metadata: {
      rendererAgnostic: true,
      deterministic: true,
      doesNotOwn: ["terrain sampling", "world-cell ownership", "route exclusions", "spawn budgets"]
    }
  });
}

export default createVegetationEcologyKit;
