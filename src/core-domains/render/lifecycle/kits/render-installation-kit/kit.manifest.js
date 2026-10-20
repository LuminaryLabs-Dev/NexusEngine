import { atomicKit } from "../../../../manifest-input.js";

export default atomicKit({
  id: "render-installation-kit",
  responsibility: "Own the aggregate phase, provider generation and controlled handover status for one Render composition.",
  domainPath: "n:render:lifecycle",
  apiName: "renderInstallation",
  requires: ["n:render", "render:provider-contract"],
  provides: ["n:render:lifecycle", "render:installation"],
  module: "./src/core-domains/render/lifecycle/kits/render-installation-kit/index.js",
  exportName: "createRenderInstallationKit",
  publicSubpath: "./domains/render/lifecycle/installation",
  proofReferences: ["tests/core-domains/core-graphics-domain-smoke.mjs", "kits/render/graphics-language-kit/tests/handover.mjs"]
});
