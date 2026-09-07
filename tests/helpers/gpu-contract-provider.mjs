/** Test double for the portable Host port. No native backend behavior is claimed. */
export function createContractGPUProvider() {
  let generation = 1;
  const handles = new Map();
  const describe = () => ({ id: `gpu-${generation}`, backend: "contract-test", generation, features: ["compute", "render", "storage-buffer"] });
  return {
    id: "contract-test-provider", backend: "contract-test",
    async ensureDevice() { return describe(); },
    async ensureResource(descriptor) {
      const previous = handles.get(descriptor.id);
      const key = JSON.stringify([generation, descriptor.type, descriptor.byteLength, descriptor.usage]);
      const reallocated = !previous || previous.key !== key;
      if (reallocated) handles.set(descriptor.id, Object.freeze({ key }));
      return { reallocated };
    },
    resolveResource(id) { return handles.get(id) ?? null; },
    releaseResource(id) { handles.delete(id); },
    invalidate() { handles.clear(); },
    async restore() { generation += 1; handles.clear(); return describe(); },
    dispose() { handles.clear(); }
  };
}
