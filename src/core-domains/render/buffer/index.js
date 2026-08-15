export { createBufferResourceKit } from "./kits/buffer-resource-kit/index.js";
export { createBufferLayoutKit } from "./kits/buffer-layout-kit/index.js";
export { createVertexBufferKit } from "./kits/vertex-buffer-kit/index.js";
export { createIndexBufferKit } from "./kits/index-buffer-kit/index.js";
export { createUniformBufferKit } from "./kits/uniform-buffer-kit/index.js";
export { createStorageBufferKit } from "./kits/storage-buffer-kit/index.js";
export { createInstanceBufferKit } from "./kits/instance-buffer-kit/index.js";
export { createIndirectBufferKit } from "./kits/indirect-buffer-kit/index.js";
export { RENDER_BUFFER_KIT_MANIFESTS } from "./buffer-manifests.js";
export { default as renderBufferSubdomainManifest } from "./subdomain.manifest.js";

import { createBufferResourceKit } from "./kits/buffer-resource-kit/index.js";
import { createBufferLayoutKit } from "./kits/buffer-layout-kit/index.js";
import { createVertexBufferKit } from "./kits/vertex-buffer-kit/index.js";
import { createIndexBufferKit } from "./kits/index-buffer-kit/index.js";
import { createUniformBufferKit } from "./kits/uniform-buffer-kit/index.js";
import { createStorageBufferKit } from "./kits/storage-buffer-kit/index.js";
import { createInstanceBufferKit } from "./kits/instance-buffer-kit/index.js";
import { createIndirectBufferKit } from "./kits/indirect-buffer-kit/index.js";

export function createRenderBufferDomain(config = {}) {
  return [
    createBufferResourceKit(config.resource ?? {}),
    createBufferLayoutKit(config.layout ?? {}),
    createVertexBufferKit(config.vertex ?? {}),
    createIndexBufferKit(config.index ?? {}),
    createUniformBufferKit(config.uniform ?? {}),
    createStorageBufferKit(config.storage ?? {}),
    createInstanceBufferKit(config.instance ?? {}),
    createIndirectBufferKit(config.indirect ?? {})
  ];
}

export default createRenderBufferDomain;
