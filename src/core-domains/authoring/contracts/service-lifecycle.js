import { authoringError, freeze, requireFields } from "./value.js";
// Source documents/history are exclusively Project-owned. Service snapshots identify
// the installed registration; derived caches and Runtime runs are disposable.
export function authoringServiceLifecycle(kitId, dispose = () => {}) {
  const snapshot = freeze({ schema: "nexusengine.authoring-service/1", kitId });
  return {
    getSnapshot: () => snapshot,
    reset() {
      dispose();
      return snapshot;
    },
    loadSnapshot(input) {
      requireFields(input, ["schema", "kitId"], "Authoring service snapshot");
      if (input.schema !== snapshot.schema || input.kitId !== kitId)
        throw authoringError(
          "AUTHORING_SCHEMA_UNSUPPORTED",
          "Service snapshot identity differs.",
        );
      dispose();
      return snapshot;
    },
  };
}
