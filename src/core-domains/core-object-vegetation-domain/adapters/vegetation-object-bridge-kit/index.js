import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import { createObjectDescriptor } from "../../../../core-kits/core-object-kit/object-descriptor.js";
import { createVegetationInstanceDescriptor } from "../../../../core-kits/core-vegetation-kit/contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function reference(value, fallbackProvider, fallbackId, metadata = {}) {
  if (value) return { ...clone(value), metadata: { ...(value.metadata ?? {}), ...clone(metadata) } };
  return { provider: fallbackProvider, descriptorId: fallbackId, contentHash: null, metadata: clone(metadata) };
}

export function vegetationSpeciesToObjectDescriptor(speciesInput, options = {}) {
  const species = clone(speciesInput);
  if (!species?.id) throw new TypeError("vegetationSpeciesToObjectDescriptor requires a vegetation species descriptor.");
  const parts = (species.parts ?? []).map((part) => ({
    id: part.id,
    parentId: part.parentId,
    kind: part.kind,
    transform: clone(part.transform ?? {}),
    geometry: part.geometry,
    material: part.material,
    collision: part.collision,
    metadata: { vegetationRegions: part.regions ?? [], ...(clone(part.metadata ?? {})) }
  }));
  return createObjectDescriptor({
    id: options.id ?? `${species.id}:object`,
    objectType: options.objectType ?? `vegetation:${species.kind}`,
    transform: clone(options.transform ?? {}),
    parts,
    bounds: clone(options.bounds ?? species.bounds),
    pivot: clone(options.pivot ?? species.pivot),
    groundAnchor: clone(options.groundAnchor ?? species.groundAnchor),
    geometry: reference(options.geometry ?? species.references?.shape, "core-object-shape", `${species.id}:shape`, { speciesId: species.id }),
    material: reference(options.material ?? species.references?.material, "core-graphics", `${species.id}:materials`, { speciesId: species.id }),
    collision: reference(options.collision ?? species.references?.collision, "core-physics", `${species.id}:collision`, { speciesId: species.id }),
    lod: reference(options.fidelity ?? species.references?.fidelity, "core-object-fidelity", `${species.id}:fidelity`, { speciesId: species.id }),
    capture: reference(options.capture ?? species.references?.capture, "core-capture", `${species.id}:capture`, { speciesId: species.id }),
    lifecycle: clone(options.lifecycle ?? { status: "generated", revision: 0 }),
    metadata: {
      vegetation: true,
      speciesId: species.id,
      family: species.family,
      kind: species.kind,
      rooted: species.rooted,
      growthStages: species.growthStages,
      ecology: species.ecology,
      environmentResponse: species.environmentResponse,
      ...(clone(species.metadata ?? {})),
      ...(clone(options.metadata ?? {}))
    }
  });
}

export function vegetationInstanceToObjectDescriptor(instanceInput, speciesInput, options = {}) {
  const instance = createVegetationInstanceDescriptor(instanceInput, speciesInput);
  const species = clone(speciesInput);
  const scale = Number(instance.variation?.uniformScale ?? 1);
  const heightScale = Number(instance.variation?.heightScale ?? 1);
  const yaw = Number(instance.variation?.yawDegrees ?? 0) * Math.PI / 180;
  const halfYaw = yaw * 0.5;
  const descriptor = vegetationSpeciesToObjectDescriptor(species, {
    ...options,
    id: options.id ?? instance.id,
    transform: {
      position: [instance.position[0], instance.position[1] - Number(instance.variation?.groundSink ?? 0), instance.position[2]],
      rotation: [0, Math.sin(halfYaw), 0, Math.cos(halfYaw)],
      scale: [scale, scale * heightScale, scale]
    },
    metadata: {
      vegetationInstanceId: instance.id,
      variation: clone(instance.variation),
      lifecycle: clone(instance.lifecycle),
      environment: clone(instance.environment),
      ...(clone(options.metadata ?? {}))
    }
  });
  return descriptor;
}

export function createVegetationObjectBridgeKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "n-vegetation-object-bridge-kit",
    domain: "vegetation-object-bridge",
    domainPath: config.domainPath ?? "n:object:vegetation:object-bridge",
    parentDomainPath: config.parentDomainPath ?? "n:object:vegetation",
    apiName: config.apiName ?? "vegetationObjectBridge",
    version: config.version ?? "0.1.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object", "n:object:vegetation"],
    services: ["species-object-conversion", "instance-object-conversion", "object-registration"],
    metadata: {
      purpose: "Convert vegetation species and instances into canonical Core Object descriptors without owning geometry, placement, or rendering.",
      rendererAgnostic: true,
      deterministic: true
    },
    createApi({ engine }) {
      const vegetation = engine.n.vegetation;
      const coreObject = engine.coreObject ?? engine.n.coreObject;
      return {
        toObjectDescriptor(speciesOrId, options = {}) {
          const species = typeof speciesOrId === "string" ? vegetation.getSpecies(speciesOrId) : speciesOrId;
          if (!species) throw new RangeError(`Unknown vegetation species: ${speciesOrId}`);
          return vegetationSpeciesToObjectDescriptor(species, options);
        },
        toInstanceObjectDescriptor(instanceOrId, options = {}) {
          const instance = typeof instanceOrId === "string" ? vegetation.getInstanceDescriptor(instanceOrId) : instanceOrId;
          if (!instance) throw new RangeError(`Unknown vegetation instance: ${instanceOrId}`);
          const species = vegetation.getSpecies(instance.speciesId);
          return vegetationInstanceToObjectDescriptor(instance, species, options);
        },
        registerSpeciesObject(speciesOrId, options = {}) {
          return coreObject.register(this.toObjectDescriptor(speciesOrId, options));
        },
        registerInstanceObject(instanceOrId, options = {}) {
          return coreObject.register(this.toInstanceObjectDescriptor(instanceOrId, options));
        }
      };
    }
  });
}

export default createVegetationObjectBridgeKit;
