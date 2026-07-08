import { createMemoryHeadlessRunWorkspace } from "./memory-workspace.js";
import { normalizeWorkspaceSnapshot, serializeHeadlessWorkspaceSnapshot } from "./workspace-contract.js";

export function createTextHeadlessRunWorkspace(input = {}) {
  const memory = typeof input === "string" || (input.version && input.files)
    ? createMemoryHeadlessRunWorkspace({ files: normalizeWorkspaceSnapshot(input) })
    : createMemoryHeadlessRunWorkspace({ files: input.files ?? input });

  return {
    ...memory,
    kind: "text",
    async toTextBundle() {
      return serializeHeadlessWorkspaceSnapshot(await memory.snapshot());
    },
    async loadTextBundle(bundle) {
      await memory.loadSnapshot(normalizeWorkspaceSnapshot(bundle));
      return this;
    }
  };
}

export { serializeHeadlessWorkspaceSnapshot, normalizeWorkspaceSnapshot } from "./workspace-contract.js";
