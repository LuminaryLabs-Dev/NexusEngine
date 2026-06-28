import { createCoreCapabilityKit } from "../core-capability-kit.js";

export function createCorePolicyKit(config = {}) {
  return createCoreCapabilityKit({
    ...config,
    domain: "core-policy",
    apiName: config.apiName ?? "corePolicy",
    purpose: "Permissions, guards, allowed/blocked actions, sandbox rules, tool/action policy, and runtime safety checks.",
    owns: ["allowed action policy", "blocked action policy", "permission gates", "sandbox rules", "promotion restrictions"],
    doesNotOwn: ["agent planning", "product-specific moderation policy"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
