import { NEXUS_ENGINE_VERSION } from "../../release.js";
import { defineCoreDomainManifest } from "../domain-manifest.js";
import {
  objectPlacementKitManifest,
  objectPlacementSubdomainManifest
} from "./subdomains/placement/domain.manifest.js";

const objectKit = (input) => ({
  status: input.status ?? "stable-candidate",
  kind: input.kind ?? "domain-service-kit",
  requires: input.requires ?? [],
  provides: input.provides ?? [],
  exportName: input.exportName,
  module: input.module,
  ...input
});

export const coreObjectDomainManifest = defineCoreDomainManifest({
  id: "core-object-domain",
  domainPath: "n:object",
  label: "Core Object",
  purpose: "Own renderer-neutral object identity and the shape, fidelity, vegetation, and placement capabilities that operate on it.",
  owns: ["object identity", "object descriptors", "object lifecycle", "intrinsic bounds", "pivot", "ground anchor", "object registry"],
  doesNotOwn: ["renderer objects", "GPU resources", "physics resolution", "world generation", "agent decisions"],
  requires: [],
  provides: ["n:object", "object:descriptor-contract", "object:registry", "object:lifecycle"],
  status: "stable-candidate",
  subdomains: [
    {
      id: "domain-object-shape",
      domainPath: "n:object:shape",
      purpose: "Own source and derived geometric shapes, provider jobs, qualification, and fallback.",
      owns: ["shape sources", "shape derivation", "shape qualification", "shape jobs"],
      doesNotOwn: ["object identity", "runtime fidelity selection", "materials", "rendering"],
      requires: ["object:descriptor-contract"],
      provides: ["n:object:shape", "object:shape-source", "object:shape-candidate", "object:shape-qualified", "object:shape-derived", "object:shape-jobs"]
    },
    {
      id: "domain-object-fidelity",
      domainPath: "n:object:fidelity",
      purpose: "Own valid object forms, fidelity packages, readiness, and contextual adaptation.",
      owns: ["object forms", "fidelity profiles", "fidelity builds", "fidelity package selection"],
      doesNotOwn: ["object identity", "shape derivation", "rendering", "asset transport"],
      requires: ["object:descriptor-contract"],
      provides: ["n:object:fidelity", "object:fidelity-forms", "object:fidelity-packages"]
    },
    {
      id: "domain-object-vegetation",
      domainPath: "n:object:vegetation",
      purpose: "Own renderer-neutral rooted plant species, instances, lifecycle, and deterministic variation.",
      owns: ["vegetation species", "vegetation instances", "plant lifecycle", "ecological preferences"],
      doesNotOwn: ["geometry generation", "world placement", "terrain sampling", "rendering"],
      requires: ["n:object"],
      provides: ["n:object:vegetation", "vegetation:species", "vegetation:instances", "vegetation:lifecycle"],
      status: "experimental"
    },
    {
      id: "domain-object-vegetation-tree",
      domainPath: "n:object:vegetation:tree",
      parentDomainPath: "n:object:vegetation",
      purpose: "Own deterministic tree structure, canopy, growth, and fidelity descriptors.",
      owns: ["tree structure", "tree canopy", "tree growth", "tree fidelity"],
      doesNotOwn: ["world placement", "rendering", "terrain"],
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:tree", "vegetation:tree-structure", "vegetation:tree-canopy", "vegetation:tree-growth", "vegetation:tree-fidelity"],
      status: "experimental"
    },
    {
      id: "domain-object-vegetation-foliage",
      domainPath: "n:object:vegetation:foliage",
      parentDomainPath: "n:object:vegetation",
      purpose: "Own deterministic foliage structure and descriptors.",
      owns: ["foliage structures", "foliage descriptors"],
      doesNotOwn: ["world placement", "rendering", "terrain"],
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:foliage", "vegetation:foliage"],
      status: "experimental"
    },
    {
      id: "domain-object-vegetation-ecology",
      domainPath: "n:object:vegetation:ecology",
      parentDomainPath: "n:object:vegetation",
      purpose: "Own deterministic vegetation suitability scoring and species selection.",
      owns: ["vegetation suitability", "species selection"],
      doesNotOwn: ["terrain sampling", "world cells", "spawn budgets"],
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:ecology", "vegetation:ecology-score", "vegetation:ecology-selection"],
      status: "experimental"
    },
    objectPlacementSubdomainManifest
  ],
  kits: [
    objectKit({
      id: "n-core-object-kit",
      version: NEXUS_ENGINE_VERSION,
      domain: "core-object",
      domainPath: "n:object",
      apiName: "coreObject",
      provides: ["n:object", "object:descriptor-contract", "object:registry", "object:lifecycle"],
      exportName: "createCoreObjectKit",
      module: "src/core-domains/core-object-domain/kits/object-registry-kit/index.js"
    }),
    objectKit({
      id: "core-object-shape-domain",
      version: "0.2.0",
      domain: "object-shape",
      domainPath: "n:object:shape",
      parentDomainPath: "n:object",
      apiName: "objectShape",
      requires: ["object:descriptor-contract"],
      provides: ["n:object:shape", "object:shape-source", "object:shape-candidate", "object:shape-qualified", "object:shape-derived", "object:shape-jobs"],
      exportName: "createCoreObjectShapeKit",
      module: "src/core-domains/core-object-domain/subdomains/shape/kits/object-shape-kit/index.js"
    }),
    objectKit({
      id: "core-object-fidelity-domain",
      version: "0.1.0",
      domain: "object-fidelity",
      domainPath: "n:object:fidelity",
      parentDomainPath: "n:object",
      apiName: "objectFidelity",
      requires: ["object:descriptor-contract"],
      provides: ["n:object:fidelity", "object:fidelity-forms", "object:fidelity-packages"],
      exportName: "createCoreObjectFidelityKit",
      module: "src/core-domains/core-object-domain/subdomains/fidelity/kits/object-fidelity-kit/index.js"
    }),
    objectKit({
      id: "n-core-vegetation-kit",
      version: "0.1.0",
      status: "experimental",
      domain: "core-vegetation",
      domainPath: "n:object:vegetation",
      parentDomainPath: "n:object",
      apiName: "vegetation",
      requires: ["n:object"],
      provides: ["n:object:vegetation", "vegetation:species", "vegetation:instances", "vegetation:lifecycle"],
      exportName: "createCoreVegetationKit",
      module: "src/core-domains/core-object-domain/subdomains/vegetation/kits/object-vegetation-kit/index.js"
    }),
    objectKit({
      id: "n-vegetation-tree-domain-kit",
      version: "0.3.0",
      status: "experimental",
      domain: "core-vegetation-tree",
      domainPath: "n:object:vegetation:tree",
      parentDomainPath: "n:object:vegetation",
      apiName: "vegetationTree",
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:tree", "vegetation:tree-structure", "vegetation:tree-canopy", "vegetation:tree-growth", "vegetation:tree-fidelity"],
      exportName: "createTreeDomainKit",
      module: "src/core-domains/core-object-domain/subdomains/vegetation/subdomains/tree-domain/index.js"
    }),
    objectKit({
      id: "n-vegetation-foliage-domain-kit",
      version: "0.2.0",
      status: "experimental",
      domain: "core-vegetation-foliage",
      domainPath: "n:object:vegetation:foliage",
      parentDomainPath: "n:object:vegetation",
      apiName: "vegetationFoliage",
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:foliage", "vegetation:foliage"],
      exportName: "createFoliageDomainKit",
      module: "src/core-domains/core-object-domain/subdomains/vegetation/subdomains/foliage-domain/index.js"
    }),
    objectKit({
      id: "n-vegetation-ecology-domain-kit",
      version: "0.1.0",
      status: "experimental",
      domain: "core-vegetation-ecology",
      domainPath: "n:object:vegetation:ecology",
      parentDomainPath: "n:object:vegetation",
      apiName: "vegetationEcology",
      requires: ["n:object:vegetation"],
      provides: ["n:object:vegetation:ecology", "vegetation:ecology-score", "vegetation:ecology-selection"],
      exportName: "createVegetationEcologyKit",
      module: "src/core-domains/core-object-domain/subdomains/vegetation/subdomains/ecology-domain/index.js"
    }),
    objectKit(objectPlacementKitManifest),
    objectKit({
      id: "meshoptimizer-shape-provider-kit",
      version: "0.1.0",
      kind: "provider-kit",
      domain: "object-shape",
      domainPath: "n:object:shape",
      requires: ["object:shape-jobs"],
      provides: ["object:shape-provider"],
      exportName: "createMeshoptimizerShapeProviderKit",
      module: "src/core-domains/core-object-domain/subdomains/shape/providers/meshoptimizer-shape-provider-kit/index.js"
    }),
    objectKit({
      id: "object-shape-fidelity-adapter-kit",
      version: "0.2.0",
      kind: "adapter-kit",
      domain: "object-shape-fidelity",
      domainPath: "n:object:fidelity",
      requires: ["object:shape-qualified", "object:fidelity-forms"],
      provides: ["object:shape-fidelity-adapter"],
      exportName: "createObjectShapeFidelityAdapterKit",
      module: "src/core-domains/core-object-domain/adapters/object-shape-fidelity-adapter-kit/index.js"
    }),
    objectKit({
      id: "n-vegetation-object-bridge-kit",
      version: "0.1.0",
      kind: "adapter-kit",
      status: "experimental",
      domain: "vegetation-object-bridge",
      domainPath: "n:object:vegetation",
      requires: ["n:object", "n:object:vegetation"],
      provides: ["vegetation:object-bridge"],
      exportName: "createVegetationObjectBridgeKit",
      module: "src/core-domains/core-object-domain/subdomains/vegetation/adapters/vegetation-object-bridge-kit/index.js"
    })
  ],
  providers: [{
    id: "meshoptimizer-shape-provider",
    domainPath: "n:object:shape",
    optional: true
  }],
  adapters: [
    { id: "object-shape-fidelity-adapter-kit", from: "n:object:shape", to: "n:object:fidelity" },
    { id: "n-vegetation-object-bridge-kit", from: "n:object:vegetation", to: "n:object" }
  ]
});

export default coreObjectDomainManifest;
