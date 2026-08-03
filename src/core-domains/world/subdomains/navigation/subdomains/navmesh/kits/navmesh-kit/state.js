import { create3DNavigationGraph, createNavMeshFromWalkability } from "./contracts.js";

export function createNavMeshState(config = {}) {
  if (!config.walkability) return { sourceSignature: null, navmesh2d: null, graph3d: null };
  const navmesh2d = createNavMeshFromWalkability(config.walkability, { sourceSignature: config.sourceSignature, id: config.id });
  return { sourceSignature: navmesh2d.sourceSignature, navmesh2d, graph3d: create3DNavigationGraph(navmesh2d, { links3d: config.links3d ?? [] }) };
}
