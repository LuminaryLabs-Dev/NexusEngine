import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import { assertBufferRange, assertBufferUsage } from "../../buffer-contracts.js";
import {
  normalizeVertexBuffer,
  normalizeVertexBufferRegistrationCommand,
  normalizeVertexBufferSnapshot,
  vertexBufferContract
} from "./contracts.js";

export function createVertexBufferKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "vertex-buffer-kit",
    id: "vertex-buffer-kit",
    domain: "render-vertex-buffer",
    apiName: "renderVertexBuffers",
    requires: ["n:render:buffer", "render:buffer-resource", "render:buffer-layout"],
    provides: ["render:vertex-buffer"],
    purpose: "Render Vertex Buffer",
    owns: ["logical Vertex Buffer views", "vertex count and byte-range validation", "Vertex layout association"],
    doesNotOwn: ["mesh topology", "shader inputs", "GPU binding slots", "provider allocation"],
    collection: "vertexBuffers",
    order: "vertexBufferOrder",
    revision: "vertexBufferRevision",
    recordField: "vertexBuffer",
    idField: "vertexBufferId",
    normalizeRecord: normalizeVertexBuffer,
    normalizeCommand: normalizeVertexBufferRegistrationCommand,
    normalizeSnapshot: normalizeVertexBufferSnapshot,
    contract: vertexBufferContract,
    validateRecord(record, { buffers, layouts }) {
      const buffer = buffers().get(record.identityId);
      if (!buffer) throw new TypeError(`Render Vertex Buffer ${record.vertexBufferId} targets unknown Buffer identity.`);
      assertBufferUsage(buffer, "vertex", `Render Vertex Buffer ${record.vertexBufferId}`);
      const layout = layouts().get(record.layoutId);
      if (!layout || layout.role !== "vertex") throw new TypeError(`Render Vertex Buffer ${record.vertexBufferId} requires a vertex layout.`);
      assertBufferRange(buffer, {
        offsetBytes: record.offsetBytes,
        sizeBytes: record.vertexCount * layout.strideBytes,
        alignmentBytes: Math.max(buffer.descriptor.alignmentBytes, layout.alignmentBytes),
        label: `Render Vertex Buffer ${record.vertexBufferId}`
      });
      return record;
    }
  });
}

export default createVertexBufferKit;
