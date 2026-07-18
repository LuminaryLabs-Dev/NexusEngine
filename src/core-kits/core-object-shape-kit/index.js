import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createObjectShape,
  createObjectShapeCandidate,
  createObjectShapeJob,
  createObjectShapeProfile,
  createObjectShapeQualification,
  createObjectShapeSource,
  hashShapeValue
} from "./descriptors.js";
import {
  createShapeDerivationRequest,
  normalizeShapeProviderResult,
  validateObjectShapeProvider
} from "./provider.js";
import {
  createShapeFallbackTargets,
  qualifyObjectShapeCandidate
} from "./qualification.js";
import { CORE_OBJECT_SHAPE_PROFILES } from "./profiles.js";

export * from "./descriptors.js";
export * from "./metrics.js";
export * from "./profiles.js";
export * from "./provider.js";
export * from "./qualification.js";

export const CORE_OBJECT_SHAPE_VERSION = "0.2.0";

const ObjectShapeState = defineResource("core.object-shape.state");
const ShapeProfileRegistered = defineEvent("core.object-shape.profile-registered");
const ShapeSourceRegistered = defineEvent("core.object-shape.source-registered");
const ShapeJobRequested = defineEvent("core.object-shape.job-requested");
const ShapeJobProgressed = defineEvent("core.object-shape.job-progressed");
const ShapeCandidateDerived = defineEvent("core.object-shape.candidate-derived");
const ShapeQualificationRecorded = defineEvent("core.object-shape.qualification-recorded");
const ShapeFallbackAttempted = defineEvent("core.object-shape.fallback-attempted");
const ShapeDerived = defineEvent("core.object-shape.derived");
const ShapeRejected = defineEvent("core.object-shape.rejected");
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
    candidates: {},
    qualifications: {},
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
  for (const candidate of Object.values(snapshot.candidates ?? {})) {
    const source = next.sources[candidate.sourceShapeId];
    const value = createObjectShapeCandidate(candidate, source);
    next.candidates[value.id] = value;
  }
  for (const qualification of Object.values(snapshot.qualifications ?? {})) {
    const value = createObjectShapeQualification(qualification);
    if (!next.candidates[value.candidateShapeId]) {
      throw new TypeError(`Object Shape qualification references missing candidate: ${value.candidateShapeId}.`);
    }
    next.qualifications[value.id] = value;
  }
  for (const shape of Object.values(snapshot.shapes ?? {})) {
    const source = next.sources[shape.sourceShapeId];
    const value = createObjectShape(shape, source);
    if (value.qualification && !next.qualifications[value.qualification.id]) {
      next.qualifications[value.qualification.id] = value.qualification;
    }
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
    provides: ["object:shape-source", "object:shape-candidate", "object:shape-qualified", "object:shape-derived", "object:shape-jobs"],
    services: [
      "sources",
      "derived-shapes",
      "profiles",
      "jobs",
      "providers",
      "metrics",
      "qualification",
      "fallback",
      "evidence",
      "snapshot",
      "reset"
    ],
    resources: { ObjectShapeState },
    events: {
      ShapeProfileRegistered,
      ShapeSourceRegistered,
      ShapeJobRequested,
      ShapeJobProgressed,
      ShapeCandidateDerived,
      ShapeQualificationRecorded,
      ShapeFallbackAttempted,
      ShapeDerived,
      ShapeRejected,
      ShapeJobFailed,
      ShapeJobCancelled,
      ShapeReset,
      ShapeSnapshotLoaded
    },
    metadata: {
      purpose: "Own source and derived geometric shapes, provider candidates, qualification evidence, conservative fallback, preservation profiles, provider-backed derivation jobs, readiness, cancellation, snapshots, and reset.",
      owns: [
        "source shapes",
        "derived shape candidates",
        "approved shapes",
        "rejected candidate evidence",
        "shape qualification",
        "safe-skinned validation",
        "fallback ladders",
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
        "creature anatomy",
        "automatic production skeleton reduction"
      ],
      optional: true,
      rendererAgnostic: true,
      providerNeutral: true,
      deterministic: true,
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
        return publish({
          ...current,
          ...clone(value),
          sequence: Number(current.sequence ?? 0) + 1
        }, event, payload);
      }

      function putJob(job, event = ShapeJobProgressed, payload = {}) {
        const value = createObjectShapeJob(job);
        const current = state();
        patch({ jobs: { ...current.jobs, [value.id]: value } }, event, { job: value, ...payload });
        return value;
      }

      function putCandidate(candidate, payload = {}) {
        const source = state().sources[candidate.sourceShapeId];
        const value = createObjectShapeCandidate(candidate, source);
        const current = state();
        patch({
          candidates: { ...current.candidates, [value.id]: value }
        }, ShapeCandidateDerived, { candidate: value, ...payload });
        return value;
      }

      function putQualification(qualification, payload = {}) {
        const value = createObjectShapeQualification(qualification);
        const current = state();
        patch({
          qualifications: { ...current.qualifications, [value.id]: value }
        }, ShapeQualificationRecorded, { qualification: value, ...payload });
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
        if (["ready", "rejected", "failed", "cancelled", "stale"].includes(existing.state)) return clone(existing);
        if (!isCurrent(existing)) {
          return clone(putJob({
            ...existing,
            state: "stale",
            revision: existing.revision + 1
          }, ShapeJobFailed, { reason: "object-content-changed" }));
        }
        if (runtime.active.has(existing.id)) return runtime.active.get(existing.id).promise;

        const provider = chooseProvider(existing.providerId);
        if (!provider) {
          return clone(putJob({
            ...existing,
            state: "waiting-for-provider",
            revision: existing.revision + 1
          }, ShapeJobProgressed));
        }

        const source = state().sources[existing.sourceShapeId];
        const profile = state().profiles[existing.profileId];
        const requestedTarget = profile?.targets.find((entry) => entry.id === existing.targetId);
        if (!source || !profile || !requestedTarget) {
          return clone(putJob({
            ...existing,
            state: "failed",
            error: { message: "Object Shape job dependencies are missing." },
            revision: existing.revision + 1
          }, ShapeJobFailed));
        }

        const attempts = createShapeFallbackTargets(profile, requestedTarget);
        const token = { cancelled: false, promise: null };
        token.promise = (async () => {
          let lastQualification = null;
          let lastCandidate = null;
          try {
            for (let attemptIndex = 0; attemptIndex < attempts.length; attemptIndex += 1) {
              const attemptTarget = attempts[attemptIndex];
              const currentJob = state().jobs[existing.id];
              if (!currentJob || token.cancelled || currentJob.state === "cancelled") {
                return clone(state().jobs[existing.id]);
              }
              if (!isCurrent(existing)) {
                return clone(putJob({
                  ...currentJob,
                  state: "stale",
                  revision: currentJob.revision + 1
                }, ShapeJobFailed, { reason: "object-content-changed" }));
              }

              putJob({
                ...currentJob,
                state: attemptTarget.mode === "source" ? "preparing" : "simplifying",
                providerId: provider.id,
                progress: { completed: attemptIndex, total: attempts.length },
                attempt: attemptIndex,
                attemptedRatio: attemptTarget.ratio,
                fallbackUsed: attemptIndex > 0,
                revision: currentJob.revision + 1
              }, attemptIndex > 0 ? ShapeFallbackAttempted : ShapeJobProgressed, {
                attempt: attemptIndex,
                target: attemptTarget,
                previousQualification: lastQualification
              });

              const request = createShapeDerivationRequest({
                jobId: existing.id,
                objectId: existing.objectId,
                objectContentHash: existing.objectContentHash,
                source,
                profile,
                target: attemptTarget,
                options: {
                  attempt: attemptIndex,
                  requestedTargetId: requestedTarget.id,
                  requestedRatio: requestedTarget.ratio,
                  qualification: true
                }
              });

              const raw = await provider.derive(request, {
                updateProgress(completed, total = 1, detail = null) {
                  const activeJob = state().jobs[existing.id];
                  if (!activeJob || token.cancelled || activeJob.state === "cancelled") return false;
                  const localProgress = Math.max(0, Math.min(1, Number(completed) / Math.max(1, Number(total))));
                  putJob({
                    ...activeJob,
                    progress: {
                      completed: attemptIndex + localProgress,
                      total: attempts.length
                    },
                    revision: activeJob.revision + 1
                  }, ShapeJobProgressed, { detail, attempt: attemptIndex });
                  return true;
                },
                isCancelled() {
                  return token.cancelled || state().jobs[existing.id]?.state === "cancelled";
                }
              });

              if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") {
                return clone(state().jobs[existing.id]);
              }
              if (!isCurrent(existing)) {
                const activeJob = state().jobs[existing.id];
                return clone(putJob({
                  ...activeJob,
                  state: "stale",
                  revision: activeJob.revision + 1
                }, ShapeJobFailed, { reason: "object-content-changed" }));
              }

              const result = normalizeShapeProviderResult(raw);
              const candidate = putCandidate({
                id: `${existing.id}:candidate:${attemptIndex}`,
                objectId: existing.objectId,
                objectContentHash: existing.objectContentHash,
                sourceShapeId: source.id,
                sourceContentHash: source.contentHash,
                profileId: profile.id,
                targetId: requestedTarget.id,
                requestedTargetId: requestedTarget.id,
                requestedRatio: requestedTarget.ratio,
                attemptedRatio: attemptTarget.ratio,
                attempt: attemptIndex,
                fallback: attemptIndex > 0,
                purpose: requestedTarget.id,
                ...result,
                provider: {
                  id: provider.id,
                  version: provider.version ?? "0.1.0"
                }
              }, { attempt: attemptIndex });
              lastCandidate = candidate;

              const qualifyingJob = state().jobs[existing.id];
              putJob({
                ...qualifyingJob,
                state: "qualifying",
                candidateShapeId: candidate.id,
                attempt: attemptIndex,
                attemptedRatio: attemptTarget.ratio,
                fallbackUsed: attemptIndex > 0,
                revision: qualifyingJob.revision + 1
              }, ShapeJobProgressed, { candidate });

              const qualification = putQualification(qualifyObjectShapeCandidate({
                source,
                profile,
                target: attemptTarget,
                candidate,
                provider: {
                  id: provider.id,
                  version: provider.version ?? "0.1.0",
                  metadata: clone(provider.metadata ?? {})
                },
                attempt: attemptIndex
              }), { candidate, attempt: attemptIndex });
              lastQualification = qualification;

              if (qualification.status !== "approved") {
                const rejectedJob = state().jobs[existing.id];
                putJob({
                  ...rejectedJob,
                  state: attemptIndex + 1 < attempts.length ? "validating" : "rejected",
                  candidateShapeId: candidate.id,
                  qualificationId: qualification.id,
                  attempt: attemptIndex,
                  attemptedRatio: attemptTarget.ratio,
                  fallbackUsed: attemptIndex > 0,
                  error: attemptIndex + 1 < attempts.length ? null : {
                    name: "ShapeQualificationError",
                    message: "No candidate passed Object Shape qualification.",
                    failures: clone(qualification.failures)
                  },
                  revision: rejectedJob.revision + 1
                }, attemptIndex + 1 < attempts.length ? ShapeFallbackAttempted : ShapeRejected, {
                  candidate,
                  qualification,
                  nextTarget: attempts[attemptIndex + 1] ?? null
                });
                continue;
              }

              const shape = createObjectShape({
                id: `${existing.id}:shape`,
                objectId: existing.objectId,
                objectContentHash: existing.objectContentHash,
                sourceShapeId: source.id,
                sourceContentHash: source.contentHash,
                profileId: profile.id,
                targetId: requestedTarget.id,
                purpose: requestedTarget.id,
                geometry: candidate.geometry,
                asset: candidate.asset,
                metrics: candidate.metrics,
                quality: candidate.quality,
                preservation: candidate.preservation,
                provider: candidate.provider,
                metadata: {
                  ...clone(candidate.metadata ?? {}),
                  requestedRatio: requestedTarget.ratio,
                  approvedRatio: attemptTarget.ratio,
                  fallbackUsed: attemptIndex > 0,
                  candidateContentHash: candidate.contentHash,
                  qualificationContentHash: qualification.contentHash
                },
                candidateShapeId: candidate.id,
                qualification
              }, source);

              const current = state();
              const readyJob = createObjectShapeJob({
                ...current.jobs[existing.id],
                state: "ready",
                providerId: provider.id,
                progress: { completed: attempts.length, total: attempts.length },
                candidateShapeId: candidate.id,
                qualificationId: qualification.id,
                resultShapeId: shape.id,
                attempt: attemptIndex,
                attemptedRatio: attemptTarget.ratio,
                fallbackUsed: attemptIndex > 0,
                error: null,
                revision: current.jobs[existing.id].revision + 1
              });
              publish({
                ...current,
                sequence: Number(current.sequence ?? 0) + 1,
                jobs: { ...current.jobs, [readyJob.id]: readyJob },
                shapes: { ...current.shapes, [shape.id]: shape }
              }, ShapeDerived, {
                job: readyJob,
                shape,
                candidate,
                qualification
              });
              return clone(readyJob);
            }

            return clone(state().jobs[existing.id] ?? createObjectShapeJob({
              ...existing,
              state: "rejected",
              candidateShapeId: lastCandidate?.id ?? null,
              qualificationId: lastQualification?.id ?? null,
              error: {
                name: "ShapeQualificationError",
                message: "No candidate passed Object Shape qualification."
              },
              revision: existing.revision + 1
            }));
          } catch (error) {
            if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") {
              return clone(state().jobs[existing.id]);
            }
            const failed = state().jobs[existing.id] ?? existing;
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
          patch({
            profiles: { ...current.profiles, [profile.id]: profile }
          }, ShapeProfileRegistered, { profile });
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
          patch({
            sources: { ...current.sources, [source.id]: source }
          }, ShapeSourceRegistered, { source });
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
          const operationId = `${source.contentHash}:${profile.contentHash}:${target.id}:${providerId ?? "auto"}:qualified-v2`;
          const jobId = `shape:${hashShapeValue(operationId)}`;
          const existing = state().jobs[jobId];
          if (existing) {
            return ["queued", "waiting-for-provider", "validating"].includes(existing.state)
              ? run(existing.id)
              : clone(existing);
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
            .filter((job) => ["queued", "waiting-for-provider", "validating"].includes(job.state))
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
          if (["ready", "rejected", "failed", "stale"].includes(job.state)) return false;
          const token = runtime.active.get(id);
          if (token) token.cancelled = true;
          runtime.providers.get(job.providerId)?.cancel?.(id);
          putJob({
            ...job,
            state: "cancelled",
            revision: job.revision + 1
          }, ShapeJobCancelled);
          return true;
        },
        getProfile(id) {
          return clone(state().profiles[String(id)] ?? null);
        },
        getSource(id) {
          return clone(state().sources[String(id)] ?? null);
        },
        getJob(id) {
          return clone(state().jobs[String(id)] ?? null);
        },
        getCandidate(id) {
          return clone(state().candidates[String(id)] ?? null);
        },
        getQualification(id) {
          return clone(state().qualifications[String(id)] ?? null);
        },
        getShape(id) {
          return clone(state().shapes[String(id)] ?? null);
        },
        getMetrics(id) {
          return clone(
            state().shapes[String(id)]?.metrics
            ?? state().candidates[String(id)]?.metrics
            ?? state().sources[String(id)]?.metrics
            ?? null
          );
        },
        listProviders() {
          return Object.values(state().providers)
            .sort((left, right) => left.id.localeCompare(right.id))
            .map(clone);
        },
        listCandidates(jobId = null) {
          return Object.values(state().candidates)
            .filter((candidate) => jobId == null || candidate.id.startsWith(`${jobId}:candidate:`))
            .sort((left, right) => left.id.localeCompare(right.id))
            .map(clone);
        },
        listQualifications(jobId = null) {
          const candidateIds = jobId == null
            ? null
            : new Set(Object.values(state().candidates)
              .filter((candidate) => candidate.id.startsWith(`${jobId}:candidate:`))
              .map((candidate) => candidate.id));
          return Object.values(state().qualifications)
            .filter((qualification) => candidateIds == null || candidateIds.has(qualification.candidateShapeId))
            .sort((left, right) => left.id.localeCompare(right.id))
            .map(clone);
        },
        getSnapshot() {
          return clone(state());
        },
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
