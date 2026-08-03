import { cloneSerializableState } from "../../../../../../../../foundation/serializable-state.js";
import { createAStarPathfinder, resolveNavigationAdapter } from "./contracts.js";

export function createPathfindingServices({ baseApi, engine, config }) {
  function sources(request) {
    const navmesh = engine.n?.navmesh;
    return {
      walkability: request.walkability ?? config.walkability,
      navmesh2d: request.navmesh2d ?? navmesh?.getNavMesh?.(),
      graph3d: request.graph3d ?? navmesh?.getGraph?.()
    };
  }
  return {
    setMode(command = {}) {
      return baseApi.applyCommand(command, (_state, request) => {
        const mode = String(request.mode ?? "");
        if (!["grid", "navmesh2d", "navmesh3d"].includes(mode)) throw new TypeError(`Unsupported pathfinding mode ${mode}.`);
        return { patch: { mode }, result: { mode } };
      });
    },
    requestPath(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const mode = String(request.mode ?? state.mode);
        const adapter = resolveNavigationAdapter(mode, sources(request), request.options ?? {});
        const result = createAStarPathfinder({ adapter }).findPath({ start: request.start, goal: request.goal });
        const path = { id: String(request.id ?? request.operationId), mode, start: cloneSerializableState(request.start), goal: cloneSerializableState(request.goal), ...result };
        const resolved = result.status === "resolved";
        return {
          patch: {
            mode,
            lastPath: path,
            paths: [...state.paths, path].slice(-Math.max(1, Number(config.historyLimit ?? 20))),
            resolvedCount: state.resolvedCount + (resolved ? 1 : 0),
            failedCount: state.failedCount + (resolved ? 0 : 1)
          },
          result: path,
          events: [{ name: resolved ? "pathResolved" : "pathFailed", payload: { path } }]
        };
      });
    },
    lastPath() {
      return cloneSerializableState(baseApi.getState().lastPath);
    },
    listPaths() {
      return cloneSerializableState(baseApi.getState().paths);
    }
  };
}

export function createNavigationQuery(api) {
  if (!api || typeof api.getSnapshot !== "function") throw new TypeError("Navigation query requires a Pathfinding API.");
  return Object.freeze({ snapshot: () => api.getSnapshot(), lastPath: () => api.lastPath(), paths: () => api.listPaths() });
}
