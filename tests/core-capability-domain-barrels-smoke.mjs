import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  CORE_DOMAIN_CATALOG,
  createCompletionLedger,
  createEngine,
  createProgressTimer,
  createSeededRandom,
  createSnapshotEnvelope
} from "./helpers/public-package-surface.mjs";

const repositoryRoot = process.cwd();
const factories = [];
for (const record of CORE_DOMAIN_CATALOG.kits) {
  const modulePath = path.resolve(repositoryRoot, record.source.module.replace(/^\.\//, ""));
  const module = await import(pathToFileURL(modulePath));
  const factory = module[record.source.exportName];
  assert.equal(typeof factory, "function", `${record.id} factory is executable`);
  factories.push({ record, factory });
}

const engine = createEngine();
const installedIds = new Set(engine.kits.map((kit) => kit.id));
const provided = new Set(engine.kits.flatMap((kit) => kit.provides ?? []));
const pending = factories
  .filter(({ record }) => !installedIds.has(record.id))
  .map(({ record, factory }) => ({
    record,
    kit: factory(
      record.id === "world-state-kit"
        ? { childDomains: false }
        : record.id === "third-person-camera-kit"
          ? { characterId: "barrel-character" }
          : {}
    )
  }))
  .sort((left, right) => left.record.id.localeCompare(right.record.id));

while (pending.length) {
  const index = pending.findIndex(({ kit }) =>
    (kit.requires ?? []).every((token) => provided.has(token))
  );
  assert.notEqual(index, -1, `No dependency-complete install order for: ${pending.map(({ record }) => record.id).join(", ")}`);
  const [{ kit, record }] = pending.splice(index, 1);
  if (record.id === "third-person-camera-kit") {
    engine.n.creature.register({ id: "barrel-creature", body: { provider: "fixture", descriptorId: "body" }, rig: { provider: "fixture", descriptorId: "rig" } });
    engine.n.character.create({ id: "barrel-character", creatureId: "barrel-creature", bindings: { motionActorId: "barrel-motion" } });
  }
  engine.installKit(kit);
  installedIds.add(record.id);
  for (const token of kit.provides ?? []) provided.add(token);
}

assert.equal(installedIds.size, CORE_DOMAIN_CATALOG.kits.length, "Every manifest-backed atomic Kit installs in one composition");
for (const record of CORE_DOMAIN_CATALOG.kits) {
  assert.ok(engine.domainServiceKits[record.id], `${record.id} is registered`);
  if (record.apiName) assert.ok(engine.n[record.apiName], `${record.apiName} is installed under engine.n`);
  assert.equal(record.apiName?.startsWith("core"), false, `${record.id} retains a transitional API name`);
}

const rngA = createSeededRandom("seed");
const rngB = createSeededRandom("seed");
assert.equal(rngA.next(), rngB.next(), "seeded random repeats");
assert.equal(createSnapshotEnvelope({ id: "snap", state: { ok: true } }).state.ok, true, "snapshot envelope stores state");
assert.equal(createCompletionLedger().complete("once").accepted, true, "completion ledger accepts first completion");
assert.equal(createProgressTimer({ durationSeconds: 2 }).tick(1).progress, 0.5, "progress timer advances deterministically");

console.log(`core capability package surface installed ${installedIds.size} manifest-backed Kits`);
