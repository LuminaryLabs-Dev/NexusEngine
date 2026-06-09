import { defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const MicroPlatformerState = defineResource("microPlatformer.state");

export function createMicroPlatformerKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "micro-platformer-kit",
    resources: { MicroPlatformerState },
    initWorld({ world }) {
      world.setResource(MicroPlatformerState, {
        id: config.id ?? "micro-platformer",
        avatar: config.avatar ?? { id: "avatar", lane: 0 },
        hazards: config.hazards ?? [],
        jumps: 0,
        failures: 0,
        goalReached: false
      });
    },
    install({ engine }) {
      engine.microPlatformer = {
        jump(payload = {}) {
          engine.interactionTargets?.input?.(payload.action ?? "jump", payload);
          return engine.world.getResource(MicroPlatformerState);
        },
        enter(payload = {}) {
          engine.interactionTargets?.input?.(payload.action ?? "enter", payload);
          return engine.world.getResource(MicroPlatformerState);
        }
      };
    },
    metadata: { purpose: "Generic miniature platforming behavior." }
  });
}
