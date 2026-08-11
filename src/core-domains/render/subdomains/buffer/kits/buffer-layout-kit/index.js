import { createBufferRegistryKit } from "../../buffer-registry-kit.js";
import {
  bufferLayoutContract,
  normalizeBufferLayout,
  normalizeBufferLayoutRegistrationCommand,
  normalizeBufferLayoutSnapshot
} from "./contracts.js";

export function createBufferLayoutKit(config = {}) {
  return createBufferRegistryKit({
    kitConfig: config,
    manifestId: "buffer-layout-kit",
    id: "buffer-layout-kit",
    domain: "render-buffer-layout",
    apiName: "renderBufferLayouts",
    requires: ["n:render:buffer", "render:buffer-resource"],
    provides: ["render:buffer-layout"],
    purpose: "Render Buffer Layout",
    owns: ["portable Buffer field formats", "explicit member offsets and alignments", "logical Buffer stride"],
    doesNotOwn: ["shader reflection", "provider packing", "GPU vertex declarations", "resource allocation"],
    collection: "layouts",
    order: "layoutOrder",
    revision: "layoutRevision",
    recordField: "layout",
    idField: "layoutId",
    normalizeRecord: normalizeBufferLayout,
    normalizeCommand: normalizeBufferLayoutRegistrationCommand,
    normalizeSnapshot: normalizeBufferLayoutSnapshot,
    contract: bufferLayoutContract,
    validateRecord(record) {
      return record;
    }
  });
}

export default createBufferLayoutKit;
