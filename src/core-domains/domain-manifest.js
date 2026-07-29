export const CORE_DOMAIN_MANIFEST_SCHEMA = "nexusengine.core-domain-manifest/1";

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const capabilities = (value) => Object.freeze([...new Set(asList(value).map(String))].sort());

function text(value, label) {
  const result = String(value ?? "").trim();
  if (!result) throw new TypeError(`${label} requires a non-empty value.`);
  return result;
}

function domainPath(value, label) {
  const result = text(value, label);
  if (!/^n:[a-z0-9-]+(?::[a-z0-9-]+)*$/.test(result)) {
    throw new TypeError(`${label} must be a normalized n: domain path.`);
  }
  return result;
}

function immediateParentPath(path) {
  const separator = path.lastIndexOf(":");
  return separator <= 1 ? null : path.slice(0, separator);
}

function assertImmediateParent(path, parentPath, label) {
  const expected = immediateParentPath(path);
  if (parentPath !== expected) {
    throw new TypeError(`${label} ${path} requires immediate parent ${expected ?? "null"}.`);
  }
}

function normalizeSubdomain(input, defaultParentDomainPath) {
  const path = domainPath(input.domainPath, "Core subdomain domainPath");
  const parentDomainPath = input.parentDomainPath == null
    ? defaultParentDomainPath
    : domainPath(input.parentDomainPath, `Core subdomain ${path} parentDomainPath`);
  if (!path.startsWith(`${parentDomainPath}:`)) {
    throw new TypeError(`Core subdomain ${path} must be nested under ${parentDomainPath}.`);
  }
  assertImmediateParent(path, parentDomainPath, "Core subdomain");
  return Object.freeze({
    id: text(input.id, "Core subdomain id"),
    domainPath: path,
    parentDomainPath,
    purpose: text(input.purpose, `Core subdomain ${path} purpose`),
    owns: Object.freeze(asList(input.owns).map(String)),
    doesNotOwn: Object.freeze(asList(input.doesNotOwn).map(String)),
    requires: capabilities(input.requires),
    provides: capabilities(input.provides),
    status: String(input.status ?? "stable-candidate"),
    settingsSchema: Object.freeze(clone(input.settingsSchema ?? {
      type: "object",
      additionalProperties: true
    }))
  });
}

