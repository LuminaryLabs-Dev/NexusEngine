import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import { createCaptureJob, createCaptureRequest, createCaptureResult } from "./descriptors.js";
import { validateCaptureProvider } from "./provider.js";

export * from "./descriptors.js";
export * from "./provider.js";

export const CORE_CAPTURE_VERSION = "0.1.0";

const CaptureState = defineResource("core.capture.state");
const CaptureRequested = defineEvent("core.capture.requested");
const CaptureStarted = defineEvent("core.capture.started");
const CaptureProgressed = defineEvent("core.capture.progressed");
const CaptureCompleted = defineEvent("core.capture.completed");
const CaptureFailed = defineEvent("core.capture.failed");
const CaptureCancelled = defineEvent("core.capture.cancelled");
const CaptureReset = defineEvent("core.capture.reset");
const CaptureSnapshotLoaded = defineEvent("core.capture.snapshot-loaded");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState() {
  return { version: CORE_CAPTURE_VERSION, sequence: 0, providers: {}, requests: {}, jobs: {}, results: {} };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) runtimes.set(world, { providers: new Map(), active: new Map() });
  return runtimes.get(world);
}

function normalizeError(error) {
  if (error == null) return null;
  if (error instanceof Error) return { name: error.name, message: error.message };
  if (typeof error === "object") return clone(error);
  return { name: "Error", message: String(error) };
}

function validateSnapshot(snapshot = {}) {
  const next = initialState();
  next.sequence = Math.max(0, Math.floor(Number(snapshot.sequence ?? 0)));
  for (const request of Object.values(snapshot.requests ?? {})) {
    const normalized = createCaptureRequest(request);
    next.requests[normalized.id] = normalized;
  }
  for (const job of Object.values(snapshot.jobs ?? {})) {
    const normalized = createCaptureJob(job);
    if (!next.requests[normalized.requestId]) throw new TypeError(`Capture snapshot job references missing request: ${normalized.requestId}.`);
    next.jobs[normalized.id] = normalized;
  }
  for (const result of Object.values(snapshot.results ?? {})) {
    const request = next.requests[result.requestId];
    const normalized = createCaptureResult(result, request);
    next.results[normalized.id] = normalized;
  }
  return next;
}

