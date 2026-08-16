import { nonEmptyText, nonNegativeInteger, portableClone, positiveInteger } from "../portable.js";

export const NEXUS_COMPUTE_DISPATCH_SCHEMA = "nexus-compute-dispatch/1";
export const NEXUS_COMPUTE_DISPATCH_RECEIPT_SCHEMA = "nexus-compute-dispatch-receipt/1";

export function createComputeWorkgroup(input = {}) {
  const source = Array.isArray(input) ? { x: input[0], y: input[1], z: input[2] } : input;
  return Object.freeze({
    x: positiveInteger(source?.x, 1, "compute workgroup x"),
    y: positiveInteger(source?.y, 1, "compute workgroup y"),
    z: positiveInteger(source?.z, 1, "compute workgroup z")
  });
}

export function createComputeDispatchRequest(input = {}) {
  return Object.freeze({
    schema: NEXUS_COMPUTE_DISPATCH_SCHEMA,
    id: nonEmptyText(input.id ?? `dispatch:${input.graphId ?? "graph"}`, "compute dispatch id"),
    graphId: nonEmptyText(input.graphId, "compute dispatch graphId"),
    workgroup: createComputeWorkgroup(input.workgroup ?? input.dispatch),
    indirect: input.indirect == null ? null : portableClone(input.indirect, "compute indirect dispatch"),
    priority: nonNegativeInteger(input.priority, 0, "compute dispatch priority"),
    metadata: portableClone(input.metadata ?? {}, "compute dispatch metadata")
  });
}

export function createComputeDispatchReceipt(input = {}) {
  return Object.freeze({
    schema: NEXUS_COMPUTE_DISPATCH_RECEIPT_SCHEMA,
    dispatchId: nonEmptyText(input.dispatchId ?? input.id, "compute dispatch receipt id"),
    providerId: nonEmptyText(input.providerId, "compute dispatch receipt providerId"),
    status: String(input.status ?? "completed"),
    sequence: nonNegativeInteger(input.sequence, 0, "compute dispatch receipt sequence"),
    diagnostics: portableClone(input.diagnostics ?? [], "compute dispatch diagnostics"),
    metadata: portableClone(input.metadata ?? {}, "compute dispatch receipt metadata")
  });
}
