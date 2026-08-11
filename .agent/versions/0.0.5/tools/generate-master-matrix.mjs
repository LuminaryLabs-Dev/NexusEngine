import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const toolsDirectory = dirname(fileURLToPath(import.meta.url));
const versionDirectory = resolve(toolsDirectory, "..");
const packetRoot = ".agent/versions/0.0.5";
const detailedRef = `${packetRoot}/feature-matrix.jsonl`;
const checklistRef = `${packetRoot}/checklist.md`;
const outputRef = `${packetRoot}/master-matrix.jsonl`;
const summaryRef = `${packetRoot}/master-matrix.md`;
const promptRef = `${packetRoot}/master-goal-prompt.md`;
const scriptRef = `${packetRoot}/tools/generate-master-matrix.mjs`;
const detailedPath = resolve(versionDirectory, "feature-matrix.jsonl");
const checklistPath = resolve(versionDirectory, "checklist.md");
const outputPath = resolve(versionDirectory, "master-matrix.jsonl");
const summaryPath = resolve(versionDirectory, "master-matrix.md");
const promptPath = resolve(versionDirectory, "master-goal-prompt.md");
const check = process.argv.includes("--check");

const DOMAIN_DEFINITIONS = [
  { id: "master-domain-physics", domain: "n:physics", owner: "physics-core-owner", outcome: "Deliver the canonical Physics Core domain and deterministic reference behavior.", detailedRollupNodeIds: ["goal-physics-domain"] },
  { id: "master-domain-render", domain: "n:render", owner: "render-core-owner", outcome: "Deliver the canonical Render Core domain and actual frame execution contracts.", detailedRollupNodeIds: ["goal-render-domain"] },
  { id: "master-domain-providers", domain: "providers", owner: "provider-owner", outcome: "Deliver independently installable Physics and Render provider packages.", detailedRollupNodeIds: [] },
  { id: "master-domain-integration", domain: "integration", owner: "composition-owner", outcome: "Prove cross-domain composition, MCP, packaging, documentation, and public boundaries.", detailedRollupNodeIds: ["goal-existing-domain-integration", "goal-documentation-and-generated-registry"] },
  { id: "master-domain-consumer", domain: "consumer", owner: "showcase-owner", outcome: "Prove the exact candidate in The Open Above, then prove its repeatable main-tracking rebuild loop.", detailedRollupNodeIds: ["goal-open-above-proof", "goal-open-above-main-continuation"] },
  { id: "master-domain-release", domain: "release", owner: "release-owner", outcome: "Prove the exact candidate, fast-forward main, and publish immutable 0.0.5 without changing 0.0.4.", detailedRollupNodeIds: ["goal-version-freeze-and-main-continuation"] }
];

