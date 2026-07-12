import { createCoreCapabilityKit } from "../../core-capability-kit.js";
import {
  RENDER_LAYER_GRAPH_CAPABILITIES,
  assertRenderLayerGraph,
  createRenderLayerGraph,
  createRenderPassContract,
  resolveRenderLayerGraph,
  validateRenderLayerGraph
} from "./contract.js";

export * from "./contract.js";

const clone = value => value === undefined ? undefined : structuredClone(value);

export function createRenderLayerGraphKit(config = {}) {
  const initialGraph = createRenderLayerGraph(config.graph ?? config);
  const initialValidation = validateRenderLayerGraph(initialGraph, config.validationOptions);
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-core-graphics-render-layer-graph-kit",
    domain: "core-graphics-render-layer-graph",
    apiName: config.apiName ?? "renderLayerGraph",
    purpose: "Renderer-agnostic render pass contracts, dependency ordering, resource-flow validation, and final scene-content boundaries.",
    owns: [
      "render pass contracts",
      "render pass dependency graph",
      "render resource flow",
      "render layer validation",
      "final scene-content boundary"
    ],
    doesNotOwn: [
      "renderer implementation",
      "WebGL or WebGPU side effects",
      "game-specific pass selection",
      "world semantic truth"
    ],
    services: ["render-layer-graph", "render-pass-contract", "render-layer-validation"],
    provides: [...RENDER_LAYER_GRAPH_CAPABILITIES],
    initialState: {
      graph: clone(initialGraph),
      validation: clone(initialValidation)
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      deterministic: true,
      snapshotSafe: true
    },
    createApi({ baseApi }) {
      const validateOptions = config.validationOptions ?? {};
      const readGraph = () => createRenderLayerGraph(baseApi.getState()?.graph ?? initialGraph);
      const commitGraph = graphInput => {
        const graph = createRenderLayerGraph(graphInput);
        const validation = validateRenderLayerGraph(graph, validateOptions);
        baseApi.update({ graph: clone(graph), validation: clone(validation) }, "descriptorChanged");
        return validation;
      };
      return {
        createPass: createRenderPassContract,
        createGraph: createRenderLayerGraph,
        getGraph: readGraph,
        setGraph: commitGraph,
        validate(graphInput = readGraph(), options = validateOptions) {
          return validateRenderLayerGraph(graphInput, options);
        },
        assertValid(graphInput = readGraph(), options = validateOptions) {
          return assertRenderLayerGraph(graphInput, options);
        },
        resolve(graphInput = readGraph()) {
          return resolveRenderLayerGraph(graphInput);
        },
        getPass(passId) {
          return readGraph().passes.find(pass => pass.id === String(passId)) ?? null;
        },
        getOrderedPasses() {
          return resolveRenderLayerGraph(readGraph()).orderedPasses;
        }
      };
    }
  });
}
