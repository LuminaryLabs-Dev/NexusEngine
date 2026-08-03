import { createThirdPersonCameraDescriptor } from "./contracts.js";

function subjectFromMotion(engine, actorId) {
  const frame = engine.n.motion.getMotionFrame?.();
  const result = frame?.results?.find?.((entry) => entry?.actorId === actorId || entry?.bodyId === actorId);
  return result?.position ?? result?.transform?.position ?? null;
}

export function createThirdPersonCameraServices(baseApi, engine, character, config) {
  const motionActorId = character.character.bindings.motionActorId;
  return {
    describe(command = {}) {
      return baseApi.applyCommand(command, (state, request) => {
        const subject = request.subject ?? subjectFromMotion(engine, motionActorId);
        if (!subject) throw new TypeError(`Third-Person Camera requires a public Motion position for ${motionActorId}.`);
        const descriptor = createThirdPersonCameraDescriptor(state, { ...request, subject, motionActorId }, config);
        return { patch: { yaw: descriptor.yaw, pitch: descriptor.pitch, descriptor, sequence: descriptor.sequence }, result: { descriptor } };
      });
    },
    getDescriptor: () => baseApi.getState().descriptor
  };
}
