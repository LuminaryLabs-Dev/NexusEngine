import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  CORE_DOMAIN_MANIFEST_SCHEMA,
  flattenCoreDomainManifests
} from "../src/core-domains/domain-manifest.js";

const root = process.cwd();
const check = process.argv.includes("--check");
const allowPending = process.argv.includes("--allow-pending");
const sourceRoot = path.join(root, "src");
const domainRoot = path.join(root, "src", "core-domains");
const buildRoot = path.join(domainRoot, "build");

const fixedPackageExports = Object.freeze({
  ".": "./src/index.js",
  "./release": "./src/release.js",
  "./foundation": "./src/foundation/index.js",
  "./engine": "./src/engine.js",
  "./ecs": "./src/ecs.js",
  "./runtime-kit": "./src/runtime-kit.js",
  "./domain-service-kit": "./src/domain-service-kit.js",
  "./domain-path": "./src/domain-path.js",
  "./domain-api": "./src/domain-api.js",
  "./domains": "./src/core-domains/index.js",
  "./domains/catalog": "./src/core-domains/catalog.js",
  "./domains/manifest": "./src/core-domains/domain-manifest.js"
});

function walk(directory, predicate, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, predicate, output);
    else if (predicate(target)) output.push(target);
  }
  return output;
}

function posix(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function stableJson(value) {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function assertRepoFile(value, label) {
  const normalized = String(value).replace(/^\.\//, "");
  const target = path.resolve(root, normalized);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`${label} escapes the repository: ${value}`);
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw new Error(`${label} does not resolve to a file: ${value}`);
  }
  return normalized.split(path.sep).join("/");
}

function validateProof(proof, label) {
  if (proof.status !== "proven") {
    if (allowPending && proof.status === "pending") return;
    throw new Error(`${label} is not proven.`);
  }
  if (!proof.references.length) throw new Error(`${label} has no proof references.`);
  for (const reference of proof.references) assertRepoFile(reference, `${label} proof`);
}

function validateManifest(manifest, sourcePath) {
  if (manifest?.schema !== CORE_DOMAIN_MANIFEST_SCHEMA) {
    throw new Error(`${sourcePath} does not export a Domain manifest v2 as default.`);
  }
  validateProof(manifest.proof, `${manifest.domainPath}`);
  assertRepoFile(manifest.publicEntry.module, `${manifest.domainPath} public entry`);
  for (const publicEntry of manifest.publicEntries ?? []) {
    assertRepoFile(publicEntry.module, `${publicEntry.domainPath} public entry`);
  }
  for (const subdomain of manifest.subdomains) validateProof(subdomain.proof, subdomain.identity.domainPath);
  for (const kit of manifest.publicKits) {
    validateProof(kit.proof, kit.id);
    const modulePath = assertRepoFile(kit.source.module, `${kit.id} source`);
    if (!modulePath.startsWith("src/core-domains/")) {
      throw new Error(`${kit.id} source is outside semantic Core Domains: ${modulePath}`);
    }
    for (const reference of kit.proof.references) assertRepoFile(reference, `${kit.id} proof`);
  }
  for (const record of [...manifest.providers, ...manifest.adapters]) {
    if (record.source?.module) assertRepoFile(record.source.module, `${record.id} source`);
    for (const reference of record.proofReferences) assertRepoFile(reference, `${record.id} proof`);
  }
}

function renderCatalog(manifestPaths, registryHash) {
  const imports = manifestPaths.map((file, index) => {
    const specifier = `./${path.relative(domainRoot, file).split(path.sep).join("/")}`;
    return `import manifest${index} from ${JSON.stringify(specifier)};`;
  }).join("\n");
  const names = manifestPaths.map((_, index) => `manifest${index}`).join(",\n  ");
  return `${imports}\nimport { flattenCoreDomainManifests } from "./domain-manifest.js";\n\nexport const CORE_REGISTRY_SHA256 = ${JSON.stringify(registryHash)};\n\nexport const CORE_DOMAIN_MANIFESTS = Object.freeze([\n  ${names}\n]);\n\nexport const CORE_DOMAIN_CATALOG = flattenCoreDomainManifests(CORE_DOMAIN_MANIFESTS);\n\nexport default CORE_DOMAIN_CATALOG;\n`;
}

function renderApiReference(catalog, registryHash) {
  const lines = [
    "# Generated Core API Reference",
    "",
    "This file is generated from Domain manifest v2 records. Do not edit it directly.",
    "",
    `Registry SHA-256: \`${registryHash}\``,
    "",
    "## Domains",
    "",
    "| Domain | Parent | Responsibility | Status |",
    "| --- | --- | --- | --- |"
  ];
  for (const domain of catalog.domains) {
    lines.push(`| \`${domain.domainPath}\` | ${domain.parentDomainPath ? `\`${domain.parentDomainPath}\`` : "-"} | ${domain.responsibility} | ${domain.status} |`);
  }
  lines.push("", "## Atomic Kits", "", "| Kit | Domain | Public subpath | Responsibility |", "| --- | --- | --- | --- |");
  for (const kit of catalog.kits) {
    lines.push(`| \`${kit.id}\` | \`${kit.domainPath}\` | \`nexusengine${kit.source.publicSubpath.slice(1)}\` | ${kit.responsibility} |`);
  }
  return `${lines.join("\n")}\n`;
}

