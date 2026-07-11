import { validateWorldCell } from "./kits/world-cell-kit/index.js";

export function validateWorldDefinition(world) {
  const issues = [];
  if (!world?.id) issues.push("missing-id");
  if (!world?.partition?.selectCells) issues.push("missing-partition");
  if (!world?.surface?.toWorld) issues.push("missing-surface");
  for (const provider of world?.providers ?? []) {
    if (!provider?.id || typeof provider?.build !== "function") issues.push(`invalid-provider:${provider?.id ?? "unknown"}`);
  }
  return { valid: issues.length === 0, issues };
}

export function validateWorldSnapshot(snapshot) {
  const issues = [];
  if (!snapshot?.id) issues.push("missing-id");
  for (const entry of snapshot?.activeCells ?? []) issues.push(...validateWorldCell(entry.cell).issues.map((issue) => `${entry.cell?.id ?? "cell"}:${issue}`));
  return { valid: issues.length === 0, issues };
}
