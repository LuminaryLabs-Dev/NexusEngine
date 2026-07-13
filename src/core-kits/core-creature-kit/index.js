import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createCreatureDefinition,
  equalCreatureDefinitions,
  validateCreatureDefinition
} from "./contracts.js";

export * from "./contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCoreCreatureKit(config = {}) {
  const apiName = config.apiName ?? "coreCreature";
  const baseKit = createCoreCapabilityKit({
    ...config,
    domain: "core-creature",
    apiName,
    purpose: "Neutral creature embodiment definitions and references.",
    owns: [
      "creature identity",
      "archetype",
      "body and rig references",
      "collision recommendations",
      "support anchors",
      "presentation hints",
      "capability tags"
    ],
    doesNotOwn: [
      "procedural generation",
      "active poses",
      "movement",
      "input",
      "physics simulation",
      "renderer objects",
      "player state"
    ],
    services: ["creature-definition", "creature-registry", "reference-validation", "snapshot", "reset"],
    initialState: { creatures: {} },
    createApi({ engine, baseApi }) {
      const records = () => baseApi.getState()?.creatures ?? {};
      const commit = (creatures, eventName = "descriptorChanged") => {
        baseApi.update({ creatures }, eventName);
        return creatures;
      };
      const get = (id) => clone(records()[String(id)] ?? null);
      const list = () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone);

      function register(input = {}) {
        const next = createCreatureDefinition(input);
        const current = records()[next.id];
        if (current) {
          if (equalCreatureDefinitions(current, next)) return clone(current);
          throw new Error(`Creature ${next.id} already exists with different data; use replace().`);
        }
        commit({ ...records(), [next.id]: next });
        return clone(next);
      }

      function replace(input = {}) {
        const next = createCreatureDefinition(input);
        if (!records()[next.id]) throw new RangeError(`Unknown creature: ${next.id}`);
        commit({ ...records(), [next.id]: next });
        return clone(next);
      }

      function remove(id) {
        const key = String(id);
        if (!records()[key]) return false;
        const referenced = engine.coreCharacter?.list?.().some((character) => character.creatureId === key);
        if (referenced) throw new Error(`Creature ${key} is referenced by a character.`);
        const next = { ...records() };
        delete next[key];
        commit(next);
        return true;
      }

      function loadSnapshot(snapshot = {}) {
        const creatures = {};
        for (const value of Object.values(snapshot.creatures ?? {})) {
          const descriptor = createCreatureDefinition(value);
          creatures[descriptor.id] = descriptor;
        }
        return baseApi.loadSnapshot({ ...clone(snapshot), creatures });
      }

      return {
        register,
        replace,
        get,
        has: (id) => Boolean(records()[String(id)]),
        list,
        remove,
        validate: validateCreatureDefinition,
        loadSnapshot
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: "nexus-creature-definition/1"
    }
  });
  const install = baseKit.install;

  return Object.freeze({
    ...baseKit,
    requires: [...(baseKit.requires ?? [])],
    provides: [...(baseKit.provides ?? []), "creature:definition", "creature:registry"],
    install(context) {
      const result = install(context);
      context.engine.coreCreature = context.engine.n[apiName];
      return result;
    }
  });
}

export default createCoreCreatureKit;