function renderDomainIndex(catalog, registryHash) {
  const lines = [
    "# Domain Index",
    "",
    `Registry SHA-256: \`${registryHash}\``,
    "",
    ...catalog.domains.map((domain) => `- \`${domain.domainPath}\`: ${domain.responsibility}`)
  ];
  return `${lines.join("\n")}\n`;
}

function renderDependencies(catalog, registryHash) {
  const lines = [
    "# Core Dependency Table",
    "",
    `Registry SHA-256: \`${registryHash}\``,
    "",
    "| Owner | Requires | Optional |",
    "| --- | --- | --- |"
  ];
  for (const domain of catalog.domains) {
    lines.push(`| \`${domain.domainPath}\` | ${domain.requires.map((item) => `\`${item}\``).join(", ") || "-"} | ${domain.optionalDependencies.map((item) => `\`${item}\``).join(", ") || "-"} |`);
  }
  return `${lines.join("\n")}\n`;
}

function loadBuildSourceRegistry() {
  if (!fs.existsSync(buildRoot)) return { records: [], sourceFiles: [] };
  const sourcePaths = walk(buildRoot, (file) => path.basename(file) === "sources.json").sort();
  const records = new Map();
  for (const sourcePath of sourcePaths) {
    const entries = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    if (!Array.isArray(entries)) throw new Error(`${posix(sourcePath)} must contain an array.`);
    for (const entry of entries) {
      if (entry?.schema !== "nexusengine.build-source-record/1" || !entry.id) {
        throw new Error(`${posix(sourcePath)} contains an invalid Build source record.`);
      }
      const prior = records.get(entry.id);
      if (prior && stableJson(prior) !== stableJson(entry)) {
        throw new Error(`Build source record collision: ${entry.id}.`);
      }
      records.set(entry.id, entry);
    }
  }
  return {
    records: [...records.values()].sort((left, right) => left.id.localeCompare(right.id)),
    sourceFiles: sourcePaths.map(posix)
  };
}

function renderBuildApi(catalog, registryHash) {
  const kits = catalog.kits.filter((kit) => kit.domainPath === "n:build" || kit.domainPath.startsWith("n:build:"));
  const lines = [
    "# Generated Build API",
    "",
    "This file is generated from Build Domain and atomic Kit manifests.",
    "",
    `Registry SHA-256: \`${registryHash}\``,
    "",
    "## Domain Service",
    "",
    "```txt",
    "listTargets()",
    "inspect(project)",
    "plan(request)",
    "apply(planId, approval)",
    "getReceipt(planId)",
    "snapshot()",
    "reset()",
    "```",
    "",
    "## Atomic Kits",
    "",
    "| Kit | Domain | Import | Responsibility |",
    "| --- | --- | --- | --- |",
    ...kits.map((kit) => `| \`${kit.id}\` | \`${kit.domainPath}\` | \`nexusengine${kit.source.publicSubpath.slice(1)}\` | ${kit.responsibility} |`),
    ""
  ];
  return lines.join("\n");
}

