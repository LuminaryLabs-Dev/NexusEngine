import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createPlayerDescriptor,
  equalPlayerDescriptors,
  validatePlayerDescriptor
} from "./contracts.js";

export * from "./contracts.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createCorePlayerKit(config = {}) {
  const baseKit = createCoreCapabilityKit({
    ...config,
    domain: "core-player",
    apiName: config.apiName ?? "corePlayer",
    purpose: "Neutral player identity, possession, control authority, and spawn generations.",
    owns: [
      "player identity",
      "possessed character ID",
      "control enabled state",
      "control generation",
      "spawn generation"
    ],
    doesNotOwn: [
      "character anatomy",
      "poses",
      "movement",
      "input implementation",
      "inventory",
      "progression",
      "profile storage",
      "rendering"
    ],
    services: ["player-registry", "character-possession", "control-authority", "spawn-generation", "snapshot", "reset"],
    initialState: { players: {} },
    createApi({ engine, baseApi }) {
      const records = () => baseApi.getState()?.players ?? {};
      const commit = (players, eventName = "updated") => {
        baseApi.update({ players }, eventName);
        return players;
      };
      const get = (id) => clone(records()[String(id)] ?? null);
      const list = () => Object.values(records()).sort((a, b) => a.id.localeCompare(b.id)).map(clone);
      const requireCharacter = (id) => {
        if (id == null) return null;
        const character = engine.coreCharacter?.get?.(id);
        if (!character) throw new RangeError(`Unknown character: ${id}`);
        return character;
      };

      function register(input = {}) {
        const next = createPlayerDescriptor(input);
        requireCharacter(next.characterId);
        const current = records()[next.id];
        if (current) {
          if (equalPlayerDescriptors(current, next)) return clone(current);
          throw new Error(`Player ${next.id} already exists with different data.`);
        }
        commit({ ...records(), [next.id]: next }, "descriptorChanged");
        return clone(next);
      }

      function updateRecord(id, patch, eventName = "updated") {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown player: ${id}`);
        const next = createPlayerDescriptor({ ...current, ...patch });
        requireCharacter(next.characterId);
        commit({ ...records(), [next.id]: next }, eventName);
        return clone(next);
      }

      function possess(id, characterId) {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown player: ${id}`);
        requireCharacter(characterId);
        if (current.characterId === String(characterId) && current.controlStatus === "enabled") return current;
        return updateRecord(id, {
          characterId: String(characterId),
          controlStatus: "enabled",
          controlGeneration: current.controlGeneration + 1
        }, "descriptorChanged");
      }

      function release(id) {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown player: ${id}`);
        if (current.characterId == null && current.controlStatus === "disabled") return current;
        return updateRecord(id, {
          characterId: null,
          controlStatus: "disabled",
          controlGeneration: current.controlGeneration + 1
        }, "descriptorChanged");
      }

      function setControl(id, enabled) {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown player: ${id}`);
        const controlStatus = enabled ? "enabled" : "disabled";
        if (current.controlStatus === controlStatus) return current;
        return updateRecord(id, {
          controlStatus,
          controlGeneration: current.controlGeneration + 1
        });
      }

      function advanceSpawn(id) {
        const current = get(id);
        if (!current) throw new RangeError(`Unknown player: ${id}`);
        return updateRecord(id, { spawnGeneration: current.spawnGeneration + 1 });
      }

      function getControlledCharacter(id) {
        const player = get(id);
        if (!player || !player.characterId) return null;
        const resolved = engine.coreCharacter?.resolve?.(player.characterId);
        if (!resolved) throw new RangeError(`Unknown controlled character: ${player.characterId}`);
        return { player, ...resolved };
      }

      function loadSnapshot(snapshot = {}) {
        const players = {};
        for (const value of Object.values(snapshot.players ?? {})) {
          const descriptor = createPlayerDescriptor(value);
          requireCharacter(descriptor.characterId);
          players[descriptor.id] = descriptor;
        }
        return baseApi.loadSnapshot({ ...clone(snapshot), players });
      }

      return {
        register,
        get,
        has: (id) => Boolean(records()[String(id)]),
        list,
        possess,
        release,
        enableControl: (id) => setControl(id, true),
        disableControl: (id) => setControl(id, false),
        advanceSpawn,
        getControlledCharacter,
        validate: validatePlayerDescriptor,
        loadSnapshot
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      contractSchema: "nexus-player/1"
    }
  });

  return Object.freeze({
    ...baseKit,
    requires: [...new Set([...(baseKit.requires ?? []), "n:core-character"])],
    provides: [...(baseKit.provides ?? []), "player:identity", "player:possession", "player:control-authority"]
  });
}

export default createCorePlayerKit;
