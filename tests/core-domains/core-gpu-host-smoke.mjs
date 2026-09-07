import assert from "node:assert/strict";
import { createGPUHost } from "nexusengine/domains/host";
import { createContractGPUProvider } from "../helpers/gpu-contract-provider.mjs";

const provider = createContractGPUProvider();
const host = createGPUHost({ id: "gpu-host-smoke", provider });
const device = await host.ensureDevice({ requiredBackend: "contract-test", requiredFeatures: ["compute", "render", "storage-buffer"] });
assert.equal(device.id, "gpu-1");
assert.equal(host.providerAccess().backend, "contract-test");

await host.ensureResource({ id: "shared", type: "buffer", byteLength: 64, usage: ["storage"] }, new Float32Array(16));
await host.ensureResource({ id: "shared", type: "buffer", byteLength: 64, usage: ["vertex", "indirect"] });
assert.deepEqual(host.getResource("shared").usage, ["indirect", "storage", "vertex"]);
const firstNative = host.providerAccess().resolveResource("shared");
assert.ok(firstNative);

host.beginWrite("shared", "compute");
const written = host.completeWrite("shared", "compute");
assert.equal(written.state, "ready");
assert.ok(written.revision >= 1);
host.beginRead("shared", "render");
assert.equal(host.getResource("shared").state, "in-use");
host.completeRead("shared", "render");
assert.equal(host.getResource("shared").state, "available");

host.retainResource("shared", "cell-42");
assert.throws(() => host.evictResource("shared"), /referenced/);
host.releaseResource("shared", "cell-42");
assert.equal(host.evictResource("shared"), true);
assert.equal(host.getResource("shared"), null);

await host.ensureResource({ id: "recoverable", type: "buffer", byteLength: 32, usage: ["storage", "vertex"] });
const recoverableA = host.providerAccess().resolveResource("recoverable");
host.invalidate("test-loss");
assert.equal(host.getResource("recoverable").state, "invalid");
assert.equal(host.getResource("recoverable").residency, "nonresident");
const restored = await host.restore({ requiredBackend: "contract-test" });
assert.equal(restored.id, "gpu-2");
await host.ensureResource({ id: "recoverable", type: "buffer", byteLength: 32, usage: ["storage", "vertex"] });
assert.notEqual(host.providerAccess().resolveResource("recoverable"), recoverableA);

const snapshot = host.snapshot();
assert.doesNotThrow(() => structuredClone(snapshot));
const serialized = JSON.stringify(snapshot);
assert.ok(!serialized.includes("GPUBuffer"));
assert.ok(!serialized.includes("createBuffer"));

console.log(JSON.stringify({ status: "PASS", device: device.id, restoredDevice: restored.id, resources: snapshot.resources.length }, null, 2));

host.dispose();
assert.equal(host.snapshot().resources.length, 0);
