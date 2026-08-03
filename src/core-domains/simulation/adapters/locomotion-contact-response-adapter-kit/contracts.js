import { cloneSerializableState } from "../../../../foundation/serializable-state.js";

function resultOf(value) {
  return value?.result ?? value;
}

export function createLocomotionContactResponse(input = {}) {
  const frame = cloneSerializableState(input.locomotionFrame ?? input.frame);
  const contactResult = cloneSerializableState(resultOf(input.contactResult ?? input.contact));
  if (!frame || typeof frame !== "object") throw new TypeError("Locomotion Contact Response requires a locomotion frame.");
  if (!contactResult || typeof contactResult !== "object") throw new TypeError("Locomotion Contact Response requires a World Contact result.");
  const correction = contactResult.correction ?? {};
  return cloneSerializableState({
    ...frame,
    position: correction.position ?? frame.position,
    velocity: correction.velocity ?? frame.velocity,
    grounded: contactResult.contact?.grounded ?? frame.grounded ?? false,
    contact: contactResult.contact ?? null,
    recoveryRequired: correction.recoveryRequired ?? contactResult.recoveryRequired ?? frame.recoveryRequired ?? null,
    metadata: { ...(frame.metadata ?? {}), contactResponseApplied: true }
  });
}
