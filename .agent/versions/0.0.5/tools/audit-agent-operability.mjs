#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

function option(name, fallback = null) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function requiredOption(name) {
  const value = option(name);
  if (!value) throw new Error(`Missing required option ${name}.`);
  return resolve(value);
}

function readJsonl(path) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`${path}:${index + 1}: ${error.message}`);
      }
    });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}

function countBy(values, selector) {
  const result = {};
  for (const value of values) {
    const key = selector(value);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

function duplicateIds(nodes) {
  const counts = countBy(nodes, (node) => node.id);
  return Object.entries(counts).filter(([, count]) => count > 1).map(([id]) => id);
}

function dependencyCycles(packages) {
  const byId = new Map(packages.map((node) => [node.id, node]));
  const visiting = new Set();
  const visited = new Set();
  const cycles = [];

  function visit(id, path) {
    if (visiting.has(id)) {
      cycles.push([...path.slice(path.indexOf(id)), id]);
      return;
    }
    if (visited.has(id) || !byId.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependencies ?? []) visit(dependency, [...path, dependency]);
    visiting.delete(id);
    visited.add(id);
  }

  for (const node of packages) visit(node.id, [node.id]);
  return cycles;
}

function topologicalDepth(packages) {
  const byId = new Map(packages.map((node) => [node.id, node]));
  const memo = new Map();
  function depth(id, trail = new Set()) {
    if (memo.has(id)) return memo.get(id);
    if (trail.has(id)) return null;
    const node = byId.get(id);
    if (!node) return null;
    const nextTrail = new Set(trail).add(id);
    const dependencyDepths = (node.dependencies ?? []).map((dependency) => depth(dependency, nextTrail));
    if (dependencyDepths.includes(null)) return null;
    const value = dependencyDepths.length ? Math.max(...dependencyDepths) + 1 : 0;
    memo.set(id, value);
    return value;
  }
  return new Map(packages.map((node) => [node.id, depth(node.id)]));
}

function markdownTable(rows) {
  const header = "| Wave | Package | Domain | State | Detailed | Dependencies | Agent action |";
  const separator = "|---:|---|---|---|---:|---|---|";
  return [header, separator, ...rows.map((row) => (
    `| ${row.wave ?? "?"} | \`${row.id}\` | \`${row.domain}\` | ${row.classification} | ${row.detailed.total} | ${row.dependencies.length || "none"} | ${row.harnessAction} |`
  ))].join("\n");
}

const masterPath = requiredOption("--master");
const detailPath = requiredOption("--detail");
const checklistPath = requiredOption("--checklist");
const repo = requiredOption("--repo");
const jsonOut = requiredOption("--json-out");
const markdownOut = requiredOption("--markdown-out");
const activePackage = option("--active-package", "");

function portablePath(path) {
  const repositoryRelative = relative(repo, path);
  return repositoryRelative.startsWith("..")
    ? `<external-input>/${basename(path)}`
    : repositoryRelative || ".";
}

const master = readJsonl(masterPath);
const detail = readJsonl(detailPath);
const masterById = new Map(master.map((node) => [node.id, node]));
const detailById = new Map(detail.map((node) => [node.id, node]));
const packages = master.filter((node) => node.executionPolicy?.mode === "strong-model-work-package");
const rollups = master.filter((node) => node.executionPolicy?.mode === "rollup-only");
const atomicDetails = detail.filter((node) => node.level === "atomic-action");
const depths = topologicalDepth(packages);

const ownership = new Map();
for (const pkg of packages) {
  for (const id of pkg.detailedNodeIds ?? []) {
    const owners = ownership.get(id) ?? [];
    owners.push(pkg.id);
    ownership.set(id, owners);
  }
}

const missingMasterParents = master
  .filter((node) => node.parentId && !masterById.has(node.parentId))
  .map((node) => ({ id: node.id, parentId: node.parentId }));
const missingDetailParents = detail
  .filter((node) => node.parentId && !detailById.has(node.parentId))
  .map((node) => ({ id: node.id, parentId: node.parentId }));
const missingDependencies = packages.flatMap((node) => (node.dependencies ?? [])
  .filter((dependency) => !masterById.has(dependency))
  .map((dependency) => ({ id: node.id, dependency })));
const missingDetailedReferences = packages.flatMap((node) => (node.detailedNodeIds ?? [])
  .filter((id) => !detailById.has(id))
  .map((id) => ({ packageId: node.id, detailedNodeId: id })));
const unownedAtomicDetails = atomicDetails.filter((node) => !ownership.has(node.id)).map((node) => node.id);
const multiplyOwnedAtomicDetails = [...ownership.entries()]
  .filter(([, owners]) => owners.length > 1)
  .map(([id, owners]) => ({ id, owners }));

const inputPaths = [...new Set([...master, ...detail]
  .flatMap((node) => node.inputs ?? [])
  .filter((value) => typeof value === "string" && value.startsWith("/")))];
const missingInputPaths = inputPaths.filter((path) => !existsSync(path));

const genericAcceptanceSuffix = "The result is independently inspectable and linked to evidence.";
const packageRows = packages.map((pkg) => {
  const children = (pkg.detailedNodeIds ?? []).map((id) => detailById.get(id)).filter(Boolean);
  const dependencyStates = (pkg.dependencies ?? []).map((id) => ({
    id,
    status: masterById.get(id)?.status ?? "missing"
  }));
  const dependenciesReady = dependencyStates.every((entry) => entry.status === "completed");
  const isActive = pkg.id === activePackage;
  const approvalGated = /approve|approval|push|publish|freeze|branch/i.test([
    pkg.id,
    pkg.outcome,
    pkg.acceptance,
    pkg.nextAction
  ].join(" "));
  const classification = pkg.status === "completed"
    ? "completed"
    : isActive
      ? "active-local-unreconciled"
      : dependenciesReady
        ? approvalGated ? "dependency-ready-approval-gated" : "dependency-ready"
        : "dependency-blocked";
  const harnessAction = pkg.status === "completed"
    ? "summarize-existing-evidence"
    : isActive
      ? "audit-current-diff-only"
      : "generate-read-only-review-packet";
  const missingCapsuleFields = [
    "repositorySha",
    "repositoryStatusHash",
    "allowedReadScope",
    "allowedWriteScope",
    "forbiddenActions",
    "testCommands",
    "outputSchema",
    "conflictExclusions"
  ];
  if (children.some((node) => node.owner === "unassigned")) missingCapsuleFields.push("resolvedDetailedOwner");
  if (!children.every((node) => node.acceptance?.endsWith(genericAcceptanceSuffix))) {
    missingCapsuleFields.push("normalizedAcceptanceMapping");
  }
  return {
    id: pkg.id,
    parentId: pkg.parentId,
    domain: pkg.domain,
    sourceGroup: pkg.sourceGroup ?? null,
    owner: pkg.owner,
    status: pkg.status,
    classification,
    wave: depths.get(pkg.id),
    dependencies: dependencyStates,
    dependenciesReady,
    approvalGated,
    detailed: {
      total: children.length,
      expected: pkg.detailedNodeIds?.length ?? 0,
      statusCounts: countBy(children, (node) => node.status),
      unassignedOwners: children.filter((node) => node.owner === "unassigned").length,
      genericAcceptance: children.filter((node) => node.acceptance?.endsWith(genericAcceptanceSuffix)).length
    },
    operability: {
      structurallyBound: children.length === (pkg.detailedNodeIds?.length ?? 0),
      reviewOnlyEligible: children.length > 0 && missingDetailedReferences.every((entry) => entry.packageId !== pkg.id),
      editEligible: pkg.status !== "completed" && !isActive && dependenciesReady && !approvalGated,
      missingCapsuleFields
    },
    harnessAction
  };
}).sort((left, right) => (
  (left.wave ?? Number.MAX_SAFE_INTEGER) - (right.wave ?? Number.MAX_SAFE_INTEGER)
  || left.domain.localeCompare(right.domain)
  || left.id.localeCompare(right.id)
));

const structuralErrors = {
  duplicateMasterIds: duplicateIds(master),
  duplicateDetailIds: duplicateIds(detail),
  missingMasterParents,
  missingDetailParents,
  missingDependencies,
  dependencyCycles: dependencyCycles(packages),
  missingDetailedReferences,
  unownedAtomicDetails,
  multiplyOwnedAtomicDetails,
  missingInputPaths
};
const structuralErrorCount = Object.values(structuralErrors).reduce((total, entries) => total + entries.length, 0);

const report = {
  schema: "nexusengine.goal-agent-operability-audit/1",
  generatedAt: new Date().toISOString(),
  authority: "human-agent-preflight",
  mutationAuthority: "none",
  inputs: {
    master: { path: portablePath(masterPath), sha256: sha256(masterPath) },
    detail: { path: portablePath(detailPath), sha256: sha256(detailPath) },
    checklist: { path: portablePath(checklistPath), sha256: sha256(checklistPath) },
    repository: {
      path: ".",
      branch: git(repo, ["branch", "--show-current"]),
      sha: git(repo, ["rev-parse", "HEAD"]),
      status: git(repo, ["status", "--short"]),
      statusHash: createHash("sha256").update(git(repo, ["status", "--porcelain=v1", "-uall"])).digest("hex")
    },
    activePackage: activePackage || null
  },
  summary: {
    masterNodes: master.length,
    rollups: rollups.length,
    packages: packages.length,
    detailedNodes: detail.length,
    atomicDetails: atomicDetails.length,
    masterStatuses: countBy(master, (node) => node.status),
    packageStatuses: countBy(packages, (node) => node.status),
    detailedStatuses: countBy(atomicDetails, (node) => node.status),
    packageClassifications: countBy(packageRows, (row) => row.classification),
    structuralErrorCount,
    reviewOnlyEligiblePackages: packageRows.filter((row) => row.operability.reviewOnlyEligible).length,
    editEligiblePackages: packageRows.filter((row) => row.operability.editEligible).length
  },
  findings: [
    {
      severity: structuralErrorCount ? "error" : "pass",
      code: "STRUCTURAL_INTEGRITY",
      detail: structuralErrorCount
        ? `${structuralErrorCount} structural matrix issue(s) require repair before dispatch.`
        : "IDs, parents, package dependencies, detailed coverage, input paths, and dependency cycles passed."
    },
    {
      severity: "warning",
      code: "CAPSULE_CONTEXT_REQUIRED",
      detail: "The matrix is a control plane, not a complete worker prompt. Every dispatch must add a repository revision/status pin, scope, commands, prohibitions, and output schema."
    },
    {
      severity: "warning",
      code: "GENERIC_ATOMIC_ACCEPTANCE",
      detail: `${atomicDetails.filter((node) => node.acceptance?.endsWith(genericAcceptanceSuffix)).length} atomic acceptance clauses use a generic evidence suffix and require package-local source and test context.`
    },
    {
      severity: "warning",
      code: "UNASSIGNED_DETAILED_OWNERS",
      detail: `${atomicDetails.filter((node) => node.owner === "unassigned").length} atomic nodes defer ownership to their master package; the binding step must resolve and record that owner.`
    },
    {
      severity: "warning",
      code: "PARALLEL_REVIEW_ONLY",
      detail: "All packages may be reviewed concurrently, but repository edits and matrix transitions must remain isolated and dependency ordered."
    },
    {
      severity: "warning",
      code: "ACTIVE_LOCAL_PACKAGE",
      detail: activePackage
        ? `${activePackage} has local unreconciled work and must receive a diff audit, not a clean-slate implementation proposal.`
        : "No active local package was declared."
    }
  ],
  requiredDispatchCapsule: [
    "master and detailed matrix hashes",
    "repository path, branch, SHA, and status hash",
    "one master package and its detailed child records",
    "dependency evidence and exclusions",
    "current source and test inventory for the source group",
    "allowed read scope and no-write authority",
    "forbidden mutation, integration, publication, and matrix actions",
    "structured review-packet schema",
    "time, token, and retry budgets"
  ],
  structuralErrors,
  packages: packageRows
};

const findings = report.findings.map((finding) => `- **${finding.code}:** ${finding.detail}`).join("\n");
const waves = [...new Set(packageRows.map((row) => row.wave))].sort((a, b) => a - b)
  .map((wave) => `- Wave ${wave}: ${packageRows.filter((row) => row.wave === wave).length} package(s)`).join("\n");
const markdown = `# NexusEngine 0.0.5 Agent Operability Audit

This is the required human-agent pass before a model harness reviews or drafts any package. It grants no repository, matrix, branch, or publication authority.

## Result

- Master nodes: ${master.length}
- Work packages: ${packages.length}
- Detailed nodes: ${detail.length}
- Atomic actions: ${atomicDetails.length}
- Structural errors: ${structuralErrorCount}
- Review-only eligible packages: ${report.summary.reviewOnlyEligiblePackages}
- Direct edit-eligible packages: ${report.summary.editEligiblePackages}
- Active local package: ${activePackage || "none"}

## Findings

${findings}

## Dispatch Rule

Every package may receive a parallel read-only review packet. Code edits remain isolated, dependency ordered, human reviewed, and outside this batch. The harness cannot update matrix status or declare proof.

Required capsule additions:

${report.requiredDispatchCapsule.map((entry) => `- ${entry}`).join("\n")}

## Topological Waves

${waves}

## Package Pass

${markdownTable(packageRows)}
`;

writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(markdownOut, markdown);

process.stdout.write(`${JSON.stringify({
  jsonOut,
  markdownOut,
  summary: report.summary
}, null, 2)}\n`);
process.exitCode = structuralErrorCount ? 1 : 0;
