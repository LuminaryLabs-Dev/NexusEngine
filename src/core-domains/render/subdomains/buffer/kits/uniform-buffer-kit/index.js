import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage } from "../../buffer-contracts.js";
import {
  normalizeUniformBuffer,
  normalizeUniformBufferRegistrationCommand,
  normalizeUniformBufferSnapshot,
  uniformBufferContract
} from "./contracts.js";

export function createUniformBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "uniform-buffer-kit",
    id: "uniform-buffer-kit",
    domain: "render-uniform-buffer",
    apiName: "renderUniformBuffers",
    requires: ["n:render:buffer", "render:buffer-resource", "render:buffer-layout"],
    provides: ["render:uniform-buffer"],
    purpose: "Render Uniform Buffer",
    owns: ["logical Uniform Buffer ranges", "Uniform layout association", "explicit dynamic-offset alignment"],
    doesNotOwn: ["shader bindings", "bind groups", "provider alignment limits", "GPU allocation"],
    collection: "uniformBuffers",
    order: "uniformBufferOrder",
    revision: "uniformBufferRevision",
    recordField: "uniformBuffer",
    idField: "uniformBufferId",
    normalizeRecord: normalizeUniformBuffer,
    normalizeCommand: normalizeUniformBufferRegistrationCommand,
    normalizeSnapshot: normalizeUniformBufferSnapshot,
    contract: uniformBufferContract,
    validateRecord(record, { buffers, layouts }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Uniform Buffer ${record.uniformBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "uniform", `Render Uniform Buffer ${record.uniformBufferId}`);
      const layout = layouts().get(record.layoutId);
      if (!layout || layout.role !== "uniform") throw new TypeError(`Render Uniform Buffer ${record.uniformBufferId} requires a uniform layout.`);
      if (record.sizeBytes < layout.strideBytes || record.sizeBytes % layout.strideBytes !== 0) {
        throw new TypeError(`Render Uniform Buffer ${record.uniformBufferId} sizeBytes must contain whole layout strides.`);
      }
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.sizeBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, layout.alignmentBytes, record.dynamicAlignmentBytes),
        label: `Render Uniform Buffer ${record.uniformBufferId}`
      });
      return record;
    }
  });
}

export default createUniformBufferKit;
