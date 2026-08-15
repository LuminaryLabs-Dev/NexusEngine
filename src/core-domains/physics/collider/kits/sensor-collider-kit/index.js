import { createAtomicColliderKit } from "../../atomic-collider-kit.js";
import { COLLIDER_SCHEMAS } from "../../collider-contracts.js";
import { sensorColliderContract, normalizeSensorCollider } from "./contracts.js";

export function createSensorColliderKit(config = {}) {
  return createAtomicColliderKit(config, {
    manifestId: "sensor-collider-kit",
    domain: "physics-sensor-collider",
    apiName: "physicsSensorCollider",
    provides: ["physics:sensor-collider"],
    purpose: "Normalize non-solving sensor semantics independently from overlap detection and events.",
    owns: ["sensor enabled descriptor", "sensor contact-reporting descriptor"],
    doesNotOwn: ["overlap detection", "contact events", "solver behavior", "gameplay triggers"],
    schema: COLLIDER_SCHEMAS.sensor,
    contract: sensorColliderContract,
    normalize: normalizeSensorCollider
  });
}

export default createSensorColliderKit;
