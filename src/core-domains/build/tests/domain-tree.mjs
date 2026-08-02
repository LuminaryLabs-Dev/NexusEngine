import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

import buildDomainManifest from "../domain.manifest.js";

assert.equal(buildDomainManifest.domainPath, "n:build");
assert.equal(buildDomainManifest.subdomains.length, 15);
assert.equal(buildDomainManifest.publicEntries.length, 15);
assert.equal(buildDomainManifest.publicKits.length, 46);
assert.equal(new Set(buildDomainManifest.publicKits.map((kit) => kit.id)).size, 46);
assert.equal(new Set(buildDomainManifest.publicKits.map((kit) => kit.source.publicSubpath)).size, 46);

const providers = new Map();
for (const kit of buildDomainManifest.publicKits) {
  for (const token of kit.provides) {
    providers.set(token, [...(providers.get(token) ?? []), kit.id].sort());
  }
}

const edges = new Map(buildDomainManifest.publicKits.map((kit) => [kit.id, new Set()]));
const indegree = new Map(buildDomainManifest.publicKits.map((kit) => [kit.id, 0]));
for (const kit of buildDomainManifest.publicKits) {
  for (const token of kit.requires) {
    const candidates = providers.get(token) ?? [];
    assert.notEqual(candidates.length, 0, `${kit.id} requires provider for ${token}`);
    const externalCandidates = candidates.filter((providerId) => providerId !== kit.id);
    assert.notEqual(externalCandidates.length, 0, `${kit.id} cannot provide its own requirement ${token}`);
    for (const providerId of externalCandidates) {
      if (edges.get(providerId).has(kit.id)) continue;
      edges.get(providerId).add(kit.id);
      indegree.set(kit.id, indegree.get(kit.id) + 1);
    }
  }
}

const ready = [...indegree.entries()]
  .filter(([, count]) => count === 0)
  .map(([id]) => id)
  .sort();
const ordered = [];
while (ready.length) {
  const id = ready.shift();
  ordered.push(id);
  for (const consumerId of [...edges.get(id)].sort()) {
    indegree.set(consumerId, indegree.get(consumerId) - 1);
    if (indegree.get(consumerId) === 0) ready.push(consumerId);
  }
  ready.sort();
}
assert.equal(ordered.length, buildDomainManifest.publicKits.length, "Build atomic capability graph is acyclic");

function dependencyClosure(kitId) {
  const selected = new Set([kitId]);
  const pending = [kitId];
  while (pending.length) {
    const currentId = pending.shift();
    const current = buildDomainManifest.publicKits.find((kit) => kit.id === currentId);
    for (const token of current?.requires ?? []) {
      const providerId = providers.get(token)?.[0];
      if (providerId && !selected.has(providerId)) {
        selected.add(providerId);
        pending.push(providerId);
      }
    }
  }
  return selected;
}

const androidClosure = dependencyClosure("android-xr-target-kit");
for (const requiredId of [
  "project-source-kit",
  "target-registry-kit",
  "openxr-runtime-kit",
  "openxr-input-kit",
  "openxr-render-kit",
  "runtime-abi-kit",
  "toolchain-source-kit"
]) {
  assert.equal(androidClosure.has(requiredId), true, `Android XR dependency walk includes ${requiredId}`);
}
assert.equal(androidClosure.has("web-live-target-kit"), false);

for (const kit of buildDomainManifest.publicKits) {
  assert.equal(kit.atomic, true);
  assert.equal(kit.productNeutral, true);
  assert.equal(kit.environments.includes("node"), true);
  const modulePath = path.resolve(kit.source.module.replace(/^\.\//, ""));
  const module = await import(pathToFileURL(modulePath).href);
  assert.equal(typeof module[kit.source.exportName], "function", `${kit.id} factory`);
  const executable = module[kit.source.exportName]();
  assert.equal(executable.id, kit.id);
  assert.equal(executable.metadata.domainPath, kit.domainPath);
  assert.equal(executable.metadata.buildTimeOnly, true);
  assert.equal(executable.metadata.runtimeComposition, false);
}

for (const pathName of [
  "n:build:target:web-live",
  "n:build:target:web-static",
  "n:build:target:openxr",
  "n:build:target:android-xr",
  "n:build:target:pcvr"
]) {
  const node = buildDomainManifest.subdomains.find((entry) => entry.identity.domainPath === pathName);
  assert.equal(node.identity.parentDomainPath, "n:build:target");
}

console.log("Build Domain tree: 15 subdomains, 46 atomic Kit contracts, and acyclic dependency traversal ok");