function renderBuildTargets(catalog, registryHash) {
  const targets = catalog.kits.filter((kit) =>
    kit.id.endsWith("-target-kit")
    && /^n:build:target:(?!openxr$)[a-z0-9-]+$/.test(kit.domainPath)
  );
  const lines = [
    "# Generated Build Targets",
    "",
    "Planning is not execution proof. Native targets remain blocked until every listed environment, source, toolchain, runtime, and hardware validator passes.",
    "",
    `Registry SHA-256: \`${registryHash}\``,
    "",
    "| Target | Domain | Status | Environments |",
    "| --- | --- | --- | --- |",
    ...targets.map((kit) => `| \`${kit.id.replace(/-target-kit$/, "")}\` | \`${kit.domainPath}\` | ${kit.status} | ${kit.environments.map((environment) => `\`${environment}\``).join(", ")} |`),
    ""
  ];
  return lines.join("\n");
}

function renderSourceDomainReadme(manifest, registryHash) {
  const lines = [
    `# ${manifest.label} Domain`,
    "",
    "This file is generated from the Domain manifest. Do not edit it directly.",
    "",
    `- Path: \`${manifest.domainPath}\``,
    `- Status: \`${manifest.status}\``,
    `- Registry SHA-256: \`${registryHash}\``,
    `- Public entry: \`nexusengine${manifest.publicEntry.subpath.slice(1)}\``,
    "",
    "## Responsibility",
    "",
    manifest.ownership.responsibility,
    "",
    "## Owns",
    "",
    ...manifest.ownership.owns.map((item) => `- ${item}`),
    "",
    "## Does Not Own",
    "",
    ...manifest.ownership.forbiddenResponsibilities.map((item) => `- ${item}`),
    "",
    "## Subdomains",
    ""
  ];
  if (manifest.subdomains.length === 0) lines.push("None.");
  else {
    lines.push("| Path | Responsibility |", "| --- | --- |");
    for (const subdomain of manifest.subdomains) {
      lines.push(`| \`${subdomain.identity.domainPath}\` | ${subdomain.ownership.responsibility} |`);
    }
  }
  lines.push("", "## Atomic Kits", "", "| Kit | Import | Responsibility |", "| --- | --- | --- |");
  for (const kit of manifest.publicKits) {
    lines.push(`| \`${kit.id}\` | \`nexusengine${kit.source.publicSubpath.slice(1)}\` | ${kit.responsibility} |`);
  }
  lines.push("", "## Lifecycle", "", `- Duplicate install: ${manifest.lifecycle.duplicateInstall}`, `- Snapshot: ${manifest.lifecycle.snapshot}`, `- Reset: ${manifest.lifecycle.reset}`, "");
  return lines.join("\n");
}

