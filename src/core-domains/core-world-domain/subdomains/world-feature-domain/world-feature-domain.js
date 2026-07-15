import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";
import { clonePortableValue } from "../../portable.js";
import { boundsIntersect, createWorldFeatureDefinition, normalizeBounds } from "./contracts.js";
import { validateWorldFeatureDefinition } from "./validation.js";
import { createInitialWorldFeatureState } from "./state.js";
import { createFeatureTypeDescriptor } from "./kits/feature-registry-kit/index.js";
import { normalizeFeatureLifecycle } from "./kits/feature-lifecycle-kit/index.js";
import { queryWorldFeatures } from "./kits/feature-query-kit/index.js";
import { flattenFeatureContributions, sortWorldFeatures } from "./kits/feature-composition-kit/index.js";
import { normalizeWorldFeatureKitHandler } from "./kits/semantic-feature-kit/index.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableSignature(value) {
  return JSON.stringify(stableValue(value));
}

function normalizedValidation(result) {
  if (result === undefined || result === null || result === true) return { valid: true, issues: [] };
  if (result === false) return { valid: false, issues: ["invalid-feature"] };
  if (Array.isArray(result)) return { valid: result.length === 0, issues: result.map(String) };
  const issues = [...(result.issues ?? [])].map(String);
  return { valid: result.valid !== false && issues.length === 0, issues };
}

