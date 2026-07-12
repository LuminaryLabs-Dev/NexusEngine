import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createComputeBufferDescriptor,
  createComputeGraphDescriptor,
  createComputeKernelDescriptor,
  validateComputeGraphDescriptor
} from "./descriptors.js";
import {
  createComputeExecutionRequest,
  normalizeComputeExecutionResult,
  validateComputeProvider
} from "./provider.js";

export * from "./descriptors.js";
export * from "./provider.js";

export const CORE_COMPUTE_VERSION = "0.1.0";

const ComputeState = defineResource("core.compute.state");
const ComputeConfigured = defineEvent("core.compute.configured");
const ComputeDescriptorChanged = defineEvent("core.compute.descriptor-changed");
const ComputeGraphExecuted = defineEvent("core.compute.graph-executed");
const ComputeReset = defineEvent("core.compute.reset");
const ComputeSnapshotLoaded = defineEvent("core.compute.snapshot-loaded");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function mapById(values = [], factory) {
  const entries = {};
  for (const value of values ?? []) {
    const descriptor = factory(value);
    if (entries[descriptor.id]) throw new TypeError(`Duplicate compute descriptor id: ${descriptor.id}.`);
    entries[descriptor.id] = descriptor;
  }
  return entries;
}

function initialState(config = {}) {
  const buffers = mapById(config.buffers, createComputeBufferDescriptor);
  const kernels = mapById(config.kernels, createComputeKernelDescriptor);
  const graphs = mapById(config.graphs, (graph) => createComputeGraphDescriptor(graph, { buffers, kernels }));
  return {
    version: CORE_COMPUTE_VERSION,
    status: "ready",
    optional: true,
    sequence: 0,
    descriptors: { buffers, kernels, graphs },
    provider: { id: null, configured: false },
    lastExecution: null
  };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) runtimes.set(world, { provider: null, engine: null });
  return runtimes.get(world);
}

function descriptorSnapshot(state) {
  return clone(state?.descriptors ?? { buffers: {}, kernels: {}, graphs: {} });
}

function validateSnapshot(snapshot = {}) {
  const buffers = mapById(Object.values(snapshot.descriptors?.buffers ?? {}), createComputeBufferDescriptor);
  const kernels = mapById(Object.values(snapshot.descriptors?.kernels ?? {}), createComputeKernelDescriptor);
  const graphs = mapById(Object.values(snapshot.descriptors?.graphs ?? {}), (graph) => createComputeGraphDescriptor(graph, { buffers, kernels }));
  return {
    ...initialState(),
    ...clone(snapshot),
    version: CORE_COMPUTE_VERSION,
    status: "ready",
    descriptors: { buffers, kernels, graphs },
    provider: { id: null, configured: false }
  };
}

