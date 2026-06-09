import { defineComponent, defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export function createCorruptionWorldKit(options = {}) {
  const components = {
    CorruptionZone: defineComponent("corruption-zone"),
    CleanseTarget: defineComponent("cleanse-target")
  };
  const resources = {
    CorruptionInput: defineResource("corruption-input"),
    CorruptionState: defineResource("corruption-state")
  };
  const events = {
    CleanseProgressed: defineEvent("cleanse-progressed"),
    RiftCleansed: defineEvent("rift-cleansed")
  };

  function corruptionSystem(world) {
    const input = world.getResource(resources.CorruptionInput) ?? {};
    const state = world.getResource(resources.CorruptionState);
    if (!state || state.riftCleansed) return;

    if (input.cleanse && input.shrineOpened) {
      state.cleanseProgress = Math.min(1, state.cleanseProgress + state.cleanseRate);
      state.corruptionLevel = Math.max(0, 1 - state.cleanseProgress);
      world.emit(events.CleanseProgressed, { progress: state.cleanseProgress });
      if (state.cleanseProgress >= 1) {
        state.riftCleansed = true;
        world.emit(events.RiftCleansed, { corruptionLevel: state.corruptionLevel });
      }
    }
  }

  return defineRuntimeKit({
    id: options.id ?? "corruption-world-kit",
    components,
    resources,
    events,
    systems: [{ phase: "resolve", name: "CorruptionWorldSystem", system: corruptionSystem }],
    initWorld({ world }) {
      world.setResource(resources.CorruptionInput, { cleanse: false, shrineOpened: false });
      world.setResource(resources.CorruptionState, {
        corruptionLevel: 1,
        cleanseProgress: 0,
        cleanseRate: options.cleanseRate ?? 0.34,
        riftCleansed: false
      });
    },
    metadata: { domain: "world-state", reusable: true }
  });
}
