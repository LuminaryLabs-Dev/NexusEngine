import assert from "node:assert/strict";
import { createGPUHost } from "nexusengine/domains/host";
import { createContractGPUProvider } from "../helpers/gpu-contract-provider.mjs";
// Native Compute/Render submission proof moved intact to NexusEngine-Kits/tests/providers.
const host = createGPUHost({ provider: createContractGPUProvider() });
await host.ensureResource({ id: "shared", type: "buffer", byteLength: 64, usage: ["storage", "vertex"] });
const handle = host.providerAccess().resolveResource("shared");
host.beginWrite("shared", "compute");
assert.throws(() => host.beginRead("shared", "render"), /still being written/);
const written = host.completeWrite("shared", "compute");
host.beginRead("shared", "render");
assert.equal(host.providerAccess().resolveResource("shared"), handle);
assert.equal(host.getResource("shared").revision, written.revision);
assert.throws(() => host.beginWrite("shared", "compute"), /cannot begin write/);
host.completeRead("shared", "render");
assert.equal(host.getResource("shared").state, "available");
assert.doesNotThrow(() => structuredClone(host.snapshot()));
host.dispose(); assert.equal(host.listResources().length, 0);
console.log("Portable Host shared-resource ownership proof passed; native execution proof lives with external providers");
