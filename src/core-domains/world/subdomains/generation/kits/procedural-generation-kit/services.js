import { createProceduralQuery, createProceduralSnapshot } from "./contracts.js";

export function createProceduralGenerationServices(baseApi) {
  const query = createProceduralQuery(() => baseApi.getState().snapshot);
  return {
    regenerate(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const priorConfig = state.snapshot?.config ?? {};
        const nextConfig = { ...priorConfig, ...(request.config ?? {}), ...(request.seed === undefined ? {} : { seed: request.seed }) };
        const snapshot = createProceduralSnapshot(nextConfig);
        return { patch: { generation: state.generation + 1, snapshot }, result: { generation: state.generation + 1, signature: snapshot.signature }, events: [{ name: "proceduralGenerated", payload: { signature: snapshot.signature } }] };
      });
    },
    getGeneratedSnapshot() {
      return query.snapshot();
    },
    query() {
      return query;
    }
  };
}
