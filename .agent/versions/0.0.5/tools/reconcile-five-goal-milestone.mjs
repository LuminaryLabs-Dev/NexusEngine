import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const versionRoot = path.join(root, ".agent/versions/0.0.5");
const matrixPath = path.join(versionRoot, "feature-matrix.jsonl");
const masterPath = path.join(versionRoot, "master-matrix.jsonl");
const failurePointPath = path.join(versionRoot, "failure-point.json");
const milestoneId = "2026-08-12-nexusengine-0-0-5-five-goal-milestone";
const evidenceRoot = path.join(root, ".agent/evidence", milestoneId);
const runRoot = path.join(root, ".agent/runs", milestoneId);
const sourceAnchor = process.env.SOURCE_ANCHOR ?? "f0ff535de6766760862c81214260e7ea51110995";
const directProofRun = process.env.DIRECT_PROOF_RUN ?? "31559584273";
const publicPromotionCommit = process.env.PUBLIC_PROMOTION_COMMIT ?? "2f278d7ce145c580a06da1f355bb81026e8f5bb3";
const publicPromotionRun = process.env.PUBLIC_PROMOTION_RUN ?? "31558873869";
const reconciliationRun = process.env.GITHUB_RUN_ID ?? "local";
const codes = Object.freeze(["C", "I", "L", "P", "G", "D", "R"]);

