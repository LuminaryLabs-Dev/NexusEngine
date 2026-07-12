import { defineResource } from "../../ecs.js";

export const PhysicsProviderState = defineResource("core.physics.provider.state");
export const PhysicsBodyDescriptorState = defineResource("core.physics.body-descriptor.state");
export const PhysicsColliderDescriptorState = defineResource("core.physics.collider-descriptor.state");
export const PhysicsMotionRequestState = defineResource("core.physics.motion-request.state");
export const PhysicsConstraintDescriptorState = defineResource("core.physics.constraint-descriptor.state");
export const PhysicsArticulationDescriptorState = defineResource("core.physics.articulation-descriptor.state");
export const PhysicsJointMotorRequestState = defineResource("core.physics.joint-motor-request.state");
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
  const next = {
    x: finite(source?.x, 0),
    y: finite(source?.y, 0),
    z: finite(source?.z, 0),
    w: finite(source?.w, 1)
  };
  const length = Math.hypot(next.x, next.y, next.z, next.w);
  if (length <= 1e-8) return { x: 0, y: 0, z: 0, w: 1 };
  return { x: next.x / length, y: next.y / length, z: next.z / length, w: next.w / length };
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

function normalizeConstraintDescriptor(input = {}, index = 0) {
  return {
    ...clone(input),
    id: text(input.id ?? input.constraintId ?? input.jointId, `constraint-${index}`, "Physics constraint id"),
    articulationId: input.articulationId == null ? null : String(input.articulationId),
    parentBodyId: input.parentBodyId == null ? null : String(input.parentBodyId),
    childBodyId: input.childBodyId == null ? null : String(input.childBodyId),
    type: String(input.type ?? input.kind ?? "fixed")
  };
}

function normalizeArticulationDescriptor(input = {}, index = 0) {
  const id = text(input.id ?? input.articulationId, `articulation-${index}`, "Physics articulation id");
  return {
    ...clone(input),
    id,
    rigId: input.rigId == null ? null : String(input.rigId),
    bodies: asArray(input.bodies).map(normalizeBodyDescriptor),
    joints: asArray(input.joints ?? input.constraints).map(normalizeConstraintDescriptor)
  };
}

function normalizeJointMotorRequest(input = {}, index = 0) {
  const request = {
    ...clone(input),
    id: text(input.id, `joint-motor-${index}`, "Physics joint motor request id"),
    jointId: text(input.jointId ?? input.constraintId, null, "Physics joint motor jointId"),
    articulationId: input.articulationId == null ? null : String(input.articulationId),
    mode: String(input.mode ?? (input.targetVelocity == null ? "position" : "velocity")),
    stiffness: Math.max(0, finite(input.stiffness, 0)),
    damping: Math.max(0, finite(input.damping, 0)),
    maximumForce: Math.max(0, finite(input.maximumForce ?? input.maximumTorque, 0))
  };
  if (input.targetRotation != null) request.targetRotation = quaternion(input.targetRotation);
  if (input.targetPosition != null) request.targetPosition = finite(input.targetPosition, 0);
  if (input.targetVelocity != null) request.targetVelocity = finite(input.targetVelocity, 0);
  return request;
}

function normalizeBodyResult(input = {}, index = 0) {
  return {
    bodyId: text(input.bodyId ?? input.id, `body-${index}`, "Physics body result id"),
    position: vector3(input.position ?? input.translation),
    rotation: quaternion(input.rotation),
    linearVelocity: vector3(input.linearVelocity ?? input.velocity),
    angularVelocity: vector3(input.angularVelocity),
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
    impulse: finite(input.impulse, 0),
    tags: asArray(input.tags).map(String),
    type: String(input.type ?? "contact")
  };
}

function normalizeConstraintResult(input = {}, index = 0) {
  return {
    constraintId: text(input.constraintId ?? input.jointId ?? input.id, `constraint-${index}`, "Physics constraint result id"),
    articulationId: input.articulationId == null ? null : String(input.articulationId),
    satisfied: input.satisfied !== false,
    error: Math.max(0, finite(input.error ?? input.targetError, 0)),
    impulse: finite(input.impulse, 0),
    limitState: input.limitState == null ? null : String(input.limitState)
  };
}

