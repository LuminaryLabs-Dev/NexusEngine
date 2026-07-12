import { defineResource } from "../../../../ecs.js";
import { defineDomainServiceKit } from "../../../../domain-service-kit.js";
import {
  createArticulatedDynamicsFrame,
  createJointMotorRequest,
  createPhysicalArticulationDescriptor,
  validatePhysicalArticulationDescriptor
} from "./contracts.js";

export * from "./contracts.js";

export const ARTICULATED_DYNAMICS_DOMAIN_VERSION = "0.1.0";
export const ArticulatedDynamicsState = defineResource("core.physics.articulated-dynamics.state");

const clone = (value) => value === undefined ? undefined : structuredClone(value);

function createState(config = {}) {
  return {
    version: ARTICULATED_DYNAMICS_DOMAIN_VERSION,
    status: "ready",
    articulations: {},
    motorTargets: {},
    ragdollWeights: {},
    currentFrame: null,
    frames: [],
    diagnostics: [],
    frameHistoryLimit: Math.max(1, Number(config.frameHistoryLimit ?? 120))
  };
}

function createApi(config, engine, world) {
  const state = () => world.getResource(ArticulatedDynamicsState);
  const setState = (next) => {
    structuredClone(next);
    world.setResource(ArticulatedDynamicsState, next);
    return next;
  };
  const corePhysics = () => engine.corePhysics ?? engine.n?.corePhysics ?? null;
  const registerArticulation = (input = {}) => {
    const descriptor = createPhysicalArticulationDescriptor(input);
    const validation = validatePhysicalArticulationDescriptor(descriptor);
    if (!validation.valid) throw new TypeError(`Invalid physical articulation: ${validation.issues.join("; ")}`);
    const current = state();
    setState({
      ...current,
      articulations: { ...(current.articulations ?? {}), [descriptor.id]: descriptor },
      ragdollWeights: {
        ...(current.ragdollWeights ?? {}),
        [descriptor.id]: descriptor.ragdollWeight
      }
    });
    return clone(descriptor);
  };

  return Object.freeze({
    registerArticulation,
    syncArticulation(input = {}) {
      const descriptor = registerArticulation(input);
      corePhysics()?.syncArticulations?.(Object.values(state().articulations ?? {}));
      corePhysics()?.syncConstraints?.(
        Object.values(state().articulations ?? {}).flatMap((articulation) => articulation.joints ?? [])
      );
      return clone(descriptor);
    },
    getArticulation(id) {
      return clone(state().articulations?.[String(id)] ?? null);
    },
    removeArticulation(id) {
      const key = String(id);
      const current = state();
      const articulations = { ...(current.articulations ?? {}) };
      const ragdollWeights = { ...(current.ragdollWeights ?? {}) };
      const removed = delete articulations[key];
      delete ragdollWeights[key];
      if (removed) {
        setState({ ...current, articulations, ragdollWeights });
        corePhysics()?.syncArticulations?.(Object.values(articulations));
        corePhysics()?.syncConstraints?.(Object.values(articulations).flatMap((entry) => entry.joints ?? []));
      }
      return removed;
    },
    submitMotorTargets(inputs = []) {
      const requests = (Array.isArray(inputs) ? inputs : [inputs]).map(createJointMotorRequest);
      const current = state();
      const next = { ...(current.motorTargets ?? {}) };
      for (const request of requests) next[request.id] = request;
      setState({ ...current, motorTargets: next });
      corePhysics()?.submitJointMotorRequests?.(requests);
      return clone(requests);
    },
    setRagdollWeight(articulationId, weight = 1) {
      const id = String(articulationId);
      if (!state().articulations?.[id]) throw new RangeError(`Unknown physical articulation ${id}.`);
      const nextWeight = Math.max(0, Math.min(1, Number(weight) || 0));
      const current = state();
      setState({
        ...current,
        ragdollWeights: { ...(current.ragdollWeights ?? {}), [id]: nextWeight }
      });
      return nextWeight;
    },
    commitFrame(input = {}) {
      const current = state();
      const physicsFrame = input.physicsFrame ?? corePhysics()?.getFrame?.() ?? {};
      const frame = createArticulatedDynamicsFrame({
        ...input,
        tickId: input.tickId ?? physicsFrame.tickId ?? physicsFrame.stepId,
        frame: input.frame ?? physicsFrame.frame,
        articulationResults: input.articulationResults ?? physicsFrame.articulationResults,
        jointResults: input.jointResults ?? physicsFrame.jointResults,
        constraintResults: input.constraintResults ?? physicsFrame.constraintResults,
        diagnostics: input.diagnostics ?? []
      });
      setState({
        ...current,
        currentFrame: frame,
        frames: [...(current.frames ?? []), frame].slice(-current.frameHistoryLimit),
        diagnostics: frame.diagnostics
      });
      return clone(frame);
    },
    getFrame() {
      return clone(state().currentFrame ?? null);
    },
    getDiagnostics() {
      return clone(state().diagnostics ?? []);
    },
    getSnapshot() {
      return clone(state());
    },
    loadSnapshot(snapshot = {}) {
      if (snapshot.version !== ARTICULATED_DYNAMICS_DOMAIN_VERSION || snapshot.status !== "ready") {
        throw new TypeError("Unsupported articulated dynamics snapshot.");
      }
      for (const descriptor of Object.values(snapshot.articulations ?? {})) {
        const validation = validatePhysicalArticulationDescriptor(descriptor);
        if (!validation.valid) throw new TypeError(`Invalid articulated dynamics snapshot: ${validation.issues.join("; ")}`);
      }
      return clone(setState({
        ...createState(config),
        ...clone(snapshot),
        frameHistoryLimit: Math.max(1, Number(snapshot.frameHistoryLimit ?? config.frameHistoryLimit ?? 120))
      }));
    },
    reset() {
      corePhysics()?.syncArticulations?.([]);
      corePhysics()?.syncConstraints?.([]);
      corePhysics()?.submitJointMotorRequests?.([]);
      return clone(setState(createState(config)));
    }
  });
}

export function createArticulatedDynamicsDomain(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "articulated-dynamics-domain-kit",
    domain: "articulated-dynamics",
    domainPath: "n:core-physics:articulated-dynamics",
    parentDomainPath: "n:core-physics",
    apiName: config.apiName ?? "articulatedDynamics",
    stability: config.stability ?? "stable-candidate",
    version: ARTICULATED_DYNAMICS_DOMAIN_VERSION,
    services: ["articulations", "physical-joints", "joint-motors", "ragdoll-state", "frames", "snapshot", "reset"],
    requires: config.requires ?? ["n:core-physics"],
    provides: [
      "physics:articulation-descriptor",
      "physics:joint-descriptor",
      "physics:joint-motor-request",
      "physics:articulated-frame"
    ],
    resources: { ArticulatedDynamicsState },
    initWorld({ world }) {
      world.setResource(ArticulatedDynamicsState, createState(config));
    },
    createApi({ engine, world }) {
      return createApi(config, engine, world);
    },
    metadata: {
      coreSubdomain: true,
      rendererAgnostic: true,
      providerNeutral: true,
      owns: ["physical articulation descriptors", "physical joints", "motor targets", "ragdoll blend state", "articulated dynamics frames"],
      doesNotOwn: ["kinematic rig solving", "movement intent", "backend joint handles", "renderer bones"]
    }
  });
}

export default createArticulatedDynamicsDomain;
