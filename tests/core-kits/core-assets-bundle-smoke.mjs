import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createAssetRegistryKit } from "../../src/core-domains/asset/kits/asset-kit/index.js";

const engine = createEngine({ kits: [createAssetRegistryKit()] });
const assets = engine.n.asset;
assets.registerProvider({ id: "fixture", async load(asset) { return { portable: { id: asset.id } }; } });
assets.registerAsset({ id: "one", type: "json", providerId: "fixture" });
assets.registerAsset({ id: "two", type: "json", providerId: "fixture" });
assets.registerBundle({ id: "bundle", assets: ["one", "two"] });
const progress = [];
const receipt = await assets.requestBundle("bundle", { onProgress(value) { progress.push(value); } });
assert.equal(receipt.kind, "bundle");
assert.equal(receipt.result.assetCount, 2);
assert.equal(progress.at(-1), 1);
console.log("core assets bundle smoke passed");