function normalizeJointResult(input = {}, index = 0) {
  return {
    jointId: text(input.jointId ?? input.constraintId ?? input.id, `joint-${index}`, "Physics joint result id"),
    articulationId: input.articulationId == null ? null : String(input.articulationId),
    position: finite(input.position, 0),
    velocity: finite(input.velocity, 0),
    rotation: quaternion(input.rotation),
    targetError: Math.max(0, finite(input.targetError, 0)),
    limitState: input.limitState == null ? null : String(input.limitState)
  };
}

function normalizeArticulationResult(input = {}, index = 0) {
  return {
    articulationId: text(input.articulationId ?? input.id, `articulation-${index}`, "Physics articulation result id"),
    rigId: input.rigId == null ? null : String(input.rigId),
    ragdollWeight: Math.max(0, Math.min(1, finite(input.ragdollWeight, 0))),
    bodyResults: asArray(input.bodyResults ?? input.bodies).map(normalizeBodyResult),
    jointResults: asArray(input.jointResults ?? input.joints).map(normalizeJointResult),
    diagnostics: clone(input.diagnostics ?? [])
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
    contacts: asArray(frame.contacts).map((entry, index) => normalizeContact(entry, index, stepId)),
    constraintResults: asArray(frame.constraintResults).map(normalizeConstraintResult),
    jointResults: asArray(frame.jointResults).map(normalizeJointResult),
    articulationResults: asArray(frame.articulationResults).map(normalizeArticulationResult)
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
      PhysicsConstraintDescriptorState,
      PhysicsArticulationDescriptorState,
      PhysicsJointMotorRequestState,
      PhysicsFrameState
    },
    initWorld({ world }) {
      ensureRuntime(world);
      world.setResource(PhysicsProviderState, createProviderState());
      world.setResource(PhysicsBodyDescriptorState, { descriptors: [] });
      world.setResource(PhysicsColliderDescriptorState, { descriptors: [] });
      world.setResource(PhysicsMotionRequestState, { requests: [] });
      world.setResource(PhysicsConstraintDescriptorState, { descriptors: [] });
      world.setResource(PhysicsArticulationDescriptorState, { descriptors: [] });
      world.setResource(PhysicsJointMotorRequestState, { requests: [] });
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
          provider.syncConstraints?.(clone(world.getResource(PhysicsConstraintDescriptorState)?.descriptors ?? []));
          provider.syncArticulations?.(clone(world.getResource(PhysicsArticulationDescriptorState)?.descriptors ?? []));
          provider.submitJointMotorRequests?.(clone(world.getResource(PhysicsJointMotorRequestState)?.requests ?? []));
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
        syncConstraints(descriptors = []) {
          const normalized = asArray(descriptors).map(normalizeConstraintDescriptor);
          world.setResource(PhysicsConstraintDescriptorState, { descriptors: normalized });
          runtime.provider?.syncConstraints?.(clone(normalized));
          return clone(normalized);
        },
        syncArticulations(descriptors = []) {
          const normalized = asArray(descriptors).map(normalizeArticulationDescriptor);
          world.setResource(PhysicsArticulationDescriptorState, { descriptors: normalized });
          runtime.provider?.syncArticulations?.(clone(normalized));
          return clone(normalized);
        },
        submitJointMotorRequests(requests = []) {
          const normalized = asArray(requests).map(normalizeJointMotorRequest);
          world.setResource(PhysicsJointMotorRequestState, { requests: normalized });
          runtime.provider?.submitJointMotorRequests?.(clone(normalized));
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
          world.setResource(PhysicsJointMotorRequestState, { requests: [] });
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
          world.setResource(PhysicsConstraintDescriptorState, { descriptors: [] });
          world.setResource(PhysicsArticulationDescriptorState, { descriptors: [] });
          world.setResource(PhysicsJointMotorRequestState, { requests: [] });
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
