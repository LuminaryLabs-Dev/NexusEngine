import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function createOpenXrInputService() {
  const actionSets = new Map();

  return Object.freeze({
    registerActionSet(input = {}) {
      const id = String(input.id ?? "").trim();
      if (!id) throw new TypeError("OpenXR action set requires id.");
      const record = Object.freeze({
        id,
        priority: Number(input.priority ?? 0),
        actions: Object.freeze([...(input.actions ?? [])].map((action) => Object.freeze({
          id: String(action.id),
          type: String(action.type),
          subactionPaths: Object.freeze([...(action.subactionPaths ?? [])].sort())
        })).sort((left, right) => left.id.localeCompare(right.id)))
      });
      const existing = actionSets.get(id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
        throw new TypeError(`OpenXR action set content conflict: ${id}.`);
      }
      actionSets.set(id, record);
      return record;
    },
    async writeNative(root) {
      await mkdir(root, { recursive: true });
      const name = "nexus_openxr_input.c";
      await writeFile(path.join(root, name), await readFile(new URL(`./native/${name}`, import.meta.url)));
      return Object.freeze({ root, files: Object.freeze([name]) });
    },
    snapshot() { return Object.freeze([...actionSets.values()].sort((left, right) => left.id.localeCompare(right.id))); },
    reset() { actionSets.clear(); return this.snapshot(); }
  });
}

export default createOpenXrInputService;
