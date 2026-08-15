import { queryNearestRouteMarker } from "./contracts.js";

export function createRouteFieldServices(baseApi) {
  return {
    nearestMarker(point = {}, options = {}) {
      return queryNearestRouteMarker(baseApi.getState(), point, options);
    },
    setMarkerActive(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const markerId = String(request.markerId ?? "");
        const marker = state.markers.find((entry) => entry.id === markerId);
        if (!marker) throw new TypeError(`Unknown route marker ${markerId}.`);
        const active = request.active !== false;
        const markers = state.markers.map((entry) => entry.id === markerId ? { ...entry, active } : entry);
        return { patch: { markers }, result: { markerId, active } };
      });
    },
    listMarkers() {
      return baseApi.getState().markers;
    },
    listCorridors() {
      return baseApi.getState().corridors;
    }
  };
}
