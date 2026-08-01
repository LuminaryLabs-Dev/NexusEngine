import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createAssetRegistryKit } from "../../src/core-domains/asset/kits/asset-kit/index.js";

const engine = createEngine({ kits: [createAssetRegistryKit()] });
let loads = 0;
engine.n.asset.registerProvider({
  id: "fixture",
  async load() {
    loads += 1;
    await Promise.resolve();
    return { portable: { ok: true } };
  }
});
engine.n.asset.registerAsset({ id: "same", type: "json", providerId: "fixture" });
const [left, right] = await Promise.all([
  engine.n.asset.request("same"),
  engine.n.asset.request("same")
]);
assert.equal(loads, 1);
assert.equal(left.id, right.id);
console.log("core assets deduplication smoke passed");
