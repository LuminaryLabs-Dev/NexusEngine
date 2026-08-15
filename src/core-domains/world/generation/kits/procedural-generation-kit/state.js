import { createProceduralSnapshot } from "./contracts.js";

export function createProceduralGenerationState(config = {}) {
  return { generation: 1, snapshot: createProceduralSnapshot(config) };
}
