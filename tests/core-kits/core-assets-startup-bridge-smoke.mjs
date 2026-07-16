import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreAssetsKit } from "../../src/core-kits/core-assets-kit/index.js";
import { createCoreStartupKit } from "../../src/core-kits/core-startup-kit/index.js";
import { trackAssetPreparation } from "../../src/core-domains/core-startup-domain/core-assets-startup-bridge.js";

const engine = createEngine({ kits: [createCoreAssetsKit(), createCoreStartupKit()] });
engine.n.coreAssets.registerProvider({ id: "fixture", async load(asset) { return { portable: { id: asset.id } }; } });
engine.n.coreAssets.registerAsset({ id: "tree", type: "json", providerId: "fixture" });
engine.n.coreAssets.registerBundle({ id: "trees", assets: ["tree"] });
engine.n.coreStartup.launch({ launchId: "fixture:1", projectId: "fixture", preparations: [] });
const receipt = await trackAssetPreparation({
  startup: engine.n.coreStartup,
  assets: engine.n.coreAssets,
  preparationId: "tree-fidelity",
  bundleId: "trees",
  required: true,
  weight: 4
});
assert.equal(receipt.targetId, "trees");
assert.equal(engine.n.coreStartup.getPreparation("tree-fidelity").status, "ready");
console.log("core assets startup bridge smoke passed");