export function createCoreComputeKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-compute-domain",
    domain: "compute",
    domainPath: config.domainPath ?? "n:compute",
    apiName: config.apiName ?? "coreCompute",
    version: CORE_COMPUTE_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["buffers", "kernels", "graph", "dispatch", "provider", "snapshot", "reset"],
    resources: { ComputeState },
    events: {
      ComputeConfigured,
      ComputeDescriptorChanged,
      ComputeGraphExecuted,
      ComputeReset,
      ComputeSnapshotLoaded
    },
    metadata: {
      purpose: "Optional renderer-neutral parallel compute descriptors, dependency graphs, dispatch plans, and provider execution boundary.",
      owns: [
        "compute buffer descriptors",
        "compute kernel descriptors",
        "compute dependency graphs",
        "dispatch dimensions",
        "provider-neutral execution requests",
        "serializable execution summaries"
      ],
      doesNotOwn: [
        "materials or lighting",
        "render-pass construction",
        "GPUDevice creation",
        "GPU command submission",
        "Worker or OffscreenCanvas lifecycle",
        "gameplay meaning",
        "physics backend implementation"
      ],
      optional: true,
      rendererAgnostic: true,
      backendNeutral: true,
      deterministicGraphOrdering: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      ensureRuntime(world);
      world.setResource(ComputeState, initialState(config));
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      runtime.engine = engine;

      function getState() {
        return world.getResource(ComputeState);
      }

      function setState(next, event, payload = {}) {
        world.setResource(ComputeState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      }

      function updateDescriptors(type, id, descriptor) {
        const state = getState();
        const descriptors = descriptorSnapshot(state);
        descriptors[type] = { ...descriptors[type], [id]: descriptor };
        const next = {
          ...state,
          sequence: Number(state.sequence ?? 0) + 1,
          descriptors
        };
        runtime.provider?.syncDescriptors?.(clone(descriptors));
        setState(next, ComputeDescriptorChanged, { type, id });
        return clone(descriptor);
      }

      const api = {
        getState: () => clone(getState()),
        getSnapshot: () => clone(getState()),
        getProvider: () => runtime.provider,
        setProvider(provider) {
          const nextProvider = validateComputeProvider(provider);
          if (runtime.provider && runtime.provider !== nextProvider) runtime.provider.dispose?.();
          runtime.provider = nextProvider;
          nextProvider.initialize?.({ engine, world, descriptors: descriptorSnapshot(getState()) });
          nextProvider.syncDescriptors?.(descriptorSnapshot(getState()));
          const state = getState();
          setState({
            ...state,
            sequence: Number(state.sequence ?? 0) + 1,
            provider: { id: nextProvider.id, configured: true }
          }, ComputeConfigured, { providerId: nextProvider.id });
          return nextProvider.id;
        },
        disposeProvider() {
          runtime.provider?.dispose?.();
          runtime.provider = null;
          const state = getState();
          setState({
            ...state,
            sequence: Number(state.sequence ?? 0) + 1,
            provider: { id: null, configured: false }
          }, ComputeConfigured, { providerId: null });
          return true;
        },
        registerBuffer(input) {
          const descriptor = createComputeBufferDescriptor(input);
          return updateDescriptors("buffers", descriptor.id, descriptor);
        },
        registerKernel(input) {
          const descriptor = createComputeKernelDescriptor(input);
          return updateDescriptors("kernels", descriptor.id, descriptor);
        },
        registerGraph(input) {
          const state = getState();
          const descriptor = createComputeGraphDescriptor(input, state.descriptors);
          return updateDescriptors("graphs", descriptor.id, descriptor);
        },
        getBuffer(id) {
          return clone(getState().descriptors.buffers[String(id)] ?? null);
        },
        getKernel(id) {
          return clone(getState().descriptors.kernels[String(id)] ?? null);
        },
        getGraph(id) {
          return clone(getState().descriptors.graphs[String(id)] ?? null);
        },
        listBuffers() {
          return Object.values(getState().descriptors.buffers).map(clone);
        },
        listKernels() {
          return Object.values(getState().descriptors.kernels).map(clone);
        },
        listGraphs() {
          return Object.values(getState().descriptors.graphs).map(clone);
        },
        validateGraph(idOrDescriptor) {
          const state = getState();
          const descriptor = typeof idOrDescriptor === "string"
            ? state.descriptors.graphs[idOrDescriptor]
            : idOrDescriptor;
          return descriptor
            ? validateComputeGraphDescriptor(descriptor, state.descriptors)
            : { valid: false, errors: [`Unknown compute graph: ${idOrDescriptor}.`] };
        },
        getExecutionPlan(id) {
          const graph = getState().descriptors.graphs[String(id)];
          if (!graph) throw new RangeError(`Unknown compute graph: ${id}.`);
          return {
            graphId: graph.id,
            executionOrder: clone(graph.executionOrder),
            nodes: clone(graph.nodes)
          };
        },
        async executeGraph(id, input = {}, context = {}) {
          if (!runtime.provider) throw new Error("Core Compute cannot execute without a provider.");
          const state = getState();
          const graph = state.descriptors.graphs[String(id)];
          if (!graph) throw new RangeError(`Unknown compute graph: ${id}.`);
          const request = createComputeExecutionRequest({
            graph,
            executionOrder: graph.executionOrder,
            buffers: state.descriptors.buffers,
            kernels: state.descriptors.kernels,
            input,
            context
          });
          const result = normalizeComputeExecutionResult(
            await runtime.provider.executeGraph(request),
            request,
            runtime.provider.id
          );
          const next = {
            ...state,
            sequence: Number(state.sequence ?? 0) + 1,
            lastExecution: result
          };
          setState(next, ComputeGraphExecuted, { result });
          return clone(result);
        },
        loadSnapshot(snapshot = {}) {
          const next = validateSnapshot(snapshot);
          if (runtime.provider) {
            next.provider = { id: runtime.provider.id, configured: true };
            runtime.provider.syncDescriptors?.(descriptorSnapshot(next));
          }
          return setState(next, ComputeSnapshotLoaded);
        },
        reset() {
          runtime.provider?.reset?.();
          const next = initialState(config);
          if (runtime.provider) {
            next.provider = { id: runtime.provider.id, configured: true };
            runtime.provider.syncDescriptors?.(descriptorSnapshot(next));
          }
          return setState(next, ComputeReset);
        }
      };

      engine.coreCompute = api;
      return api;
    }
  });
}

export default createCoreComputeKit;
