import { normalizeDomainPath } from "../../../../domain-path.js";
import { sha256Integrity } from "../../../../foundation/sha256.js";
import { NEXUS_ENGINE_VERSION } from "../../../../release.js";
import { CORE_DOMAIN_CATALOG, CORE_REGISTRY_SHA256 } from "../../../catalog.js";

export const COMPOSITION_REGISTRY_SCHEMA = "nexusengine.composition-registry/3";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const unique = (values) => [...new Set(values)];
const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));

function stableId(value, label) {
  const id = String(value ?? "").trim();
  if (!id) throw new TypeError(`${label} requires a stable id.`);
  if (!/^[a-z0-9][a-z0-9:._/-]*$/i.test(id)) throw new TypeError(`${label} has an invalid id: ${id}.`);
  return id;
}

function stableText(value, label) {
  const text = String(value ?? "").trim();
  if (!text || /\s/.test(text)) throw new TypeError(`${label} requires a non-empty value without whitespace.`);
  return text;
}

function optionalDomainPath(value, label) {
  if (value === undefined || value === null || value === "") return null;
  return normalizeDomainPath(value, label);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

export function hashRegistryValue(value) {
  return sha256Integrity(JSON.stringify(stableValue(value)));
}

function normalizeSettingsSchema(value) {
  if (value == null) return Object.freeze({ type: "object", additionalProperties: true });
  if (!isObject(value)) throw new TypeError("Registry settingsSchema must be an object.");
  const schema = clone(value);
  if (schema.type !== undefined && schema.type !== "object") {
    throw new TypeError("Registry settingsSchema root type must be object.");
  }
  schema.type = "object";
  return Object.freeze(schema);
}

function normalizeStringList(value, label, { allowEmpty = true, compact = false } = {}) {
  const entries = unique(asList(value).map((entry) => {
    const text = String(entry ?? "").trim();
    if (!text || (compact && /\s/.test(text))) {
      throw new TypeError(`${label} requires ${compact ? "a value without whitespace" : "a non-empty value"}.`);
    }
    return text;
  })).sort();
  if (!allowEmpty && entries.length === 0) throw new TypeError(`${label} requires at least one value.`);
  return Object.freeze(entries);
}

function normalizeIntegrity(value, label) {
  const integrity = String(value ?? "").trim().toLowerCase();
  if (!/^sha256:[0-9a-f]{64}$/.test(integrity)) {
    throw new TypeError(`${label} requires sha256:<64 lowercase hex characters>.`);
  }
  return integrity;
}

function normalizeSourceCommit(value, label, { allowBuiltin = false } = {}) {
  const commit = String(value ?? "").trim().toLowerCase();
  if (/^[0-9a-f]{40}$/.test(commit)) return commit;
  if (allowBuiltin && /^builtin:[0-9a-f]{64}$/.test(commit)) return commit;
  throw new TypeError(`${label} requires an immutable 40-character Git commit.`);
}

function normalizeSubpath(value, label, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new TypeError(`${label} requires a canonical package subpath.`);
    return null;
  }
  const subpath = String(value).trim();
  if (!/^\.\/[a-z0-9][a-z0-9._/-]*$/i.test(subpath) || subpath.includes("..") || subpath.includes("\\")) {
    throw new TypeError(`${label} must be a package-relative canonical subpath.`);
  }
  return subpath;
}

function normalizeExportName(value, label, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new TypeError(`${label} requires an export name.`);
    return null;
  }
  const exportName = String(value).trim();
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(exportName)) {
    throw new TypeError(`${label} has an invalid JavaScript export name.`);
  }
  return exportName;
}

