import { defineEvent, defineResource } from "../../../../ecs.js";
import { defineDomainServiceKit } from "../../../manifest-domain-service-kit.js";

const VERSION = "0.0.4";
const State = defineResource("core.presentation.state");
const Configured = defineEvent("core.presentation.configured");
const Reset = defineEvent("core.presentation.reset");
const SnapshotLoaded = defineEvent("core.presentation.snapshot-loaded");

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState(config = {}) {
  return {
    version: VERSION,
    status: "ready",
    optional: true,
    sequence: 0,
    config: clone(config.config ?? {}),
    graph: {
      root: "n:presentation",
      output: "n:presentation:output",
      uiScale: "n:presentation:ui-scale",
      cameraFraming: "n:presentation:camera-framing"
    }
  };
}

export function createPresentationKit(config = {}) {
  return defineDomainServiceKit({
    manifestId: "presentation-registry-kit",
    id: config.id ?? "presentation-registry-kit",
    domain: "presentation",
    domainPath: config.domainPath ?? "n:presentation",
    apiName: config.apiName ?? "presentation",
    version: VERSION,
    stability: "stable-candidate",
    services: ["composition", "snapshot"],
    resources: { State },
    events: { Configured, Reset, SnapshotLoaded },
    metadata: {
      purpose: "Optional parent domain for renderer-neutral output, UI scaling, and camera framing policy.",
      owns: ["presentation domain composition", "presentation capability graph"],
      doesNotOwn: ["canvas creation", "DOM layout", "renderer objects", "platform measurement"],
      rendererAgnostic: true,
      deterministic: true,
      optional: true,
      snapshot: true,
      reset: true
    },
    initWorld({ world }) {
      world.setResource(State, initialState(config));
    },
    createApi({ world }) {
      const setState = (state, event, payload = {}) => {
        world.setResource(State, state);
        world.emit(event, { state: clone(state), ...clone(payload) });
        return clone(state);
      };
      return {
        getGraph: () => clone(world.getResource(State).graph),
        getState: () => clone(world.getResource(State)),
        getSnapshot: () => clone(world.getResource(State)),
        configure(patch = {}) {
          const current = world.getResource(State);
          return setState({
            ...current,
            sequence: current.sequence + 1,
            config: { ...current.config, ...clone(patch) }
          }, Configured, { patch });
        },
        loadSnapshot(snapshot = {}) {
          const next = { ...initialState(config), ...clone(snapshot), version: VERSION, status: "ready" };
          return setState(next, SnapshotLoaded);
        },
        reset() {
          return setState(initialState(config), Reset);
        }
      };
    }
  });
}
