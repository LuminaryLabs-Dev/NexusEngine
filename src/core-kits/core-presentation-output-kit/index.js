import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createPresentationDescriptor,
  normalizePresentationPolicy,
  normalizePresentationSurface
} from "./math.js";

export * from "./math.js";

const VERSION = "0.0.3";
const Surface = defineResource("core.presentation.surface");
const Policy = defineResource("core.presentation.policy");
const Descriptor = defineResource("core.presentation.descriptor");
const SurfaceChanged = defineEvent("core.presentation.surface-changed");
const PolicyChanged = defineEvent("core.presentation.policy-changed");
const OutputChanged = defineEvent("core.presentation.output-changed");
const Reset = defineEvent("core.presentation.output-reset");
const SnapshotLoaded = defineEvent("core.presentation.output-snapshot-loaded");
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initial(config = {}) {
  const surface = normalizePresentationSurface(config.surface ?? {});
  const policy = normalizePresentationPolicy(config.policy ?? config);
  return { surface, policy, descriptor: createPresentationDescriptor(surface, policy, 0) };
}

export function createCorePresentationOutputKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-presentation-output-kit",
    domain: "presentation-output",
    domainPath: "n:presentation:output",
    parentDomainPath: "n:presentation",
    apiName: config.apiName ?? "presentationOutput",
    version: VERSION,
    stability: "stable-candidate",
    services: ["surface-input", "viewport-policy", "render-resolution", "safe-area"],
    resources: { Surface, Policy, Descriptor },
    events: { SurfaceChanged, PolicyChanged, OutputChanged, Reset, SnapshotLoaded },
    metadata: {
      purpose: "Renderer-neutral surface, safe-area, aspect-ratio, viewport, bar, and render-resolution policy.",
      owns: ["surface descriptors", "viewport policy", "safe rectangles", "render resolution descriptors"],
      doesNotOwn: ["DOM measurement", "canvas creation", "renderer mutation", "subject framing"],
      rendererAgnostic: true,
      deterministic: true,
      optional: true,
      snapshot: true,
      reset: true,
      fitModes: ["native", "contain", "cover", "width", "height", "stretch", "safe-contain"]
    },
    initWorld({ world }) {
      const state = initial(config);
      world.setResource(Surface, state.surface);
      world.setResource(Policy, state.policy);
      world.setResource(Descriptor, state.descriptor);
    },
    createApi({ world }) {
      const recompute = (event = OutputChanged) => {
        const previous = world.getResource(Descriptor);
        const descriptor = createPresentationDescriptor(
          world.getResource(Surface),
          world.getResource(Policy),
          Number(previous?.revision ?? 0) + 1
        );
        world.setResource(Descriptor, descriptor);
        world.emit(event, { descriptor: clone(descriptor) });
        if (event !== OutputChanged) world.emit(OutputChanged, { descriptor: clone(descriptor) });
        return clone(descriptor);
      };
      return {
        setSurface(surface = {}) {
          const normalized = normalizePresentationSurface(surface);
          world.setResource(Surface, normalized);
          world.emit(SurfaceChanged, { surface: clone(normalized) });
          return recompute();
        },
        configure(policy = {}) {
          const normalized = normalizePresentationPolicy({ ...world.getResource(Policy), ...policy });
          world.setResource(Policy, normalized);
          world.emit(PolicyChanged, { policy: clone(normalized) });
          return recompute();
        },
        getSurface: () => clone(world.getResource(Surface)),
        getPolicy: () => clone(world.getResource(Policy)),
        getDescriptor: () => clone(world.getResource(Descriptor)),
        getState: () => ({
          surface: clone(world.getResource(Surface)),
          policy: clone(world.getResource(Policy)),
          descriptor: clone(world.getResource(Descriptor))
        }),
        getSnapshot() {
          return this.getState();
        },
        loadSnapshot(snapshot = {}) {
          const surface = normalizePresentationSurface(snapshot.surface ?? {});
          const policy = normalizePresentationPolicy(snapshot.policy ?? {});
          const revision = Number(snapshot.descriptor?.revision ?? 0);
          const descriptor = createPresentationDescriptor(surface, policy, revision);
          world.setResource(Surface, surface);
          world.setResource(Policy, policy);
          world.setResource(Descriptor, descriptor);
          world.emit(SnapshotLoaded, { descriptor: clone(descriptor) });
          return clone(descriptor);
        },
        reset() {
          const state = initial(config);
          world.setResource(Surface, state.surface);
          world.setResource(Policy, state.policy);
          world.setResource(Descriptor, state.descriptor);
          world.emit(Reset, { descriptor: clone(state.descriptor) });
          return clone(state.descriptor);
        }
      };
    }
  });
}
