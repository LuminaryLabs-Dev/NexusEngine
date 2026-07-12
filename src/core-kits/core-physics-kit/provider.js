import { defineResource } from "../../ecs.js";

export const PhysicsProviderState = defineResource("core.physics.provider.state");
export const PhysicsBodyDescriptorState = defineResource("core.physics.body-descriptor.state");
export const PhysicsColliderDescriptorState = defineResource("core.physics.collider-descriptor.state");
export const PhysicsMotionRequestState = defineResource("core.physics.motion-request.state");
export const PhysicsFrameState = defineResource("core.physics.frame.state");

const runtimes = new WeakMap();

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function finite(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function text(value, fallback, label) {
  const next = String(value ?? fallback ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function vector3(value = {}) {
  const source = Array.isArray(value) ? { x: value[0], y: value[1], z: value[2] } : value;
  return {
    x: finite(source?.x, 0),
    y: finite(source?.y, 0),
    z: finite(source?.z, 0)
  };
}

function quaternion(value = {}) {
  const source = Array.isArray(value) ? { x: value[0], y: value[1], z: value[2], w: value[3] } : value;
  return {
    x: finite(source?.x, 0),
    y: finite(source?.y, 0),
    z: finite(source?.z, 0),
    w: finite(source?.w, 1)
  };
}

function normalizeBodyDescriptor(input = {}, index = 0) {
  return {
    ...clone(input),
    id: text(input.id ?? input.bodyId, `body-${index}`, "Physics body id")
  };
}

function normalizeColliderDescriptor(input = {}, index = 0) {
  return {
    ...clone(input),
    id: text(input.id ?? input.colliderId, `collider-${index}`, "Physics collider id")
  };
}

function normalizeMotionRequest(input = {}, index = 0) {
  return {
    ...clone(input),
    id: text(input.id, `motion-${index}`, "Physics motion request id"),
    bodyId: text(input.bodyId ?? input.actorId, null, "Physics motion bodyId")
  };
}

function normalizeBodyResult(input = {}, index = 0) {
  return {
    bodyId: text(input.bodyId ?? input.id, `body-${index}`, "Physics body result id"),
    position: vector3(input.position ?? input.translation),
    rotation: quaternion(input.rotation),
    linearVelocity: vector3(input.linearVelocity ?? input.velocity),
    grounded: input.grounded === true,
    tags: asArray(input.tags).map(String)
  };
}

function normalizeContact(input = {}, index = 0, stepId = "physics-step") {
  const bodyA = text(input.bodyA ?? input.actorId, "unknown-a", "Physics contact bodyA");
  const bodyB = text(input.bodyB ?? input.colliderId, "unknown-b", "Physics contact bodyB");
  return {
    contactId: text(input.contactId, `${stepId}:${bodyA}:${bodyB}:${index}`, "Physics contact id"),
    bodyA,
    bodyB,
    actorId: input.actorId == null ? bodyA : String(input.actorId),
    colliderId: input.colliderId == null ? bodyB : String(input.colliderId),
    colliderA: input.colliderA == null ? null : String(input.colliderA),
    colliderB: input.colliderB == null ? null : String(input.colliderB),
    started: input.started !== false,
    ended: input.ended === true,
    point: vector3(input.point),
    normal: vector3(input.normal),
    tags: asArray(input.tags).map(String),
    type: String(input.type ?? "contact")
  };
}

export function normalizePhysicsFrame(frame = {}, tickContext = {}, providerId = "physics-provider") {
  const stepId = text(frame.stepId, tickContext.tickId ?? `tick:${tickContext.frame ?? 0}`, "Physics frame stepId");
  const normalized = {
    stepId,
    tickId: String(frame.tickId ?? tickContext.tickId ?? stepId),
    frame: finite(frame.frame, tickContext.frame ?? 0),
    providerId: text(frame.providerId, providerId, "Physics provider id"),
    bodyResults: asArray(frame.bodyResults).map(normalizeBodyResult),
    contacts: asArray(frame.contacts).map((entry, index) => normalizeContact(entry, index, stepId))
  };
  structuredClone(normalized);
  return normalized;
}

function createProviderState() {
  return {
    providerId: null,
    initialized: false,
    disposed: false,
    lastStepId: null
  };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) runtimes.set(world, { engine: null, provider: null, lastFrame: null });
  return runtimes.get(world);
}

function validateProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Core Physics provider must be an object.");
  for (const method of ["step", "getFrame"]) {
    if (typeof provider[method] !== "function") {
      throw new TypeError(`Core Physics provider requires ${method}().`);
    }
  }
  return provider;
}

export function createCorePhysicsProviderExtension() {
  return {
    resources: {
      PhysicsProviderState,
      PhysicsBodyDescriptorState,
      PhysicsColliderDescriptorState,
      PhysicsMotionRequestState,
      PhysicsFrameState
    },
    initWorld({ world }) {
      ensureRuntime(world);
      world.setResource(PhysicsProviderState, createProviderState());
      world.setResource(PhysicsBodyDescriptorState, { descriptors: [] });
      world.setResource(PhysicsColliderDescriptorState, { descriptors: [] });
      world.setResource(PhysicsMotionRequestState, { requests: [] });
      world.setResource(PhysicsFrameState, { current: null });
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      runtime.engine = engine;

      const api = {
        setProvider(nextProvider) {
          const provider = validateProvider(nextProvider);
          if (runtime.provider && runtime.provider !== provider) runtime.provider.dispose?.();
          runtime.provider = provider;
          provider.initialize?.({ engine, world });
          provider.syncBodies?.(clone(world.getResource(PhysicsBodyDescriptorState)?.descriptors ?? []));
          provider.syncColliders?.(clone(world.getResource(PhysicsColliderDescriptorState)?.descriptors ?? []));
          provider.submitMotionRequests?.(clone(world.getResource(PhysicsMotionRequestState)?.requests ?? []));
          world.setResource(PhysicsProviderState, {
            providerId: text(provider.id, "physics-provider", "Physics provider id"),
            initialized: true,
            disposed: false,
            lastStepId: null
          });
          return provider.id;
        },
        getProvider() {
          return runtime.provider;
        },
        syncBodies(descriptors = []) {
          const normalized = asArray(descriptors).map(normalizeBodyDescriptor);
          world.setResource(PhysicsBodyDescriptorState, { descriptors: normalized });
          runtime.provider?.syncBodies?.(clone(normalized));
          return clone(normalized);
        },
        syncColliders(descriptors = []) {
          const normalized = asArray(descriptors).map(normalizeColliderDescriptor);
          world.setResource(PhysicsColliderDescriptorState, { descriptors: normalized });
          runtime.provider?.syncColliders?.(clone(normalized));
          return clone(normalized);
        },
        submitMotionRequests(requests = []) {
          const normalized = asArray(requests).map(normalizeMotionRequest);
          world.setResource(PhysicsMotionRequestState, { requests: normalized });
          runtime.provider?.submitMotionRequests?.(clone(normalized));
          return clone(normalized);
        },
        step(tickContext = engine.getCurrentTickContext?.() ?? world.__nexusTickContext) {
          if (!runtime.provider) throw new Error("Core Physics cannot step without a provider.");
          if (!tickContext?.tickId) throw new Error("Core Physics requires an active TickContext.");
          const state = world.getResource(PhysicsProviderState) ?? createProviderState();
          if (state.lastStepId === tickContext.tickId && runtime.lastFrame) return clone(runtime.lastFrame);
          runtime.provider.step(tickContext);
          runtime.lastFrame = normalizePhysicsFrame(
            runtime.provider.getFrame() ?? {},
            tickContext,
            runtime.provider.id ?? state.providerId ?? "physics-provider"
          );
          world.setResource(PhysicsFrameState, { current: runtime.lastFrame });
          world.setResource(PhysicsProviderState, {
            providerId: runtime.lastFrame.providerId,
            initialized: true,
            disposed: false,
            lastStepId: tickContext.tickId
          });
          world.setResource(PhysicsMotionRequestState, { requests: [] });
          return clone(runtime.lastFrame);
        },
        getFrame() {
          return clone(world.getResource(PhysicsFrameState)?.current ?? null);
        },
        reset() {
          runtime.provider?.reset?.();
          runtime.lastFrame = null;
          world.setResource(PhysicsBodyDescriptorState, { descriptors: [] });
          world.setResource(PhysicsColliderDescriptorState, { descriptors: [] });
          world.setResource(PhysicsMotionRequestState, { requests: [] });
          world.setResource(PhysicsFrameState, { current: null });
          const providerId = runtime.provider?.id ?? null;
          world.setResource(PhysicsProviderState, {
            providerId,
            initialized: Boolean(runtime.provider),
            disposed: false,
            lastStepId: null
          });
          return true;
        },
        dispose() {
          runtime.provider?.dispose?.();
          runtime.provider = null;
          runtime.lastFrame = null;
          world.setResource(PhysicsProviderState, {
            providerId: null,
            initialized: false,
            disposed: true,
            lastStepId: null
          });
          return true;
        }
      };

      engine.corePhysics = api;
      return api;
    }
  };
}
