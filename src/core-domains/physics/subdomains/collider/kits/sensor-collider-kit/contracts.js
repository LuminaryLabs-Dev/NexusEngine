import { COLLIDER_SCHEMAS, normalizeSensorCollider } from "../../collider-contracts.js";

export { normalizeSensorCollider };

export function sensorColliderContract() {
  return Object.freeze({
    schema: COLLIDER_SCHEMAS.sensor,
    nonSolvingWhenEnabled: true,
    contactReportingExplicit: true,
    providerNeutral: true,
    eventEmissionForbidden: true
  });
}
