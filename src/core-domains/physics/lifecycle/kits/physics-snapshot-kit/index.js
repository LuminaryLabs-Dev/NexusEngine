import { createDomainKit } from "../../../../domain-kit.js";
import { rollbackSnapshots, samePortableValue } from "../../lifecycle-contracts.js";
import {
  PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA,
  normalizeCaptureCommand,
  normalizeLifecycleBundle,
  normalizeRestoreCommand,
  normalizeSnapshotKitState,
  snapshotContract
} from "./contracts.js";

export function createPhysicsSnapshotKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "physics-snapshot-kit",
    id: config.id ?? "physics-snapshot-kit",
    domain: "physics-snapshot",
    domainPath: "n:physics:lifecycle",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsSnapshot",
    requires: ["physics:installation", "physics:startup", "physics:step", "physics:shutdown", "physics:reset"],
    provides: ["physics:snapshot"],
    purpose: "Capture and atomically restore portable snapshots of composed Physics lifecycle state.",
    owns: ["named lifecycle snapshots", "last restored snapshot identity"],
    doesNotOwn: ["backend world snapshots", "body state schema", "provider persistence"],
    initialState: { captures: {}, lastRestored: null },
    createApi({ engine, baseApi }) {
      const components = () => ({
        installation: engine.n.physicsInstallation,
        reset: engine.n.physicsReset,
        shutdown: engine.n.physicsShutdown,
        startup: engine.n.physicsStartup,
        step: engine.n.physicsStep
      });
      return {
        ...baseApi,
        getContract: snapshotContract,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeSnapshotKitState(snapshot));
        },
        listCaptures() {
          return Object.keys(baseApi.getState().captures).sort();
        },
        getCapture(snapshotId) {
          return baseApi.getState().captures[snapshotId] ?? null;
        },
        capture(command = {}) {
          const request = normalizeCaptureCommand(command);
          const apis = components();
          return baseApi.applyCommand(request, (state) => {
            const snapshot = normalizeLifecycleBundle({
              schema: PHYSICS_LIFECYCLE_SNAPSHOT_SCHEMA,
              snapshotId: request.snapshotId,
              label: request.label,
              components: Object.fromEntries(
                Object.entries(apis).map(([id, api]) => [id, api.getSnapshot()])
              ),
              metadata: request.metadata
            });
            const existing = state.captures[request.snapshotId];
            if (existing && !samePortableValue(existing, snapshot)) {
              throw new TypeError(`Physics snapshot ${request.snapshotId} already exists with different content.`);
            }
            return {
              patch: { captures: { ...state.captures, [request.snapshotId]: snapshot } },
              result: { snapshot }
            };
          });
        },
        restore(command = {}) {
          const request = normalizeRestoreCommand(command);
          const apis = components();
          const records = Object.entries(apis).map(([id, api]) => ({ id, api, snapshot: api.getSnapshot() }));
          try {
            return baseApi.applyCommand(request, () => {
              for (const [id, api] of Object.entries(apis)) {
                api.loadSnapshot(request.snapshot.components[id]);
              }
              return {
                patch: { lastRestored: request.snapshot.snapshotId },
                result: { snapshotId: request.snapshot.snapshotId, restored: Object.keys(apis).sort() }
              };
            });
          } catch (error) {
            rollbackSnapshots(records);
            throw error;
          }
        }
      };
    }
  });
}

export default createPhysicsSnapshotKit;
