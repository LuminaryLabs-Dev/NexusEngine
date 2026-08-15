import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage } from "../../buffer-contracts.js";
import {
  normalizeStorageBuffer,
  normalizeStorageBufferRegistrationCommand,
  normalizeStorageBufferSnapshot,
  storageBufferContract
} from "./contracts.js";

export function createStorageBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "storage-buffer-kit",
    id: "storage-buffer-kit",
    domain: "render-storage-buffer",
    apiName: "renderStorageBuffers",
    requires: ["n:render:buffer", "render:buffer-resource", "render:buffer-layout"],
    provides: ["render:storage-buffer"],
    purpose: "Render Storage Buffer",
    owns: ["logical Storage Buffer ranges", "portable storage access mode", "element-count and layout validation"],
    doesNotOwn: ["shader bindings", "GPU barriers", "provider synchronization", "compute dispatch"],
    collection: "storageBuffers",
    order: "storageBufferOrder",
    revision: "storageBufferRevision",
    recordField: "storageBuffer",
    idField: "storageBufferId",
    normalizeRecord: normalizeStorageBuffer,
    normalizeCommand: normalizeStorageBufferRegistrationCommand,
    normalizeSnapshot: normalizeStorageBufferSnapshot,
    contract: storageBufferContract,
    validateRecord(record, { buffers, layouts }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Storage Buffer ${record.storageBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "storage", `Render Storage Buffer ${record.storageBufferId}`);
      const layout = layouts().get(record.layoutId);
      if (!layout || layout.role !== "storage") throw new TypeError(`Render Storage Buffer ${record.storageBufferId} requires a storage layout.`);
      if (record.sizeBytes !== record.elementCount * layout.strideBytes) {
        throw new TypeError(`Render Storage Buffer ${record.storageBufferId} sizeBytes must equal elementCount times layout stride.`);
      }
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.sizeBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, layout.alignmentBytes),
        label: `Render Storage Buffer ${record.storageBufferId}`
      });
      return record;
    }
  });
}

export default createStorageBufferKit;
