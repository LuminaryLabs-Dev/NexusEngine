import { atomicKit } from "../../../../manifest-input.js";
export default atomicKit({
  id: "spatial-layout-kit", domainPath: "n:spatial:layout", apiName: "spatialLayout",
  responsibility: "Store validated arrangement descriptions and resolve explicit, row, column and grid placements without moving scene objects.",
  requires: ["n:spatial"], provides: ["n:spatial:layout", "spatial:layout-resolution"],
  module: "./src/core-domains/spatial/layout/kits/layout-kit/index.js", exportName: "createSpatialLayoutKit",
  publicSubpath: "./domains/spatial/layout", proofReferences: ["src/core-domains/spatial/tests/spatial-layout.mjs"]
});
