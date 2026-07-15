import { createCoreCapabilityKit } from "../../core-kits/core-capability-kit.js";
import { createWorldBuilderRuntime } from "./kits/world-builder-runtime-kit/index.js";
import { createInitialWorldState } from "./state.js";
import { validateCoreWorldState } from "./validation.js";
import { createWorldFoundationDomain } from "./subdomains/world-foundation-domain/index.js";
import { createWorldFeatureDomain } from "./subdomains/world-feature-domain/index.js";
import { createLandformFeatureDomain } from "./subdomains/world-feature-domain/subdomains/landform-feature-domain/index.js";
import { createHydrologyFeatureDomain } from "./subdomains/world-feature-domain/subdomains/hydrology-feature-domain/index.js";
import { createEcologyFeatureDomain } from "./subdomains/world-feature-domain/subdomains/ecology-feature-domain/index.js";
import { createSettlementFeatureDomain } from "./subdomains/world-feature-domain/subdomains/settlement-feature-domain/index.js";
import { createAtmosphereFeatureDomain } from "./subdomains/world-feature-domain/subdomains/atmosphere-feature-domain/index.js";

const EVENT_NAMES = [
  "configured",
  "updated",
  "reset",
  "snapshotLoaded",
  "descriptorChanged",
  "worldRegistered",
  "worldRemoved",
  "focusChanged",
  "cellsChanged",
  "providerSnapshotsRestored",
  "snapshotReconciled"
];

function installIfMissing(engine, kit) {
  if (!kit) return null;
  if (engine.domainServiceKits?.[kit.id]) return kit;
  return engine.installKit(kit);
}

function featureFamilyConfig(config, name, aliases = []) {
  for (const key of [name, ...aliases]) {
    if (config[key] !== undefined) return config[key];
    if (config.features && typeof config.features === "object" && config.features[key] !== undefined) return config.features[key];
    if (config.features?.families?.[key] !== undefined) return config.features.families[key];
  }
  return {};
}

export function createCoreWorldDomain(config = {}) {
  const userInstall = config.install;
  return createCoreCapabilityKit({
    ...config,
    domain: "core-world",
    domainPath: config.domainPath ?? "n:world",
    apiName: config.apiName ?? "coreWorld",
    eventNames: config.eventNames ?? EVENT_NAMES,
    purpose: "Host-agnostic world identity, partitioning, cells, surfaces, effects, providers, composition, features, and snapshots.",
    owns: ["world identity", "world definitions", "world partitions", "world cells", "world surfaces", "world effect descriptors", "world provider contracts", "world composition", "world snapshots"],
    doesNotOwn: ["terrain generation", "foliage generation", "renderer meshes", "GPU resources", "physics resolution", "game-specific world content"],
    services: ["world-definition", "world-partition", "world-cell", "world-surface", "world-effects", "world-builder", "world-snapshot"],
    initialState: createInitialWorldState(config),
    metadata: { ...(config.metadata ?? {}), piecesFirst: true, coreDomain: true, hostAgnostic: true, rendererAgnostic: true },
    createApi({ engine, baseApi }) {
      const runtime = createWorldBuilderRuntime({
        getState: baseApi.getState,
        diagnosticLimit: config.diagnosticLimit,
        commit(patch, eventName) {
          return baseApi.update(patch, eventName);
        }
      });
      const baseLoadSnapshot = baseApi.loadSnapshot.bind(baseApi);
      const baseReset = baseApi.reset.bind(baseApi);

      const api = {
        registerWorld: runtime.registerWorld,
        removeWorld: runtime.removeWorld,
        setFocus: runtime.setFocus,
        updateWorld: runtime.updateWorld,
        getWorld: runtime.getWorld,
        getWorldDefinition: runtime.getWorldDefinition,
        getCell: runtime.getCell,
        getCellRecord: runtime.getCellRecord,
        getActiveCells: runtime.getActiveCells,
        getEffects: runtime.getEffects,
        getDiagnostics: runtime.getDiagnostics,
        snapshotWorld: runtime.snapshot,
        snapshotWorlds: runtime.snapshotAll,
        restoreProviderSnapshots: runtime.restoreProviderSnapshots,
        validateWorldState: runtime.validateState,
        loadSnapshot(snapshot = {}) {
          const coordinationState = snapshot.state ?? snapshot;
          const validation = validateCoreWorldState(coordinationState);
          if (!validation.valid) throw new TypeError(`Loaded CoreWorldState is invalid: ${validation.issues.join(", ")}`);
          runtime.disposeRuntime({ clearDefinitions: false, reason: "snapshot-load" });
          baseLoadSnapshot(coordinationState);
          runtime.markLoadedCellsForRestore();
          for (const [worldId, worldSnapshot] of Object.entries(snapshot.worlds ?? {})) {
            if (runtime.getWorldDefinition(worldId) && worldSnapshot?.providerSnapshots) {
              runtime.restoreProviderSnapshots(worldId, worldSnapshot.providerSnapshots);
            }
          }
          return baseApi.getState();
        },
        reset(payload = {}) {
          runtime.disposeRuntime({ clearDefinitions: true, reason: "domain-reset" });
          return baseReset(payload);
        },
        resetWorlds: runtime.reset
      };
      return api;
    },
    install(context) {
      const { engine } = context;
      engine.coreWorld = engine.n.coreWorld;
      if (config.childDomains !== false) {
        if (config.foundation !== false) installIfMissing(engine, createWorldFoundationDomain(config.foundation ?? {}));
        if (config.features !== false) {
          installIfMissing(engine, createWorldFeatureDomain(typeof config.features === "object" ? config.features : {}));
          if (config.featureFamilies !== false) {
            const landforms = featureFamilyConfig(config, "landforms", ["landform"]);
            const hydrology = featureFamilyConfig(config, "hydrology");
            const ecology = featureFamilyConfig(config, "ecology");
            const settlement = featureFamilyConfig(config, "settlement", ["settlements"]);
            const atmosphere = featureFamilyConfig(config, "atmosphere");
            if (landforms !== false) installIfMissing(engine, createLandformFeatureDomain(landforms ?? {}));
            if (hydrology !== false) installIfMissing(engine, createHydrologyFeatureDomain(hydrology ?? {}));
            if (ecology !== false) installIfMissing(engine, createEcologyFeatureDomain(ecology ?? {}));
            if (settlement !== false) installIfMissing(engine, createSettlementFeatureDomain(settlement ?? {}));
            if (atmosphere !== false) installIfMissing(engine, createAtmosphereFeatureDomain(atmosphere ?? {}));
          }
        }
      }
      userInstall?.(context);
    }
  });
}
