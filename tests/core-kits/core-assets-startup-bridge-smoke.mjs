import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createAssetRegistryKit } from "../../src/core-domains/asset/kits/asset-kit/index.js";
import { createStartupKit } from "../../src/core-domains/runtime/startup/kits/startup-kit/index.js";
import { trackAssetPreparation } from "../../src/core-domains/runtime/startup/core-assets-startup-bridge.js";

const engine = createEngine({ kits: [createAssetRegistryKit(), createStartupKit()] });
engine.n.asset.registerProvider({ id: "fixture", async load(asset) { return { portable: { id: asset.id } }; } });
engine.n.asset.registerAsset({ id: "tree", type: "json", providerId: "fixture" });
engine.n.asset.registerBundle({ id: "trees", assets: ["tree"] });
engine.n.startup.launch({ launchId: "fixture:1", projectId: "fixture", preparations: [] });
const receipt = await trackAssetPreparation({
  startup: engine.n.startup,
  assets: engine.n.asset,
  preparationId: "tree-fidelity",
  bundleId: "trees",
  required: true,
  weight: 4
});
assert.equal(receipt.targetId, "trees");
assert.equal(engine.n.startup.getPreparation("tree-fidelity").status, "ready");
console.log("core assets startup bridge smoke passed");
