import { createDomainKit } from "../../../../domain-kit.js";

export * from "./actions.js";
export * from "./bindings.js";
export * from "./contexts.js";
export * from "./intent.js";
export * from "./adapters.js";

export function createInputKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "input-contract-kit",
    id: config.id ?? "input-contract-kit",

    domainPath: config.domainPath ?? "n:interaction:input",

    parentDomainPath: config.parentDomainPath ?? "n:interaction",
    domain: "input",

    apiName: config.apiName ?? "input",
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