export function createCoreCaptureKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-capture-domain",
    domain: "capture",
    domainPath: config.domainPath ?? "n:capture",
    apiName: config.apiName ?? "coreCapture",
    version: CORE_CAPTURE_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["subjects", "view-sets", "framing", "jobs", "providers", "results", "snapshot", "reset"],
    resources: { CaptureState },
    events: { CaptureRequested, CaptureStarted, CaptureProgressed, CaptureCompleted, CaptureFailed, CaptureCancelled, CaptureReset, CaptureSnapshotLoaded },
    metadata: {
      purpose: "Renderer-neutral observation requests, view sets, framing, provider coordination, progress, and reusable capture results.",
      owns: ["capture subjects", "view sets", "framing descriptors", "requested observations", "capture jobs", "capture provider boundary", "capture results", "failure and cancellation state"],
      doesNotOwn: ["why a capture is needed", "object fidelity policy", "renderer implementation", "GPU device creation", "Canvas or render targets", "file encoding or download"],
      optional: true,
      rendererAgnostic: true,
      providerNeutral: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      ensureRuntime(world);
      world.setResource(CaptureState, initialState());
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      const state = () => world.getResource(CaptureState);

      function publish(next, event, payload = {}) {
        world.setResource(CaptureState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      }

      function patch(value, event, payload = {}) {
        const current = state();
        return publish({ ...current, ...clone(value), sequence: Number(current.sequence ?? 0) + 1 }, event, payload);
      }

      function putJob(job, event, payload = {}) {
        const normalized = createCaptureJob(job);
        const current = state();
        patch({ jobs: { ...current.jobs, [normalized.id]: normalized } }, event, { job: normalized, ...payload });
        return normalized;
      }

      function chooseProvider(request) {
        if (request.providerId) return runtime.providers.get(request.providerId) ?? null;
        return Array.from(runtime.providers.values()).sort((left, right) => left.id.localeCompare(right.id))[0] ?? null;
      }

      async function run(jobId) {
        const existing = state().jobs[String(jobId)];
        if (!existing) throw new RangeError(`Unknown capture job: ${jobId}.`);
        if (["ready", "failed", "cancelled"].includes(existing.state)) return clone(existing);
        if (runtime.active.has(existing.id)) return runtime.active.get(existing.id).promise;

        const request = state().requests[existing.requestId];
        const provider = chooseProvider(request);
        if (!provider) return clone(putJob({ ...existing, state: "waiting-for-provider", revision: existing.revision + 1 }, CaptureProgressed));

        const token = { cancelled: false, promise: null };
        token.promise = (async () => {
          putJob({ ...existing, state: "capturing", providerId: provider.id, progress: { completed: 0, total: 1 }, revision: existing.revision + 1 }, CaptureStarted, { providerId: provider.id });
          try {
            const rawResult = await provider.capture(clone(request), {
              jobId: existing.id,
              updateProgress(completed, total = 1, detail = null) {
                const activeJob = state().jobs[existing.id];
                if (!activeJob || activeJob.state !== "capturing" || token.cancelled) return false;
                putJob({ ...activeJob, progress: { completed, total }, revision: activeJob.revision + 1 }, CaptureProgressed, { detail });
                return true;
              },
              isCancelled() {
                return token.cancelled || state().jobs[existing.id]?.state === "cancelled";
              }
            });
            if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") return clone(state().jobs[existing.id]);

            const result = createCaptureResult({ ...rawResult, requestId: request.id, objectId: request.subject.objectId }, request);
            const after = state();
            const readyJob = createCaptureJob({
              ...after.jobs[existing.id],
              state: "ready",
              providerId: provider.id,
              progress: { completed: 1, total: 1 },
              resultId: result.id,
              error: null,
              revision: after.jobs[existing.id].revision + 1
            });
            publish({
              ...after,
              sequence: Number(after.sequence ?? 0) + 1,
              jobs: { ...after.jobs, [readyJob.id]: readyJob },
              results: { ...after.results, [result.id]: result }
            }, CaptureCompleted, { job: readyJob, result });
            return clone(readyJob);
          } catch (error) {
            if (token.cancelled || state().jobs[existing.id]?.state === "cancelled") return clone(state().jobs[existing.id]);
            const failed = state().jobs[existing.id];
            return clone(putJob({ ...failed, state: "failed", error: normalizeError(error), revision: failed.revision + 1 }, CaptureFailed));
          } finally {
            runtime.active.delete(existing.id);
          }
        })();
        runtime.active.set(existing.id, token);
        return token.promise;
      }

      const api = {
        registerProvider(input) {
          const provider = validateCaptureProvider(input);
          const previous = runtime.providers.get(provider.id);
          if (previous && previous !== provider) previous.dispose?.();
          runtime.providers.set(provider.id, provider);
          provider.initialize?.({ engine, world });
          const current = state();
          patch({ providers: { ...current.providers, [provider.id]: { id: provider.id, metadata: clone(provider.metadata ?? {}) } } }, CaptureProgressed, { providerId: provider.id });
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
          patch({ providers }, CaptureProgressed, { providerId: id });
          return true;
        },
        listProviders() {
          return Object.values(state().providers).sort((left, right) => left.id.localeCompare(right.id)).map(clone);
        },
        async request(input = {}) {
          const request = createCaptureRequest(input);
          const current = state();
          const existingRequest = current.requests[request.id];
          if (existingRequest) {
            if (existingRequest.contentHash !== request.contentHash) throw new TypeError(`Capture request id ${request.id} already exists with different content.`);
            const existingJob = Object.values(current.jobs).find((job) => job.requestId === request.id);
            if (!existingJob) throw new Error(`Capture request ${request.id} has no job.`);
            return ["queued", "waiting-for-provider"].includes(existingJob.state) ? run(existingJob.id) : clone(existingJob);
          }
          const job = createCaptureJob({ id: `capture:${request.contentHash}`, requestId: request.id, state: "queued", progress: { completed: 0, total: 1 }, revision: 0 });
          publish({
            ...current,
            sequence: Number(current.sequence ?? 0) + 1,
            requests: { ...current.requests, [request.id]: request },
            jobs: { ...current.jobs, [job.id]: job }
          }, CaptureRequested, { request, job });
          return run(job.id);
        },
        run,
        async resumeWaiting(providerId = null) {
          const jobs = Object.values(state().jobs)
            .filter((job) => ["queued", "waiting-for-provider"].includes(job.state))
            .filter((job) => providerId == null || state().requests[job.requestId]?.providerId === providerId);
          const results = [];
          for (const job of jobs) results.push(await run(job.id));
          return results;
        },
        cancel(jobId) {
          const id = String(jobId);
          const job = state().jobs[id];
          if (!job) return false;
          if (job.state === "cancelled") return true;
          if (["ready", "failed"].includes(job.state)) return false;
          const token = runtime.active.get(id);
          if (token) token.cancelled = true;
          const provider = job.providerId ? runtime.providers.get(job.providerId) : null;
          provider?.cancel?.(id);
          putJob({ ...job, state: "cancelled", revision: job.revision + 1 }, CaptureCancelled);
          return true;
        },
        getJob(jobId) { return clone(state().jobs[String(jobId)] ?? null); },
        getRequest(requestId) { return clone(state().requests[String(requestId)] ?? null); },
        getResult(jobOrResultId) {
          const id = String(jobOrResultId);
          const job = state().jobs[id];
          return clone(state().results[job?.resultId ?? id] ?? null);
        },
        listJobs() { return Object.values(state().jobs).sort((left, right) => left.id.localeCompare(right.id)).map(clone); },
        getSnapshot() { return clone(state()); },
        loadSnapshot(snapshot = {}) {
          const next = validateSnapshot(snapshot);
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, { id: provider.id, metadata: clone(provider.metadata ?? {}) }]));
          return publish(next, CaptureSnapshotLoaded);
        },
        reset() {
          for (const token of runtime.active.values()) token.cancelled = true;
          runtime.active.clear();
          for (const provider of runtime.providers.values()) provider.reset?.();
          const next = initialState();
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, { id: provider.id, metadata: clone(provider.metadata ?? {}) }]));
          return publish(next, CaptureReset);
        }
      };
      engine.coreCapture = api;
      return api;
    }
  });
}

export default createCoreCaptureKit;
