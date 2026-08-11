import { createDomainKit } from "../../../../../domain-kit.js";
import {
  detectionBoundsOverlap,
  normalizeDetectionProxy,
  normalizeProxyDefinitionCommand,
  normalizeProxyRemovalCommand,
  normalizeProxyReplacementCommand,
  normalizeSpatialPartitionSnapshot,
  sameDetectionValue
} from "../../detection-contracts.js";
import { spatialPartitionContract } from "./contracts.js";

function initialProxyState(inputs = []) {
  if (!Array.isArray(inputs)) throw new TypeError("Physics spatial partition initialProxies must be an array.");
  const proxies = {};
  for (const input of inputs) {
    const proxy = normalizeDetectionProxy(input);
    if (proxies[proxy.id] && !sameDetectionValue(proxies[proxy.id], proxy)) {
      throw new TypeError(`Physics Detection proxy ${proxy.id} has conflicting initial content.`);
    }
    proxies[proxy.id] = proxy;
  }
  return Object.fromEntries(Object.keys(proxies).sort().map((id) => [id, proxies[id]]));
}

function unsupportedMutation() {
  throw new TypeError("Physics spatial partition mutations require a normalized exact-once proxy command.");
}

export function createSpatialPartitionKit(config = {}) {
  const proxies = initialProxyState(config.initialProxies ?? []);
  return createDomainKit({
    ...config,
    manifestId: "spatial-partition-kit",
    id: config.id ?? "spatial-partition-kit",
    domain: "physics-spatial-partition",
    domainPath: "n:physics:detection",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsSpatialPartition",
    requires: ["n:physics", "n:physics:shape", "n:physics:collider"],
    provides: ["physics:spatial-partition"],
    purpose: "Own deterministic portable proxy indexing without owning provider acceleration structures.",
    owns: ["broad-phase proxy registry", "proxy bounds", "proxy query ordering", "exact-once proxy receipts"],
    doesNotOwn: ["provider trees", "shape definitions", "collider lifecycle", "contact generation", "solver execution"],
    initialState: { proxies, order: Object.keys(proxies), partitionRevision: 0 },
    createApi({ baseApi }) {
      const readProxy = (proxyId) => baseApi.getState().proxies[String(proxyId)] ?? null;
      const commit = (state, proxyId, proxy, changed) => {
        const nextProxies = changed ? { ...state.proxies, [proxyId]: proxy } : state.proxies;
        const partitionRevision = changed ? state.partitionRevision + 1 : state.partitionRevision;
        return {
          patch: { proxies: nextProxies, order: Object.keys(nextProxies).sort(), partitionRevision },
          result: { proxy: changed ? proxy : state.proxies[proxyId], changed, partitionRevision }
        };
      };
      return {
        ...baseApi,
        getContract: () => spatialPartitionContract,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeSpatialPartitionSnapshot(snapshot));
        },
        defineProxy(command = {}) {
          const request = normalizeProxyDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.proxies[request.proxy.id];
            if (existing && !sameDetectionValue(existing, request.proxy)) {
              throw new TypeError(`Physics Detection proxy ${request.proxy.id} already exists with different content.`);
            }
            return commit(state, request.proxy.id, request.proxy, !existing);
          });
        },
        replaceProxy(command = {}) {
          const request = normalizeProxyReplacementCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.proxies[request.proxy.id];
            if (!existing) throw new TypeError(`Unknown Physics Detection proxy ${request.proxy.id}.`);
            if (request.expectedRevision !== undefined && existing.revision !== request.expectedRevision) {
              throw new TypeError(`Physics Detection proxy ${request.proxy.id} expected revision ${request.expectedRevision}, received ${existing.revision}.`);
            }
            const changed = !sameDetectionValue(existing, request.proxy);
            if (changed && request.proxy.revision <= existing.revision) {
              throw new TypeError(`Physics Detection proxy ${request.proxy.id} changed content requires a greater revision.`);
            }
            return commit(state, request.proxy.id, request.proxy, changed);
          });
        },
        removeProxy(command = {}) {
          const request = normalizeProxyRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.proxies[request.proxyId];
            if (!existing) throw new TypeError(`Unknown Physics Detection proxy ${request.proxyId}.`);
            if (request.expectedRevision !== undefined && existing.revision !== request.expectedRevision) {
              throw new TypeError(`Physics Detection proxy ${request.proxyId} expected revision ${request.expectedRevision}, received ${existing.revision}.`);
            }
            const nextProxies = { ...state.proxies };
            delete nextProxies[request.proxyId];
            const partitionRevision = state.partitionRevision + 1;
            return {
              patch: { proxies: nextProxies, order: Object.keys(nextProxies).sort(), partitionRevision },
              result: { proxy: existing, removed: true, partitionRevision }
            };
          });
        },
        hasProxy(proxyId) {
          return readProxy(proxyId) !== null;
        },
        getProxy(proxyId) {
          return readProxy(proxyId);
        },
        listProxies() {
          const state = baseApi.getState();
          return state.order.map((id) => state.proxies[id]);
        },
        queryBounds(bounds) {
          const state = baseApi.getState();
          return state.order.map((id) => state.proxies[id]).filter((proxy) => detectionBoundsOverlap(proxy.bounds, bounds));
        },
        configure: unsupportedMutation,
        update: unsupportedMutation,
        setDescriptor: unsupportedMutation,
        applyCommand: unsupportedMutation
      };
    }
  });
}

export default createSpatialPartitionKit;