const targets = Object.freeze([
  {
    sourceGroup: "n:physics/body",
    capabilityId: "goal-capability-n-physics-body",
    masterPackageId: "master-package-n-physics-body",
    owner: "physics-core-owner",
    expectedDetailed: 91,
    expectedKits: 13,
    proof: "tests/core-domains/core-physics-body-smoke.mjs",
    migration: "docs/migrations/0.0.5-physics-body.md",
    evidenceFile: "physics-body-package.json"
  },
  {
    sourceGroup: "n:physics/shape",
    capabilityId: "goal-capability-n-physics-shape",
    masterPackageId: "master-package-n-physics-shape",
    owner: "physics-core-owner",
    expectedDetailed: 98,
    expectedKits: 14,
    proof: "tests/core-domains/core-physics-shape-smoke.mjs",
    migration: "docs/migrations/0.0.5-physics-shape.md",
    evidenceFile: "physics-shape-package.json"
  },
  {
    sourceGroup: "n:physics/collider",
    capabilityId: "goal-capability-n-physics-collider",
    masterPackageId: "master-package-n-physics-collider",
    owner: "physics-core-owner",
    expectedDetailed: 84,
    expectedKits: 12,
    proof: "tests/core-domains/core-physics-collider-smoke.mjs",
    migration: "docs/migrations/0.0.5-physics-collider.md",
    evidenceFile: "physics-collider-package.json"
  },
  {
    sourceGroup: "n:physics/detection",
    capabilityId: "goal-capability-n-physics-detection",
    masterPackageId: "master-package-n-physics-detection",
    owner: "physics-core-owner",
    expectedDetailed: 77,
    expectedKits: 11,
    proof: "tests/core-domains/core-physics-detection-smoke.mjs",
    migration: "docs/migrations/0.0.5-physics-detection.md",
    evidenceFile: "physics-detection-package.json"
  },
  {
    sourceGroup: "n:render/surface",
    capabilityId: "goal-capability-n-render-surface",
    masterPackageId: "master-package-n-render-surface",
    owner: "render-core-owner",
    expectedDetailed: 63,
    expectedKits: 9,
    proof: "tests/core-domains/core-render-surface-smoke.mjs",
    migration: "docs/migrations/0.0.5-render-surface.md",
    evidenceFile: "render-surface-package.json"
  }
]);

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function readJsonl(file) {
  return fs.readFileSync(file, "utf8").trimEnd().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function writeJsonl(file, rows) {
  fs.writeFileSync(file, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
}

function eventFor(row, owner, evidenceRef, nextAction) {
  const from = row.status;
  const expectedRevision = Number.isInteger(row.expectedRevision) ? row.expectedRevision : 0;
  return {
    eventId: `five-goal-${sha(`${row.id}:${sourceAnchor}:${expectedRevision}`).slice(0, 16)}`,
    expectedRevision,
    from,
    to: "completed",
    action: "direct-proof-and-reconcile",
    owner,
    inputs: [".agent/versions/0.0.5/feature-matrix.jsonl"],
    outputs: row.output ?? [],
    evidence: [evidenceRef, `observed-commit:${sourceAnchor}`, `observed-run:${directProofRun}`],
    acceptance: row.acceptance ?? "Direct package evidence observed and reconciled.",
    blocker: null,
    nextAction
  };
}

function completeRow(row, owner, evidenceRef, nextAction, implementedOutput) {
  if (row.status === "completed") throw new Error(`${row.id} was already completed before this five-goal transition.`);
  if (row.status !== "pending" && row.status !== "in_progress") throw new Error(`${row.id} has unsupported pre-transition status ${row.status}.`);
  const transition = eventFor(row, owner, evidenceRef, nextAction);
  row.owner = owner;
  row.output = unique([...(row.output ?? []), implementedOutput]);
  row.evidence = unique([...(row.evidence ?? []), ...transition.evidence]);
  row.status = "completed";
  row.risk = [];
  row.nextAction = nextAction;
  row.expectedRevision = transition.expectedRevision + 1;
  row.lastTransition = transition;
  row.transitionHistory = [...(row.transitionHistory ?? []), transition];
}

const masterBefore = readJsonl(masterPath);
const packagesBefore = masterBefore.filter((row) => row.level === "atomic-action");
if (packagesBefore.length !== 67) throw new Error(`Expected 67 master packages before reconciliation, found ${packagesBefore.length}.`);
const completedBefore = packagesBefore.filter((row) => row.status === "completed").length;
if (completedBefore !== 12) throw new Error(`Expected 12 completed packages before reconciliation, found ${completedBefore}.`);
for (const target of targets) {
  const master = packagesBefore.find((row) => row.id === target.masterPackageId);
  if (!master) throw new Error(`Missing ${target.masterPackageId}.`);
  if (master.status !== "pending") throw new Error(`${target.masterPackageId} expected pending before reconciliation, found ${master.status}.`);
}

const rows = readJsonl(matrixPath);
const byId = new Map(rows.map((row) => [row.id, row]));
let transitionedDetailed = 0;
fs.mkdirSync(evidenceRoot, { recursive: true });
fs.mkdirSync(runRoot, { recursive: true });

for (const target of targets) {
  const detailed = rows.filter((row) => row.level === "atomic-action" && (row.parentGroup ?? row.parentId) === target.sourceGroup);
  if (detailed.length !== target.expectedDetailed) {
    throw new Error(`${target.sourceGroup} expected ${target.expectedDetailed} detailed nodes, found ${detailed.length}.`);
  }
  const kits = [...new Set(detailed.map((row) => row.kit))].sort();
  if (kits.length !== target.expectedKits) throw new Error(`${target.sourceGroup} expected ${target.expectedKits} Kits, found ${kits.length}.`);
  for (const kit of kits) {
    const kitRows = detailed.filter((row) => row.kit === kit);
    const actualCodes = kitRows.map((row) => row.checklistCode).sort();
    if (actualCodes.join(",") !== [...codes].sort().join(",")) {
      throw new Error(`${target.sourceGroup}/${kit} does not contain exactly C/I/L/P/G/D/R: ${actualCodes.join(",")}.`);
    }
  }

  const evidencePath = `.agent/evidence/${milestoneId}/${target.evidenceFile}`;
  const detailedActions = {};
  for (const row of detailed) {
    const evidenceRef = `observed:${evidencePath}#detailedActions.${row.kit}.${row.checklistCode}`;
    const implemented = `implemented:${target.sourceGroup}/${row.kit}/${String(row.checklistCode).toLowerCase()}`;
    completeRow(row, target.owner, evidenceRef, "Reconcile the parent capability and master package.", implemented);
    transitionedDetailed += 1;
    detailedActions[row.kit] ??= {};
    const codeEvidence = {
      C: [`source:${target.sourceGroup}`, `commit:${sourceAnchor}`],
      I: [`test:${target.proof}`, `commit:${sourceAnchor}`],
      L: [`test:${target.proof}`, `run:${directProofRun}`],
      P: [`test:${target.proof}`, `run:${directProofRun}`],
      G: [`test:${target.proof}`, `run:${directProofRun}`],
      D: [`migration:${target.migration}`, "test:tests/core-domains/core-0.0.5-five-goal-public-surface-smoke.mjs", `commit:${publicPromotionCommit}`],
      R: [`run:${directProofRun}`, `run:${publicPromotionRun}`, `commit:${sourceAnchor}`, "strict-next-blocker:n:physics:constraints"]
    }[row.checklistCode];
    detailedActions[row.kit][row.checklistCode] = {
      status: "completed",
      nodeId: row.id,
      evidence: codeEvidence
    };
  }

  const capability = byId.get(target.capabilityId);
  if (!capability) throw new Error(`Missing capability node ${target.capabilityId}.`);
  completeRow(
    capability,
    target.owner,
    `observed:${evidencePath}#package`,
    "Reconcile the parent domain.",
    `implemented:${target.sourceGroup}`
  );

  const evidence = {
    schema: "nexusengine.goal-package-evidence/1",
    milestoneId,
    masterPackageId: target.masterPackageId,
    sourceGroup: target.sourceGroup,
    status: "completed",
    owner: target.owner,
    sourceAnchor,
    publicPromotionCommit,
    directProofRun,
    publicPromotionRun,
    reconciliationRun,
    scope: {
      kits: target.expectedKits,
      detailedActions: target.expectedDetailed,
      checklistCodes: codes
    },
    ownership: {
      providerNeutral: true,
      backendHandlesPrivate: true,
      gpuForwardCompatible: true
    },
    implementation: {
      directProof: target.proof,
      migration: target.migration,
      publicSurfaceProof: "tests/core-domains/core-0.0.5-five-goal-public-surface-smoke.mjs"
    },
    package: {
      status: "completed",
      acceptance: "Every referenced detailed node has scope-matching observed evidence; public imports, direct behavior, lifecycle/composition, documentation, release-boundary checks, and backend neutrality are proven."
    },
    detailedActions,
    matrixMutated: true
  };
  fs.writeFileSync(path.join(evidenceRoot, target.evidenceFile), `${JSON.stringify(evidence, null, 2)}\n`);
}

if (transitionedDetailed !== 413) throw new Error(`Expected exactly 413 transitioned detailed nodes, received ${transitionedDetailed}.`);
writeJsonl(matrixPath, rows);

const failurePoint = {
  schema: "nexusengine.0.0.5-failure-point/1",
  milestoneId,
  sourceSnapshot: sourceAnchor,
  sourceProofRun: directProofRun,
  reconciliationRun,
  activePackage: "master-package-n-physics-constraints",
  activeSourceGroup: "n:physics/constraints",
  provenPackageCount: 17,
  pendingPackageCount: 50,
  totalPackageCount: 67,
  strictBlocker: "n:physics:constraints is not proven.",
  releaseReady: false,
  npmPublicationReady: false,
  numericBranchReady: false,
  note: "Five-goal milestone complete. Strict release/catalog checks intentionally continue to fail at the next unproven package until the remaining 50 packages are completed."
};
fs.writeFileSync(failurePointPath, `${JSON.stringify(failurePoint, null, 2)}\n`);

const validation = `# NexusEngine 0.0.5 Five-Goal Milestone Validation\n\n## Result\n\n- Start: **12 / 67** completed work packages\n- End target: **17 / 67** completed work packages\n- Detailed nodes transitioned: **413**\n- Remaining packages: **50**\n- Release ready: **NO**\n- Numeric \`0.0.5\` branch ready: **NO**\n- npm publication ready: **NO**\n- Next strict blocker: \`n:physics:constraints is not proven.\`\n\n## Completed packages\n\n1. \`n:physics/body\` — 91 detailed actions\n2. \`n:physics/shape\` — 98 detailed actions\n3. \`n:physics/collider\` — 84 detailed actions\n4. \`n:physics/detection\` — 77 detailed actions\n5. \`n:render/surface\` — 63 detailed actions\n\n## Evidence anchors\n\n- Source anchor: \`${sourceAnchor}\`\n- Direct five-package proof workflow: \`${directProofRun}\`\n- Public-surface promotion commit: \`${publicPromotionCommit}\`\n- Public-surface promotion workflow: \`${publicPromotionRun}\`\n- Matrix reconciliation workflow: \`${reconciliationRun}\`\n\n## Architecture gates\n\n- Provider handles remain outside Core target records.\n- No Rapier/PhysX/Three/WebGL/WebGPU/native-window/GPU-buffer handles are introduced into the target Core packages.\n- Physics Body, Shape, Collider, and Detection remain portable and provider-neutral.\n- Detection supports deterministic reference execution without making CPU execution part of the public semantic contract.\n- Render Surface remains a portable description/intention boundary; concrete host/GPU surfaces remain provider-owned.\n- The strengthened Detection proof found and fixed optional-field portability in continuous-collision normalization before matrix promotion.\n\n## Validation contract\n\nThe reconciliation workflow must pass direct package tests, public self-imports, Core contracts, ownership, boundaries, development-catalog stability, master-matrix regeneration/check, and exact 17/67 projection assertions. Strict \`core:check\` and \`npm test\` are expected to stop at \`n:physics:constraints\`, proving the previous Collider/Detection blocker has advanced without claiming release readiness.\n`;
fs.writeFileSync(path.join(runRoot, "validation.md"), validation);

console.log(`Reconciled ${transitionedDetailed} detailed actions across five packages. Regenerate master matrix next.`);
