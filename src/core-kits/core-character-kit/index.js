import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createCharacterDescriptor,
  equalCharacterDescriptors,
  validateCharacterDescriptor
} from "./contracts.js";

export * from "./contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCoreCharacterKit(config = {}) {
  const baseKit = createCoreCapabilityKit({
    ...config,
    domain: "core-character",
    apiName: config.apiName ?? "coreCharacter",
    purpose: "Active embodied character identity and neutral runtime bindings.",
    owns: [
      "character identity",
      "creature binding",
      "profile reference",
      "pose binding",
      "motion actor binding",
      "physics body binding",
      "runtime status",
      "lifecycle revision"
    ],
    doesNotOwn: [
      "creature construction",
      "IK mathematics",
      "motion solving",
      "physics solving",
      "input",
      "camera",
      "rendering"
    ],
    services: ["character-descriptor", "character-registry", "character-resolution", "runtime-bindings", "snapshot", "reset"],
    initialState: { characters: {} },
    createApi({ engine, baseApi }) {
      const records = () => baseApi.getState()?.characters ?? {};
      const commit = (characters, eventName = "descriptorChanged") => {
        baseApi.update({ characters }, eventName);
        return characters;
      };
      const get = (id) => clone(records()[String(id)] ?? null);
      const list = () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone);
      const requireCreature = (id) => {
        const creature = engine.coreCreature?.get?.(id);
        if (!creature) throw new RangeError(`Unknown creature: ${id}`);
        return creature;
      };

      function create(input = {}) {
        const next = createCharacterDescriptor(input);
        requireCreature(next.creatureId);
        const current = records()[next.id];
        if (current) {
          if (equalCharacterDescriptors(current, next)) return clone(current);
          throw new Error(`Character ${next.id} already exists with different data; use replace().`);
        }
        commit({ ...records(), [next.id]: next });
        return clone(next);
      }

      function replace(input = {}) {
        const next = createCharacterDescriptor(input);
        requireCreature(next.creatureId);
        if (!records()[next.id]) throw new RangeError(`Unknown character: ${next.id}`);
        commit({ ...records(), [next.id]: next });
        return clone(next);
      }

      function updateRecord(id, patch, eventName = "updated") {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown character: ${id}`);
        const next = createCharacterDescriptor({
          ...current,
          ...patch,
          bindings: { ...current.bindings, ...(patch.bindings ?? {}) },
          lifecycleRevision: current.lifecycleRevision + 1
        });
        requireCreature(next.creatureId);
        commit({ ...records(), [next.id]: next }, eventName);
        return clone(next);
      }

      function resolve(id) {
        const character = get(id);
        if (!character) return null;
        return { character, creature: requireCreature(character.creatureId) };
      }

      function remove(id) {
        const key = String(id);
        if (!records()[key]) return false;
        const referenced = engine.corePlayer?.list?.().some((player) => player.characterId === key);
        if (referenced) throw new Error(`Character ${key} is possessed by a player.`);
        const next = { ...records() };
        delete next[key];
        commit(next);
        return true;
      }

      function loadSnapshot(snapshot = {}) {
        const characters = {};
        for (const value of Object.values(snapshot.characters ?? {})) {
          const descriptor = createCharacterDescriptor(value);
          requireCreature(descriptor.creatureId);
          characters[descriptor.id] = descriptor;
        }
        return baseApi.loadSnapshot({ ...clone(snapshot), characters });
      }

      return {
        create,
        replace,
        get,
        has: (id) => Boolean(records()[String(id)]),
        list,
        remove,
        resolve,
        setPose: (id, poseId) => updateRecord(id, { bindings: { poseId: poseId == null ? null : String(poseId) } }, "descriptorChanged"),
        setBindings: (id, bindings = {}) => updateRecord(id, { bindings }, "descriptorChanged"),
        setStatus: (id, status) => updateRecord(id, { status }, "updated"),
        validate: validateCharacterDescriptor,
        loadSnapshot
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: "nexus-character/1"
    }
  });

  return Object.freeze({
    ...baseKit,
    requires: [...new Set([...(baseKit.requires ?? []), "n:core-creature"])],
    provides: [...(baseKit.provides ?? []), "character:descriptor", "character:registry", "character:resolution"]
  });
}

export default createCoreCharacterKit;
