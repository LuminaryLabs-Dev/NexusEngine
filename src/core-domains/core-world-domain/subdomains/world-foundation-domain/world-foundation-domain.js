import { createCoreCapabilityKit } from "../../../../core-kits/core-capability-kit.js";
import { clonePortableValue } from "../../portable.js";
import { createFoundationContribution } from "./contracts.js";
import { createInitialWorldFoundationState } from "./state.js";
import { validateFoundationContribution, validateResolvedFoundation } from "./validation.js";
import { createFoundationDefinition } from "./kits/foundation-definition-kit/index.js";
import { composeFoundationContributions } from "./kits/foundation-composition-kit/index.js";
import { sampleFoundationChannel, sampleFoundationElevation } from "./kits/foundation-sampling-kit/index.js";
import { createWorldFoundationCellProvider } from "./kits/foundation-cell-resolution-kit/index.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createWorldFoundationDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-world-foundation-domain",
    domain: "core-world-foundation",
    domainPath: config.domainPath ?? "n:world:foundation",
    parentDomainPath: config.parentDomainPath ?? "n:world",
    apiName: config.apiName ?? "worldFoundation",
    requires: [...(config.requires ?? []), "n:world"],
    purpose: "Authoritative resolved physical-world foundation from deterministic bounded contributions.",
    owns: ["resolved elevation", "resolved normals", "resolved slopes", "base material regions", "surface continuity", "ground collision descriptors", "resolved cell foundation"],
    doesNotOwn: ["mountain meaning", "river meaning", "forest meaning", "settlement meaning", "renderer meshes", "GPU resources"],
    services: ["definition", "contribution", "composition", "sampling", "cell-resolution", "snapshot"],
    initialState: createInitialWorldFoundationState(),
    metadata: { ...(config.metadata ?? {}), coreDomain: true, childDomain: true, rendererAgnostic: true, deterministic: true },
    createApi({ engine, baseApi }) {
      const baseLoadSnapshot = baseApi.loadSnapshot.bind(baseApi);
      const baseReset = baseApi.reset.bind(baseApi);
      const read = () => baseApi.getState();
      const commit = (patch, eventName = "updated") => baseApi.update(patch, eventName);

      function registerDefinition(input) {
        const definition = createFoundationDefinition(input);
        commit({ definitions: { ...(read().definitions ?? {}), [definition.id]: definition } }, "descriptorChanged");
        return clone(definition);
      }

      function setContributions(cellId, inputs = []) {
        const id = String(cellId ?? "").trim();
        if (!id) throw new TypeError("Foundation contributions require a cell id.");
        const contributions = inputs.map((input) => createFoundationContribution({ ...input, cellId: input.cellId ?? id }));
        for (const contribution of contributions) {
          const result = validateFoundationContribution(contribution);
          if (!result.valid) throw new TypeError(`Invalid foundation contribution ${contribution.id}: ${result.issues.join(", ")}`);
        }
        commit({ contributionsByCell: { ...(read().contributionsByCell ?? {}), [id]: contributions } }, "descriptorChanged");
        return clone(contributions);
      }

      function resolveCell(cellId, base = {}) {
        const id = String(cellId ?? "").trim();
        if (!id) throw new TypeError("Foundation resolution requires a cell id.");
        const state = read();
        const revision = Number(state.revisionByCell?.[id] ?? 0) + 1;
        const resolved = composeFoundationContributions(id, base, state.contributionsByCell?.[id] ?? [], revision);
        const validation = validateResolvedFoundation(resolved);
        if (!validation.valid) throw new TypeError(`Invalid resolved foundation ${id}: ${validation.issues.join(", ")}`);
        commit({
          resolvedCells: { ...(state.resolvedCells ?? {}), [id]: resolved },
          revisionByCell: { ...(state.revisionByCell ?? {}), [id]: revision }
        }, "descriptorChanged");
        return clone(resolved);
      }

      function removeCell(cellId) {
        const id = String(cellId);
        const state = read();
        const contributionsByCell = { ...(state.contributionsByCell ?? {}) };
        const resolvedCells = { ...(state.resolvedCells ?? {}) };
        const revisionByCell = { ...(state.revisionByCell ?? {}) };
        const existed = Boolean(contributionsByCell[id] || resolvedCells[id]);
        delete contributionsByCell[id];
        delete resolvedCells[id];
        delete revisionByCell[id];
        if (existed) commit({ contributionsByCell, resolvedCells, revisionByCell }, "updated");
        return existed;
      }

      const api = {
        registerDefinition,
        getDefinition(id) { return clone(read().definitions?.[String(id)] ?? null); },
        listDefinitions() { return Object.values(read().definitions ?? {}).sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
        setContributions,
        getContributions(cellId) { return clone(read().contributionsByCell?.[String(cellId)] ?? []); },
        resolveCell,
        getResolvedCell(cellId) { return clone(read().resolvedCells?.[String(cellId)] ?? null); },
        removeCell,
        sampleElevation(cellId, point, samplers = {}) { return sampleFoundationElevation(read().resolvedCells?.[String(cellId)], point, samplers); },
        sampleChannel(cellId, channel, point, samplers = {}) { return sampleFoundationChannel(read().resolvedCells?.[String(cellId)], channel, point, samplers); },
        createCellProvider(options = {}) { return createWorldFoundationCellProvider(options); },
        loadSnapshot(snapshot = {}) {
          const state = snapshot.state ?? snapshot;
          for (const contributions of Object.values(state.contributionsByCell ?? {})) {
            for (const contribution of contributions) {
              const validation = validateFoundationContribution(contribution);
              if (!validation.valid) throw new TypeError(`Invalid foundation snapshot contribution: ${validation.issues.join(", ")}`);
            }
          }
          return baseLoadSnapshot(clonePortableValue(state, "world-foundation-load-snapshot"));
        },
        reset(payload = {}) { return baseReset({ ...payload, initialState: createInitialWorldFoundationState() }); }
      };
      return api;
    },
    install(context) {
      context.engine.worldFoundation = context.engine.n.worldFoundation;
      userInstall?.(context);
    }
  });
}

export default createWorldFoundationDomain;
