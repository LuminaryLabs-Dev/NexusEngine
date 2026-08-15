import { createDomainKit } from "../../../../domain-kit.js";
import {
  BODY_STATE_SCHEMA,
  inspectBodyValue,
  normalizeAtomicBodySnapshot,
  normalizeBodyState
} from "../../body-contracts.js";
import { bodyStateContract } from "./contracts.js";

const REQUIRES = Object.freeze([
  "n:physics",
  "physics:body-identity",
  "physics:body-type",
  "physics:body-pose",
  "physics:body-velocity",
  "physics:body-force",
  "physics:body-mass",
  "physics:body-inertia",
  "physics:body-damping",
  "physics:body-sleep",
  "physics:body-lifecycle"
]);

export function createBodyStateKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "body-state-kit",
    id: config.id ?? "body-state-kit",
    domain: "physics-body-state",
    domainPath: "n:physics:body",
    parentDomainPath: "n:physics",
    apiName: config.apiName ?? "physicsBodyState",
    requires: REQUIRES,
    provides: ["n:physics:body", "physics:body-state"],
    purpose: "Compose the atomic portable body descriptors into one coherent provider-neutral body state.",
    owns: ["body state composition", "cross-descriptor body invariants"],
    doesNotOwn: ["body registry", "motion integration", "colliders", "provider handles"],
    createApi({ baseApi, engine }) {
      const parts = {
        identity: (...args) => engine.n.physicsBodyIdentity.normalize(...args),
        type: (...args) => engine.n.physicsBodyType.normalize(...args),
        pose: (...args) => engine.n.physicsBodyPose.normalize(...args),
        velocity: (...args) => engine.n.physicsBodyVelocity.normalize(...args),
        force: (...args) => engine.n.physicsBodyForce.normalize(...args),
        mass: (...args) => engine.n.physicsBodyMass.normalize(...args),
        inertia: (...args) => engine.n.physicsBodyInertia.normalize(...args),
        damping: (...args) => engine.n.physicsBodyDamping.normalize(...args),
        sleep: (...args) => engine.n.physicsBodySleep.normalize(...args),
        lifecycle: (...args) => engine.n.physicsBodyLifecycle.normalize(...args)
      };
      const normalize = (input) => normalizeBodyState(input, parts);
      return {
        ...baseApi,
        getContract: bodyStateContract,
        normalize,
        inspect(input) {
          return inspectBodyValue(normalize, input, BODY_STATE_SCHEMA);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeAtomicBodySnapshot(snapshot, "physics-body-state"));
        }
      };
    }
  });
}

export default createBodyStateKit;

