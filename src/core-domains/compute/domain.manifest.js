import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const computeProof = ["tests/core-domains/core-compute-domain-smoke.mjs"];
const modelProof = ["tests/core-kits/core-mlnn-kit-smoke.mjs"];

export const computeDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({ id: "compute-domain", domainPath: "n:compute", label: "Compute", responsibility: "Own parallel compute descriptors, dependency graphs, dispatch plans, and provider contracts.", owns: ["compute descriptors", "compute graphs", "dispatch plans", "provider contracts"], forbiddenResponsibilities: ["GPU implementation", "worker pool implementation", "model runtime", "renderer passes"], provides: ["n:compute", "compute:descriptor", "compute:graph", "compute:provider-contract"], proofReferences: computeProof }),
  subdomains: [domainNode({ id: "compute-model-domain", domainPath: "n:compute:model", parentDomainPath: "n:compute", label: "Compute Model", responsibility: "Own model descriptors, registries, inference requests/results, and model provider contracts.", owns: ["model descriptors", "model registry", "inference requests", "inference results"], forbiddenResponsibilities: ["model runtime implementation", "network model service", "authored model files", "agent policy"], requires: ["n:compute"], provides: ["n:compute:model", "model:registry", "model:inference-contract"], proofReferences: modelProof })],
  publicEntry: { subpath: "./domains/compute", module: "./src/core-domains/compute/index.js" },
  publicKits: [
    atomicKit({ id: "compute-graph-kit", responsibility: "Validate compute descriptors and create deterministic dependency-ordered dispatch plans.", domainPath: "n:compute", apiName: "compute", provides: ["n:compute", "compute:descriptor", "compute:graph", "compute:provider-contract"], module: "./src/core-domains/compute/kits/compute-kit/index.js", exportName: "createComputeKit", publicSubpath: "./domains/compute/graph", proofReferences: computeProof }),
    atomicKit({ id: "model-registry-kit", responsibility: "Register model descriptors and normalize provider-neutral inference requests and results.", domainPath: "n:compute:model", apiName: "model", requires: ["n:compute"], provides: ["n:compute:model", "model:registry", "model:inference-contract"], module: "./src/core-domains/compute/subdomains/model/kits/model-kit/index.js", exportName: "createModelKit", publicSubpath: "./domains/compute/model", proofReferences: modelProof })
  ]
}));

export default computeDomainManifest;