export function normalizeRegistrySource(input = {}, options = {}) {
  const registryId = stableId(input.registryId ?? input.id, "Registry source");
  const status = String(input.status ?? "available");
  if (!["available", "metadata-only", "blocked"].includes(status)) {
    throw new TypeError(`Registry source ${registryId} has invalid status ${status}.`);
  }
  return Object.freeze({
    registryId,
    package: stableText(input.package ?? input.packageName, `Registry source ${registryId} package`),
    version: stableText(input.version, `Registry source ${registryId} version`),
    sourceCommit: normalizeSourceCommit(input.sourceCommit ?? input.commit, `Registry source ${registryId} sourceCommit`, {
      allowBuiltin: options.allowBuiltin === true
    }),
    integrity: normalizeIntegrity(input.integrity ?? input.contentHash, `Registry source ${registryId} integrity`),
    status,
    environments: normalizeStringList(input.environments, `Registry source ${registryId} environment`, { allowEmpty: false, compact: true }),
    permissions: normalizeStringList(input.permissions, `Registry source ${registryId} permission`, { compact: true }),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeKitRegistryRecord(input = {}, options = {}) {
  const id = stableId(input.id, "Kit registry record");
  const domainPath = normalizeDomainPath(input.domainPath, "kit.domainPath");
  const parentDomainPath = optionalDomainPath(input.parentDomainPath, "kit.parentDomainPath");
  const sourceInput = input.source ?? {};
  const installable = sourceInput.installable !== false;
  const source = Object.freeze({
    registryId: stableId(sourceInput.registryId ?? input.sourceRegistryId ?? options.defaultSourceId, "Kit source registry"),
    subpath: normalizeSubpath(sourceInput.subpath ?? sourceInput.publicSubpath, `Kit ${id} source`, { required: installable }),
    exportName: normalizeExportName(sourceInput.exportName, `Kit ${id} source`, { required: installable }),
    environments: normalizeStringList(sourceInput.environments ?? input.environments, `Kit ${id} source environment`, { allowEmpty: !installable, compact: true }),
    permissions: normalizeStringList(sourceInput.permissions, `Kit ${id} source permission`, { compact: true }),
    installable
  });
  return Object.freeze({
    id,
    version: stableText(input.version ?? "0.0.0", `Kit ${id} version`),
    status: String(input.status ?? input.stability ?? "experimental"),
    kind: String(input.kind ?? input.type ?? "domain-service-kit"),
    responsibility: String(input.responsibility ?? "Unspecified registry responsibility."),
    domainPath,
    parentDomainPath,
    apiName: input.apiName == null ? null : String(input.apiName),
    apiVisibility: String(input.apiVisibility ?? input.visibility ?? "public"),
    requires: normalizeStringList(input.requires, `Kit ${id} requirement`, { compact: true }),
    provides: normalizeStringList(input.provides, `Kit ${id} capability`, { allowEmpty: false, compact: true }),
    composes: normalizeStringList(input.composes, `Kit ${id} composition`, { compact: true }),
    defaults: Object.freeze(clone(input.defaults ?? input.config ?? {})),
    settingsSchema: normalizeSettingsSchema(input.settingsSchema),
    source,
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeDomainRegistryRecord(input = {}) {
  const id = stableId(input.id, "Domain registry record");
  const domainPath = normalizeDomainPath(input.domainPath, "domain.domainPath");
  const parentDomainPath = optionalDomainPath(input.parentDomainPath, "domain.parentDomainPath");
  const separator = domainPath.lastIndexOf(":");
  const expectedParentDomainPath = separator <= 1 ? null : domainPath.slice(0, separator);
  if (parentDomainPath !== expectedParentDomainPath) {
    throw new TypeError(`Domain ${id} path ${domainPath} requires immediate parent ${expectedParentDomainPath ?? "null"}.`);
  }
  return Object.freeze({
    id,
    domainPath,
    parentDomainPath,
    label: String(input.label ?? id),
    status: String(input.status ?? input.stability ?? "stable-candidate"),
    responsibility: String(input.responsibility ?? "Unspecified registry responsibility."),
    ownedMeaning: normalizeStringList(input.ownedMeaning ?? input.owns, `Domain ${id} owned meaning`, { allowEmpty: false }),
    forbiddenResponsibilities: normalizeStringList(input.forbiddenResponsibilities ?? input.doesNotOwn, `Domain ${id} forbidden responsibility`, { allowEmpty: false }),
    requires: normalizeStringList(input.requires, `Domain ${id} requirement`, { compact: true }),
    provides: normalizeStringList(input.provides ?? [domainPath], `Domain ${id} capability`, { allowEmpty: false, compact: true }),
    settingsSchema: normalizeSettingsSchema(input.settingsSchema),
    sourceRegistryId: stableId(input.sourceRegistryId ?? input.source?.registryId, "Domain source registry"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeRecipeRegistryRecord(input = {}) {
  const id = stableId(input.id, "Recipe registry record");
  return Object.freeze({
    id,
    label: String(input.label ?? id),
    domains: normalizeStringList(input.domains, `Recipe ${id} domain`, { compact: true }),
    kits: normalizeStringList(input.kits, `Recipe ${id} Kit`, { compact: true }),
    settings: Object.freeze(clone(input.settings ?? {})),
    sourceRegistryId: stableId(input.sourceRegistryId ?? input.source?.registryId, "Recipe source registry"),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function normalizeRegistrySnapshot(value = {}, options = {}) {
  if (value.schema !== COMPOSITION_REGISTRY_SCHEMA) {
    throw new TypeError(`Unsupported Composition registry snapshot ${String(value.schema ?? "<missing>")}.`);
  }
  const sourceInputs = asList(value.sources);
  if (!sourceInputs.length) throw new TypeError("Registry snapshot requires at least one source.");
  const sources = sourceInputs.map((source) => normalizeRegistrySource(source, { allowBuiltin: options.allowBuiltinSources === true }));
  const sourceIds = new Set(sources.map((source) => source.registryId));
  if (sourceIds.size !== sources.length) throw new TypeError("Registry snapshot has duplicate source ids.");
  const defaultSourceId = sources[0].registryId;
  const domains = asList(value.domains).map((record) => normalizeDomainRegistryRecord({ ...record, sourceRegistryId: record.sourceRegistryId ?? defaultSourceId }));
  const kits = asList(value.kits).map((record) => normalizeKitRegistryRecord(record, { defaultSourceId }));
  const recipes = asList(value.recipes).map((record) => normalizeRecipeRegistryRecord({ ...record, sourceRegistryId: record.sourceRegistryId ?? defaultSourceId }));
  const sourcesById = new Map(sources.map((source) => [source.registryId, source]));
  for (const record of [...domains, ...recipes]) {
    if (!sourceIds.has(record.sourceRegistryId)) throw new TypeError(`Registry record ${record.id} references unknown source ${record.sourceRegistryId}.`);
  }
  for (const record of kits) {
    const registrySource = sourcesById.get(record.source.registryId);
    if (!registrySource) throw new TypeError(`Registry Kit ${record.id} references unknown source ${record.source.registryId}.`);
    if (record.source.installable && registrySource.status !== "available") {
      throw new TypeError(`Registry Kit ${record.id} cannot be installable from ${registrySource.status} source ${registrySource.registryId}.`);
    }
    const unavailableEnvironment = record.source.environments.find((environment) => !registrySource.environments.includes(environment));
    if (unavailableEnvironment) {
      throw new TypeError(`Registry Kit ${record.id} environment ${unavailableEnvironment} is not provided by source ${registrySource.registryId}.`);
    }
  }
  const identities = new Set();
  for (const record of [...domains, ...kits, ...recipes]) {
    if (identities.has(record.id)) throw new TypeError(`Registry identity collision: ${record.id}.`);
    identities.add(record.id);
  }
  const domainPaths = new Set();
  for (const domain of domains) {
    if (domainPaths.has(domain.domainPath)) throw new TypeError(`Registry domain path collision: ${domain.domainPath}.`);
    domainPaths.add(domain.domainPath);
  }
  for (const domain of domains) {
    if (domain.parentDomainPath && !domainPaths.has(domain.parentDomainPath) && options.allowExternalParents !== true) {
      throw new TypeError(`Registry domain ${domain.id} has missing parent ${domain.parentDomainPath}.`);
    }
  }
  if (options.allowExternalReferences !== true) {
    const domainIds = new Set(domains.map((record) => record.id));
    const kitIds = new Set(kits.map((record) => record.id));
    for (const recipe of recipes) {
      for (const domainId of recipe.domains) if (!domainIds.has(domainId)) throw new TypeError(`Registry recipe ${recipe.id} references unknown domain ${domainId}.`);
      for (const kitId of recipe.kits) if (!kitIds.has(kitId)) throw new TypeError(`Registry recipe ${recipe.id} references unknown Kit ${kitId}.`);
    }
  }
  const body = {
    schema: COMPOSITION_REGISTRY_SCHEMA,
    revision: Math.max(0, Number(value.revision ?? 0)),
    registryId: stableId(value.registryId ?? defaultSourceId, "Registry snapshot"),
    sources: sources.sort((left, right) => left.registryId.localeCompare(right.registryId)),
    domains: domains.sort((left, right) => left.id.localeCompare(right.id)),
    kits: kits.sort((left, right) => left.id.localeCompare(right.id)),
    recipes: recipes.sort((left, right) => left.id.localeCompare(right.id))
  };
  return Object.freeze({ ...clone(body), contentHash: hashRegistryValue(body) });
}

function createEngineCatalogBody() {
  const registryId = "nexusengine-core";
  const domains = CORE_DOMAIN_CATALOG.domains.map((domain) => ({
    ...clone(domain),
    sourceRegistryId: registryId,
    metadata: { core: true, ...(domain.metadata ?? {}) }
  }));
  const kits = CORE_DOMAIN_CATALOG.kits.map((kit) => ({
    ...clone(kit),
    apiVisibility: "public",
    source: {
      registryId,
      subpath: kit.source.publicSubpath,
      exportName: kit.source.exportName,
      environments: kit.environments,
      permissions: [],
      installable: true
    },
    metadata: {
      core: true,
      determinism: kit.determinism,
      idempotency: kit.idempotency,
      reset: kit.reset,
      snapshot: kit.snapshot,
      proof: kit.proof
    }
  }));
  const content = { domains, kits, recipes: [] };
  const integrity = `sha256:${CORE_REGISTRY_SHA256}`;
  return {
    schema: COMPOSITION_REGISTRY_SCHEMA,
    revision: 1,
    registryId,
    sources: [{
      registryId,
      package: "nexusengine",
      version: NEXUS_ENGINE_VERSION,
      sourceCommit: `builtin:${integrity.slice("sha256:".length)}`,
      integrity,
      status: "available",
      environments: ["browser", "node", "worker"],
      permissions: [],
      metadata: { authority: "core", core: true, resolution: "already-loaded-package" }
    }],
    ...content
  };
}

export function createEngineRegistrySnapshot() {
  return normalizeRegistrySnapshot(createEngineCatalogBody(), { allowBuiltinSources: true });
}

export function mergeRegistrySnapshots(core, imports = []) {
  const normalizedCore = normalizeRegistrySnapshot(core, { allowBuiltinSources: true });
  const merged = {
    schema: COMPOSITION_REGISTRY_SCHEMA,
    revision: normalizedCore.revision,
    registryId: normalizedCore.registryId,
    sources: clone(normalizedCore.sources),
    domains: clone(normalizedCore.domains),
    kits: clone(normalizedCore.kits),
    recipes: clone(normalizedCore.recipes)
  };
  const identityOwners = new Map([...merged.domains, ...merged.kits, ...merged.recipes].map((record) => [record.id, normalizedCore.registryId]));
  const domainPathOwners = new Map(merged.domains.map((record) => [record.domainPath, normalizedCore.registryId]));
  for (const input of asList(imports)) {
    const imported = normalizeRegistrySnapshot(input, { allowExternalParents: true, allowExternalReferences: true });
    for (const source of imported.sources) {
      if (merged.sources.some((entry) => entry.registryId === source.registryId)) throw new TypeError(`Imported registry source collision: ${source.registryId}.`);
      merged.sources.push(source);
    }
    for (const domain of imported.domains) {
      if (identityOwners.has(domain.id)) throw new TypeError(`Imported registry cannot replace ${identityOwners.get(domain.id)} record ${domain.id}.`);
      if (domainPathOwners.has(domain.domainPath)) throw new TypeError(`Imported registry cannot replace ${domainPathOwners.get(domain.domainPath)} domain path ${domain.domainPath}.`);
      identityOwners.set(domain.id, imported.registryId);
      domainPathOwners.set(domain.domainPath, imported.registryId);
      merged.domains.push(domain);
    }
    for (const record of [...imported.kits, ...imported.recipes]) {
      if (identityOwners.has(record.id)) throw new TypeError(`Imported registry cannot replace ${identityOwners.get(record.id)} record ${record.id}.`);
      identityOwners.set(record.id, imported.registryId);
      ("domainPath" in record ? merged.kits : merged.recipes).push(record);
    }
    merged.revision += 1;
  }
  return normalizeRegistrySnapshot(merged, { allowBuiltinSources: true });
}
