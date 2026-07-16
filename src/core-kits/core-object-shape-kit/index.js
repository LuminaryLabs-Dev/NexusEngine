import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createObjectShape,
  createObjectShapeJob,
  createObjectShapeProfile,
  createObjectShapeSource,
  hashShapeValue
} from "./descriptors.js";
import {
  createShapeDerivationRequest,
  normalizeShapeProviderResult,
  validateObjectShapeProvider
} from "./provider.js";
import { CORE_OBJECT_SHAPE_PROFILES } from "./profiles.js";

export * from "./descriptors.js";
export * from "./metrics.js";
export * from "./profiles.js";
export * from "./provider.js";

export const CORE_OBJECT_SHAPE_VERSION = "0.1.0";

const ObjectShapeState = defineResource("core.object-shape.state");
const ShapeProfileRegistered = defineEvent("core.object-shape.profile-registered");
const ShapeSourceRegistered = defineEvent("core.object-shape.source-registered");
const ShapeJobRequested = defineEvent("core.object-shape.job-requested");
const ShapeJobProgressed = defineEvent("core.object-shape.job-progressed");
const ShapeDerived = defineEvent("core.object-shape.derived");
const ShapeJobFailed = defineEvent("core.object-shape.job-failed");
const ShapeJobCancelled = defineEvent("core.object-shape.job-cancelled");
const ShapeReset = defineEvent("core.object-shape.reset");
const ShapeSnapshotLoaded = defineEvent("core.object-shape.snapshot-loaded");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState() {
  return {
    version: CORE_OBJECT_SHAPE_VERSION,
    sequence: 0,
    profiles: {},
    sources: {},
    providers: {},
    jobs: {},
    shapes: {}
  };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) runtimes.set(world, { providers: new Map(), active: new Map() });
  return runtimes.get(world);
}

function normalizeError(error) {
  if (error instanceof Error) return { name: error.name, message: error.message };
  if (error && typeof error === "object") return clone(error);
  return { name: "Error", message: String(error) };
}

function validateSnapshot(snapshot = {}) {
  const next = initialState();
  next.sequence = Math.max(0, Math.floor(Number(snapshot.sequence ?? 0)));
  for (const profile of Object.values(snapshot.profiles ?? {})) {
    const value = createObjectShapeProfile(profile);
    next.profiles[value.id] = value;
  }
  for (const source of Object.values(snapshot.sources ?? {})) {
    const value = createObjectShapeSource(source);
    next.sources[value.id] = value;
  }
  for (const job of Object.values(snapshot.jobs ?? {})) {
    const value = createObjectShapeJob(job);
    next.jobs[value.id] = value;
  }
  for (const shape of Object.values(snapshot.shapes ?? {})) {
    const source = next.sources[shape.sourceShapeId];
    const value = createObjectShape(shape, source);
    next.shapes[value.id] = value;
  }
  return next;
}

