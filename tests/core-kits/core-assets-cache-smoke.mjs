import assert from "node:assert/strict";
import { createEngine } from "../../src/engine.js";
import { createAssetRegistryKit } from "../../src/core-domains/asset/kits/asset-kit/index.js";

const records = new Map();
const cache = {
  id: "memory-cache",
  async get(key) { return structuredClone(records.get(key) ?? null); },
  async put(key, value) { records.set(key, structuredClone(value)); },
  async delete(key) { records.delete(key); }
};
let loads = 0;
const first = createEngine({ kits: [createAssetRegistryKit()] });
first.n.asset.setCacheProvider(cache);
first.n.asset.registerProvider({ id: "fixture", async load() { loads += 1; return { portable: { cached: true } }; } });
first.n.asset.registerAsset({ id: "cached", type: "json", providerId: "fixture" });
await first.n.asset.request("cached");
assert.equal(loads, 1);

const second = createEngine({ kits: [createAssetRegistryKit()] });
second.n.asset.setCacheProvider(cache);
second.n.asset.registerAsset({ id: "cached", type: "json", providerId: "fixture" });
const receipt = await second.n.asset.request("cached");
assert.equal(receipt.cached, true);
assert.equal(loads, 1);
console.log("core assets cache smoke passed");
