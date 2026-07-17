import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createObjectDescriptor,
  updateObjectLifecycle,
  validateObjectDescriptor
} from "./object-descriptor.js";

export * from "./object-descriptor.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCoreObjectKit(config = {}) {
  const baseKit = createCoreCapabilityKit({
    ...config,
    domain: "core-object",
    apiName: config.apiName ?? "coreObject",
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
      function records() {
        return baseApi.getState()?.objects ?? {};
      }

      function register(input) {
        const descriptor = createObjectDescriptor(input);
        baseApi.update({
          objects: {
            ...records(),
            [descriptor.id]: descriptor
          }
        }, "descriptorChanged");
        return clone(descriptor);
      }

      function get(id) {
        return clone(records()[String(id)] ?? null);
      }

      function list() {
        return Object.values(records())
          .sort((left, right) => left.id.localeCompare(right.id))
          .map(clone);
      }

      function remove(id) {
        const key = String(id);
        if (!Object.prototype.hasOwnProperty.call(records(), key)) return false;
        const next = { ...records() };
        delete next[key];
        baseApi.update({ objects: next }, "descriptorChanged");
        return true;
      }

      function setLifecycle(id, status) {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown core object: ${id}`);
        const next = updateObjectLifecycle(current, status);
        baseApi.update({
          objects: {
            ...records(),
            [next.id]: next
          }
        }, "updated");
        return clone(next);
      }

      function loadObjectSnapshot(snapshot = {}) {
        const objects = snapshot.objects ?? {};
        for (const descriptor of Object.values(objects)) {
          const result = validateObjectDescriptor(descriptor);
          if (!result.valid) {
            throw new TypeError(`Invalid core object snapshot descriptor: ${result.errors.join("; ")}`);
          }
        }
        return baseApi.loadSnapshot(snapshot);
      }

      return {
        create: register,
        register,
        get,
        has(id) {
          return Object.prototype.hasOwnProperty.call(records(), String(id));
        },
        list,
        remove,
        setLifecycle,
        validate: validateObjectDescriptor,
        loadSnapshot: loadObjectSnapshot
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: "nexus-object-descriptor/1"
    }
  });

  return Object.freeze({
    ...baseKit,
    requires: [...(baseKit.requires ?? [])],
    provides: [
      ...(baseKit.provides ?? []),
      "n:object",
      "object:descriptor-contract",
      "object:registry",
      "object:lifecycle"
    ]
  });
}

export default createCoreObjectKit;