const GROUP_DEPENDENCIES = {
  "n:physics/contracts": [],
  "n:physics/lifecycle": ["n:physics/contracts"],
  "n:physics/world": ["n:physics/contracts", "n:physics/lifecycle"],
  "n:physics/body": ["n:physics/contracts", "n:physics/lifecycle"],
  "n:physics/shape": ["n:physics/contracts"],
  "n:physics/material": ["n:physics/contracts"],
  "n:physics/collider": ["n:physics/body", "n:physics/shape", "n:physics/material"],
  "n:physics/constraints": ["n:physics/body"],
  "n:physics/detection": ["n:physics/shape", "n:physics/collider"],
  "n:physics/contact": ["n:physics/detection"],
  "n:physics/queries": ["n:physics/detection", "n:physics/collider"],
  "n:physics/solver": ["n:physics/body", "n:physics/contact", "n:physics/constraints", "n:physics/material"],
  "n:physics/articulation": ["n:physics/body", "n:physics/constraints", "n:physics/solver"],
  "n:physics/surfaces": ["n:physics/world", "n:physics/collider", "n:physics/queries"],
  "n:physics/integration": ["n:physics/world", "n:physics/body", "n:physics/collider", "n:physics/queries", "n:physics/solver"],
  "n:physics/execution": ["n:physics/solver", "n:physics/contact"],
  "n:physics/determinism": ["n:physics/contracts", "n:physics/execution", "n:physics/solver"],
  "n:physics/recovery": ["n:physics/contact", "n:physics/queries", "n:physics/determinism"],
  "n:physics/provider": ["n:physics/contracts", "n:physics/solver", "n:physics/queries", "n:physics/determinism"],
  "n:physics/diagnostics": ["n:physics/provider", "n:physics/solver", "n:physics/queries"],
  "NexusEngine-Kits/n:physics/reference": ["n:physics/provider", "n:physics/diagnostics", "n:physics/recovery"],
  "NexusEngine-Kits/n:physics/rapier": ["n:physics/provider", "n:physics/diagnostics"],
  "NexusEngine-Kits/n:physics/physx": ["n:physics/provider", "n:physics/diagnostics"],

  "n:render/contracts": [],
  "n:render/lifecycle": ["n:render/contracts"],
  "n:render/device": ["n:render/contracts", "n:render/lifecycle"],
  "n:render/surface": ["n:render/device"],
  "n:render/resource": ["n:render/device"],
  "n:render/buffer": ["n:render/resource"],
  "n:render/texture": ["n:render/resource", "n:render/buffer"],
  "n:render/geometry": ["n:render/resource", "n:render/buffer"],
  "n:render/shader": ["n:render/device"],
  "n:render/material": ["n:render/shader", "n:render/texture"],
  "n:render/lighting": ["n:render/material"],
  "n:render/camera": ["n:render/contracts"],
  "n:render/pipeline": ["n:render/device", "n:render/surface", "n:render/shader", "n:render/material"],
  "n:render/frame": ["n:render/pipeline", "n:render/surface"],
  "n:render/scene": ["n:render/geometry", "n:render/material", "n:render/lighting"],
  "n:render/visibility": ["n:render/scene", "n:render/camera"],
  "n:render/animation": ["n:render/geometry"],
  "n:render/effects": ["n:render/pipeline", "n:render/texture"],
  "n:render/postprocess": ["n:render/pipeline", "n:render/frame"],
  "n:render/bridge": ["n:render/scene", "n:render/frame", "n:render/animation"],
  "n:render/provider": ["n:render/device", "n:render/pipeline", "n:render/frame", "n:render/bridge"],
  "n:render/capture": ["n:render/frame", "n:render/texture"],
  "n:render/xr": ["n:render/provider", "n:render/camera"],
  "n:render/diagnostics": ["n:render/provider", "n:render/frame"],
  "NexusEngine-Kits/n:render/headless": ["n:render/provider", "n:render/diagnostics"],
  "NexusEngine-Kits/n:render/webgl2": ["n:render/provider", "n:render/shader", "n:render/pipeline"],
  "NexusEngine-Kits/n:render/threejs": ["NexusEngine-Kits/n:render/webgl2", "n:render/scene"],
  "NexusEngine-Kits/n:render/openxr": ["n:render/xr", "n:render/provider"],
  "NexusEngine-Kits/n:render/android-xr": ["NexusEngine-Kits/n:render/openxr"],
  "NexusEngine-Kits/n:render/pcvr": ["NexusEngine-Kits/n:render/openxr"]
};

