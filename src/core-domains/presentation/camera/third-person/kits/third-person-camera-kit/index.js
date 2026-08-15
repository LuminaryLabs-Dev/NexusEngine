import { createDomainKit } from "../../../../../domain-kit.js";
import { createThirdPersonCameraServices } from "./services.js";
import { createThirdPersonCameraState, normalizeThirdPersonCameraConfig } from "./contracts.js";

export { createThirdPersonCameraDescriptor, createThirdPersonCameraState, normalizeThirdPersonCameraConfig } from "./contracts.js";

export function createThirdPersonCameraKit(config = {}) {
  const normalized = normalizeThirdPersonCameraConfig(config);
  return createDomainKit({
    ...config,
    manifestId: "third-person-camera-kit",
    id: config.id ?? "third-person-camera-kit",
    domain: "third-person-camera",
    domainPath: "n:presentation:camera:third-person",
    parentDomainPath: "n:presentation:camera",
    apiName: "thirdPersonCamera",
    requires: ["n:presentation:camera", "character:resolution", "motion:velocity"],
    provides: ["n:presentation:camera:third-person", "camera:third-person-descriptor"],
    config: normalized,
    initialState: createThirdPersonCameraState(normalized),
    createApi({ baseApi, engine }) {
      const character = engine.n.character?.resolve?.(normalized.characterId);
      if (!character) throw new TypeError(`Third-Person Camera cannot resolve character ${normalized.characterId}.`);
      if (!character.character.bindings.motionActorId) throw new TypeError(`Third-Person Camera character ${normalized.characterId} requires a public motionActorId binding.`);
      if (!engine.n.motion?.getMotionFrame) throw new TypeError("Third-Person Camera requires the public Motion API.");
      return createThirdPersonCameraServices(baseApi, engine, character, normalized);
    },
    metadata: { rendererAgnostic: true, occlusionIndependent: true, historicalSource: "src/character-camera-kit.js@a9adca5" }
  });
}

export default createThirdPersonCameraKit;
