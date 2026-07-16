import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createAssetBundleDescriptor,
  createAssetCacheRecord,
  createAssetDescriptor,
  createAssetJob,
  createAssetReceipt,
  hashAssetValue
} from "./descriptors.js";
import { validateAssetProvider } from "./provider.js";
import { validateAssetCacheProvider } from "./cache-provider.js";

export * from "./descriptors.js";
export * from "./provider.js";
export * from "./cache-provider.js";

export const CORE_ASSETS_VERSION = "0.2.0";

const AssetsState = defineResource("core.assets.state");
const AssetRegistered = defineEvent("core.assets.asset-registered");
const BundleRegistered = defineEvent("core.assets.bundle-registered");
const AssetRequested = defineEvent("core.assets.requested");
const AssetProgressed = defineEvent("core.assets.progressed");
const AssetReady = defineEvent("core.assets.ready");
const AssetFailed = defineEvent("core.assets.failed");
const AssetCancelled = defineEvent("core.assets.cancelled");
const AssetInvalidated = defineEvent("core.assets.invalidated");
const AssetsSnapshotLoaded = defineEvent("core.assets.snapshot-loaded");
const AssetsReset = defineEvent("core.assets.reset");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState(config = {}) {
  const assets = {};
  const bundles = {};
  for (const input of config.assets ?? []) {
    const asset = createAssetDescriptor(input);
    assets[asset.id] = asset;
  }
  for (const input of config.bundles ?? []) {
    const bundle = createAssetBundleDescriptor(input);
    bundles[bundle.id] = bundle;
  }
  return {
    version: CORE_ASSETS_VERSION,
    sequence: 0,
    assets,
    bundles,
    jobs: {},
    receipts: {},
    providers: {},
    cache: { providerId: null, entries: {} }
  };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) {
    runtimes.set(world, {
      providers: new Map(),
      cacheProvider: null,
      active: new Map(),
      tokens: new Map(),
      values: new Map(),
      engine: null
    });
  }
  return runtimes.get(world);
}

function normalizeError(error) {
  if (error instanceof Error) return { name: error.name, message: error.message, code: error.code ?? null };
  if (error && typeof error === "object") return clone(error);
  return { name: "Error", message: String(error) };
}

function validateSnapshot(snapshot = {}, config = {}) {
  const next = initialState(config);
  next.sequence = Math.max(0, Math.floor(Number(snapshot.sequence) || 0));
  for (const asset of Object.values(snapshot.assets ?? {})) {
    const value = createAssetDescriptor(asset);
    next.assets[value.id] = value;
  }
  for (const bundle of Object.values(snapshot.bundles ?? {})) {
    const value = createAssetBundleDescriptor(bundle);
    next.bundles[value.id] = value;
  }
  for (const job of Object.values(snapshot.jobs ?? {})) {
    const value = createAssetJob(job);
    next.jobs[value.id] = value;
  }
  for (const receipt of Object.values(snapshot.receipts ?? {})) {
    const value = createAssetReceipt(receipt);
    next.receipts[value.id] = value;
  }
  next.providers = clone(snapshot.providers ?? {});
  next.cache = clone(snapshot.cache ?? next.cache);
  return next;
}

