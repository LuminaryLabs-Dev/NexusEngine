import { BODY_INERTIA_SCHEMA, normalizeBodyInertia } from "../../body-contracts.js";

export { normalizeBodyInertia };

export function bodyInertiaContract() {
  return Object.freeze({
    schema: BODY_INERTIA_SCHEMA,
    representation: "principal-diagonal-with-local-orientation",
    inversePrincipalDerived: true,
    tensorEstimationOwnedExternally: true
  });
}

