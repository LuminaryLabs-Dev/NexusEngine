import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreAssetsKit } from "../../src/core-kits/core-assets-kit/index.js";

const engine = createEngine({ kits: [createCoreAssetsKit()] });
let loads = 0;
engine.n.coreAssets.registerProvider({
  id: "fixture",
  async load() {
    loads += 1;
    await Promise.resolve();
    return { portable: { ok: true } };
  }
});
engine.n.coreAssets.registerAsset({ id: "same", type: "json", providerId: "fixture" });
const [left, right] = await Promise.all([
  engine.n.coreAssets.request("same"),
  engine.n.coreAssets.request("same")
]);
assert.equal(loads, 1);
assert.equal(left.id, right.id);
console.log("core assets deduplication smoke passed");
