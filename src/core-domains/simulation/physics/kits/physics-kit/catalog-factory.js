import { createPhysicsKit } from "./index.js";

export function createSimulationPhysicsContractKit(config = {}) {
  return createPhysicsKit({
    ...config,
    manifestId: "simulation-physics-contract-kit",
    id: config.id ?? "simulation-physics-contract-kit",
    apiName: "physicsContract"
  });
}

export default createSimulationPhysicsContractKit;
