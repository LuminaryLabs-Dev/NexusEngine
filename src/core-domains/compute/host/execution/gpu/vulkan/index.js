import { nonEmptyText, portableClone, stringSet } from "../../../../portable.js";

export function createVulkanComputeContract(input = {}) {
  return Object.freeze({
    id: nonEmptyText(input.id ?? "vulkan-compute", "Vulkan compute contract id"),
    family: "gpu",
    backend: "vulkan",
    api: "Vulkan",
    requiredOperations: stringSet(input.requiredOperations ?? ["device", "memory", "descriptor", "pipeline", "command", "synchronization"]),
    requiredExtensions: stringSet(input.requiredExtensions ?? [], "Vulkan required extension"),
    metadata: portableClone(input.metadata ?? {}, "Vulkan compute metadata")
  });
}