export function createCoreAssetsKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "n-core-assets-kit",
    domain: "core-assets",
    domainPath: config.domainPath ?? "n:core-assets",
    apiName: config.apiName ?? "coreAssets",
    version: CORE_ASSETS_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["registry", "bundles", "requests", "jobs", "providers", "cache", "readiness", "snapshot", "reset"],
    resources: { AssetsState },
    events: {
      AssetRegistered,
      BundleRegistered,
      AssetRequested,
      AssetProgressed,
      AssetReady,
      AssetFailed,
      AssetCancelled,
      AssetInvalidated,
      AssetsSnapshotLoaded,
      AssetsReset
    },
    metadata: {
      purpose: "Asset manifests, bundles, asynchronous provider jobs, dependency resolution, portable cache receipts, readiness, fallback metadata, and content-addressed reuse.",
      owns: [
        "asset descriptors and stable ids",
        "asset bundle descriptors",
        "provider-neutral asynchronous requests",
        "dependency ordering",
        "serializable job progress and receipts",
        "cache keys and cache metadata",
        "content-addressed request deduplication",
        "asset invalidation"
      ],
      doesNotOwn: [
        "browser transport implementation",
        "renderer-specific texture or model upload",
        "Three.js objects",
        "GPU resources",
        "IndexedDB implementation",
        "startup truth",
        "gameplay rules"
      ],
      rendererAgnostic: true,
      providerNeutral: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      ensureRuntime(world);
      world.setResource(AssetsState, initialState(config));
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      runtime.engine = engine;
      const state = () => world.getResource(AssetsState);

      function publish(next, event, payload = {}) {
        world.setResource(AssetsState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      }

      function patch(value, event, payload = {}) {
        const current = state();
        return publish({ ...current, ...clone(value), sequence: Number(current.sequence ?? 0) + 1 }, event, payload);
      }

      function putJob(input, event = AssetProgressed, payload = {}) {
        const job = createAssetJob(input);
        const current = state();
        patch({ jobs: { ...current.jobs, [job.id]: job } }, event, { job, ...payload });
        return job;
      }

      function chooseProvider(asset) {
        if (asset.providerId) return runtime.providers.get(asset.providerId) ?? null;
        return Array.from(runtime.providers.values()).sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;
      }

      function cacheKey(asset) {
        return asset.cache.key ?? `${asset.cache.namespace}:${asset.id}:${asset.contentHash}`;
      }

      function operationFor(kind, target) {
        return `${kind}:${target.id}:${target.contentHash}`;
      }

      function jobFor(kind, target) {
        const operationId = operationFor(kind, target);
        return {
          operationId,
          jobId: `core-assets:${hashAssetValue(operationId)}`
        };
      }

      function receiptForJob(job) {
        return job?.receiptId ? state().receipts[job.receiptId] ?? null : null;
      }

      function reportJob(job, update = {}, event = AssetProgressed) {
        const next = createAssetJob({
          ...job,
          ...update,
          progress: update.progress ?? job.progress,
          revision: Number(job.revision ?? 0) + 1
        });
        putJob(next, event);
        return next;
      }

      async function resolveDependencies(asset, options, token) {
        const receipts = [];
        for (const dependencyId of asset.dependencies) {
          if (token.cancelled) throw Object.assign(new Error("Asset request cancelled."), { code: "core.assets.cancelled" });
          receipts.push(await request(dependencyId, { ...options, priority: options.priority ?? "dependency" }));
        }
        return receipts;
      }

      async function readCache(asset, provider, key, context) {
        if (!asset.cache.enabled || !runtime.cacheProvider) return null;
        const record = await runtime.cacheProvider.get(key);
        if (!record || record.contentHash !== asset.contentHash) return null;
        const normalized = createAssetCacheRecord(record);
        const value = typeof provider?.restore === "function"
          ? await provider.restore(normalized.portable, context)
          : clone(normalized.portable);
        return { record: normalized, value };
      }

      async function writeCache(asset, key, portable, metadata = {}) {
        if (!asset.cache.enabled || !runtime.cacheProvider || portable === undefined) return null;
        const record = createAssetCacheRecord({
          key,
          assetId: asset.id,
          contentHash: asset.contentHash,
          version: asset.version,
          portable,
          metadata
        });
        await runtime.cacheProvider.put(key, record);
        const current = state();
        patch({ cache: { ...current.cache, entries: { ...current.cache.entries, [key]: { assetId: asset.id, contentHash: asset.contentHash, version: asset.version } } } }, AssetProgressed, { cacheKey: key });
        return record;
      }

      async function executeAsset(asset, options, job, token) {
        const provider = chooseProvider(asset);
        const context = {
          engine,
          world,
          asset: clone(asset),
          jobId: job.id,
          priority: options.priority ?? "normal",
          signal: options.signal ?? null,
          isCancelled: () => token.cancelled,
          updateProgress(completed, total = 1, detail = null) {
            if (token.cancelled) return false;
            const current = state().jobs[job.id] ?? job;
            const next = reportJob(current, { state: current.state === "queued" ? "loading" : current.state, progress: { completed, total }, detail });
            options.onProgress?.(next.progress.ratio, detail, clone(next));
            return true;
          }
        };

        const dependencies = await resolveDependencies(asset, options, token);
        const key = cacheKey(asset);
        const cached = await readCache(asset, provider, key, context);
        if (cached) {
          runtime.values.set(asset.id, cached.value);
          const receipt = createAssetReceipt({
            id: `${job.id}:receipt`,
            kind: "asset",
            targetId: asset.id,
            operationId: job.operationId,
            contentHash: asset.contentHash,
            providerId: provider?.id ?? null,
            cacheKey: key,
            cached: true,
            dependencies: dependencies.map((item) => item.id),
            result: { portable: true },
            metadata: cached.record.metadata
          });
          const current = state();
          publish({
            ...current,
            sequence: Number(current.sequence ?? 0) + 1,
            jobs: { ...current.jobs, [job.id]: createAssetJob({ ...job, state: "ready", progress: { completed: 1, total: 1 }, receiptId: receipt.id, revision: job.revision + 1 }) },
            receipts: { ...current.receipts, [receipt.id]: receipt }
          }, AssetReady, { receipt });
          options.onProgress?.(1, "Loaded from cache", clone(state().jobs[job.id]));
          return receipt;
        }

        if (!provider) {
          reportJob(job, { state: "waiting-for-provider", detail: "Waiting for asset provider" });
          throw Object.assign(new Error(`No Core Assets provider is available for ${asset.id}.`), { code: "core.assets.provider.missing" });
        }

        let activeJob = reportJob(job, { state: "loading", providerId: provider.id, detail: `Loading ${asset.id}` });
        options.onProgress?.(activeJob.progress.ratio, activeJob.detail, clone(activeJob));
        const loader = provider.load ?? provider.prepare;
        const raw = await loader(clone(asset), context);
        if (token.cancelled) throw Object.assign(new Error("Asset request cancelled."), { code: "core.assets.cancelled" });
        activeJob = reportJob(activeJob, { state: "preparing", progress: { completed: 0.9, total: 1 }, detail: `Preparing ${asset.id}` });
        options.onProgress?.(activeJob.progress.ratio, activeJob.detail, clone(activeJob));

        const value = raw?.value ?? raw?.runtimeValue ?? raw?.portable ?? raw;
        const portable = raw?.portable ?? (raw?.runtimeValue === undefined ? raw?.value ?? raw : undefined);
        runtime.values.set(asset.id, value);
        await writeCache(asset, key, portable, raw?.metadata ?? {});
        const receipt = createAssetReceipt({
          id: `${job.id}:receipt`,
          kind: "asset",
          targetId: asset.id,
          operationId: job.operationId,
          contentHash: asset.contentHash,
          providerId: provider.id,
          cacheKey: key,
          cached: false,
          dependencies: dependencies.map((item) => item.id),
          result: clone(raw?.receipt ?? raw?.result ?? null),
          metadata: clone(raw?.metadata ?? {})
        });
        const current = state();
        publish({
          ...current,
          sequence: Number(current.sequence ?? 0) + 1,
          jobs: { ...current.jobs, [job.id]: createAssetJob({ ...activeJob, state: "ready", progress: { completed: 1, total: 1 }, receiptId: receipt.id, revision: activeJob.revision + 1 }) },
          receipts: { ...current.receipts, [receipt.id]: receipt }
        }, AssetReady, { receipt });
        options.onProgress?.(1, `Ready ${asset.id}`, clone(state().jobs[job.id]));
        return receipt;
      }

      async function request(assetId, options = {}) {
        const asset = state().assets[String(assetId)];
        if (!asset) throw new RangeError(`Unknown Core Assets asset: ${assetId}.`);
        const { operationId, jobId } = jobFor("asset", asset);
        const existingJob = state().jobs[jobId];
        const existingReceipt = receiptForJob(existingJob);
        if (existingJob?.state === "ready" && existingReceipt) return clone(existingReceipt);
        if (runtime.active.has(operationId)) return runtime.active.get(operationId);

        const token = { cancelled: false };
        runtime.tokens.set(jobId, token);
        const job = existingJob && !["failed", "cancelled", "stale"].includes(existingJob.state)
          ? existingJob
          : putJob({ id: jobId, kind: "asset", targetId: asset.id, operationId, state: "queued", progress: { completed: 0, total: 1 }, revision: Number(existingJob?.revision ?? -1) + 1 }, AssetRequested, { asset });
        const promise = executeAsset(asset, options, job, token)
          .catch((error) => {
            const current = state().jobs[job.id] ?? job;
            if (token.cancelled || error?.code === "core.assets.cancelled") {
              reportJob(current, { state: "cancelled", error: normalizeError(error) }, AssetCancelled);
            } else {
              reportJob(current, { state: "failed", error: normalizeError(error) }, AssetFailed);
            }
            throw error;
          })
          .finally(() => {
            runtime.active.delete(operationId);
            runtime.tokens.delete(jobId);
          });
        runtime.active.set(operationId, promise);
        return promise;
      }

      async function requestBundle(bundleId, options = {}) {
        const bundle = state().bundles[String(bundleId)];
        if (!bundle) throw new RangeError(`Unknown Core Assets bundle: ${bundleId}.`);
        const { operationId, jobId } = jobFor("bundle", bundle);
        const existingJob = state().jobs[jobId];
        const existingReceipt = receiptForJob(existingJob);
        if (existingJob?.state === "ready" && existingReceipt) return clone(existingReceipt);
        if (runtime.active.has(operationId)) return runtime.active.get(operationId);

        const token = { cancelled: false };
        runtime.tokens.set(jobId, token);
        let job = putJob({ id: jobId, kind: "bundle", targetId: bundle.id, operationId, state: "loading", progress: { completed: 0, total: Math.max(1, bundle.dependencies.length + bundle.assets.length) }, revision: Number(existingJob?.revision ?? -1) + 1 }, AssetRequested, { bundle });
        const promise = (async () => {
          const memberReceipts = [];
          const total = Math.max(1, bundle.dependencies.length + bundle.assets.length);
          let completed = 0;
          const report = (detail) => {
            const current = state().jobs[job.id] ?? job;
            job = reportJob(current, { state: "loading", progress: { completed, total }, detail });
            options.onProgress?.(job.progress.ratio, detail, clone(job));
          };
          for (const dependencyBundleId of bundle.dependencies) {
            if (token.cancelled) throw Object.assign(new Error("Asset bundle request cancelled."), { code: "core.assets.cancelled" });
            memberReceipts.push(await requestBundle(dependencyBundleId, options));
            completed += 1;
            report(`Prepared bundle ${dependencyBundleId}`);
          }
          for (const memberId of bundle.assets) {
            if (token.cancelled) throw Object.assign(new Error("Asset bundle request cancelled."), { code: "core.assets.cancelled" });
            memberReceipts.push(await request(memberId, {
              ...options,
              onProgress(ratio, detail) {
                options.onProgress?.(Math.min(0.999, (completed + ratio) / total), detail, clone(state().jobs[job.id] ?? job));
              }
            }));
            completed += 1;
            report(`Prepared ${memberId}`);
          }
          const receipt = createAssetReceipt({
            id: `${job.id}:receipt`,
            kind: "bundle",
            targetId: bundle.id,
            operationId,
            contentHash: bundle.contentHash,
            cached: memberReceipts.every((item) => item.cached),
            dependencies: bundle.dependencies,
            members: memberReceipts.map((item) => item.id),
            result: { assetCount: bundle.assets.length, dependencyBundleCount: bundle.dependencies.length },
            metadata: bundle.metadata
          });
          const current = state();
          publish({
            ...current,
            sequence: Number(current.sequence ?? 0) + 1,
            jobs: { ...current.jobs, [job.id]: createAssetJob({ ...job, state: "ready", progress: { completed: total, total }, receiptId: receipt.id, revision: job.revision + 1 }) },
            receipts: { ...current.receipts, [receipt.id]: receipt }
          }, AssetReady, { receipt });
          options.onProgress?.(1, `Ready ${bundle.id}`, clone(state().jobs[job.id]));
          return receipt;
        })().catch((error) => {
          const current = state().jobs[job.id] ?? job;
          if (token.cancelled || error?.code === "core.assets.cancelled") reportJob(current, { state: "cancelled", error: normalizeError(error) }, AssetCancelled);
          else reportJob(current, { state: "failed", error: normalizeError(error) }, AssetFailed);
          throw error;
        }).finally(() => {
          runtime.active.delete(operationId);
          runtime.tokens.delete(jobId);
        });
        runtime.active.set(operationId, promise);
        return promise;
      }

      const api = {
        registerAsset(input) {
          const asset = createAssetDescriptor(input);
          const current = state();
          const existing = current.assets[asset.id];
          if (existing?.contentHash === asset.contentHash) return clone(existing);
          patch({ assets: { ...current.assets, [asset.id]: asset } }, AssetRegistered, { asset });
          return clone(asset);
        },
        registerBundle(input) {
          const bundle = createAssetBundleDescriptor(input);
          const current = state();
          const existing = current.bundles[bundle.id];
          if (existing?.contentHash === bundle.contentHash) return clone(existing);
          patch({ bundles: { ...current.bundles, [bundle.id]: bundle } }, BundleRegistered, { bundle });
          return clone(bundle);
        },
        registerProvider(input) {
          const provider = validateAssetProvider(input);
          const previous = runtime.providers.get(provider.id);
          if (previous && previous !== provider) previous.dispose?.();
          runtime.providers.set(provider.id, provider);
          provider.initialize?.({ engine, world });
          const current = state();
          patch({ providers: { ...current.providers, [provider.id]: { id: provider.id, version: provider.version ?? "1", metadata: clone(provider.metadata ?? {}) } } }, AssetProgressed, { providerId: provider.id });
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
          patch({ providers }, AssetProgressed, { providerId: id });
          return true;
        },
        setCacheProvider(input) {
          const provider = validateAssetCacheProvider(input);
          runtime.cacheProvider = provider;
          provider.initialize?.({ engine, world });
          const current = state();
          patch({ cache: { ...current.cache, providerId: provider.id ?? "asset-cache" } }, AssetProgressed, { cacheProviderId: provider.id ?? "asset-cache" });
          return provider.id ?? "asset-cache";
        },
        getCacheProvider: () => runtime.cacheProvider,
        request,
        requestBundle,
        resume(jobId, options = {}) {
          const job = state().jobs[String(jobId)];
          if (!job) throw new RangeError(`Unknown Core Assets job: ${jobId}.`);
          return job.kind === "bundle" ? requestBundle(job.targetId, options) : request(job.targetId, options);
        },
        async resumeWaiting(providerId = null) {
          const jobs = Object.values(state().jobs).filter((job) => ["queued", "waiting-for-provider", "failed"].includes(job.state));
          const results = [];
          for (const job of jobs) {
            const asset = job.kind === "asset" ? state().assets[job.targetId] : null;
            if (providerId != null && asset?.providerId !== providerId) continue;
            results.push(await api.resume(job.id));
          }
          return results;
        },
        cancel(jobId) {
          const id = String(jobId);
          const job = state().jobs[id];
          if (!job) return false;
          if (["ready", "failed", "cancelled", "stale"].includes(job.state)) return false;
          const token = runtime.tokens.get(id);
          if (token) token.cancelled = true;
          if (job.providerId) runtime.providers.get(job.providerId)?.cancel?.(id);
          putJob({ ...job, state: "cancelled", revision: job.revision + 1 }, AssetCancelled);
          return true;
        },
        async invalidate(id) {
          const targetId = String(id);
          const asset = state().assets[targetId];
          const bundle = state().bundles[targetId];
          if (!asset && !bundle) return false;
          const current = state();
          const jobs = { ...current.jobs };
          const receipts = { ...current.receipts };
          for (const [jobId, job] of Object.entries(jobs)) {
            if (job.targetId !== targetId) continue;
            delete jobs[jobId];
            if (job.receiptId) delete receipts[job.receiptId];
          }
          runtime.values.delete(targetId);
          if (asset && runtime.cacheProvider) await runtime.cacheProvider.delete(cacheKey(asset));
          patch({ jobs, receipts }, AssetInvalidated, { targetId });
          return true;
        },
        getAsset(id) { return clone(state().assets[String(id)] ?? null); },
        getBundle(id) { return clone(state().bundles[String(id)] ?? null); },
        getJob(id) { return clone(state().jobs[String(id)] ?? null); },
        getReceipt(id) { return clone(state().receipts[String(id)] ?? null); },
        getValue(id) { return runtime.values.get(String(id)) ?? null; },
        getStatus(id) {
          const targetId = String(id);
          const jobs = Object.values(state().jobs).filter((job) => job.targetId === targetId).sort((a, b) => b.revision - a.revision);
          return jobs[0]?.state ?? "unrequested";
        },
        getProgress(id) {
          const targetId = String(id);
          const jobs = Object.values(state().jobs).filter((job) => job.targetId === targetId).sort((a, b) => b.revision - a.revision);
          return jobs[0]?.progress?.ratio ?? 0;
        },
        getSnapshot: () => clone(state()),
        loadSnapshot(snapshot = {}) {
          const next = validateSnapshot(snapshot, config);
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, { id: provider.id, version: provider.version ?? "1", metadata: clone(provider.metadata ?? {}) }]));
          next.cache.providerId = runtime.cacheProvider?.id ?? next.cache.providerId;
          return publish(next, AssetsSnapshotLoaded);
        },
        reset() {
          for (const token of runtime.tokens.values()) token.cancelled = true;
          runtime.tokens.clear();
          runtime.active.clear();
          runtime.values.clear();
          for (const provider of runtime.providers.values()) provider.reset?.();
          const next = initialState(config);
          next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, { id: provider.id, version: provider.version ?? "1", metadata: clone(provider.metadata ?? {}) }]));
          next.cache.providerId = runtime.cacheProvider?.id ?? null;
          return publish(next, AssetsReset);
        }
      };

      engine.coreAssets = api;
      return api;
    }
  });
}

export default createCoreAssetsKit;