const EXTRA_DEPENDENCIES = {
  "goal-checklist-kit-c-contract-and-ownership": [],
  "goal-checklist-kit-i-implementation": ["goal-checklist-kit-c-contract-and-ownership"],
  "goal-checklist-kit-l-lifecycle": ["goal-checklist-kit-i-implementation"],
  "goal-checklist-kit-p-direct-proof": ["goal-checklist-kit-l-lifecycle"],
  "goal-checklist-kit-g-composition-provider-proof": ["goal-checklist-kit-p-direct-proof"],
  "goal-checklist-kit-d-documentation-and-exports": ["goal-checklist-kit-g-composition-provider-proof"],
  "goal-checklist-kit-r-release-integrity": ["goal-checklist-kit-d-documentation-and-exports"],
  "goal-checklist-physics-domain": ["NexusEngine-Kits/n:physics/reference", "NexusEngine-Kits/n:physics/rapier", "NexusEngine-Kits/n:physics/physx"],
  "goal-checklist-render-domain": ["NexusEngine-Kits/n:render/headless", "NexusEngine-Kits/n:render/threejs", "NexusEngine-Kits/n:render/android-xr", "NexusEngine-Kits/n:render/pcvr"],
  "goal-checklist-existing-domain-integration": ["goal-checklist-physics-domain", "goal-checklist-render-domain", "goal-checklist-kit-r-release-integrity"],
  "goal-checklist-the-open-above": ["goal-checklist-existing-domain-integration"],
  "goal-checklist-version-freeze-and-main-continuation": ["goal-checklist-the-open-above", "goal-checklist-kit-d-documentation-and-exports"],
  "goal-checklist-open-above-main-validation-loop": ["goal-checklist-version-freeze-and-main-continuation"],
  "goal-final-completion-gate": ["goal-checklist-open-above-main-validation-loop"]
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function packageId(sourceGroup) {
  return `master-package-${slug(sourceGroup)}`;
}

function projection(items) {
  const counts = { completed: 0, in_progress: 0, pending: 0, blocked: 0 };
  for (const item of items) counts[item.status] = (counts[item.status] ?? 0) + 1;
  const status = counts.completed === items.length
    ? "completed"
    : counts.completed > 0 || counts.in_progress > 0
      ? "in_progress"
      : counts.blocked > 0
        ? "blocked"
        : "pending";
  return { status, counts };
}

function domainForGroup(sourceGroup) {
  if (sourceGroup.startsWith("NexusEngine-Kits/")) return "master-domain-providers";
  if (sourceGroup.startsWith("n:physics/")) return "master-domain-physics";
  if (sourceGroup.startsWith("n:render/")) return "master-domain-render";
  if (sourceGroup === "goal-checklist-the-open-above" || sourceGroup === "goal-checklist-open-above-main-validation-loop") return "master-domain-consumer";
  if (sourceGroup === "goal-checklist-version-freeze-and-main-continuation" || sourceGroup === "goal-final-completion-gate" || sourceGroup.includes("release-integrity")) return "master-domain-release";
  if (sourceGroup === "goal-checklist-physics-domain") return "master-domain-physics";
  if (sourceGroup === "goal-checklist-render-domain") return "master-domain-render";
  return "master-domain-integration";
}

function ownerForParent(parentId) {
  return DOMAIN_DEFINITIONS.find((domain) => domain.id === parentId)?.owner ?? "nexus-version-it";
}

function transitionFor(id, status, owner, sourceSha, counts) {
  if (status === "pending") return null;
  return {
    eventId: `projection-${sha256(`${id}:${sourceSha}:${JSON.stringify(counts)}`).slice(0, 16)}`,
    expectedRevision: 0,
    from: "pending",
    to: status,
    action: "project-detailed-evidence",
    owner,
    inputs: [detailedRef],
    outputs: [outputRef],
    evidence: [`source-matrix-sha256:${sourceSha}`],
    acceptance: status === "completed" ? "all referenced detailed nodes are completed" : "partial detailed evidence observed",
    blocker: null,
    nextAction: status === "completed" ? "Reconcile the parent package." : "Complete the remaining referenced detailed nodes."
  };
}

function createNode({ id, parentId, level, domain, outcome, reason, owner, dependencies = [], acceptance, evidence, status, nextAction, detailedNodeIds, detailedRollupNodeIds, sourceGroup, sourceSha, counts, rollupPackageIds }) {
  return {
    id,
    parentId,
    level,
    domain,
    outcome,
    reason,
    owner,
    dependencies,
    inputs: [detailedRef, checklistRef],
    output: [`master-work-package:${id}`],
    acceptance,
    evidence,
    status,
    risk: ["A master package cannot promote from aggregate claims; every referenced detailed node needs scope-matching observed evidence."],
    nextAction,
    expectedRevision: status === "pending" ? 0 : 1,
    lastTransition: transitionFor(id, status, owner, sourceSha, counts ?? {}),
    ...(sourceGroup ? { sourceGroup } : {}),
    ...(detailedNodeIds ? { detailedNodeIds } : {}),
    ...(detailedRollupNodeIds ? { detailedRollupNodeIds } : {}),
    ...(counts ? { detailedProjection: { total: detailedNodeIds?.length ?? 0, ...counts } } : {}),
    ...(rollupPackageIds ? { rollupPackageIds } : {}),
    executionPolicy: {
      mode: level === "atomic-action" ? "strong-model-work-package" : "rollup-only",
      detailedMatrixIsAuthority: true,
      reconcileChildrenIndividually: true,
      allowPartialPackageCommit: true,
      promoteOnlyWhenAllReferencedNodesPass: true
    }
  };
}

function assertAcyclic(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Cycle detected at ${id}`);
    visiting.add(id);
    const node = byId.get(id);
    if (!node) throw new Error(`Missing node ${id}`);
    if (node.parentId) visit(node.parentId);
    for (const dep of node.dependencies ?? []) visit(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const node of nodes) visit(node.id);
}

function validate(nodes, detailedRows) {
  const ids = nodes.map((node) => node.id);
  if (new Set(ids).size !== ids.length) throw new Error("Master matrix contains duplicate IDs.");
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    if (node.parentId && !byId.has(node.parentId)) throw new Error(`${node.id} has missing parent ${node.parentId}`);
    if (!node.owner || node.owner === "unassigned") throw new Error(`${node.id} has no concrete owner.`);
    if (!node.acceptance) throw new Error(`${node.id} has no acceptance gate.`);
    for (const dep of node.dependencies ?? []) if (!byId.has(dep)) throw new Error(`${node.id} has missing dependency ${dep}`);
  }
  assertAcyclic(nodes);

  const mission = nodes.find((node) => node.level === "mission");
  if (!mission) throw new Error("Master matrix requires one mission node.");
  if (nodes.filter((node) => node.level === "mission").length !== 1) throw new Error("Master matrix requires exactly one mission node.");
  for (const node of nodes) {
    let current = node;
    const lineage = new Set();
    while (current.parentId) {
      if (lineage.has(current.id)) throw new Error(`Parent cycle detected at ${current.id}`);
      lineage.add(current.id);
      current = byId.get(current.parentId);
    }
    if (current.id !== mission.id) throw new Error(`${node.id} is not reachable from the mission.`);
  }

  const references = new Map();
  for (const node of nodes) {
    for (const detailedId of [...(node.detailedNodeIds ?? []), ...(node.detailedRollupNodeIds ?? [])]) {
      if (!references.has(detailedId)) references.set(detailedId, []);
      references.get(detailedId).push(node.id);
    }
  }
  for (const detailed of detailedRows) {
    const owners = references.get(detailed.id) ?? [];
    if (owners.length !== 1) throw new Error(`Detailed node ${detailed.id} has ${owners.length} master package references.`);
  }
  for (const detailedId of references.keys()) {
    if (!detailedRows.some((node) => node.id === detailedId)) throw new Error(`Unknown detailed node reference ${detailedId}`);
  }
}

const detailedText = await readFile(detailedPath, "utf8");
const detailedRows = detailedText.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
const detailedById = new Map(detailedRows.map((row) => [row.id, row]));
const detailedAtomic = detailedRows.filter((row) => row.level === "atomic-action");
const sourceSha = sha256(detailedText);

const grouped = new Map();
for (const row of detailedAtomic) {
  const sourceGroup = row.parentGroup ?? row.parentId;
  if (!grouped.has(sourceGroup)) grouped.set(sourceGroup, []);
  grouped.get(sourceGroup).push(row);
}

const allSourceGroups = [...grouped.keys()];
const sourceToPackageId = new Map(allSourceGroups.map((sourceGroup) => [sourceGroup, packageId(sourceGroup)]));
const resolveDependencies = (sourceGroup) => {
  const requested = GROUP_DEPENDENCIES[sourceGroup] ?? EXTRA_DEPENDENCIES[sourceGroup] ?? [];
  return requested.map((dependency) => {
    const id = sourceToPackageId.get(dependency);
    if (!id) throw new Error(`${sourceGroup} references unknown source group dependency ${dependency}`);
    return id;
  });
};

const detailedRollupForGroup = (sourceGroup) => {
  const exact = detailedById.get(sourceGroup);
  if (exact && exact.level !== "atomic-action") return [exact.id];
  const capabilityId = `goal-capability-${slug(sourceGroup)}`;
  const capability = detailedById.get(capabilityId);
  if (capability?.level === "capability") return [capability.id];
  throw new Error(`No detailed rollup node found for ${sourceGroup}`);
};

const packageNodes = allSourceGroups.map((sourceGroup) => {
  const items = grouped.get(sourceGroup);
  const parentId = domainForGroup(sourceGroup);
  const projected = projection(items);
  const kitCount = new Set(items.map((item) => item.kit).filter(Boolean)).size;
  const sourceParent = detailedById.get(sourceGroup);
  return createNode({
    id: sourceToPackageId.get(sourceGroup),
    parentId,
    level: "atomic-action",
    domain: DOMAIN_DEFINITIONS.find((entry) => entry.id === parentId)?.domain ?? "integration",
    outcome: sourceParent?.outcome ?? `Complete ${sourceGroup} as one coherent work package covering ${kitCount} Kits and ${items.length} detailed actions.`,
    reason: `A stronger model can implement and prove this semantic family together while the detailed matrix retains ${items.length} independently auditable child actions.`,
    owner: ownerForParent(parentId),
    dependencies: resolveDependencies(sourceGroup),
    acceptance: `All ${items.length} referenced detailed nodes are completed with observed evidence; retained Kits satisfy contract, implementation, lifecycle, direct proof, composition, documentation, and release integrity gates.`,
    evidence: [`source-matrix:${detailedRef}`, `source-matrix-sha256:${sourceSha}`, `detailed-node-count:${items.length}`],
    status: projected.status,
    nextAction: projected.status === "completed" ? "Reconcile the parent domain." : `Execute ${sourceGroup} as one bounded strong-model work package and reconcile each detailed child node.`,
    detailedNodeIds: items.map((item) => item.id),
    detailedRollupNodeIds: detailedRollupForGroup(sourceGroup),
    sourceGroup,
    sourceSha,
    counts: projected.counts
  });
});

const domainNodes = DOMAIN_DEFINITIONS.map((definition) => {
  const children = packageNodes.filter((node) => node.parentId === definition.id);
  const projected = projection(children);
  return createNode({
    ...definition,
    parentId: "master-goal-nexusengine-0.0.5-physics-render",
    level: "domain",
    reason: "This is a rollup boundary for related strong-model work packages.",
    dependencies: [],
    acceptance: `Every one of the ${children.length} child work packages is completed and reconciled against detailed evidence.`,
    evidence: [`source-matrix-sha256:${sourceSha}`, `child-package-count:${children.length}`],
    status: projected.status,
    nextAction: projected.status === "completed" ? "Reconcile the master mission." : "Select the highest-leverage dependency-ready child package.",
    sourceSha,
    counts: projected.counts,
    rollupPackageIds: children.map((child) => child.id),
    detailedRollupNodeIds: definition.detailedRollupNodeIds
  });
});

const missionProjection = projection(domainNodes);
const missionNode = createNode({
  id: "master-goal-nexusengine-0.0.5-physics-render",
  parentId: null,
  level: "mission",
  domain: "nexusengine",
  outcome: "Deliver canonical Physics and Render, publish immutable 0.0.5 from the approved release commit, leave main ready for progress toward 0.0.6, and prove The Open Above can repeatedly rebuild against lock-resolved main.",
  reason: "This master matrix compresses the detailed control plane into strong-model work packages without reducing detailed release requirements.",
  owner: "nexus-version-it",
  dependencies: [],
  acceptance: `All ${packageNodes.length} work packages and six domain rollups are completed from observed detailed evidence; approved release commit A is on immutable 0.0.5; 0.0.4 is unchanged; main remains the mutable next-development line; and The Open Above has repeatable main-SHA validation receipts.`,
  evidence: [`source-matrix:${detailedRef}`, `source-matrix-sha256:${sourceSha}`, `detailed-atomic-node-count:${detailedAtomic.length}`],
  status: missionProjection.status,
  nextAction: "Select the highest-leverage dependency-ready master package and execute its referenced detailed nodes as one coherent cycle.",
  sourceSha,
  counts: missionProjection.counts,
  rollupPackageIds: domainNodes.map((domain) => domain.id),
  detailedRollupNodeIds: ["goal-nexusengine-0.0.5-physics-render"]
});

const nodes = [missionNode, ...domainNodes, ...packageNodes];
validate(nodes, detailedRows);
if (packageNodes.length < 40 || packageNodes.length > 80) throw new Error(`Expected 40-80 strong-model packages, received ${packageNodes.length}.`);
const packageSizes = packageNodes.map((node) => node.detailedNodeIds.length);
if (Math.max(...packageSizes) > 120) throw new Error(`Master package exceeds 120 detailed nodes.`);

const output = `${nodes.map((node) => JSON.stringify(node)).join("\n")}\n`;
const completedPackages = packageNodes.filter((node) => node.status === "completed").length;
const activePackages = packageNodes.filter((node) => node.status === "in_progress").length;
const packageById = new Map(packageNodes.map((node) => [node.id, node]));
const eligiblePackages = packageNodes.filter((node) =>
  node.status !== "completed" && node.dependencies.every((dependency) => packageById.get(dependency)?.status === "completed")
);
const summary = `# NexusEngine 0.0.5 Master Goal Matrix

This is a deterministic strong-model execution projection over the detailed matrix. It does not replace detailed node state or evidence.

## Scale

- Master nodes: ${nodes.length}
- Executable work packages: ${packageNodes.length}
- Detailed nodes represented exactly once: ${detailedRows.length}
- Detailed atomic nodes covered exactly once: ${detailedAtomic.length}
- Completed packages: ${completedPackages}
- Active packages: ${activePackages}
- Pending packages: ${packageNodes.length - completedPackages - activePackages}
- Dependency-ready packages: ${eligiblePackages.length}
- Detailed matrix SHA-256: \`${sourceSha}\`

## Execution Contract

1. Select one dependency-ready master package.
2. Treat all referenced \`detailedNodeIds\` as one coherent implementation and proof batch.
3. Update each detailed node independently from direct evidence.
4. Regenerate this master matrix to project the new child state.
5. Promote a master package only when every referenced detailed node is complete.
6. Keep \`0.0.4\` unchanged; push \`main\` and create immutable \`0.0.5\` only after their exact approvals; then validate The Open Above against lock-resolved \`main\`.

## Current Eligible Packages

${eligiblePackages.map((node) => `- \`${node.sourceGroup}\`: ${node.status}, ${node.detailedNodeIds.length} detailed actions`).join("\n")}

