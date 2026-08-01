import { createDomainKit } from "../../../../../domain-kit.js";

export function createUIKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "ui-descriptor-kit",
    id: config.id ?? "ui-descriptor-kit",

    domainPath: config.domainPath ?? "n:presentation:ui",

    parentDomainPath: config.parentDomainPath ?? "n:presentation",
    domain: "ui",

    apiName: config.apiName ?? "ui",
    purpose: "UI descriptors for HUDs, menus, prompts, notifications, panels, focus, selection, and accessibility.",
    owns: ["HUD descriptors", "menu descriptors", "prompt descriptors", "notifications", "focus state", "selection state"],
    doesNotOwn: ["DOM rendering", "React components", "native UI implementation"],
    metadata: { ...(config.metadata ?? {}), piecesFirst: true }
  });
}
