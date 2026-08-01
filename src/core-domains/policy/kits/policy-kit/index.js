import { createDomainKit } from "../../../domain-kit.js";

export function createPolicyKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "policy-kit",
    id: config.id ?? "policy-kit",

    domainPath: config.domainPath ?? "n:policy",
    domain: "policy",

    apiName: config.apiName ?? "policy",
    purpose: "Permissions, guards, allowed/blocked actions, sandbox rules, tool/action policy, and runtime safety checks.",
    owns: ["allowed action policy", "blocked action policy", "permission gates", "sandbox rules", "promotion restrictions"],
    doesNotOwn: ["agent planning", "product-specific moderation policy"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
