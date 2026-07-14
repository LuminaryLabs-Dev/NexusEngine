import assert from "node:assert/strict";
import {
  createEngine,
  createCoreCapabilityDescriptor,
  createCoreCapabilityKit,
  createCoreDataKit,
  createCoreInputKit,
  createCoreGraphicsKit,
  createCoreReflectionKit,
  createCoreInteractionKit
} from "../src/index.js";

const descriptor = createCoreCapabilityDescriptor("core-release-check", {
  owns: ["release check"],
  doesNotOwn: ["host state"],
  services: ["audit"]
});
assert.equal(descriptor.version, "0.0.3");
assert.equal(descriptor.stability, "stable-candidate");
assert.ok(descriptor.domain.startsWith("core-"));
assert.throws(() => createCoreCapabilityDescriptor("release-check"), /core-\*/);

const customKit = createCoreCapabilityKit({
  domain: "core-release-custom",
  services: ["audit"],
  descriptors: { audit: { release: { version: "0.0.3" } } },
  config: { enabled: true }
});

const customEngine = createEngine({ kits: [customKit] });
assert.equal(customEngine.n.coreReleaseCustom.getSnapshot().version, "0.0.3");
assert.equal(customEngine.n.coreReleaseCustom.getConfig().enabled, true);
customEngine.n.coreReleaseCustom.configure({ enabled: false });
assert.equal(customEngine.n.coreReleaseCustom.getConfig().enabled, false);
customEngine.n.coreReleaseCustom.setDescriptor("audit", "gate", { pass: true });
assert.equal(customEngine.n.coreReleaseCustom.getDescriptors("audit").gate.pass, true);
customEngine.n.coreReleaseCustom.reset();
assert.equal(customEngine.n.coreReleaseCustom.getSnapshot().sequence, 0);

const coreFactories = [
  createCoreDataKit,
  createCoreInputKit,
  createCoreGraphicsKit,
  createCoreReflectionKit,
  createCoreInteractionKit
];
const engine = createEngine({ kits: coreFactories.map((factory) => factory()) });
for (const kit of engine.kits) {
  assert.equal(kit.metadata.kind, "domain-service-kit");
  assert.equal(kit.metadata.version, "0.0.3");
  assert.equal(kit.metadata.stability, "stable-candidate");
  assert.ok(kit.provides.includes(`n:${kit.metadata.domain}`));
  const api = engine.n[kit.metadata.apiName];
  assert.equal(typeof api.getSnapshot, "function");
  assert.equal(typeof api.reset, "function");
  assert.equal(typeof api.loadSnapshot, "function");
  assert.equal(api.getSnapshot().version, "0.0.3");
}

console.log("release-0.0.3-core-kit-contracts ok");
