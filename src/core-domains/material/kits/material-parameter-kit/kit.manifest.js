import { atomicKit } from "../../../manifest-input.js";

export default atomicKit({ id: "material-parameter-kit", responsibility: "Own typed portable values for exact Material parameter slots.", domainPath: "n:material", apiName: "renderMaterialParameters", requires: ["n:material", "render:material-binding"], provides: ["render:material-parameter"], module: "./src/core-domains/material/kits/material-parameter-kit/index.js", exportName: "createMaterialParameterKit", publicSubpath: "./domains/material/parameter", proofReferences: ["tests/core-domains/core-graphics-domain-smoke.mjs"] });
