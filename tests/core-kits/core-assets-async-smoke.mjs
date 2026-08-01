import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createAssetRegistryKit } from "../../src/core-domains/asset/kits/asset-kit/index.js";

const engine = createEngine({ kits: [createAssetRegistryKit()] });
const assets = engine.n.asset;
let loads = 0;
assets.registerProvider({
  id: "fixture",
  async load(asset, context) {
    loads += 1;
    context.updateProgress(1, 2, "loading");
    context.updateProgress(2, 2, "ready");
    return { portable: { id: asset.id, value: asset.metadata.value }, metadata: { fixture: true } };
  }
});
assets.registerAsset({ id: "base", type: "json", providerId: "fixture", metadata: { value: 1 } });
assets.registerAsset({ id: "dependent", type: "json", providerId: "fixture", dependencies: ["base"], metadata: { value: 2 } });
const receipt = await assets.request("dependent");
assert.equal(receipt.targetId, "dependent");
assert.equal(loads, 2);
assert.deepEqual(assets.getValue("dependent"), { id: "dependent", value: 2 });
assert.equal(assets.getStatus("dependent"), "ready");
structuredClone(assets.getSnapshot());
console.log("core assets async smoke passed");
