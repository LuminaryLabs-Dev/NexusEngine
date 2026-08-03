export function createPathfindingState(config = {}) {
  const mode = String(config.mode ?? "navmesh2d");
  if (!["grid", "navmesh2d", "navmesh3d"].includes(mode)) throw new TypeError(`Unsupported pathfinding mode ${mode}.`);
  return { mode, lastPath: null, paths: [], resolvedCount: 0, failedCount: 0 };
}