export function createCoreObjectShapeKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-object-shape-domain",
    domain: "object-shape",
    domainPath: config.domainPath ?? "n:object:shape",
    parentDomainPath: config.parentDomainPath,
    apiName: config.apiName ?? "objectShape",
    version: CORE_OBJECT_SHAPE_VERSION,
    stability: config.stability ?? "stable-candidate",
    requires: ["object:descriptor-contract", ...(config.requires ?? [])],
    provides: ["object:shape-source", "object:shape-derived", "object:shape-jobs"],
    services: ["sources", "derived-shapes", "profiles", "jobs", "providers", "metrics", "snapshot", "reset"],
    resources: { ObjectShapeState },
    events: {
      ShapeProfileRegistered,
      ShapeSourceRegistered,
      ShapeJobRequested,
      ShapeJobProgressed,
      ShapeDerived,
      ShapeJobFailed,
      ShapeJobCancelled,
      ShapeReset,
      ShapeSnapshotLoaded
    },
    metadata: {
      purpose: "Own source and derived geometric shapes, preservation profiles, provider-backed derivation jobs, evidence, readiness, cancellation, snapshots, and reset.",
      owns: [
        "source shapes",
        "derived shapes",
        "shape profiles",
        "preservation requirements",
        "derivation jobs",
        "provider coordination",
        "shape metrics",
        "content-addressed reuse"
      ],
      doesNotOwn: [
        "object identity",
        "runtime fidelity choice",
        "capture rendering",
        "materials or lighting",
        "renderer objects",
        "GPU buffers",
        "asset compression",
        "tree morphology",
        "creature anatomy"
      ],
      optional: true,
      rendererAgnostic: true,
      providerNeutral: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      ensureRuntime(world);
      const state = initialState();
      for (const profileInput of config.profiles ?? CORE_OBJECT_SHAPE_PROFILES) {
        const profile = createObjectShapeProfile(profileInput);
        state.profiles[profile.id] = profile;
      }
      world.setResource(ObjectShapeState, state);
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      const state = () => world.getResource(ObjectShapeState);

      function publish(next, event, payload = {}) {
        world.setResource(ObjectShapeState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      }

      function patch(value, event, payload = {}) {
        const current = state();
        return publish({ ...current, ...clone(value), sequence: Number(current.sequence ?? 0) + 1 }, event, payload);
      }

      function putJob(job, event = ShapeJobProgressed, payload = {}) {
        const value = createObjectShapeJob(job);
        const current = state();
        patch({ jobs: { ...current.jobs, [value.id]: value } }, event, { job: value, ...payload });
        return value;
      }

      function chooseProvider(providerId = null) {
        if (providerId) return runtime.providers.get(String(providerId)) ?? null;
        return Array.from(runtime.providers.values()).sort((left, right) => left.id.localeCompare(right.id))[0] ?? null;
      }

      function isCurrent(job) {
        const object = engine.n?.coreObject?.get?.(job.objectId) ?? engine.coreObject?.get?.(job.objectId);
        return object?.contentHash === job.objectContentHash;
      }

      async function run(jobId) {
        const existing = state().jobs[String(jobId)];
        if (!existing) throw new RangeError(`Unknown object shape job: ${jobId}.`);
        if (["ready", "failed", "cancelled", "stale"].includes(existing.state)) return clone(existing);
        if (!isCurrent(existing)) {
          return clone(putJob({ ...existing, state: "stale", revision: existing.revision + 1 }, ShapeJobFailed, { reason: "object-content-changed" }));
        }
        if (runtime.active.has(existing.id)) return runtime.active.get(existing.id).promise;

        const provider = chooseProvider(existing.providerId);
        if (!provider) {
          return clone(putJob({ ...existing, state: "waiting-for-provider", revision: existing.revision + 1 }, ShapeJobProgressed));
        }
        const source = state().sources[existing.sourceShapeId];
        const profile = state().profiles[existing.profileId];
        const target = profile?.targets.find((entry) => entry.id === existing.targetId);
        if (!source || !profile || !target) {
          return clone(putJob({
            ...existing,
            state: "failed",
            error: { message: "Object Shape job dependencies are missing." },
            revision: existing.revision + 1
          }, ShapeJobFailed));
        }

        const token = { cancelled: false, promise: null };
        token.promise = (async () => {
          putJob({
            ...existing,
            state: target.mode === "source" ? "preparing" : "simplifying",
            providerId: provider.id,
            progress: { completed: 0, total: 1 },
            revision: existing.revision + 1
          }, ShapeJobProgressed);
          try {
            const request = createShapeDerivationRequest({
              jobId: existing.id,
              objectId: existing.objectId,
              objectContentHash: existing.objectContentHash,
              source,
              profile,
              target
            });
            const raw = await provider.derive(request, {
              updateProgress(completed, total = 1, detail = null) {
                const currentJob = state().jobs[existing.id];
                if (!currentJob || token.cancelled || currentJob.state === "cancelled") return false;
                putJob({
                  ...currentJob,
                  progress: { completed, total },
                  revision: currentJob.revision + 1
                }, ShapeJobProgressed, { detail });
                return true;
              },
              isCancelled() {
                return token.cancelled || state().jobs[existing.id]?.state === "cancelled";
              }
            });
            if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") return clone(state().jobs[existing.id]);
            if (!isCurrent(existing)) {
              const currentJob = state().jobs[existing.id];
              return clone(putJob({ ...currentJob, state: "stale", revision: currentJob.revision + 1 }, ShapeJobFailed));
            }
            const result = normalizeShapeProviderResult(raw);
            const shape = createObjectShape({
              id: `${existing.id}:shape`,
              objectId: existing.objectId,
              objectContentHash: existing.objectContentHash,
              sourceShapeId: source.id,
              sourceContentHash: source.contentHash,
              profileId: profile.id,
              targetId: target.id,
              purpose: target.id,
              ...result,
              provider: { id: provider.id, version: provider.version ?? "0.1.0" }
            }, source);
            const current = state();
            const readyJob = createObjectShapeJob({
              ...current.jobs[existing.id],
              state: "ready",
              providerId: provider.id,
              progress: { completed: 1, total: 1 },
              resultShapeId: shape.id,
              error: null,
              revision: current.jobs[existing.id].revision + 1
            });
            publish({
              ...current,
              sequence: Number(current.sequence ?? 0) + 1,
              jobs: { ...current.jobs, [readyJob.id]: readyJob },
              shapes: { ...current.shapes, [shape.id]: shape }
            }, ShapeDerived, { job: readyJob, shape });
            return clone(readyJob);
          } catch (error) {
            if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") return clone(state().jobs[existing.id]);
            const failed = state().jobs[existing.id];
            return clone(putJob({
              ...failed,
              state: "failed",
              error: normalizeError(error),
              revision: failed.revision + 1
            }, ShapeJobFailed));
          } finally {
            runtime.active.delete(existing.id);
          }
        })();
        runtime.active.set(existing.id, token);
        return token.promise;
      }

      const api = {
        registerProfile(input) {
          const profile = createObjectShapeProfile(input);
          const existing = state().profiles[profile.id];
          if (existing?.contentHash === profile.contentHash) return clone(existing);
          const current = state();
          patch({ profiles: { ...current.profiles, [profile.id]: profile } }, ShapeProfileRegistered, { profile });
          return clone(profile);
        },
        registerSource(input) {
          const source = createObjectShapeSource(input);
          const object = engine.n?.coreObject?.get?.(source.objectId) ?? engine.coreObject?.get?.(source.objectId);
          if (!object) throw new RangeError(`Unknown core object: ${source.objectId}.`);
          if (object.contentHash !== source.objectContentHash) {
            throw new TypeError("Shape source objectContentHash does not match Core Object.");
          }
          const existing = state().sources[source.id];
          if (existing?.contentHash === source.contentHash) return clone(existing);
          const current = state();
          patch({ sources: { ...current.sources, [source.id]: source } }, ShapeSourceRegistered, { source });
          return clone(source);
        },
        registerProvider(input) {
          const provider = validateObjectShapeProvider(input);
          const previous = runtime.providers.get(provider.id);
          if (previous && previous !== provider) previous.dispose?.();
          runtime.providers.set(provider.id, provider);
          provider.initialize?.({ engine, world });
          const current = state();
          patch({
            providers: {
              ...current.providers,
              [provider.id]: {
                id: provider.id,
                version: provider.version ?? "0.1.0",
                metadata: clone(provider.metadata ?? {})
              }
            }
          }, ShapeJobProgressed, { providerId: provider.id });
          return provider.id;
        },
        unregisterProvider(providerId) {
          const id = String(providerId);
          const provider = runtime.providers.get(id);
          if (!provider) return false;
          provider.dispose?.();
          runtime.providers.delete(id);
          const current = state();
          const providers = { ...current.providers };
          delete providers[id];
          patch({ providers }, ShapeJobProgressed, { providerId: id });
          return true;
        },
        async derive(input = {}) {
          const source = state().sources[String(input.sourceShapeId ?? "")];
          const profile = state().profiles[String(input.profileId ?? "")];
          if (!source) throw new RangeError(`Unknown object shape source: ${input.sourceShapeId}.`);
          if (!profile) throw new RangeError(`Unknown object shape profile: ${input.profileId}.`);
          const target = profile.targets.find((entry) => entry.id === String(input.targetId ?? ""));
          if (!target) throw new RangeError(`Unknown object shape target: ${input.targetId}.`);
          const object = engine.n?.coreObject?.get?.(source.objectId) ?? engine.coreObject?.get?.(source.objectId);
          if (!object || object.contentHash !== source.objectContentHash) throw new TypeError("Object shape source is stale.");
          const providerId = input.providerId == null ? null : String(input.providerId);
          const operationId = `${source.contentHash}:${profile.contentHash}:${target.id}:${providerId ?? "auto"}`;
          const jobId = `shape:${hashShapeValue(operationId)}`;
          const existing = state().jobs[jobId];
          if (existing) {
            return ["queued", "waiting-for-provider"].includes(existing.state) ? run(existing.id) : clone(existing);
          }
          const job = createObjectShapeJob({
            id: jobId,
            objectId: source.objectId,
            objectContentHash: source.objectContentHash,
            sourceShapeId: source.id,
            sourceContentHash: source.contentHash,
            profileId: profile.id,
            targetId: target.id,
            providerId,
            state: "queued",
            operationId,
            revision: 0
          });
          const current = state();
          publish({
            ...current,
            sequence: Number(current.sequence ?? 0) + 1,
            jobs: { ...current.jobs, [job.id]: job }
          }, ShapeJobRequested, { job });
          return run(job.id);
        },
        run,
        async resumeWaiting(providerId = null) {
          const jobs = Object.values(state().jobs)
            .filter((job) => ["queued", "waiting-for-provider"].includes(job.state))
            .filter((job) => providerId == null || job.providerId === providerId);
          const results = [];
          for (const job of jobs) results.push(await run(job.id));
          return results;
        },
        cancel(jobId) {
          const id = String(jobId);
          const job = state().jobs[id];
          if (!job) return false;
          if (job.state === "cancelled") return true;
          if (["ready", "failed", "stale"].includes(job.state)) return false;
          const token = runtime.active.get(id);
          if (token) token.cancelled = true;
          runtime.providers.get(job.providerId)?.cancel?.(id);
          putJob({ ...job, state: "cancelled", revision: job.revision + 1 }, ShapeJobCancelled);
          return true;
        },
        getProfile(id) { return clone(state().profiles[String(id)] ?? null); },
        getSource(id) { return clone(state().sources[String(id)] ?? null); },
        getJob(id) { return clone(state().jobs[String(id)] ?? null); },
        getShape(id) { return clone(state().shapes[String(id)] ?? null); },
        getMetrics(id) {
          return clone(state().shapes[String(id)]?.metrics ?? state().sources[String(id)]?.metrics ?? null);
        },
        listProviders() {
          return Object.values(state().providers).sort((left, right) => left.id.localeCompare(right.id)).map(clone);
        },
        getSnapshot() { return clone(state()); },
        loadSnapshot(snapshot = {}) {
          const next = validateSnapshot(snapshot);
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, {
            id: provider.id,
            version: provider.version ?? "0.1.0",
            metadata: clone(provider.metadata ?? {})
          }]));
          return publish(next, ShapeSnapshotLoaded);
        },
        reset() {
          for (const token of runtime.active.values()) token.cancelled = true;
          runtime.active.clear();
          for (const provider of runtime.providers.values()) provider.reset?.();
          const next = initialState();
          for (const profileInput of config.profiles ?? CORE_OBJECT_SHAPE_PROFILES) {
            const profile = createObjectShapeProfile(profileInput);
            next.profiles[profile.id] = profile;
          }
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, {
            id: provider.id,
            version: provider.version ?? "0.1.0",
            metadata: clone(provider.metadata ?? {})
          }]));
          return publish(next, ShapeReset);
        }
      };

      engine.objectShape = api;
      return api;
    }
  });
}

export default createCoreObjectShapeKit;