function normalizeKit(input, allowedPaths) {
  const path = domainPath(input.domainPath, "Core domain Kit domainPath");
  if (!allowedPaths.has(path)) {
    throw new TypeError(`Core domain Kit ${input.id ?? "unknown"} references undeclared domain ${path}.`);
  }
  return Object.freeze({
    id: text(input.id, "Core domain Kit id"),
    version: String(input.version ?? "0.0.0"),
    status: String(input.status ?? "stable-candidate"),
    kind: String(input.kind ?? "domain-service-kit"),
    domain: text(input.domain, "Core domain Kit domain"),
    domainPath: path,
    parentDomainPath: input.parentDomainPath == null ? null : domainPath(input.parentDomainPath, "Core domain Kit parentDomainPath"),
    apiName: input.apiName == null ? null : String(input.apiName),
    requires: Object.freeze([...new Set(asList(input.requires).map(String))].sort()),
    provides: Object.freeze([...new Set(asList(input.provides).map(String))].sort()),
    composes: Object.freeze([...new Set(asList(input.composes).map(String))].sort()),
    defaults: Object.freeze(clone(input.defaults ?? {})),
    settingsSchema: Object.freeze(clone(input.settingsSchema ?? {
      type: "object",
      additionalProperties: true
    })),
    preview: input.preview == null ? null : Object.freeze(clone(input.preview)),
    exportName: text(input.exportName, `Core domain Kit ${input.id ?? "unknown"} exportName`),
    module: text(input.module, `Core domain Kit ${input.id ?? "unknown"} module`),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function defineCoreDomainManifest(input = {}) {
  const rootPath = domainPath(input.domainPath, "Core domain domainPath");
  const parentDomainPath = input.parentDomainPath == null
    ? null
    : domainPath(input.parentDomainPath, "Core domain parentDomainPath");
  assertImmediateParent(rootPath, parentDomainPath, "Core domain");
  const subdomains = asList(input.subdomains).map((entry) => normalizeSubdomain(entry, rootPath));
  const allowedPaths = new Set([rootPath, ...subdomains.map((entry) => entry.domainPath)]);
  for (const subdomain of subdomains) {
    if (!allowedPaths.has(subdomain.parentDomainPath)) {
      throw new TypeError(`Core subdomain ${subdomain.domainPath} has undeclared parent ${subdomain.parentDomainPath}.`);
    }
  }
  const kits = asList(input.kits).map((entry) => normalizeKit(entry, allowedPaths));
  const kitIds = new Set();
  for (const kit of kits) {
    if (kitIds.has(kit.id)) throw new TypeError(`Duplicate Core domain Kit id: ${kit.id}.`);
    kitIds.add(kit.id);
  }
  return Object.freeze({
    schema: CORE_DOMAIN_MANIFEST_SCHEMA,
    id: text(input.id, "Core domain id"),
    domainPath: rootPath,
    parentDomainPath,
    label: String(input.label ?? input.id),
    purpose: text(input.purpose, `Core domain ${input.id ?? "unknown"} purpose`),
    owns: Object.freeze(asList(input.owns).map(String)),
    doesNotOwn: Object.freeze(asList(input.doesNotOwn).map(String)),
    requires: capabilities(input.requires),
    provides: capabilities(input.provides),
    status: String(input.status ?? "stable-candidate"),
    settingsSchema: Object.freeze(clone(input.settingsSchema ?? {
      type: "object",
      additionalProperties: true
    })),
    kits: Object.freeze(kits),
    subdomains: Object.freeze(subdomains),
    providers: Object.freeze(asList(input.providers).map((entry) => Object.freeze(clone(entry)))),
    adapters: Object.freeze(asList(input.adapters).map((entry) => Object.freeze(clone(entry)))),
    metadata: Object.freeze(clone(input.metadata ?? {}))
  });
}

export function flattenCoreDomainManifests(manifests = []) {
  const domains = [];
  const kits = [];
  const domainPaths = new Set();
  const kitIds = new Set();
  for (const manifest of manifests) {
    if (manifest?.schema !== CORE_DOMAIN_MANIFEST_SCHEMA) {
      throw new TypeError("Core domain catalog contains an invalid manifest.");
    }
    const records = [{
      id: manifest.id,
      domainPath: manifest.domainPath,
      parentDomainPath: manifest.parentDomainPath,
      label: manifest.label,
      status: manifest.status,
      ownedMeaning: manifest.owns,
      forbiddenResponsibilities: manifest.doesNotOwn,
      requires: manifest.requires,
      provides: manifest.provides,
      settingsSchema: manifest.settingsSchema,
      metadata: {
        ...clone(manifest.metadata),
        purpose: manifest.purpose,
        providers: clone(manifest.providers),
        adapters: clone(manifest.adapters),
        core: true
      }
    }, ...manifest.subdomains.map((subdomain) => ({
      id: subdomain.id,
      domainPath: subdomain.domainPath,
      parentDomainPath: subdomain.parentDomainPath,
      label: subdomain.id,
      status: subdomain.status,
      ownedMeaning: subdomain.owns,
      forbiddenResponsibilities: subdomain.doesNotOwn,
      requires: subdomain.requires,
      provides: subdomain.provides,
      settingsSchema: subdomain.settingsSchema,
      metadata: { purpose: subdomain.purpose, core: true }
    }))];
    for (const record of records) {
      if (domainPaths.has(record.domainPath)) throw new TypeError(`Core domain path collision: ${record.domainPath}.`);
      domainPaths.add(record.domainPath);
      domains.push(record);
    }
    for (const kit of manifest.kits) {
      if (kitIds.has(kit.id)) throw new TypeError(`Core domain Kit collision: ${kit.id}.`);
      kitIds.add(kit.id);
      kits.push(clone(kit));
    }
  }
  for (const domain of domains) {
    if (domain.parentDomainPath && !domainPaths.has(domain.parentDomainPath)) {
      throw new TypeError(`Core domain ${domain.domainPath} has undeclared parent ${domain.parentDomainPath}.`);
    }
  }
  return Object.freeze({
    domains: Object.freeze(domains),
    kits: Object.freeze(kits)
  });
}
