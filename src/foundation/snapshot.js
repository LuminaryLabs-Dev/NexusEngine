function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function createSnapshotEnvelope({ id = "snapshot", version = "0.0.3", state = {}, metadata = {} } = {}) {
  return {
    id,
    version,
    state: clone(state),
    metadata: clone(metadata)
  };
}

export function cloneSnapshot(snapshot = {}) {
  return clone(snapshot);
}

export function assertSnapshotEnvelope(snapshot = {}) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    throw new TypeError("Snapshot must be an object.");
  }
  if (typeof snapshot.id !== "string" || snapshot.id.length === 0) {
    throw new TypeError("Snapshot requires a non-empty id.");
  }
  if (!Object.prototype.hasOwnProperty.call(snapshot, "state")) {
    throw new TypeError("Snapshot requires state.");
  }
  return snapshot;
}

export function createSnapshotController({ getState, setState, createInitialState, id = "snapshot-controller", version = "0.0.3" } = {}) {
  if (typeof getState !== "function" || typeof setState !== "function") {
    throw new TypeError("createSnapshotController requires getState and setState functions.");
  }
  return {
    getSnapshot(metadata = {}) {
      return createSnapshotEnvelope({ id, version, state: getState(), metadata });
    },
    loadSnapshot(snapshot = {}) {
      assertSnapshotEnvelope(snapshot);
      setState(clone(snapshot.state));
      return getState();
    },
    reset(payload = {}) {
      const next = typeof createInitialState === "function" ? createInitialState(payload) : {};
      setState(next);
      return getState();
    }
  };
}
