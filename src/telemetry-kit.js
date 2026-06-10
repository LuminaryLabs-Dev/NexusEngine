import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const TelemetryState = defineResource("telemetry.state");

function getPath(source, path = "") {
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((current, part) => current?.[part], source);
}

function initialState(config = {}) {
  return {
    id: config.id ?? "telemetry",
    snapshots: [],
    lastSnapshot: null
  };
}

function createSnapshot(world, selectors = []) {
  const values = {};
  for (const selector of selectors) {
    const key = selector.id ?? selector.name;
    if (!key || !selector.resource) continue;
    const source = world.getResource(selector.resource);
    values[key] = selector.path ? getPath(source, selector.path) : source;
  }
  return {
    at: Number(world.__nexusClock?.elapsed ?? 0),
    frame: Number(world.__nexusClock?.frame ?? 0),
    values
  };
}

export function createTelemetryKit(config = {}) {
  const selectors = config.selectors ?? [];
  return defineRuntimeKit({
    id: config.id ?? "telemetry-kit",
    resources: { TelemetryState },
    systems: [{
      phase: "cleanup",
      name: "telemetrySystem",
      system(world) {
        const state = world.getResource(TelemetryState);
        if (!state) return;
        const snapshot = createSnapshot(world, selectors);
        world.setResource(TelemetryState, {
          ...state,
          lastSnapshot: snapshot,
          snapshots: [...state.snapshots, snapshot].slice(-Number(config.historyLimit ?? 60))
        });
      }
    }],
    provides: ["telemetry"],
    initWorld({ world }) {
      world.setResource(TelemetryState, initialState(config));
    },
    install({ engine }) {
      engine.telemetry = {
        getState() {
          return engine.world.getResource(TelemetryState);
        },
        snapshot(extraSelectors = selectors) {
          const snapshot = createSnapshot(engine.world, extraSelectors);
          const state = engine.world.getResource(TelemetryState);
          engine.world.setResource(TelemetryState, {
            ...state,
            lastSnapshot: snapshot,
            snapshots: [...state.snapshots, snapshot].slice(-Number(config.historyLimit ?? 60))
          });
          return snapshot;
        },
        reset() {
          engine.world.setResource(TelemetryState, initialState(config));
          return engine.world.getResource(TelemetryState);
        }
      };
    },
    metadata: { purpose: "Generic selector-based runtime snapshots for validation and diagnostics." }
  });
}
