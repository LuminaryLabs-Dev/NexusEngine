import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createCoreAssetsKit } from "../../src/core-kits/core-assets-kit/index.js";

const records = new Map();
const cache = {
  id: "memory-cache",
  async get(key) { return structuredClone(records.get(key) ?? null); },
  async put(key, value) { records.set(key, structuredClone(value)); },
  async delete(key) { records.delete(key); }
};
let loads = 0;
const first = createEngine({ kits: [createCoreAssetsKit()] });
first.n.coreAssets.setCacheProvider(cache);
first.n.coreAssets.registerProvider({ id: "fixture", async load() { loads += 1; return { portable: { cached: true } }; } });
first.n.coreAssets.registerAsset({ id: "cached", type: "json", providerId: "fixture" });
await first.n.coreAssets.request("cached");
assert.equal(loads, 1);

const second = createEngine({ kits: [createCoreAssetsKit()] });
second.n.coreAssets.setCacheProvider(cache);
second.n.coreAssets.registerAsset({ id: "cached", type: "json", providerId: "fixture" });
const receipt = await second.n.coreAssets.request("cached");
assert.equal(receipt.cached, true);
assert.equal(loads, 1);
console.log("core assets cache smoke passed");
