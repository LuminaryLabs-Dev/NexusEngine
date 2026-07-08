import { createMemoryHeadlessRunWorkspace } from "./memory-workspace.js";
import { normalizeWorkspaceSnapshot, serializeHeadlessWorkspaceSnapshot } from "./workspace-contract.js";

export function createTextHeadlessRunWorkspace(input = {}) {
  const snapshot = typeof input === "string" || input.files ? normalizeWorkspaceSnapshot(input) : { files: input.files ?? {} };
  const memory = createMemoryHeadlessRunWorkspace({ files: snapshot });
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
