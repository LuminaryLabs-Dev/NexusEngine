import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import { createUIScaleDescriptor, normalizeUIScalePolicy, normalizeUIViewport } from "./math.js";

export * from "./math.js";

const VERSION = "0.0.3";
const UIScale = defineResource("core.presentation.ui-scale");
const Changed = defineEvent("core.presentation.ui-scale-changed");
const Reset = defineEvent("core.presentation.ui-scale-reset");
const SnapshotLoaded = defineEvent("core.presentation.ui-scale-snapshot-loaded");
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initial(config = {}) {
  const policy = normalizeUIScalePolicy(config.policy ?? config);
  const viewport = normalizeUIViewport(config.viewport ?? {});
  return { policy, viewport, descriptor: createUIScaleDescriptor(viewport, policy), revision: 0 };
}

export function createCoreUIScaleKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-ui-scale-kit",
    domain: "presentation-ui-scale",
    domainPath: "n:presentation:ui-scale",
    parentDomainPath: "n:presentation",
    apiName: config.apiName ?? "uiScale",
    version: VERSION,
    stability: "stable-candidate",
    services: ["reference-resolution", "viewport-scale", "scale-policy"],
    resources: { UIScale },
    events: { Changed, Reset, SnapshotLoaded },
    metadata: {
      purpose: "Renderer-neutral reference-resolution and UI scale policy.",
      owns: ["reference resolution", "UI scale policy", "UI scale descriptor"],
      doesNotOwn: ["HTML layout", "font rendering", "widget hierarchy", "canvas sizing"],
      rendererAgnostic: true,
      deterministic: true,
      optional: true,
      snapshot: true,
      reset: true
    },
    initWorld({ world }) {
      world.setResource(UIScale, initial(config));
    },
    createApi({ world }) {
      const commit = (next, event = Changed) => {
        world.setResource(UIScale, next);
        world.emit(event, { state: clone(next) });
        return clone(next.descriptor);
      };
      return {
        configure(patch = {}) {
          const current = world.getResource(UIScale);
          const policy = normalizeUIScalePolicy({ ...current.policy, ...patch });
          return commit({
            policy,
            viewport: current.viewport,
            descriptor: createUIScaleDescriptor(current.viewport, policy),
            revision: current.revision + 1
          });
        },
        setViewport(viewportInput = {}) {
          const current = world.getResource(UIScale);
          const viewport = normalizeUIViewport(viewportInput);
          return commit({
            policy: current.policy,
            viewport,
            descriptor: createUIScaleDescriptor(viewport, current.policy),
            revision: current.revision + 1
          });
        },
        getDescriptor: () => clone(world.getResource(UIScale).descriptor),
        getState: () => clone(world.getResource(UIScale)),
        getSnapshot: () => clone(world.getResource(UIScale)),
        loadSnapshot(snapshot = {}) {
          const policy = normalizeUIScalePolicy(snapshot.policy ?? {});
          const viewport = normalizeUIViewport(snapshot.viewport ?? {});
          return commit({
            policy,
            viewport,
            descriptor: createUIScaleDescriptor(viewport, policy),
            revision: Math.max(0, Number(snapshot.revision ?? 0))
          }, SnapshotLoaded);
        },
        reset() {
          return commit(initial(config), Reset);
        }
      };
    }
  });
}
