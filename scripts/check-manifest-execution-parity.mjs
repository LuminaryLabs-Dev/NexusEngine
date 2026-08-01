import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { validateDomainServiceKit } from "../src/domain-service-kit.js";
import { CORE_DOMAIN_CATALOG } from "../src/core-domains/catalog.js";

const root = process.cwd();
const sortedUnique = (values = []) => [...new Set(values)].sort();

for (const record of CORE_DOMAIN_CATALOG.kits) {
  const sourcePath = path.resolve(root, record.source.module.replace(/^\.\//, ""));
  const module = await import(pathToFileURL(sourcePath).href);
  const factory = module[record.source.exportName];
  assert.equal(typeof factory, "function", `${record.id} must export ${record.source.exportName}.`);

  const kit = validateDomainServiceKit(factory());
  assert.deepEqual({
    id: kit.id,
    domainPath: kit.metadata.domainPath,
    parentDomainPath: kit.metadata.parentDomainPath ?? null,
    apiName: kit.metadata.apiName,
    version: kit.metadata.version,
    requires: sortedUnique(kit.requires),
    provides: sortedUnique(kit.provides)
  }, {
    id: record.id,
    domainPath: record.domainPath,
    parentDomainPath: record.parentDomainPath ?? null,
    apiName: record.apiName,
    version: record.version,
    requires: sortedUnique(record.requires),
    provides: sortedUnique(record.provides)
  }, `${record.id} executable contract must equal its manifest.`);

  assert.equal(kit.metadata.execution.snapshot, "required", `${record.id} must require snapshots.`);
  assert.equal(kit.metadata.execution.reset, "required", `${record.id} must require reset.`);
  assert.deepEqual(
    [...kit.metadata.manifestEnvironments].sort(),
    [...record.environments].sort(),
    `${record.id} environments must equal its manifest.`
  );
}

console.log(`Validated executable parity for ${CORE_DOMAIN_CATALOG.kits.length} manifest-backed Core Kits.`);
