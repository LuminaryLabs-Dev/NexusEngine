import { createDomainKit } from "../../../../../domain-kit.js";
import { sameMaterialValue } from "../../material-contracts.js";
import {
  normalizeMaterialDefinitionCommand,
  normalizeMaterialId,
  normalizeMaterialRemovalCommand,
  normalizePhysicsMaterialSnapshot,
  physicsMaterialContract
} from "./contracts.js";

export function createPhysicsMaterialKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-material-kit",
    id: config.id ?? "physics-material-kit",
    domain: "physics-material",
    domainPath: "n:physics:material",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsMaterial",
    requires: [
      "n:physics",
      "physics:state-schema",
      "physics:command-schema",
      "physics:event-schema",
      "physics:friction-material",
      "physics:restitution-material",
      "physics:density-material",
      "physics:surface-material",
      "physics:material-combine-policy"
    ],
    provides: ["n:physics:material", "physics:material", "physics:material-registry"],
    purpose: "Own immutable portable physical material records and resolve material pairs through the public combine-policy capability.",
    owns: ["physical material identity", "material registry", "material revision", "material definition receipts"],
    doesNotOwn: ["visual materials", "colliders", "contacts", "solver execution", "provider handles"],
    initialState: {
      materials: {},
      order: [],
      materialRevision: 0
    },
    createApi({ baseApi, engine }) {
      const readMaterial = (materialId) => {
        const id = normalizeMaterialId(materialId);
        return baseApi.getState().materials[id] ?? null;
      };

      return {
        ...baseApi,
        getContract: physicsMaterialContract,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizePhysicsMaterialSnapshot(snapshot));
        },
        defineMaterial(command = {}) {
          const request = normalizeMaterialDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.materials[request.material.id];
            if (existing && !sameMaterialValue(existing, request.material)) {
              throw new TypeError(`Physics material ${request.material.id} already exists with different content.`);
            }
            const created = !existing;
            const materials = created
              ? { ...state.materials, [request.material.id]: request.material }
              : state.materials;
            const materialRevision = created ? state.materialRevision + 1 : state.materialRevision;
            return {
              patch: {
                materials,
                order: Object.keys(materials).sort(),
                materialRevision
              },
              result: {
                material: request.material,
                created,
                materialRevision
              }
            };
          });
        },
        removeMaterial(command = {}) {
          const request = normalizeMaterialRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const existing = state.materials[request.materialId];
            if (!existing) throw new TypeError(`Unknown Physics material ${request.materialId}.`);
            const materials = { ...state.materials };
            delete materials[request.materialId];
            const materialRevision = state.materialRevision + 1;
            return {
              patch: {
                materials,
                order: Object.keys(materials).sort(),
                materialRevision
              },
              result: {
                material: existing,
                removed: true,
                materialRevision
              }
            };
          });
        },
        hasMaterial(materialId) {
          return readMaterial(materialId) !== null;
        },
        getMaterial(materialId) {
          return readMaterial(materialId);
        },
        listMaterials() {
          const state = baseApi.getState();
          return state.order.map((id) => state.materials[id]);
        },
        resolvePair(leftMaterialId, rightMaterialId, policy) {
          const left = readMaterial(leftMaterialId);
          const right = readMaterial(rightMaterialId);
          if (!left) throw new TypeError(`Unknown Physics material ${leftMaterialId}.`);
          if (!right) throw new TypeError(`Unknown Physics material ${rightMaterialId}.`);
          const combineApi = engine.n.physicsMaterialCombinePolicy;
          if (!combineApi?.resolve) throw new Error("Physics material pair resolution requires physics:material-combine-policy.");
          return combineApi.resolve({ left, right, ...(policy === undefined ? {} : { policy }) });
        }
      };
    }
  });
}

export default createPhysicsMaterialKit;
