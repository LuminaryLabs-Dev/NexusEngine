import { nonEmptyText, portableClone, stringSet } from "../../../../portable.js";

export function createOpenGLComputeContract(input = {}) {
  return Object.freeze({
    id: nonEmptyText(input.id ?? "opengl-compute", "OpenGL compute contract id"),
    family: "gpu",
    backend: "opengl",
    api: "OpenGL",
    minimumVersion: String(input.minimumVersion ?? "4.3"),
    requiredOperations: stringSet(input.requiredOperations ?? ["context", "storage-buffer", "compute-shader", "dispatch", "memory-barrier"]),
    requiredExtensions: stringSet(input.requiredExtensions ?? [], "OpenGL required extension"),
    metadata: portableClone(input.metadata ?? {}, "OpenGL compute metadata")
  });
}
