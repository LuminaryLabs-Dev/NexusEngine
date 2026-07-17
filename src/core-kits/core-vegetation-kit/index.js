import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createVegetationInstanceDescriptor,
  createVegetationSpeciesDescriptor,
  equalVegetationDescriptors,
  scoreVegetationSuitability,
  selectVegetationSpecies,
  updateVegetationLifecycle,
  validateVegetationInstance,
  validateVegetationSpecies
} from "./contracts.js";

export * from "./contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCoreVegetationKit(config = {}) {
  const baseKit = createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-core-vegetation-kit",
    domain: "core-vegetation",
    domainPath: config.domainPath ?? "n:object:vegetation",
    parentDomainPath: config.parentDomainPath ?? "n:object",
    apiName: config.apiName ?? "vegetation",
    version: config.version ?? "0.1.0",
    stability: config.stability ?? "experimental",
    requires: [...(config.requires ?? []), "n:object"],
    provides: [...(config.provides ?? []), "vegetation:species", "vegetation:instances", "vegetation:lifecycle"],
    purpose: "Renderer-neutral rooted plant species, instances, lifecycle, deterministic variation, ecology preferences, and references into the Core Object pipeline.",
    owns: [
      "vegetation species identity",
      "plant family and kind",
      "rooted state",
      "growth stages",
      "vegetation lifecycle",
      "ecological preferences",
      "deterministic variation policy",
      "plant-part descriptors",
      "environmental response intent"
    ],
    doesNotOwn: [
      "geometry generation",
      "renderer materials",
      "GPU resources",
      "world placement",
      "terrain sampling",
      "physics resolution",
      "cultivation rules"
    ],
    services: [
      "species-registry",
      "instance-registry",
      "instance-descriptors",
      "lifecycle",
      "ecology-selection",
      "snapshot",
      "reset"
    ],
    initialState: { species: {}, instances: {} },
    createApi({ baseApi }) {
      const state = () => baseApi.getState();
      const speciesRecords = () => state()?.species ?? {};
      const instanceRecords = () => state()?.instances ?? {};

      function registerSpecies(input = {}) {
        const descriptor = createVegetationSpeciesDescriptor(input);
        const current = speciesRecords()[descriptor.id];
        if (current) {
          if (equalVegetationDescriptors(current, descriptor)) return clone(current);
          throw new Error(`Vegetation species ${descriptor.id} already exists with different data; use replaceSpecies().`);
        }
        baseApi.update({ species: { ...speciesRecords(), [descriptor.id]: descriptor } }, "descriptorChanged");
        return clone(descriptor);
      }

      function replaceSpecies(input = {}) {
        const descriptor = createVegetationSpeciesDescriptor(input);
        if (!speciesRecords()[descriptor.id]) throw new RangeError(`Unknown vegetation species: ${descriptor.id}`);
        baseApi.update({ species: { ...speciesRecords(), [descriptor.id]: descriptor } }, "descriptorChanged");
        return clone(descriptor);
      }

      function getSpecies(id) {
        return clone(speciesRecords()[String(id)] ?? null);
      }

      function listSpecies() {
        return Object.values(speciesRecords()).sort((left, right) => left.id.localeCompare(right.id)).map(clone);
      }

      function createInstanceDescriptor(input = {}) {
        const species = getSpecies(input.speciesId);
        if (!species) throw new RangeError(`Unknown vegetation species: ${input.speciesId}`);
        return createVegetationInstanceDescriptor(input, species);
      }

      function registerInstance(input = {}) {
        const descriptor = createInstanceDescriptor(input);
        const current = instanceRecords()[descriptor.id];
        if (current) {
          if (equalVegetationDescriptors(current, descriptor)) return clone(current);
          throw new Error(`Vegetation instance ${descriptor.id} already exists with different data.`);
        }
        baseApi.update({ instances: { ...instanceRecords(), [descriptor.id]: descriptor } }, "descriptorChanged");
        return clone(descriptor);
      }

      function getInstanceDescriptor(id) {
        return clone(instanceRecords()[String(id)] ?? null);
      }

      function listInstances() {
        return Object.values(instanceRecords()).sort((left, right) => left.id.localeCompare(right.id)).map(clone);
      }

      function setLifecycleState(id, lifecycleState, patch = {}) {
        const current = getInstanceDescriptor(id);
        if (!current) throw new RangeError(`Unknown vegetation instance: ${id}`);
        const next = updateVegetationLifecycle(current, lifecycleState, patch);
        baseApi.update({ instances: { ...instanceRecords(), [next.id]: next } }, "updated");
        return clone(next);
      }

      function removeInstance(id) {
        const key = String(id);
        if (!instanceRecords()[key]) return false;
        const next = { ...instanceRecords() };
        delete next[key];
        baseApi.update({ instances: next }, "descriptorChanged");
        return true;
      }

      function loadSnapshot(snapshot = {}) {
        const species = {};
        const instances = {};
        for (const value of Object.values(snapshot.species ?? {})) {
          const descriptor = createVegetationSpeciesDescriptor(value);
          species[descriptor.id] = descriptor;
        }
        for (const value of Object.values(snapshot.instances ?? {})) {
          const descriptor = createVegetationInstanceDescriptor(value, species[value.speciesId]);
          instances[descriptor.id] = descriptor;
        }
        return baseApi.loadSnapshot({ ...clone(snapshot), species, instances });
      }

      return {
        registerSpecies,
        replaceSpecies,
        getSpecies,
        hasSpecies: (id) => Boolean(speciesRecords()[String(id)]),
        listSpecies,
        createInstanceDescriptor,
        registerInstance,
        getInstanceDescriptor,
        listInstances,
        removeInstance,
        setLifecycleState,
        scoreSpecies(speciesId, environment = {}) {
          const species = getSpecies(speciesId);
          if (!species) throw new RangeError(`Unknown vegetation species: ${speciesId}`);
          return scoreVegetationSuitability(species, environment);
        },
        selectSpecies(environment = {}, seed = "vegetation-selection", filter = null) {
          const values = listSpecies().filter((entry) => typeof filter === "function" ? filter(entry) : true);
          return clone(selectVegetationSpecies(values, environment, seed));
        },
        validateSpecies: validateVegetationSpecies,
        validateInstance: validateVegetationInstance,
        loadSnapshot
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchemas: ["nexus-vegetation-species/1", "nexus-vegetation-instance/1"]
    }
  });

  const install = baseKit.install;
  return Object.freeze({
    ...baseKit,
    install(context) {
      const result = install?.(context);
      context.engine.coreVegetation = context.engine.n[config.apiName ?? "vegetation"];
      return result;
    }
  });
}

export default createCoreVegetationKit;
