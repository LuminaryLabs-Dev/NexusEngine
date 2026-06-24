import assert from "node:assert/strict";
import {
  createHostGraphSnapshot,
  createNexusHost,
  defineHostAdapter,
  defineResource,
  defineRuntimeKit
} from "../src/index.js";

const RenderDescriptorState = defineResource("hostSmoke.renderDescriptorState");
const renderDescriptorKit = defineRuntimeKit({
  id: "render-descriptor-kit",
  resources: { RenderDescriptorState },
  provides: ["render.descriptor"],
  metadata: { domain: "render.descriptor", version: "0.0.1" },
  initWorld({ world }) {
    world.setResource(RenderDescriptorState, {
      meshes: [{ id: "cube-01" }],
      revision: "host-smoke-001"
    });
  }
});

const threeHostAdapter = defineHostAdapter({
  id: "three-host-kit",
  domain: "host.render.three",
  provides: ["host.render.three", "render.adapter.three"],
  requires: ["render.descriptor"],
  mount({ host }) {
    host.diagnostics.push({ level: "info", adapterId: "three-host-kit", message: "mounted" });
  },
  snapshot({ engine }) {
    return {
      status: "ready",
      meshCount: engine.world.getResource(RenderDescriptorState).meshes.length
    };
  }
});

const host = createNexusHost({
  id: "host-smoke",
  revision: "host-smoke-001",
  provides: ["scene.ops", "input.intent"],
  kits: [renderDescriptorKit],
  adapters: [threeHostAdapter]
});

assert.equal(host.engine.kits.includes(renderDescriptorKit), true);
assert.equal(host.adapterRecords.length, 1);

const snapshot = host.snapshot();
assert.equal(snapshot.id, "host-smoke");
assert.equal(snapshot.revision, "host-smoke-001");
assert.equal(snapshot.kits["render-descriptor-kit"].domain, "render.descriptor");
assert.equal(snapshot.adapters["three-host-kit"].domain, "host.render.three");
assert.equal(snapshot.adapters["three-host-kit"].snapshot.meshCount, 1);
assert.equal(snapshot.domains["render.descriptor"].owner, "render-descriptor-kit");
assert.equal(snapshot.domains["host.render.three"].owner, "three-host-kit");
assert.equal(snapshot.edges.some((edge) =>
  edge.from === "render-descriptor-kit" &&
  edge.to === "three-host-kit" &&
  edge.token === "render.descriptor" &&
  edge.satisfied === true
), true);
assert.deepEqual(createHostGraphSnapshot(host), snapshot);

assert.throws(() => createNexusHost({
  id: "blocked-host-smoke",
  adapters: [defineHostAdapter({
    id: "blocked-adapter",
    domain: "host.blocked",
    requires: ["missing.token"]
  })]
}), /requires missing token\(s\): missing\.token/);

assert.equal(host.unmountAdapter("three-host-kit"), true);
assert.equal(host.unmountAdapter("three-host-kit"), false);

console.log("host-smoke ok");
