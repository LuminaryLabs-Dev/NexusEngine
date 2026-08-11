import { createTextureRegistryKit } from "../../texture-registry-kit.js";
import {
  normalizeTextureFormat,
  normalizeTextureFormatRegistrationCommand,
  normalizeTextureFormatSnapshot,
  textureFormatContract
} from "./contracts.js";

export function createTextureFormatKit(config = {}) {
  return createTextureRegistryKit({
    kitConfig: config,
    manifestId: "texture-format-kit",
    id: "texture-format-kit",
    domain: "render-texture-format",
    apiName: "renderTextureFormats",
    requires: ["n:render:resource"],
    provides: ["render:texture-format"],
    purpose: "Render Texture Format",
    owns: ["portable Texture format records", "texel block layout", "format aspect and capability declarations"],
    doesNotOwn: ["provider format enums", "device support claims", "source decoding", "shader sampling policy"],
    collection: "formats",
    order: "formatOrder",
    revision: "formatRevision",
    recordField: "format",
    idField: "formatId",
    normalizeRecord: normalizeTextureFormat,
    normalizeCommand: normalizeTextureFormatRegistrationCommand,
    normalizeSnapshot: normalizeTextureFormatSnapshot,
    contract: textureFormatContract,
    validateRecord: (record) => record
  });
}

export default createTextureFormatKit;
