import assert from "node:assert/strict";
import {
  createEngine,
  createDomainServiceToken,
  defineDomainServiceKit,
  validateDomainServiceKit,
  isDomainServiceKit,
  createCoreDataKit
} from "../src/index.js";

assert.equal(createDomainServiceToken("release-domain"), "n:release-domain");
assert.equal(createDomainServiceToken("release-domain", "state"), "n:release-domain:state");
assert.throws(() => createDomainServiceToken("Release Domain"), /invalid domain/);

const releaseKit = defineDomainServiceKit({
  domain: "release-domain",
  stability: "stable-candidate",
  version: "0.0.3",
  services: ["state", "snapshot"],
  createApi() {
    return {
      snapshot() {
        return { ok: true };
      },
      reset() {
        return { ok: true, reset: true };
      }
    };
  }
});

assert.equal(isDomainServiceKit(releaseKit), true);
assert.equal(validateDomainServiceKit(releaseKit), releaseKit);
assert.equal(releaseKit.id, "n-release-domain-kit");
assert.ok(releaseKit.provides.includes("n:release-domain"));
assert.ok(releaseKit.provides.includes("n:release-domain:state"));
assert.ok(releaseKit.provides.includes("n:release-domain:snapshot"));
assert.equal(releaseKit.metadata.version, "0.0.3");
assert.equal(releaseKit.metadata.stability, "stable-candidate");
assert.equal(releaseKit.metadata.execution.snapshot, "required");
assert.equal(releaseKit.metadata.execution.reset, "required");

const engine = createEngine();
engine.installKit(releaseKit);
assert.equal(typeof engine.n.releaseDomain.snapshot, "function");
assert.deepEqual(engine.n.releaseDomain.snapshot(), { ok: true });

const dependentKit = defineDomainServiceKit({
  domain: "release-dependent",
  stability: "stable-candidate",
  version: "0.0.3",
  requires: ["n:missing-domain"],
  createApi() {
    return {};
  }
});
assert.throws(() => createEngine({ kits: [dependentKit] }), /requires missing token/);

assert.throws(() => defineDomainServiceKit({
  domain: "release-bad-token",
  stability: "stable-candidate",
  version: "0.0.3",
  requires: ["not a token"]
}), /malformed requires token/);

const collisionA = defineDomainServiceKit({
  domain: "release-collision-a",
  apiName: "releaseCollision",
  stability: "stable-candidate",
  version: "0.0.3",
  createApi() {
    return {};
  }
});
const collisionB = defineDomainServiceKit({
  domain: "release-collision-b",
  apiName: "releaseCollision",
  stability: "stable-candidate",
  version: "0.0.3",
  createApi() {
    return {};
  }
});
const collisionEngine = createEngine();
collisionEngine.installKit(collisionA);
assert.throws(() => collisionEngine.installKit(collisionB), /cannot overwrite engine\.n\.releaseCollision/);

const coreEngine = createEngine({ kits: [createCoreDataKit()] });
assert.equal(typeof coreEngine.n.coreData.getSnapshot, "function");
assert.equal(typeof coreEngine.n.coreData.reset, "function");
assert.equal(typeof coreEngine.n.coreData.loadSnapshot, "function");
const snapshot = coreEngine.n.coreData.getSnapshot();
assert.equal(snapshot.version, "0.0.3");
coreEngine.n.coreData.update({ descriptors: { release: { marker: { id: "marker" } } } });
assert.ok(coreEngine.n.coreData.getSnapshot().sequence > snapshot.sequence);
coreEngine.n.coreData.reset();
assert.equal(coreEngine.n.coreData.getSnapshot().sequence, 0);
coreEngine.n.coreData.loadSnapshot({ config: { mode: "release" }, descriptors: { proof: { one: true } } });
assert.equal(coreEngine.n.coreData.getSnapshot().config.mode, "release");
assert.equal(coreEngine.n.coreData.getSnapshot().descriptors.proof.one, true);

console.log("release-0.0.3-dsk-contracts ok");
