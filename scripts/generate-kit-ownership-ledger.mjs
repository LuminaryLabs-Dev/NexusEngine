import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { CORE_DOMAIN_CATALOG, CORE_DOMAIN_MANIFESTS } from "../src/core-domains/catalog.js";

const root = process.cwd();
const check = process.argv.includes("--check");
const sourceRoot = path.join(root, "src");
const jsonTarget = path.join(root, "docs", "KIT-OWNERSHIP.json");
const markdownTarget = path.join(root, "docs", "KIT-OWNERSHIP.md");
const registryHash = fs.readFileSync(path.join(root, "docs", "generated", "CORE-REGISTRY-SHA256"), "utf8").trim();

const minimalRootModules = new Set([
  "src/index.js",
  "src/release.js",
  "src/engine.js",
  "src/ecs.js",
  "src/runtime-kit.js",
  "src/domain-service-kit.js",
  "src/domain-path.js",
  "src/domain-api.js"
]);

function walk(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, output);
    else if (/\.(?:m?js)$/i.test(entry.name)) output.push(target);
  }
  return output;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function directExports(source) {
  const names = new Set();
  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1]);
  for (const match of source.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/).at(-1);
      if (name) names.add(name);
    }
  }
  if (/\bexport\s+\*\s+from\b/.test(source)) names.add("*");
  return [...names].sort();
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function stableJson(value) {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function writeOrCheck(target, contents) {
  if (check) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
    if (current !== contents) throw new Error(`Generated ownership drift: ${relative(target)}`);
    return;
  }
  fs.writeFileSync(target, contents);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageEntrypointsByModule = new Map();
for (const [subpath, target] of Object.entries(packageJson.exports ?? {})) {
  if (typeof target !== "string" || target.includes("*")) continue;
  const modulePath = target.replace(/^\.\//, "");
  const list = packageEntrypointsByModule.get(modulePath) ?? [];
  list.push(subpath);
  packageEntrypointsByModule.set(modulePath, list);
}

const manifestByFolder = new Map(CORE_DOMAIN_MANIFESTS.map((manifest) => [
  manifest.publicEntry.module.split("/")[3],
  manifest
]));
const kitsByModule = new Map();
for (const kit of CORE_DOMAIN_CATALOG.kits) {
  const modulePath = kit.source.module.replace(/^\.\//, "");
  const list = kitsByModule.get(modulePath) ?? [];
  list.push(kit);
  kitsByModule.set(modulePath, list);
}

const records = [];
const violations = [];
for (const absolutePath of walk(sourceRoot).sort()) {
  const modulePath = relative(absolutePath);
  if (modulePath.includes("/tests/")) continue;
  const source = fs.readFileSync(absolutePath, "utf8");
  const packageEntrypoints = [...(packageEntrypointsByModule.get(modulePath) ?? [])].sort();
  const kitContracts = kitsByModule.get(modulePath) ?? [];
  const parts = modulePath.split("/");
  let owner = null;
  let destination = "review-required";
  let reviewStatus = "unreviewed";
  let ownershipBasis = "none";

  if (modulePath.startsWith("src/foundation/")) {
    owner = "engine-foundation";
    destination = "NexusEngine foundation";
    reviewStatus = "root-contract";
    ownershipBasis = "minimal-root-contract";
  } else if (minimalRootModules.has(modulePath)) {
    owner = "engine-root";
    destination = "NexusEngine minimal root";
    reviewStatus = "root-contract";
    ownershipBasis = "minimal-root-contract";
  } else if (parts[1] === "core-domains" && manifestByFolder.has(parts[2])) {
    owner = manifestByFolder.get(parts[2]).domainPath;
    destination = "NexusEngine Core";
    reviewStatus = kitContracts.length ? "manifest-proven-public-atom" : "manifest-owned-internal";
    ownershipBasis = kitContracts.length ? "atomic-kit-manifest-v2" : "semantic-folder-and-domain-manifest";
  } else if (parts[1] === "core-domains" && parts.length === 3) {
    owner = "n:composition";
    destination = "NexusEngine Core";
    reviewStatus = "manifest-infrastructure";
    ownershipBasis = "catalog-infrastructure";
  }

  if (kitContracts.length > 1) violations.push(`${modulePath} is the executable source for multiple atomic Kit records.`);
  if (packageEntrypoints.length && !owner) violations.push(`${modulePath} is public but has no canonical owner.`);

  const kit = kitContracts[0] ?? null;
  records.push({
    path: modulePath,
    publicExports: directExports(source),
    packageEntrypoints,
    owner,
    ownershipBasis,
    responsibility: kit?.responsibility ?? null,
    atomic: kit?.atomic ?? null,
    idempotency: kit?.idempotency ?? null,
    fullyReusable: kit?.productNeutral ?? null,
    productOrGenreSpecific: kit ? !kit.productNeutral : null,
    currentConsumers: packageEntrypoints,
    destination,
    proof: kit?.proof ?? null,
    reviewStatus
  });
}

for (const kit of CORE_DOMAIN_CATALOG.kits) {
  const modulePath = kit.source.module.replace(/^\.\//, "");
  if (!records.some((record) => record.path === modulePath && record.owner === kit.domainPath.split(":").slice(0, 2).join(":"))) {
    const record = records.find((entry) => entry.path === modulePath);
    if (!record?.owner) violations.push(`${kit.id} source has no semantic Domain owner: ${modulePath}.`);
  }
}

const counts = {
  sourceModules: records.length,
  manifestProvenPublicAtoms: records.filter((record) => record.reviewStatus === "manifest-proven-public-atom").length,
  manifestOwnedInternalModules: records.filter((record) => record.reviewStatus === "manifest-owned-internal").length,
  rootContractModules: records.filter((record) => ["root-contract", "manifest-infrastructure"].includes(record.reviewStatus)).length,
  unreviewedModules: records.filter((record) => record.reviewStatus === "unreviewed").length,
  violations: violations.length
};

const ledger = {
  schema: "nexusengine.kit-ownership-ledger/2",
  registrySha256: registryHash,
  generatedFrom: ["Domain manifest v2", "generated package exports", "src production inventory"],
  coreRule: "atomic, idempotent, deterministic, fully reusable, product-neutral, lifecycle-complete, and proven",
  counts,
  violations,
  records
};

const markdown = [
  "# Kit Ownership Ledger",
  "",
  "Generated from Domain manifest v2 and the production source inventory. Null compliance fields are intentionally unproven; they are never inferred as true.",
  "",
  `Registry SHA-256: \`${registryHash}\``,
  "",
  `- Source modules: ${counts.sourceModules}`,
  `- Manifest-proven public atoms: ${counts.manifestProvenPublicAtoms}`,
  `- Manifest-owned internal modules: ${counts.manifestOwnedInternalModules}`,
  `- Root contract modules: ${counts.rootContractModules}`,
  `- Unreviewed modules: ${counts.unreviewedModules}`,
  `- Violations: ${counts.violations}`,
  "",
  "| Path | Owner | Review | Destination |",
  "| --- | --- | --- | --- |",
  ...records.map((record) => `| \`${record.path}\` | ${record.owner ? `\`${record.owner}\`` : "unassigned"} | ${record.reviewStatus} | ${record.destination} |`),
  ""
].join("\n");

writeOrCheck(jsonTarget, stableJson(ledger));
writeOrCheck(markdownTarget, markdown);
if (violations.length) throw new Error(`Ownership ledger has ${violations.length} violation(s):\n${violations.join("\n")}`);
console.log(`${check ? "Checked" : "Generated"} ownership ledger v2`, counts);
