import { createDomainKit } from "../../../../../domain-kit.js";
import {
  svegetationSuitability,
  selectVegetationSpecies
} from "../../kits/object-vegetation-kit/contracts.js";

export function createVegetationEcologyKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "object-vegetation-ecology-kit",
    id: config.id ?? "object-vegetation-ecology-kit",
    domain: "vegetation-ecology",
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
        score: svegetationSuitability,
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
