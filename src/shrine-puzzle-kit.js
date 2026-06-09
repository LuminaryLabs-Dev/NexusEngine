import { defineComponent, defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export function createShrinePuzzleKit(options = {}) {
  const components = {
    ShrineLock: defineComponent("shrine-lock"),
    ShrineGate: defineComponent("shrine-gate")
  };
  const resources = {
    ShrineInput: defineResource("shrine-input"),
    ShrineState: defineResource("shrine-state")
  };
  const events = {
    ShrineCharged: defineEvent("shrine-charged"),
    ShrineOpened: defineEvent("shrine-opened")
  };

  function shrineSystem(world) {
    const input = world.getResource(resources.ShrineInput) ?? {};
    const state = world.getResource(resources.ShrineState);
    if (!state || state.opened) return;

    if (input.relicSeeds >= state.requiredSeeds && input.companionArrived) {
      state.charged = true;
      world.emit(events.ShrineCharged, { relicSeeds: input.relicSeeds });
    }
    if (state.charged && input.activate) {
      state.opened = true;
      world.emit(events.ShrineOpened, { gate: state.gateId });
    }
  }

  return defineRuntimeKit({
    id: options.id ?? "shrine-puzzle-kit",
    components,
    resources,
    events,
    systems: [{ phase: "resolve", name: "ShrinePuzzleSystem", system: shrineSystem }],
    initWorld({ world }) {
      world.setResource(resources.ShrineInput, { relicSeeds: 0, companionArrived: false, activate: false });
      world.setResource(resources.ShrineState, {
        charged: false,
        opened: false,
        gateId: options.gateId ?? "first-shrine-gate",
        requiredSeeds: options.requiredSeeds ?? 3
      });
    },
    metadata: { domain: "puzzle", reusable: true }
  });
}
