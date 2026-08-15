import { defineEvent } from "../../../../../ecs.js";
import { createDomainKit } from "../../../../domain-kit.js";
import { createProceduralGenerationServices } from "./services.js";
import { createProceduralGenerationState } from "./state.js";

export { createProceduralQuery, createProceduralSnapshot, normalizeProceduralConfig, proceduralAlgorithms } from "./contracts.js";

export const ProceduralGenerated = defineEvent("procedural.generated");

export function createProceduralGenerationKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "procedural-generation-kit",
    id: config.id ?? "procedural-generation-kit",
    domain: "procedural-generation",
    domainPath: "n:world:generation",
    parentDomainPath: "n:world",
    apiName: "proceduralGeneration",
    requires: ["n:world"],
    provides: ["n:world:generation", "world:procedural-generation", "navigation:walkability-source"],
    config,
    initialState: createProceduralGenerationState(config),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "proceduralGenerated"],
    events: { ProceduralGenerated },
    createApi({ baseApi }) {
      return createProceduralGenerationServices(baseApi);
    },
    metadata: { rendererAgnostic: true, deterministic: true, historicalSource: "src/procedural-kit.js@a9adca5" }
  });
}

export default createProceduralGenerationKit;
