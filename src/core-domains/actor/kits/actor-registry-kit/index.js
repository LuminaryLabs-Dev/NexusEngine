import { createDomainKit } from "../../../domain-kit.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function normalizeActor(input = {}) {
  const id = String(input.id ?? "").trim();
  if (!id) throw new TypeError("Actor descriptor requires a stable id.");
  return Object.freeze({
    id,
    kind: String(input.kind ?? "actor"),
    embodimentId: input.embodimentId == null ? null : String(input.embodimentId),
    status: String(input.status ?? "active"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function createActorRegistryKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "actor-registry-kit",
    id: "actor-registry-kit",
    domain: "actor",
    domainPath: "n:actor",
    apiName: "actor",
    provides: ["n:actor", "actor:identity", "actor:embodiment"],
    purpose: "Own neutral actor identities and embodiment references.",
    initialState: { actors: {} },
    createApi({ baseApi }) {
      const records = () => baseApi.getState().actors ?? {};
      return {
        register(input = {}) {
          const actor = normalizeActor(input);
          const existing = records()[actor.id];
          if (existing) {
            if (JSON.stringify(existing) === JSON.stringify(actor)) return clone(existing);
            throw new Error(`Actor ${actor.id} already exists with different content.`);
          }
          baseApi.update({ actors: { ...records(), [actor.id]: actor } }, "descriptorChanged");
          return clone(actor);
        },
        get: (id) => clone(records()[String(id)] ?? null),
        has: (id) => Boolean(records()[String(id)]),
        list: () => Object.values(records()).sort((left, right) => left.id.localeCompare(right.id)).map(clone),
        remove(id) {
          const key = String(id);
          if (!records()[key]) return false;
          const actors = { ...records() };
          delete actors[key];
          baseApi.update({ actors }, "descriptorChanged");
          return true;
        }
      };
    }
  });
}

export default createActorRegistryKit;