function sameContributionIds(resolved, contributions) {
  const left = resolved?.contributionIds ?? [];
  const right = contributions.map((entry) => entry.id);
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function createWorldFeatureDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-world-feature-domain",
    domain: "core-world-features",
    domainPath: config.domainPath ?? "n:world:features",
    parentDomainPath: config.parentDomainPath ?? "n:world",
    apiName: config.apiName ?? "worldFeatures",
    requires: [...(config.requires ?? []), "n:world"],
    purpose: "Bounded semantic world feature identity, lifecycle, queries, compilation, caching, and foundation contribution descriptors.",
    owns: ["world feature identity", "feature type", "feature bounds", "feature seed", "feature priority", "feature dependencies", "feature lifecycle", "feature contribution descriptors", "semantic fidelity requirements", "cell feature compilation cache"],
    doesNotOwn: ["resolved foundation", "renderer meshes", "GPU resources", "generic graphics LOD policy"],
    services: ["definition", "registry", "lifecycle", "query", "composition", "compile", "cell-cache", "snapshot"],
    initialState: createInitialWorldFeatureState(),
    metadata: { ...(config.metadata ?? {}), coreDomain: true, childDomain: true, deterministic: true, rendererAgnostic: true },
    createApi({ engine, baseApi }) {
      const featureTypes = new Map();
      const cellCompilationCache = new Map();
      const baseLoadSnapshot = baseApi.loadSnapshot.bind(baseApi);
      const baseReset = baseApi.reset.bind(baseApi);
      const read = () => baseApi.getState();
      const commit = (patch, eventName = "updated") => baseApi.update(patch, eventName);

      function invalidateCellsForBounds(bounds = null) {
        let removed = 0;
        for (const [cellId, entry] of cellCompilationCache) {
          if (!bounds || boundsIntersect(entry.bounds, bounds)) {
            cellCompilationCache.delete(cellId);
            removed += 1;
          }
        }
        return removed;
      }

      function registerFeatureType(type, handler = {}) {
        const normalizedHandler = normalizeWorldFeatureKitHandler(type, handler);
        const descriptor = createFeatureTypeDescriptor(type, normalizedHandler);
        featureTypes.set(descriptor.id, normalizedHandler);
        cellCompilationCache.clear();
        commit({ featureTypes: { ...(read().featureTypes ?? {}), [descriptor.id]: descriptor } }, "descriptorChanged");
        return clone(descriptor);
      }

      function registerFeature(input = {}) {
        const type = String(input.type ?? input.kind ?? "").trim();
        const handler = featureTypes.get(type);
        const normalizedInput = handler?.normalize ? handler.normalize(input) : input;
        const bounds = normalizedInput.bounds ?? handler?.calculateBounds?.(normalizedInput) ?? input.bounds ?? {};
        const fidelity = normalizedInput.fidelity ?? handler?.describeFidelity?.(normalizedInput) ?? input.fidelity;
        const candidate = { ...normalizedInput, type, bounds, fidelity };
        const handlerValidation = normalizedValidation(handler?.validate?.(candidate));
        if (!handlerValidation.valid) {
          throw new TypeError(`Invalid ${type} feature ${candidate.id ?? "unknown"}: ${handlerValidation.issues.join(", ")}`);
        }
        const feature = createWorldFeatureDefinition(candidate);
        const validation = validateWorldFeatureDefinition(feature);
        if (!validation.valid) throw new TypeError(`Invalid world feature ${feature.id}: ${validation.issues.join(", ")}`);
        const state = read();
        const previous = state.features?.[feature.id] ?? null;
        if (previous) invalidateCellsForBounds(previous.bounds);
        invalidateCellsForBounds(feature.bounds);
        commit({
          features: { ...(state.features ?? {}), [feature.id]: feature },
          lifecycle: { ...(state.lifecycle ?? {}), [feature.id]: feature.lifecycle }
        }, "descriptorChanged");
        return clone(feature);
      }

      function setLifecycle(id, lifecycle) {
        const key = String(id);
        const state = read();
        const feature = state.features?.[key];
        if (!feature) throw new RangeError(`Unknown world feature: ${key}.`);
        const nextLifecycle = normalizeFeatureLifecycle(lifecycle);
        const nextFeature = { ...feature, lifecycle: nextLifecycle };
        invalidateCellsForBounds(feature.bounds);
        commit({
          features: { ...state.features, [key]: nextFeature },
          lifecycle: { ...(state.lifecycle ?? {}), [key]: nextLifecycle }
        }, "updated");
        return clone(nextFeature);
      }

      function compileFeature(id, context = {}) {
        const feature = read().features?.[String(id)];
        if (!feature) throw new RangeError(`Unknown world feature: ${id}.`);
        const handler = featureTypes.get(feature.type);
        if (!handler?.compileContributions) throw new TypeError(`World feature type ${feature.type} has no contribution compiler.`);
        return flattenFeatureContributions(handler.compileContributions(feature, context));
      }

      function compileCell(cell, context = {}) {
        if (!cell?.id) throw new TypeError("World feature cell compilation requires a cell id.");
        const bounds = normalizeBounds(cell.bounds ?? {});
        const features = sortWorldFeatures(
          queryWorldFeatures(Object.values(read().features ?? {}), { bounds })
            .filter((feature) => feature.lifecycle !== "inactive")
        );
        const signature = stableSignature({
          bounds,
          baseFoundation: context.baseFoundation ?? {},
          features: features.map((feature) => ({
            ...feature,
            handlerVersion: featureTypes.get(feature.type)?.version ?? null
          }))
        });
        const foundation = context.foundation ?? engine.worldFoundation ?? engine.n?.worldFoundation;
        const cached = cellCompilationCache.get(String(cell.id));
        if (cached?.signature === signature) {
          let resolved = cached.resolved;
          if (foundation) {
            const current = foundation.getResolvedCell?.(cell.id);
            if (current && sameContributionIds(current, cached.contributions)) resolved = current;
            else {
              foundation.setContributions(cell.id, cached.contributions);
              resolved = foundation.resolveCell(cell.id, context.baseFoundation ?? {});
              cached.resolved = clone(resolved);
            }
          }
          commit({
            lastCompilation: {
              cellId: cell.id,
              featureIds: cached.features.map((entry) => entry.id),
              contributionIds: cached.contributions.map((entry) => entry.id),
              cacheHit: true
            }
          }, "updated");
          return { features: clone(cached.features), contributions: clone(cached.contributions), resolved: clone(resolved), cacheHit: true };
        }

        const contributions = flattenFeatureContributions(features.map((feature) => compileFeature(feature.id, { ...context, cell: { ...cell, bounds } })));
        let resolved = null;
        if (foundation) {
          foundation.setContributions(cell.id, contributions);
          resolved = foundation.resolveCell(cell.id, context.baseFoundation ?? {});
        }
        cellCompilationCache.set(String(cell.id), {
          signature,
          bounds,
          features: clone(features),
          contributions: clone(contributions),
          resolved: clone(resolved)
        });
        commit({
          lastCompilation: {
            cellId: cell.id,
            featureIds: features.map((entry) => entry.id),
            contributionIds: contributions.map((entry) => entry.id),
            cacheHit: false
          }
        }, "updated");
        return { features: clone(features), contributions: clone(contributions), resolved: clone(resolved), cacheHit: false };
      }

      const api = {
        registerFeatureType,
        hasFeatureType(type) { return featureTypes.has(String(type)); },
        getFeatureKit(type) { return featureTypes.get(String(type)) ?? null; },
        listFeatureTypes() { return Object.values(read().featureTypes ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
        registerFeature,
        unregisterFeature(id) {
          const key = String(id);
          const state = read();
          const feature = state.features?.[key];
          if (!feature) return false;
          invalidateCellsForBounds(feature.bounds);
          const features = { ...state.features };
          const lifecycle = { ...(state.lifecycle ?? {}) };
          delete features[key];
          delete lifecycle[key];
          commit({ features, lifecycle }, "updated");
          return true;
        },
        getFeature(id) { return clone(read().features?.[String(id)] ?? null); },
        listFeatures() { return Object.values(read().features ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
        queryFeatures(query = {}) { return queryWorldFeatures(Object.values(read().features ?? {}), query).map(clone); },
        setLifecycle,
        compileFeature,
        compileCell,
        releaseCompiledCell(cellId, options = {}) {
          const id = String(cellId);
          const removed = cellCompilationCache.delete(id);
          const foundation = options.foundation ?? engine.worldFoundation ?? engine.n?.worldFoundation;
          foundation?.removeCell?.(id);
          return removed;
        },
        getCompilationCacheState() {
          return Object.freeze({
            size: cellCompilationCache.size,
            cells: Object.freeze([...cellCompilationCache.entries()].map(([cellId, entry]) => Object.freeze({ cellId, bounds: clone(entry.bounds), signature: entry.signature })))
          });
        },
        getSampler(type) { return featureTypes.get(String(type))?.sample ?? null; },
        getSamplers() {
          return Object.fromEntries([...featureTypes.entries()].filter(([, handler]) => typeof handler.sample === "function").map(([type, handler]) => [type, handler.sample]));
        },
        loadSnapshot(snapshot = {}) {
          const state = snapshot.state ?? snapshot;
          for (const feature of Object.values(state.features ?? {})) {
            const validation = validateWorldFeatureDefinition(feature);
            if (!validation.valid) throw new TypeError(`Invalid world feature snapshot: ${validation.issues.join(", ")}`);
          }
          cellCompilationCache.clear();
          return baseLoadSnapshot(clonePortableValue(state, "world-feature-load-snapshot"));
        },
        reset(payload = {}) {
          cellCompilationCache.clear();
          const result = baseReset({ ...payload, initialState: createInitialWorldFeatureState() });
          if (featureTypes.size) {
            commit({ featureTypes: Object.fromEntries([...featureTypes].map(([type, handler]) => [type, createFeatureTypeDescriptor(type, handler)])) }, "descriptorChanged");
          }
          return result;
        }
      };
      return api;
    },
    install(context) {
      context.engine.worldFeatures = context.engine.n.worldFeatures;
      userInstall?.(context);
    }
  });
}

export default createWorldFeatureDomain;
