import { createCoreCapabilityKit } from "../core-capability-kit.js";

export { InputIntentState, InputIntentChanged, InputActionPressed, createInputIntentKit } from "../../input-intent-kit.js";
export * from "./actions.js";
export * from "./bindings.js";
export * from "./contexts.js";
export * from "./intent.js";
export * from "./adapters.js";

export function createCoreInputKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-input",
    apiName: config.apiName ?? "coreInput",
    purpose: "Semantic input actions, axes, contexts, bindings, dead zones, and adapter boundaries.",
    owns: ["actions", "axes", "bindings", "contexts", "pressed/held/released state", "device adapter boundaries"],
    doesNotOwn: ["movement policy", "interaction results", "platform-specific input UI"],
    descriptors: {
      actions: config.actions ?? {},
      bindings: config.bindings ?? {},
      contexts: config.contexts ?? {},
      ...(config.descriptors ?? {})
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
