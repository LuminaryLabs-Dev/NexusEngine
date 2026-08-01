export function createDebugDrawDescriptor(type, props = {}) {
  return { type, ...props };
}

export function jointSphere(name, position, radius = 0.05, color = 'joint') {
  return createDebugDrawDescriptor('joint-sphere', { name, position: { ...position }, radius, color });
}

export function limbSegment(name, start, end, radius = 0.025, color = 'limb') {
  return createDebugDrawDescriptor('limb-segment', { name, start: { ...start }, end: { ...end }, radius, color });
}

export function lookAheadMarker(name, position, radius = 0.22, color = 'look-ahead') {
  return createDebugDrawDescriptor('look-ahead-marker', { name, position: { ...position }, radius, color });
}

export function createDebugDrawDescriptorKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "debug-draw-descriptor-kit",
    id: "debug-draw-descriptor-kit",
    domain: "debug-draw",
    domainPath: "n:diagnostics",
    apiName: "debugDraw",
    provides: ["diagnostics:debug-draw-descriptor"],
    purpose: "Create stateless renderer-neutral debug draw descriptors.",
    createApi: () => ({
      createDebugDrawDescriptor,
      jointSphere,
      limbSegment,
      lookAheadMarker
    })
  });
}
import { createDomainKit } from "../../domain-kit.js";
