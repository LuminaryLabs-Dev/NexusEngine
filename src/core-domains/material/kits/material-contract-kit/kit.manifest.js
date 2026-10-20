import { atomicKit } from "../../../manifest-input.js";

export default atomicKit({ id: "material-contract-kit", responsibility: "Define the canonical backend-neutral Render Material execution boundary.", domainPath: "n:material", apiName: "renderMaterialContract", requires: ["n:render"], provides: ["n:material", "render:material-contract"], module: "./src/core-domains/material/kits/material-contract-kit/index.js", exportName: "createMaterialContractKit", publicSubpath: "./domains/material/contract", proofReferences: ["tests/core-domains/core-graphics-domain-smoke.mjs"] });
