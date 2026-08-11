import { createDomainKit } from "../../../../../domain-kit.js";
import {
  normalizeShape,
  normalizeShapeDefinitionCommand,
  normalizeShapeRegistrySnapshot,
  normalizeShapeRemovalCommand,
  sameShapeValue
} from "../../shape-contracts.js";
import { shapeRegistryContract } from "./contracts.js";

function normalizeInitialShapes(value = []) {
  if (!Array.isArray(value)) throw new TypeError("Physics shape registry initialShapes must be an array.");
  const shapes = {};
  for (const input of value) {
    const shape = normalizeShape(input);
    if (shapes[shape.id] && !sameShapeValue(shapes[shape.id], shape)) {
      throw new TypeError(`Physics shape ${shape.id} appears with different initial content.`);
    }
    shapes[shape.id] = shape;
  }
  return Object.fromEntries(Object.keys(shapes).sort().map((id) => [id, shapes[id]]));
}

export function createShapeRegistryKit(config = {}) {
  const shapes = normalizeInitialShapes(config.initialShapes ?? []);
  return createDomainKit({
    ...config,
    manifestId: "shape-registry-kit",
    id: config.id ?? "shape-registry-kit",
    domain: "physics-shape-registry",
    domainPath: "n:physics:shape",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "shapeRegistry",
    requires: ["n:physics", "physics:shape-validation"],
    provides: ["n:physics:shape", "physics:shape-registry"],
    purpose: "Own the deterministic exact-once registry of portable Physics shape descriptors.",
    owns: ["shape registry state", "shape definition receipts", "stable shape query ordering"],
    doesNotOwn: ["collision detection", "provider shape objects", "mesh rendering", "automatic shape repair"],
    initialState: { shapes, order: Object.keys(shapes), shapeRevision: 0 },
    createApi({ baseApi }) {
      return {
        ...baseApi,
        getContract: shapeRegistryContract,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeShapeRegistrySnapshot(snapshot));
        },
        defineShape(command = {}) {
          const request = normalizeShapeDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.shapes[request.shape.id];
            if (existing && !sameShapeValue(existing, request.shape)) {
              throw new TypeError(`Physics shape ${request.shape.id} already exists with different content.`);
            }
            const changed = !existing;
            const nextShapes = changed ? { ...state.shapes, [request.shape.id]: request.shape } : state.shapes;
            const shapeRevision = changed ? state.shapeRevision + 1 : state.shapeRevision;
            return {
              patch: { shapes: nextShapes, order: Object.keys(nextShapes).sort(), shapeRevision },
              result: { shape: existing ?? request.shape, created: changed, shapeRevision }
            };
          });
        },
        removeShape(command = {}) {
          const request = normalizeShapeRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.shapes[request.shapeId];
            if (!existing) throw new TypeError(`Unknown Physics shape ${request.shapeId}.`);
            const nextShapes = { ...state.shapes };
            delete nextShapes[request.shapeId];
            const shapeRevision = state.shapeRevision + 1;
            return {
              patch: { shapes: nextShapes, order: Object.keys(nextShapes).sort(), shapeRevision },
              result: { shape: existing, removed: true, shapeRevision }
            };
          });
        },
        hasShape(shapeId) {
          return Object.hasOwn(baseApi.getState().shapes, String(shapeId));
        },
        getShape(shapeId) {
          return baseApi.getState().shapes[String(shapeId)] ?? null;
        },
        listShapes() {
          const state = baseApi.getState();
          return state.order.map((id) => state.shapes[id]);
        }
      };
    }
  });
}

export default createShapeRegistryKit;
