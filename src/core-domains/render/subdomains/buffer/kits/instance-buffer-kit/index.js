import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage } from "../../buffer-contracts.js";
import {
  instanceBufferContract,
  normalizeInstanceBuffer,
  normalizeInstanceBufferRegistrationCommand,
  normalizeInstanceBufferSnapshot
} from "./contracts.js";

export function createInstanceBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "instance-buffer-kit",
    id: "instance-buffer-kit",
    domain: "render-instance-buffer",
    apiName: "renderInstanceBuffers",
    requires: ["n:render:buffer", "render:buffer-resource", "render:buffer-layout"],
    provides: ["render:instance-buffer"],
    purpose: "Render Instance Buffer",
    owns: ["logical Instance Buffer views", "instance count and byte-range validation", "Instance layout association"],
    doesNotOwn: ["Object identity", "visibility", "draw batching", "provider allocation"],
    collection: "instanceBuffers",
    order: "instanceBufferOrder",
    revision: "instanceBufferRevision",
    recordField: "instanceBuffer",
    idField: "instanceBufferId",
    normalizeRecord: normalizeInstanceBuffer,
    normalizeCommand: normalizeInstanceBufferRegistrationCommand,
    normalizeSnapshot: normalizeInstanceBufferSnapshot,
    contract: instanceBufferContract,
    validateRecord(record, { buffers, layouts }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Instance Buffer ${record.instanceBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "instance", `Render Instance Buffer ${record.instanceBufferId}`);
      const layout = layouts().get(record.layoutId);
      if (!layout || layout.role !== "instance") throw new TypeError(`Render Instance Buffer ${record.instanceBufferId} requires an instance layout.`);
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.instanceCount * layout.strideBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, layout.alignmentBytes),
        label: `Render Instance Buffer ${record.instanceBufferId}`
      });
      return record;
    }
  });
}

export default createInstanceBufferKit;
