import { defineEvent } from "../../../../../../../../ecs.js";
import { createDomainKit } from "../../../../../../../domain-kit.js";
import { createPathfindingServices } from "./services.js";
import { createPathfindingState } from "./state.js";

export { createAStarPathfinder, navigationAdapters, navigationHeuristics, resolveNavigationAdapter } from "./contracts.js";
export { createNavigationQuery } from "./services.js";

export const PathResolved = defineEvent("navigation.pathResolved");
export const PathFailed = defineEvent("navigation.pathFailed");

export function createPathfindingKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "pathfinding-kit",
    id: config.id ?? "pathfinding-kit",
    domain: "pathfinding",
    domainPath: "n:world:navigation:pathfinding",
    parentDomainPath: "n:world:navigation",
    apiName: "pathfinding",
    requires: ["navigation:navmesh"],
    provides: ["n:world:navigation:pathfinding", "navigation:pathfinding", "navigation:astar"],
    config,
    initialState: createPathfindingState(config),
    eventNames: ["configured", "updated", "reset", "snapshotLoaded", "pathResolved", "pathFailed"],
    events: { PathResolved, PathFailed },
    createApi({ baseApi, engine }) {
      return createPathfindingServices({ baseApi, engine, config });
    },
    metadata: { rendererAgnostic: true, historicalSource: "src/pathfinding-kit.js@a9adca5" }
  });
}

export default createPathfindingKit;