function writeOrCheck(file, contents) {
  if (check) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (current !== contents) throw new Error(`Generated file drift: ${posix(file)}`);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

const discoveredManifestPaths = walk(domainRoot, (file) => path.basename(file) === "domain.manifest.js").sort();
if (!discoveredManifestPaths.length) throw new Error("No Core Domain manifests found.");

const records = [];
for (const manifestPath of discoveredManifestPaths) {
  const module = await import(`${pathToFileURL(manifestPath).href}?catalog=${Date.now()}`);
  const manifest = module.default;
  validateManifest(manifest, posix(manifestPath));
  records.push({ manifestPath, manifest });
}
records.sort((left, right) => left.manifest.domainPath.localeCompare(right.manifest.domainPath));
const manifestPaths = records.map(({ manifestPath }) => manifestPath);
const manifests = records.map(({ manifest }) => manifest);

const catalog = flattenCoreDomainManifests(manifests);
const sourceFiles = walk(sourceRoot, (file) => /(?:\.(?:c|cc|cpp|cjs|cts|gradle|h|hpp|js|json|kts|lock|mjs|mts|rs|toml|ts|xml)|Cargo\.lock)$/i.test(file))
  .map((file) => posix(file))
  .filter((file) => ![
    "src/core-domains/catalog.js",
    "src/core-domains/composition/adapters/mcp/generated-guide-resources.js"
  ].includes(file))
  .sort()
  .map((file) => ({
    path: file,
    sha256: sha256(fs.readFileSync(path.join(root, file)))
  }));
const registryPayload = stable({
  schema: catalog.schema,
  domains: catalog.domains,
  kits: catalog.kits,
  packageExports: catalog.packageExports,
  sourceFiles
});
const registryHash = sha256(JSON.stringify(registryPayload));
const buildSources = loadBuildSourceRegistry();
const buildDomains = catalog.domains.filter((domain) => domain.domainPath === "n:build" || domain.domainPath.startsWith("n:build:"));
const buildKits = catalog.kits.filter((kit) => kit.domainPath === "n:build" || kit.domainPath.startsWith("n:build:"));
const buildPackageExports = Object.fromEntries(
  Object.entries(catalog.packageExports).filter(([subpath]) => subpath === "./domains/build" || subpath.startsWith("./domains/build/"))
);
const buildSourceFiles = sourceFiles.filter((file) => file.path.startsWith("src/core-domains/build/"));
const buildRegistryPayload = stable({
  schema: "nexusengine.build-catalog/1",
  registryHash,
  domains: buildDomains,
  kits: buildKits,
  packageExports: buildPackageExports,
  sourceFiles: buildSourceFiles
});
const buildSourceRegistry = stable({
  schema: "nexusengine.build-source-registry/1",
  registryHash,
  contentHash: sha256(stableJson(buildSources.records)),
  records: buildSources.records,
  sourceFiles: buildSources.sourceFiles
});
const packageExports = Object.fromEntries([
  ...Object.entries(fixedPackageExports),
  ...Object.entries(catalog.packageExports)
].sort(([left], [right]) => left.localeCompare(right)));

const packagePath = path.join(root, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.exports = packageExports;

const outputs = new Map([
  [path.join(domainRoot, "catalog.js"), renderCatalog(manifestPaths, registryHash)],
  [packagePath, `${JSON.stringify(packageJson, null, 2)}\n`],
  [path.join(root, "docs", "generated", "CORE-CATALOG.json"), stableJson({ ...registryPayload, registryHash })],
  [path.join(root, "docs", "generated", "PACKAGE-EXPORTS.json"), stableJson({ schema: "nexusengine.package-exports/1", registryHash, exports: packageExports })],
  [path.join(root, "docs", "generated", "API-REFERENCE.md"), renderApiReference(catalog, registryHash)],
  [path.join(root, "docs", "guide", "generated", "domain-index.md"), renderDomainIndex(catalog, registryHash)],
  [path.join(root, "docs", "guide", "generated", "dependency-table.md"), renderDependencies(catalog, registryHash)],
  [path.join(root, "docs", "generated", "CORE-REGISTRY-SHA256"), `${registryHash}\n`]
]);

if (buildDomains.length) {
  outputs.set(path.join(root, "docs", "generated", "BUILD-CATALOG.json"), stableJson(buildRegistryPayload));
  outputs.set(path.join(root, "docs", "generated", "BUILD-API.md"), renderBuildApi(catalog, registryHash));
  outputs.set(path.join(root, "docs", "generated", "BUILD-TARGETS.md"), renderBuildTargets(catalog, registryHash));
  outputs.set(path.join(root, "docs", "generated", "BUILD-SOURCE-REGISTRY.json"), stableJson(buildSourceRegistry));
}

for (const { manifestPath, manifest } of records) {
  outputs.set(
    path.join(path.dirname(manifestPath), "README.md"),
    renderSourceDomainReadme(manifest, registryHash)
  );
}

for (const [file, contents] of outputs) writeOrCheck(file, contents);
console.log(`${check ? "Checked" : "Generated"} ${manifests.length} Domain manifests, ${catalog.domains.length} Domain records, and ${catalog.kits.length} atomic Kits (${registryHash}).`);
