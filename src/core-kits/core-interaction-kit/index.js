import { createCoreCapabilityKit } from "../core-capability-kit.js";

export { InteractionTargetState, InteractionTargetInput, InteractionTargetCompleted, createInteractionTargetKit } from "../../interaction-target-kit.js";
export * from "./targets.js";
export * from "./affordances.js";
export * from "./activation.js";
export * from "./prompts.js";
export * from "./results.js";

export function createCoreInteractionKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-interaction",
    apiName: config.apiName ?? "coreInteraction",
    purpose: "Targets, affordances, activation progress, prompts, semantic requirements, and interaction completion events.",
    owns: ["targets", "affordances", "activation progress", "prompts", "interaction completion events"],
    doesNotOwn: ["raw input device handling", "renderer UI implementation"],
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
