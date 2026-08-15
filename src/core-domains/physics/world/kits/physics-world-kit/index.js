import { createDomainKit } from "../../../../domain-kit.js";
import { createWorldRecordRegistry } from "../../record-registry.js";
import {
  PHYSICS_WORLD_SCHEMA,
  normalizeRegistrySnapshot,
  normalizeWorldVector,
  pointInsideWorldSettings,
  requireWorldNumber,
  requireWorldObject,
  rejectWorldFields,
  sumWorldVectors
} from "../../world-contracts.js";
import {
  normalizePhysicsWorld,
  normalizePhysicsWorldDefinitionCommand,
  normalizePhysicsWorldRemovalCommand,
  physicsWorldContract
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Physics world requires public capability ${name}.`);
  return api;
}

function normalizeSampleQuery(input = {}) {
  requireWorldObject(input, "Physics world sample query");
  rejectWorldFields(input, ["position", "timeSeconds", "deltaSeconds"], "Physics world sample query");
  return {
    position: normalizeWorldVector(input.position, "Physics world sample query.position"),
    timeSeconds: requireWorldNumber(input.timeSeconds ?? 0, "Physics world sample query.timeSeconds", { minimum: 0 }),
    deltaSeconds: requireWorldNumber(input.deltaSeconds ?? 0, "Physics world sample query.deltaSeconds", { minimum: 0 })
  };
}

export function createPhysicsWorldKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-world-kit",
    id: config.id ?? "physics-world-kit",
    domain: "physics-world",
    domainPath: "n:physics:world",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsWorld",
    requires: [
      "n:physics",
      "physics:state-schema",
      "physics:command-schema",
      "physics:event-schema",
      "physics:world-settings",
      "physics:gravity-field",
      "physics:force-field",
      "physics:wind-field",
      "physics:time-scale",
      "physics:simulation-region"
    ],
    provides: ["n:physics:world", "physics:world", "physics:world-registry"],
    purpose: "Own immutable Physics world records and compose public field, scale, and region capabilities into read-only samples.",
    owns: ["Physics world identity", "Physics world capability references", "provider-neutral world sampling"],
    doesNotOwn: ["bodies", "colliders", "contacts", "solver execution", "weather", "Runtime clocks", "provider handles"],
    initialState: { worlds: {}, order: [], worldRevision: 0 },
    createApi({ baseApi, engine }) {
      const registry = createWorldRecordRegistry({
        baseApi,
        collectionName: "worlds",
        revisionName: "worldRevision",
        recordName: "world",
        idName: "worldId",
        normalizeDefinition: normalizePhysicsWorldDefinitionCommand,
        normalizeRemoval: normalizePhysicsWorldRemovalCommand
      });

      const apis = () => ({
        settings: requiredApi(engine, "physicsWorldSettings"),
        gravity: requiredApi(engine, "physicsGravityField"),
        force: requiredApi(engine, "physicsForceField"),
        wind: requiredApi(engine, "physicsWindField"),
        timeScale: requiredApi(engine, "physicsTimeScale"),
        region: requiredApi(engine, "physicsSimulationRegion")
      });

      function validateReferences(world) {
        const capabilities = apis();
        const groups = [
          [world.gravityFieldIds, capabilities.gravity.hasField, "gravity field"],
          [world.forceFieldIds, capabilities.force.hasField, "force field"],
          [world.windFieldIds, capabilities.wind.hasField, "wind field"],
          [world.timeScaleIds, capabilities.timeScale.hasScale, "Physics time scale"],
          [world.simulationRegionIds, capabilities.region.hasRegion, "simulation region"]
        ];
        for (const [ids, has, label] of groups) {
          for (const id of ids) if (!has(id)) throw new TypeError(`Physics world ${world.id} references unknown ${label} ${id}.`);
        }
        const worldRegions = new Set(world.simulationRegionIds);
        for (const [ids, getField, label] of [
          [world.gravityFieldIds, capabilities.gravity.getField, "gravity field"],
          [world.forceFieldIds, capabilities.force.getField, "force field"],
          [world.windFieldIds, capabilities.wind.getField, "wind field"]
        ]) {
          for (const id of ids) {
            const field = getField(id);
            for (const regionId of field.regionIds) {
              if (!capabilities.region.hasRegion(regionId)) {
                throw new TypeError(`Physics world ${world.id} ${label} ${id} references unknown simulation region ${regionId}.`);
              }
              if (!worldRegions.has(regionId)) {
                throw new TypeError(`Physics world ${world.id} must include simulation region ${regionId} used by ${label} ${id}.`);
              }
            }
          }
        }
        return world;
      }

      function getRequired(worldId) {
        const world = registry.getRecord(worldId);
        if (!world) throw new TypeError(`Unknown Physics world ${worldId}.`);
        return world;
      }

      function activeFieldIds(ids, getField, activeRegionIds) {
        const active = new Set(activeRegionIds);
        return ids.filter((id) => {
          const field = getField(id);
          if (!field) throw new TypeError(`Physics world references missing field ${id}.`);
          return field.regionIds.length === 0 || field.regionIds.some((regionId) => active.has(regionId));
        });
      }

      return {
        ...baseApi,
        getContract: physicsWorldContract,
        normalize: normalizePhysicsWorld,
        defineWorld(command = {}) {
          const request = normalizePhysicsWorldDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateReferences(request.world);
            const existing = state.worlds[request.world.id];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.world)) {
              throw new TypeError(`Physics world ${request.world.id} already exists with different content.`);
            }
            const created = !existing;
            const worlds = created ? { ...state.worlds, [request.world.id]: request.world } : state.worlds;
            const worldRevision = created ? state.worldRevision + 1 : state.worldRevision;
            return {
              patch: { worlds, order: Object.keys(worlds).sort(), worldRevision },
              result: { world: request.world, created, worldRevision }
            };
          });
        },
        removeWorld: registry.removeRecord,
        hasWorld: registry.hasRecord,
        getWorld: registry.getRecord,
        listWorlds: registry.listRecords,
        validateReferences(worldInput) {
          return validateReferences(normalizePhysicsWorld(worldInput));
        },
        sample(worldId, queryInput = {}) {
          const world = getRequired(worldId);
          const query = normalizeSampleQuery(queryInput);
          const capabilities = apis();
          const regionResolution = capabilities.region.resolve(world.simulationRegionIds, query.position);
          const activeRegions = regionResolution.regionIds;
          const gravityIds = activeFieldIds(world.gravityFieldIds, capabilities.gravity.getField, activeRegions);
          const forceIds = activeFieldIds(world.forceFieldIds, capabilities.force.getField, activeRegions);
          const windIds = activeFieldIds(world.windFieldIds, capabilities.wind.getField, activeRegions);
          const gravity = capabilities.gravity.sampleMany(gravityIds, query.position);
          const force = capabilities.force.sampleMany(forceIds, query.position);
          const wind = capabilities.wind.sampleMany(windIds, query.position, query.timeSeconds);
          const time = capabilities.timeScale.resolve(world.timeScaleIds, query.deltaSeconds);
          const insideBounds = pointInsideWorldSettings(world.settings, query.position);
          const boundsPolicy = world.settings.outOfBoundsPolicy;
          const regionBehavior = regionResolution.behavior;
          const disabled = !world.enabled
            || regionBehavior === "disable"
            || (!insideBounds && boundsPolicy === "disable");
          const sleeping = !disabled && (regionBehavior === "sleep" || (!insideBounds && boundsPolicy === "sleep"));
          return {
            schema: "nexusengine.physics-world-sample/1",
            worldId: world.id,
            position: query.position,
            timeSeconds: query.timeSeconds,
            insideBounds,
            outOfBoundsPolicy: boundsPolicy,
            simulationEnabled: !disabled,
            shouldSleep: sleeping,
            region: regionResolution,
            acceleration: sumWorldVectors([gravity.acceleration, force.acceleration]),
            force: force.force,
            windVelocity: wind.velocity,
            gravitySamples: gravity.samples,
            forceSamples: force.samples,
            windSamples: wind.samples,
            timeScale: time
          };
        },
        inspect(input) {
          try {
            normalizePhysicsWorld(input);
            return { schema: PHYSICS_WORLD_SCHEMA, valid: true, errors: [] };
          } catch (error) {
            return { schema: PHYSICS_WORLD_SCHEMA, valid: false, errors: [{ code: "invalid-physics-world", message: error.message }] };
          }
        },
        loadSnapshot(snapshot) {
          const normalized = normalizeRegistrySnapshot(snapshot, {
            domain: "physics-world",
            collectionName: "worlds",
            revisionName: "worldRevision",
            normalizeRecord: normalizePhysicsWorld
          });
          Object.values(normalized.worlds).forEach(validateReferences);
          return baseApi.loadSnapshot(normalized);
        }
      };
    }
  });
}

export default createPhysicsWorldKit;
