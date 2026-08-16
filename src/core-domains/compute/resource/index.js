import { nonEmptyText, nonNegativeInteger, portableClone, stringSet } from "../portable.js";

export const NEXUS_COMPUTE_RESOURCE_SCHEMA = "nexus-compute-resource/1";
export const NEXUS_COMPUTE_RESOURCE_RECEIPT_SCHEMA = "nexus-compute-resource-receipt/1";

export function createComputeResourceDescriptor(input = {}) {
  const kind = String(input.kind ?? "buffer");
  if (!["buffer", "image"].includes(kind)) throw new TypeError(`Unsupported compute resource kind: ${kind}.`);
  return Object.freeze({
    schema: NEXUS_COMPUTE_RESOURCE_SCHEMA,
    id: nonEmptyText(input.id, "compute resource id"),
    kind,
    byteLength: nonNegativeInteger(input.byteLength, 0, "compute resource byteLength"),
    stride: nonNegativeInteger(input.stride, 0, "compute resource stride"),
    elementCount: nonNegativeInteger(input.elementCount, 0, "compute resource elementCount"),
    format: input.format == null ? null : String(input.format),
    usage: stringSet(input.usage ?? ["storage"], "compute resource usage"),
    access: String(input.access ?? "read-write"),
    lifetime: String(input.lifetime ?? "graph"),
    initialData: portableClone(input.initialData ?? null, "compute resource initialData"),
    metadata: portableClone(input.metadata ?? {}, "compute resource metadata")
  });
}

export function createComputeResourceReceipt(input = {}) {
  return Object.freeze({
    schema: NEXUS_COMPUTE_RESOURCE_RECEIPT_SCHEMA,
    resourceId: nonEmptyText(input.resourceId ?? input.id, "compute resource receipt resourceId"),
    providerId: nonEmptyText(input.providerId, "compute resource receipt providerId"),
    backend: nonEmptyText(input.backend ?? "provider", "compute resource receipt backend"),
    revision: nonNegativeInteger(input.revision, 0, "compute resource receipt revision"),
    resident: input.resident !== false,
    byteLength: nonNegativeInteger(input.byteLength, 0, "compute resource receipt byteLength"),
    metadata: portableClone(input.metadata ?? {}, "compute resource receipt metadata")
  });
}

export function resolveComputeProviderResource(provider, receipt) {
  if (!provider || typeof provider.resolveResource !== "function") {
    throw new TypeError("Compute provider does not expose provider-private resource resolution.");
  }
  const portableReceipt = createComputeResourceReceipt(receipt);
  return provider.resolveResource(portableReceipt.resourceId, portableReceipt);
}
