import { defineCoreDomainManifest } from "../domain-manifest.js";
import { domainNode, manifestShell } from "../manifest-input.js";
import { PHYSICS_BODY_KIT_MANIFESTS } from "./subdomains/body/body-manifests.js";
import physicsBodySubdomainManifest from "./subdomains/body/subdomain.manifest.js";
import { PHYSICS_COLLIDER_KIT_MANIFESTS } from "./subdomains/collider/collider-manifests.js";
import physicsColliderSubdomainManifest from "./subdomains/collider/subdomain.manifest.js";
import { PHYSICS_CONSTRAINT_KIT_MANIFESTS } from "./subdomains/constraints/constraints-manifests.js";
import physicsConstraintsSubdomainManifest from "./subdomains/constraints/subdomain.manifest.js";
import { PHYSICS_CONTRACT_KIT_MANIFESTS } from "./subdomains/contracts/contract-manifests.js";
import physicsContractsSubdomainManifest from "./subdomains/contracts/subdomain.manifest.js";
import { PHYSICS_DETECTION_KIT_MANIFESTS } from "./subdomains/detection/detection-manifests.js";
import physicsDetectionSubdomainManifest from "./subdomains/detection/subdomain.manifest.js";
import { PHYSICS_LIFECYCLE_KIT_MANIFESTS } from "./subdomains/lifecycle/lifecycle-manifests.js";
import physicsLifecycleSubdomainManifest from "./subdomains/lifecycle/subdomain.manifest.js";
import { PHYSICS_MATERIAL_KIT_MANIFESTS } from "./subdomains/material/material-manifests.js";
import physicsMaterialSubdomainManifest from "./subdomains/material/subdomain.manifest.js";
import { PHYSICS_SHAPE_KIT_MANIFESTS } from "./subdomains/shape/shape-manifests.js";
import physicsShapeSubdomainManifest from "./subdomains/shape/subdomain.manifest.js";
import { PHYSICS_WORLD_KIT_MANIFESTS } from "./subdomains/world/world-manifests.js";
import physicsWorldSubdomainManifest from "./subdomains/world/subdomain.manifest.js";

const proof = ["tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs"];

export const physicsDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({
    id: "physics-domain",
    domainPath: "n:physics",
    label: "Physics",
    responsibility: "Own the canonical backend-neutral Physics boundary and compose its atomic capability subdomains.",
    owns: ["Physics domain identity", "Physics capability catalog", "provider-neutral Physics contracts"],
    forbiddenResponsibilities: ["concrete physics backend implementation", "renderer resources or frame submission", "input bindings", "gameplay damage or scoring"],
    requires: ["n:runtime"],
    provides: ["n:physics", "physics:domain-contract"],
    proofReferences: proof
  }),
  subdomains: [
    physicsContractsSubdomainManifest,
    physicsLifecycleSubdomainManifest,
    physicsBodySubdomainManifest,
    physicsShapeSubdomainManifest,
    physicsMaterialSubdomainManifest,
    physicsColliderSubdomainManifest,
    physicsDetectionSubdomainManifest,
    physicsConstraintsSubdomainManifest,
    physicsWorldSubdomainManifest
  ],
  publicEntry: { subpath: "./domains/physics", module: "./src/core-domains/physics/index.js" },
  publicEntries: [
    { domainPath: "n:physics:contracts", subpath: "./domains/physics/contracts", module: "./src/core-domains/physics/subdomains/contracts/index.js" },
    { domainPath: "n:physics:lifecycle", subpath: "./domains/physics/lifecycle", module: "./src/core-domains/physics/subdomains/lifecycle/index.js" },
    { domainPath: "n:physics:body", subpath: "./domains/physics/body", module: "./src/core-domains/physics/subdomains/body/index.js" },
    { domainPath: "n:physics:shape", subpath: "./domains/physics/shape", module: "./src/core-domains/physics/subdomains/shape/index.js" },
    { domainPath: "n:physics:material", subpath: "./domains/physics/material", module: "./src/core-domains/physics/subdomains/material/index.js" },
    { domainPath: "n:physics:collider", subpath: "./domains/physics/collider", module: "./src/core-domains/physics/subdomains/collider/index.js" },
    { domainPath: "n:physics:detection", subpath: "./domains/physics/detection", module: "./src/core-domains/physics/subdomains/detection/index.js" },
    { domainPath: "n:physics:constraints", subpath: "./domains/physics/constraints", module: "./src/core-domains/physics/subdomains/constraints/index.js" },
    { domainPath: "n:physics:world", subpath: "./domains/physics/world", module: "./src/core-domains/physics/subdomains/world/index.js" }
  ],
  publicKits: [
    ...PHYSICS_CONTRACT_KIT_MANIFESTS,
    ...PHYSICS_LIFECYCLE_KIT_MANIFESTS,
    ...PHYSICS_BODY_KIT_MANIFESTS,
    ...PHYSICS_SHAPE_KIT_MANIFESTS,
    ...PHYSICS_MATERIAL_KIT_MANIFESTS,
    ...PHYSICS_COLLIDER_KIT_MANIFESTS,
    ...PHYSICS_DETECTION_KIT_MANIFESTS,
    ...PHYSICS_CONSTRAINT_KIT_MANIFESTS,
    ...PHYSICS_WORLD_KIT_MANIFESTS
  ]
}));

export default physicsDomainManifest;
