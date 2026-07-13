import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";
import { clonePortableValue } from "../../portable.js";
import { createWorldFeatureDefinition } from "./contracts.js";
import { validateWorldFeatureDefinition } from "./validation.js";
import { createInitialWorldFeatureState } from "./state.js";
import { createFeatureTypeDescriptor } from "./kits/feature-registry-kit/index.js";
import { normalizeFeatureLifecycle } from "./kits/feature-lifecycle-kit/index.js";
import { queryWorldFeatures } from "./kits/feature-query-kit/index.js";
import { flattenFeatureContributions, sortWorldFeatures } from "./kits/feature-composition-kit/index.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

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
    purpose: "Bounded semantic world feature identity, lifecycle, queries, compilation, and foundation contribution descriptors.",
    owns: ["world feature identity", "feature type", "feature bounds", "feature seed", "feature priority", "feature dependencies", "feature lifecycle", "feature contribution descriptors", "semantic fidelity requirements"],
    doesNotOwn: ["resolved foundation", "renderer meshes", "GPU resources", "generic graphics LOD policy"],
    services: ["definition", "registry", "lifecycle", "query", "composition", "compile", "snapshot"],
    initialState: createInitialWorldFeatureState(),
    metadata: { ...(config.metadata ?? {}), coreDomain: true, childDomain: true, deterministic: true, rendererAgnostic: true },
    createApi({ engine, baseApi }) {
      const featureTypes = new Map();
      const baseLoadSnapshot = baseApi.loadSnapshot.bind(baseApi);
      const baseReset = baseApi.reset.bind(baseApi);
      const read = () => baseApi.getState();
      const commit = (patch, eventName = "updated") => baseApi.update(patch, eventName);

      function registerFeatureType(type, handler = {}) {
        const descriptor = createFeatureTypeDescriptor(type, handler);
        featureTypes.set(descriptor.id, handler);
        commit({ featureTypes: { ...(read().featureTypes ?? {}), [descriptor.id]: descriptor } }, "descriptorChanged");
        return clone(descriptor);
      }

      function registerFeature(input = {}) {
        const type = String(input.type ?? input.kind ?? "").trim();
        const handler = featureTypes.get(type);
        const normalizedInput = handler?.normalize ? handler.normalize(input) : input;
        const feature = createWorldFeatureDefinition(normalizedInput);
        const validation = validateWorldFeatureDefinition(feature);
        if (!validation.valid) throw new TypeError(`Invalid world feature ${feature.id}: ${validation.issues.join(", ")}`);
        const state = read();
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
        if (!handler?.compile) throw new TypeError(`World feature type ${feature.type} has no compiler.`);
        return flattenFeatureContributions(handler.compile(feature, context));
      }

      function compileCell(cell, context = {}) {
        if (!cell?.id) throw new TypeError("World feature cell compilation requires a cell id.");
        const features = sortWorldFeatures(queryWorldFeatures(Object.values(read().features ?? {}), { bounds: cell.bounds }));
        const contributions = flattenFeatureContributions(features.map((feature) => compileFeature(feature.id, { ...context, cell })));
        const foundation = context.foundation ?? engine.worldFoundation ?? engine.n?.worldFoundation;
        let resolved = null;
        if (foundation) {
          foundation.setContributions(cell.id, contributions);
          resolved = foundation.resolveCell(cell.id, context.baseFoundation ?? {});
        }
        commit({
          lastCompilation: {
            cellId: cell.id,
            featureIds: features.map((entry) => entry.id),
            contributionIds: contributions.map((entry) => entry.id)
          }
        }, "updated");
        return { features: clone(features), contributions: clone(contributions), resolved: clone(resolved) };
      }

      const api = {
        registerFeatureType,
        hasFeatureType(type) { return featureTypes.has(String(type)); },
        listFeatureTypes() { return Object.values(read().featureTypes ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
        registerFeature,
        unregisterFeature(id) {
          const key = String(id);
          const state = read();
          if (!state.features?.[key]) return false;
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
          return baseLoadSnapshot(clonePortableValue(state, "world-feature-load-snapshot"));
        },
        reset(payload = {}) {
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
