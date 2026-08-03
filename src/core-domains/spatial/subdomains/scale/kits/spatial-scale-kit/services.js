import { queryEnteredScaleAnchor, queryNearestScaleAnchor } from "./contracts.js";

export function createSpatialScaleServices(baseApi) {
  return {
    nearestAnchor(point = {}) {
      return queryNearestScaleAnchor(baseApi.getState(), point);
    },
    setSubject(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const scale = request.scale == null ? state.subject.scale : Number(request.scale);
        const x = request.x == null ? state.subject.x : Number(request.x);
        const y = request.y == null && request.z == null ? state.subject.y : Number(request.y ?? request.z);
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(scale) || scale <= 0) throw new TypeError("Spatial subject coordinates must be finite and scale positive.");
        const subject = { id: String(request.subjectId ?? request.id ?? state.subject.id), x, y, scale };
        const nearest = queryNearestScaleAnchor(state, subject);
        const entered = queryEnteredScaleAnchor(state, subject);
        const activeAnchorId = entered?.anchor.id ?? null;
        const activeBand = entered?.band ?? nearest?.band ?? null;
        const events = [];
        if (activeBand !== state.activeBand) events.push({ name: "scaleBandChanged", payload: { previousBand: state.activeBand, band: activeBand, anchor: entered?.anchor ?? nearest?.anchor ?? null } });
        if (activeAnchorId && activeAnchorId !== state.activeAnchorId) events.push({ name: "scaleAnchorEntered", payload: { anchor: entered.anchor, distance: entered.distance } });
        return { patch: { subject, activeAnchorId, activeBand }, result: { subject, nearest, entered }, events };
      });
    }
  };
}
