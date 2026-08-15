import { queryWaterSurface } from "./contracts.js";

export function createWaterSurfaceServices(baseApi) {
  return {
    query(point = {}) {
      return queryWaterSurface(baseApi.getState(), point);
    },
    advance(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const delta = Number(request.delta);
        if (!Number.isFinite(delta) || delta < 0) throw new TypeError("Water advance delta must be finite and nonnegative.");
        const elapsedSeconds = state.elapsedSeconds + delta;
        return { patch: { elapsedSeconds }, result: { elapsedSeconds } };
      });
    },
    listZones() {
      return baseApi.getState().zones;
    }
  };
}
