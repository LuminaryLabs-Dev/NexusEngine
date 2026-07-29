import { defineDomainServiceKit } from "../../../../../../domain-service-kit.js";
import {
  createObjectPlacementDescriptor,
  OBJECT_PLACEMENT_FRAME,
  OBJECT_PLACEMENT_VERSION
} from "../../contracts/placement-descriptor.js";
import {
  alignPlacementAnchors,
  computePlacementWorldPoint,
  fitPlacementWithinBounds,
  getPlacementWorldAnchor,
  getPlacementWorldBounds,
  groundPlacement
} from "./placement-operations.js";
import { clonePlacementValue } from "./placement-math.js";
import { validatePlacement } from "./placement-validation.js";

export * from "../../contracts/placement-descriptor.js";
export * from "./placement-math.js";
export * from "./placement-operations.js";
export * from "./placement-validation.js";

function createPlacementApi(config, engine) {
  let records = new Map();

  function intrinsicObjectDefaults(input = {}) {
    const objectId = String(input.objectId ?? "").trim();
    const object = objectId ? engine?.n?.coreObject?.get?.(objectId) : null;
    if (!object) {
      throw new TypeError(
        objectId
          ? `Unknown core object ${objectId}; register it before creating a placement.`
          : "objectId is required."
      );
    }
    const anchors = input.anchors ?? [{
      id: "support",
      position: object.groundAnchor,
      normal: [0, -1, 0],
      forward: [0, 0, -1],
      tags: ["support", "object-ground-anchor"]
    }];
    return {
      ...input,
      localBounds: object.bounds,
      pivot: object.pivot,
      anchors
    };
  }

  function normalize(input = {}) {
    return createObjectPlacementDescriptor({
      ...config.defaults,
      ...intrinsicObjectDefaults(input)
    });
  }

  function resolve(value) {
    if (typeof value !== "string") return normalize(value);
    const found = records.get(value);
    if (!found) throw new TypeError(`Unknown object placement ${value}.`);
    return found;
  }

  const api = {
    create(input = {}) {
      const next = normalize(input);
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    revise(id, patch = {}) {
      const current = resolve(String(id));
      const next = normalize({
        ...current,
        ...patch,
        id: current.id,
        objectId: current.objectId,
        revision: current.revision + 1,
        coordinateFrame: { ...current.coordinateFrame, ...(patch.coordinateFrame ?? {}) },
        localBounds: current.localBounds,
        pivot: current.pivot,
        transform: { ...current.transform, ...(patch.transform ?? {}) },
        metadata: { ...current.metadata, ...(patch.metadata ?? {}) },
        anchors: patch.anchors ?? current.anchors
      });
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    save(input) {
      const next = normalize(input);
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    get(id) {
      return clonePlacementValue(records.get(String(id)) ?? null);
    },
    list() {
      return [...records.values()]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(clonePlacementValue);
    },
    remove(id) {
      return records.delete(String(id));
    },
    worldPoint(input, point) {
      return computePlacementWorldPoint(resolve(input), point);
    },
    worldAnchor(input, anchorId) {
      return getPlacementWorldAnchor(resolve(input), anchorId);
    },
    worldBounds(input) {
      return getPlacementWorldBounds(resolve(input));
    },
    align(input, target, options = {}) {
      const next = alignPlacementAnchors(
        resolve(input),
        typeof target === "string" ? resolve(target) : target,
        options
      );
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    ground(input, plane, options = {}) {
      const next = groundPlacement(resolve(input), plane, options);
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    fit(input, targetBounds, options = {}) {
      const next = fitPlacementWithinBounds(resolve(input), targetBounds, options);
      records.set(next.id, next);
      return clonePlacementValue(next);
    },
    validate(input, options = {}) {
      return validatePlacement(resolve(input), options);
    },
    getSnapshot() {
      return {
        version: OBJECT_PLACEMENT_VERSION,
        status: "ready",
        records: api.list()
      };
    },
    loadSnapshot(snapshot = {}) {
      if (snapshot.version !== OBJECT_PLACEMENT_VERSION || snapshot.status !== "ready") {
        throw new TypeError("Unsupported object-placement snapshot.");
      }
      records = new Map((snapshot.records ?? []).map((record) => {
        const next = normalize(record);
        return [next.id, next];
      }));
      return api.getSnapshot();
    },
    reset() {
      records = new Map();
      return api.getSnapshot();
    }
  };
  return Object.freeze(api);
}

export function createObjectPlacementKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "n-core-object-placement-kit",
    domain: "core-object-placement",
    domainPath: "n:object:placement",
    parentDomainPath: "n:object",
    apiName: config.apiName ?? "objectPlacement",
    version: OBJECT_PLACEMENT_VERSION,
    stability: config.stability ?? "stable-candidate",
    requires: [...(config.requires ?? []), "n:object", "object:descriptor-contract"],
    services: [
      "coordinate-frame",
      "origin-pivot",
      "intrinsic-bounds",
      "named-anchors",
      "surface-contact",
      "anchor-alignment",
      "volume-fit",
      "overlap-validation",
      "snapshot",
      "reset"
    ],
    provides: [
      "n:object:placement",
      "object:placement-contract",
      "object:placement-anchor-alignment",
      "object:placement-validation"
    ],
    createApi({ engine }) {
      return createPlacementApi(config, engine);
    },
    install({ engine }) {
      engine.objectPlacement = engine.n[config.apiName ?? "objectPlacement"];
    },
    metadata: {
      rendererAgnostic: true,
      deterministic: true,
      coordinateFrame: OBJECT_PLACEMENT_FRAME,
      purpose: "Serializable placement records and deterministic placement math over registered Object descriptors.",
      owns: ["world transforms", "named placement anchors", "grounding", "alignment", "fitting", "contact and overlap checks"],
      doesNotOwn: ["object identity", "meshes", "render objects", "physics resolution", "world generation", "agent decisions"],
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    }
  });
}

export default createObjectPlacementKit;
