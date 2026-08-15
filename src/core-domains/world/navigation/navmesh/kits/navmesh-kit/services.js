import { cloneSerializableState } from "../../../../../../foundation/serializable-state.js";
import { create3DNavigationGraph, createNavMeshFromWalkability, nearestNavigationWaypoint } from "./contracts.js";

export function createNavMeshServices(baseApi) {
  return {
    rebuild(command = {}) {
      return baseApi.applyCommand(command, (_state, request) => {
        const navmesh2d = createNavMeshFromWalkability(request.walkability, { id: request.id, sourceSignature: request.sourceSignature });
        const graph3d = create3DNavigationGraph(navmesh2d, { links3d: request.links3d ?? [], heightOffset: request.heightOffset });
        return { patch: { sourceSignature: navmesh2d.sourceSignature, navmesh2d, graph3d }, result: { sourceSignature: navmesh2d.sourceSignature, cells: navmesh2d.cells.length, links: graph3d.links.length } };
      });
    },
    getNavMesh() {
      return cloneSerializableState(baseApi.getState().navmesh2d);
    },
    getGraph() {
      return cloneSerializableState(baseApi.getState().graph3d);
    },
    nearest(point = {}) {
      return nearestNavigationWaypoint(baseApi.getState().graph3d ?? {}, point);
    },
    snapshot() {
      return baseApi.getSnapshot();
    }
  };
}
