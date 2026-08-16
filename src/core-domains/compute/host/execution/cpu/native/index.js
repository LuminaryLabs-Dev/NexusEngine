import { nonEmptyText, portableClone, stringSet } from "../../../../portable.js";

export function createNativeComputeContract(input = {}) {
  return Object.freeze({
    id: nonEmptyText(input.id ?? "native-compute", "native compute contract id"),
    family: "cpu",
    backend: "native",
    requiredOperations: stringSet(input.requiredOperations ?? ["thread-pool", "task-dispatch", "synchronization"]),
    vectorFeatures: stringSet(input.vectorFeatures ?? [], "native vector feature"),
    metadata: portableClone(input.metadata ?? {}, "native compute metadata")
  });
}
