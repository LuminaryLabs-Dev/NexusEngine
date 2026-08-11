import { createDomainKit } from "../../../../../domain-kit.js";
import { rollbackSnapshots, samePortableValue } from "../../lifecycle-contracts.js";
import {
  RENDER_LIFECYCLE_SNAPSHOT_SCHEMA,
  normalizeCaptureCommand,
  normalizeLifecycleBundle,
  normalizeRestoreCommand,
  normalizeSnapshotKitState,
  snapshotContract
} from "./contracts.js";

export function createRenderSnapshotKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "render-snapshot-kit",
    id: config.id ?? "render-snapshot-kit",
    domain: "render-snapshot",
    domainPath: "n:render:lifecycle",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderSnapshot",
    requires: ["render:installation", "render:startup", "render:shutdown", "render:recovery", "render:reset"],
    provides: ["render:snapshot"],
    purpose: "Capture and atomically restore portable snapshots of composed Render lifecycle state.",
    owns: ["named lifecycle snapshots", "last restored snapshot identity"],
    doesNotOwn: ["backend resource snapshots", "GPU handles", "provider persistence"],
    initialState: { captures: {}, lastRestored: null },
    createApi({ engine, baseApi }) {
      const components = () => ({
        installation: engine.n.renderInstallation,
        recovery: engine.n.renderRecovery,
        reset: engine.n.renderReset,
        shutdown: engine.n.renderShutdown,
        startup: engine.n.renderStartup
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
              schema: RENDER_LIFECYCLE_SNAPSHOT_SCHEMA,
              snapshotId: request.snapshotId,
              label: request.label,
              components: Object.fromEntries(
                Object.entries(apis).map(([id, api]) => [id, api.getSnapshot()])
              ),
              metadata: request.metadata
            });
            const existing = state.captures[request.snapshotId];
            if (existing && !samePortableValue(existing, snapshot)) {
              throw new TypeError(`Render snapshot ${request.snapshotId} already exists with different content.`);
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

export default createRenderSnapshotKit;