## Domain Rollup

| Domain | Packages | Status | Owner |
|---|---:|---|---|
${domainNodes.map((node) => `| \`${node.domain}\` | ${node.rollupPackageIds.length} | ${node.status} | \`${node.owner}\` |`).join("\n")}

## Work Packages

| Package | Detailed nodes | Status | Dependencies |
|---|---:|---|---:|
${packageNodes.map((node) => `| \`${node.sourceGroup}\` | ${node.detailedNodeIds.length} | ${node.status} | ${node.dependencies.length} |`).join("\n")}
`;

const prompt = `# NexusEngine 0.0.5 Strong-Model Goal Prompt

Mission: Deliver canonical \`n:physics\` and \`n:render\`, deterministic Physics, actual rendered frames, and provider composition; publish immutable \`0.0.5\` from the approved release commit; leave \`main\` ready for progress toward \`0.0.6\`; and prove The Open Above repeatedly rebuilds against an exact lock-resolved \`main\` SHA.

Use these control planes:

- Master execution matrix: \`${outputRef}\`
- Detailed evidence matrix: \`${detailedRef}\`
- Detailed checklist: \`${checklistRef}\`

The master matrix selects work; the detailed matrix remains the authority for individual requirements, evidence, status, and history.

For each goal cycle:

1. Run \`node ${scriptRef} --check\` and reject drift, missing coverage, cycles, stale projection, or protected-branch changes.
2. Select one dependency-ready master \`atomic-action\` package using leverage, risk reduction, and proof readiness.
3. Load only that package, its dependencies, its \`detailedNodeIds\`, repository instructions, current code, and current evidence.
4. Treat the referenced detailed nodes as one coherent strong-model batch. Implement the full semantic package when feasible; record a bounded partial commit only when the package remains honestly \`in_progress\`.
5. Prevent duplicate ownership, private imports, hidden provider installation, product-specific Core behavior, forwarding exports, and unproved compatibility claims.
6. Run package-specific direct, lifecycle, composition, provider, deterministic replay, packaging, documentation, and consumer proof required by the referenced detailed nodes.
7. Update every affected detailed node independently with observed evidence and append-only transitions. Do not mark untouched children complete.
8. Regenerate the master matrix. Its package completes only when every referenced detailed child is complete.
9. Commit reproducible source, generated outputs, evidence, and matrix transitions together.
10. Recalculate priorities and select the next dependency-ready master package.

Release boundary:

- Work in the isolated feature branch until committed-SHA proof is complete.
- Keep \`origin/0.0.4\` unchanged.
- Do not push \`main\` without explicit approval for the exact final SHA.
- Create immutable \`origin/0.0.5\` only after explicit release approval for the exact SHA already proven on \`main\`; never force-update or delete it.
- After the freeze, keep \`main\` as the mutable next-development line and validate The Open Above through HTTPS \`#main\` with an exact lock-resolved SHA per run.
- Completion requires Physics, Render, providers, MCP, clean packaging, browser proof, full The Open Above feature coverage, restart/replay/disconnection proof, two repeatable clean main-SHA validation cycles, generated-doc agreement, and all detailed completion gates.
`;

if (check) {
  const [currentOutput, currentSummary, currentPrompt] = await Promise.all([
    readFile(outputPath, "utf8"),
    readFile(summaryPath, "utf8"),
    readFile(promptPath, "utf8")
  ]);
  if (currentOutput !== output) throw new Error(`Generated master matrix drift: ${outputPath}`);
  if (currentSummary !== summary) throw new Error(`Generated master summary drift: ${summaryPath}`);
  if (currentPrompt !== prompt) throw new Error(`Generated master prompt drift: ${promptPath}`);
  console.log(`Master matrix valid: ${nodes.length} nodes, ${packageNodes.length} packages, ${detailedRows.length}/${detailedRows.length} detailed nodes represented.`);
} else {
  await Promise.all([
    writeFile(outputPath, output),
    writeFile(summaryPath, summary),
    writeFile(promptPath, prompt)
  ]);
  console.log(`Generated master matrix: ${nodes.length} nodes, ${packageNodes.length} packages, ${detailedRows.length}/${detailedRows.length} detailed nodes represented.`);
}
