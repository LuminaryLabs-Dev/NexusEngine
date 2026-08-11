import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage, bufferIndexFormatByteSize } from "../../buffer-contracts.js";
import {
  indexBufferContract,
  normalizeIndexBuffer,
  normalizeIndexBufferRegistrationCommand,
  normalizeIndexBufferSnapshot
} from "./contracts.js";

export function createIndexBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "index-buffer-kit",
    id: "index-buffer-kit",
    domain: "render-index-buffer",
    apiName: "renderIndexBuffers",
    requires: ["n:render:buffer", "render:buffer-resource"],
    provides: ["render:index-buffer"],
    purpose: "Render Index Buffer",
    owns: ["logical Index Buffer views", "portable index format", "index count and byte-range validation"],
    doesNotOwn: ["primitive topology", "mesh ownership", "draw submission", "provider allocation"],
    collection: "indexBuffers",
    order: "indexBufferOrder",
    revision: "indexBufferRevision",
    recordField: "indexBuffer",
    idField: "indexBufferId",
    normalizeRecord: normalizeIndexBuffer,
    normalizeCommand: normalizeIndexBufferRegistrationCommand,
    normalizeSnapshot: normalizeIndexBufferSnapshot,
    contract: indexBufferContract,
    validateRecord(record, { buffers }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Index Buffer ${record.indexBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "index", `Render Index Buffer ${record.indexBufferId}`);
      const elementBytes = bufferIndexFormatByteSize(record.indexFormat);
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.indexCount * elementBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, elementBytes),
        label: `Render Index Buffer ${record.indexBufferId}`
      });
      return record;
    }
  });
}

export default createIndexBufferKit;
