import { createDomainKit } from "../../../domain-kit.js";
import { createObjectRegistryState } from "../../state/object-registry-state.js";

export * from "../../contracts/object-descriptor.js";

export function createObjectRegistryKit(config = {}) {
  return createDomainKit({
    ...config,

    manifestId: "object-registry-kit",
    id: config.id ?? "object-registry-kit",
    domain: "object",

    domainPath: config.domainPath ?? "n:object",
    legacyDomainTokens: false,

    apiName: config.apiName ?? "object",
    provides: [
      ...(config.provides ?? []),
      "object:descriptor-contract",
      "object:registry",
      "object:lifecycle"
    ],
    purpose: "Universal renderer-agnostic object identity, structure, bounds, references, lifecycle, snapshots, and validation.",
    owns: [
      "stable object identity",
      "object type",
      "transform descriptors",
      "part hierarchy",
      "bounds and pivots",
      "ground anchors",
      "geometry, material, collision, LOD, and capture references",
      "content hashes",
      "object lifecycle state"
    ],
    doesNotOwn: [
      "procedural generation policy",
      "tree morphology",
      "creature anatomy",
      "renderer objects",
      "GPU resources",
      "physics resolution",
      "asset transport"
    ],
    services: [
      "object-descriptor",
      "object-registry",
      "object-validation",
      "object-lifecycle",
      "snapshot",
      "reset"
    ],
    initialState: {
      objects: {}
    },
    createApi({ baseApi }) {
      return createObjectRegistryState(baseApi);
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: "nexus-object-descriptor/1"
    }
  });
}

export default createObjectRegistryKit;
