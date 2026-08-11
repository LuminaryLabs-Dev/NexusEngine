import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage } from "../../buffer-contracts.js";
import {
  indirectBufferContract,
  normalizeIndirectBuffer,
  normalizeIndirectBufferRegistrationCommand,
  normalizeIndirectBufferSnapshot
} from "./contracts.js";

export function createIndirectBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "indirect-buffer-kit",
    id: "indirect-buffer-kit",
    domain: "render-indirect-buffer",
    apiName: "renderIndirectBuffers",
    requires: ["n:render:buffer", "render:buffer-resource"],
    provides: ["render:indirect-buffer"],
    purpose: "Render Indirect Buffer",
    owns: ["logical Indirect Buffer command ranges", "portable command type", "command count and stride validation"],
    doesNotOwn: ["command byte contents", "draw or dispatch policy", "provider command execution", "GPU allocation"],
    collection: "indirectBuffers",
    order: "indirectBufferOrder",
    revision: "indirectBufferRevision",
    recordField: "indirectBuffer",
    idField: "indirectBufferId",
    normalizeRecord: normalizeIndirectBuffer,
    normalizeCommand: normalizeIndirectBufferRegistrationCommand,
    normalizeSnapshot: normalizeIndirectBufferSnapshot,
    contract: indirectBufferContract,
    validateRecord(record, { buffers }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Indirect Buffer ${record.indirectBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "indirect", `Render Indirect Buffer ${record.indirectBufferId}`);
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.commandCount * record.strideBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, 4),
        label: `Render Indirect Buffer ${record.indirectBufferId}`
      });
      return record;
    }
  });
}

export default createIndirectBufferKit;
