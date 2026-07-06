import assert from "node:assert/strict";
import {
  createEngine,
  defineDomainServiceKit,
  isDomainPath,
  normalizeDomainPath
} from "../src/index.js";

const physicsWorld = defineDomainServiceKit({
  id: "physics-world-domain-kit",
  domain: "physics-world",
  domainPath: "n:physics:world",
  parentDomainPath: "n:physics",
  apiName: "physicsWorld",
  stability: "experimental",
  version: "0.1.0",
  createApi() {
    return {
      getState() {
        return { ready: true };
      }
    };
  }
});

const rigidbody = defineDomainServiceKit({
  id: "physics-rigidbody-domain-kit",
  domain: "physics-rigidbody",
  domainPath: "n:physics:rigidbody",
  parentDomainPath: "n:physics",
  apiPath: "n:physics:rigidbody:api",
  apiName: "physicsRigidbody",
  visibility: "editor-safe",
  stability: "experimental",
  version: "0.1.0",
  requires: ["n:physics:world"],
  services: ["query"],
  createApi() {
    return {
      getState() {
        return { bodies: 0 };
      }
    };
  }
});

assert.equal(isDomainPath("n:physics:rigidbody"), true);
assert.equal(normalizeDomainPath(" N:Physics:Rigidbody "), "n:physics:rigidbody");
assert.equal(rigidbody.metadata.domainPath, "n:physics:rigidbody");
assert.equal(rigidbody.metadata.parentDomainPath, "n:physics");
assert.equal(rigidbody.metadata.apiPath, "n:physics:rigidbody:api");
assert.ok(rigidbody.provides.includes("n:physics:rigidbody"));
assert.ok(rigidbody.provides.includes("n:physics-rigidbody"));
assert.ok(rigidbody.provides.includes("n:physics:rigidbody:query"));
assert.ok(rigidbody.provides.includes("n:physics-rigidbody:query"));

assert.throws(() => createEngine({ kits: [rigidbody] }), /requires missing token\(s\): n:physics:world/);

const engine = createEngine({ kits: [physicsWorld, rigidbody] });
assert.equal(engine.n.ownerOf("n:physics:rigidbody"), "physics-rigidbody-domain-kit");
assert.equal(engine.n.path("n:physics:rigidbody").parentPath, "n:physics");
const pathNames = engine.n.paths().map((entry) => entry.path);
assert.ok(pathNames.includes("n:realtime"));
assert.ok(pathNames.includes("n:sequence"));
assert.ok(pathNames.includes("n:physics:rigidbody"));
assert.ok(pathNames.includes("n:physics:world"));
assert.equal(engine.n.api("physicsRigidbody").domainPath, "n:physics:rigidbody");
assert.equal(engine.n.api("physicsRigidbody").visibility, "editor-safe");
const apiNames = engine.n.apis().map((entry) => entry.name);
assert.ok(apiNames.includes("realtime"));
assert.ok(apiNames.includes("sequence"));
assert.ok(apiNames.includes("physicsRigidbody"));
assert.ok(apiNames.includes("physicsWorld"));
assert.deepEqual(engine.n.physicsRigidbody.getState(), { bodies: 0 });

engine.n.registerPath({
  path: "n:custom:tool",
  parentPath: "n:custom",
  ownerKitId: "custom-tool-domain-kit"
});
assert.equal(engine.n.ownerOf("n:custom:tool"), "custom-tool-domain-kit");

const duplicatePath = defineDomainServiceKit({
  id: "physics-rigidbody-duplicate-kit",
  domain: "physics-rigidbody-duplicate",
  domainPath: "n:physics:rigidbody",
  parentDomainPath: "n:physics",
  apiName: "physicsRigidbodyDuplicate",
  stability: "experimental",
  version: "0.1.0",
  createApi() {
    return {};
  }
});
assert.throws(
  () => createEngine({ kits: [physicsWorld, rigidbody, duplicatePath] }),
  /Domain path n:physics:rigidbody is already registered to kit physics-rigidbody-domain-kit/
);

const duplicateApi = defineDomainServiceKit({
  id: "physics-collider-domain-kit",
  domain: "physics-collider",
  domainPath: "n:physics:collider",
  parentDomainPath: "n:physics",
  apiName: "physicsRigidbody",
  stability: "experimental",
  version: "0.1.0",
  createApi() {
    return {};
  }
});
assert.throws(
  () => createEngine({ kits: [physicsWorld, rigidbody, duplicateApi] }),
  /cannot overwrite engine\.n\.physicsRigidbody/
);

const reservedApi = defineDomainServiceKit({
  id: "domain-path-reader-kit",
  domain: "domain-path-reader",
  domainPath: "n:domain:path-reader",
  parentDomainPath: "n:domain",
  apiName: "paths",
  stability: "experimental",
  version: "0.1.0",
  createApi() {
    return {};
  }
});
assert.throws(() => createEngine({ kits: [reservedApi] }), /cannot overwrite engine\.n\.paths/);

assert.throws(
  () => defineDomainServiceKit({
    domain: "bad-path",
    domainPath: "physics:rigidbody",
    stability: "experimental",
    version: "0.1.0"
  }),
  /invalid domainPath/
);
assert.throws(
  () => defineDomainServiceKit({
    domain: "bad-parent",
    domainPath: "n:physics:rigidbody",
    parentDomainPath: "n:terrain",
    stability: "experimental",
    version: "0.1.0"
  }),
  /nested under parentDomainPath/
);

console.log("domain-path-api-registration-smoke ok");
