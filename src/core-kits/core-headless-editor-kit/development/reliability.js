const CHECK_DEFINITIONS = Object.freeze({
  "repository-integrity": {
    evidence: ["repository-inspection", "module-graph-before"],
    reason: "Every development run must prove the repository and relative module graph can be inspected."
  },
  "test-coverage": {
    evidence: ["check:test-coverage"],
    reason: "Every completed change needs an executed test result, not only source inspection."
  },
  "kit-composition": {
    evidence: ["kit-graph", "check:kit-composition"],
    reason: "Kit or domain changes must be exercised through a composed engine path."
  },
  "installed-api-parity": {
    evidence: ["check:installed-api-parity"],
    reason: "Public direct APIs and APIs installed into engine.n must agree."
  },
  "descriptor-integrity": {
    evidence: ["check:descriptor-integrity"],
    reason: "Descriptor-producing behavior must emit complete identifiers, schemas, and references."
  },
  "snapshot-reset-replay": {
    evidence: ["check:snapshot-reset-replay"],
    reason: "Stateful domains must prove snapshot, reset, and replay behavior."
  },
  "public-export-integrity": {
    evidence: ["module-graph-after", "check:public-export-integrity"],
    reason: "Public entrypoints and package exports must resolve after the change."
  },
  "browser-startup": {
    evidence: ["check:browser-startup"],
    reason: "Browser-facing work must prove startup and console health in a browser-capable environment."
  },
  "deterministic-replay": {
    evidence: ["check:deterministic-replay"],
    reason: "Procedural or seeded behavior must reproduce the same output for the same input."
  },
  "runtime-tick": {
    evidence: ["check:runtime-tick"],
    reason: "Realtime behavior must be composed and advanced through deterministic ticks."
  }
});

const HEURISTICS = Object.freeze([
  {
    id: "kit-composition",
    pattern: /\b(kit|domain|dsk|compose|composition|engine\.n|createRealtimeGame|requires|provides)\b/i
  },
  {
    id: "installed-api-parity",
    pattern: /\b(installed|install(?:ed|ation)?|createApi|engine\.n|direct api|parity|composition fixture)\b/i
  },
  {
    id: "descriptor-integrity",
    pattern: /\b(descriptors?|schema|object contract|objectDescriptor|references?|stable id|identifier)\b/i
  },
  {
    id: "snapshot-reset-replay",
    pattern: /\b(snapshot|reset|replay|serializ(?:e|able|ation)|stateful|state ownership)\b/i
  },
  {
    id: "public-export-integrity",
    pattern: /\b(public api|public entry|entrypoint|exports?|package surface|package\.json|src\/index|cdn|module graph|import map)\b/i
  },
  {
    id: "browser-startup",
    pattern: /\b(browser|webgl|three\.js|dom|github pages|pages deployment|startup|console error|renderer|web lab)\b/i
  },
  {
    id: "deterministic-replay",
    pattern: /\b(procedural|deterministic|seed|random stream|generation|reproducible)\b/i
  },
  {
    id: "runtime-tick",
    pattern: /\b(realtime|tick|scheduler|simulation|frame|runtime state)\b/i
  }
]);

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function changedFileSignals(changedFiles = []) {
  return changedFiles.map((entry) => typeof entry === "string" ? entry : entry.path ?? entry.file ?? "").join("\n");
}

export function listHeadlessReliabilityChecks() {
  return Object.entries(CHECK_DEFINITIONS).map(([id, definition]) => ({ id, ...structuredClone(definition) }));
}

export function describeHeadlessReliabilityCheck(id) {
  const definition = CHECK_DEFINITIONS[id];
  return definition ? { id, ...structuredClone(definition) } : null;
}

export function inferHeadlessReliabilityRequirements(input = {}) {
  const target = input.target ?? {};
  const moduleGraph = input.moduleGraph ?? {};
  const repository = input.repository ?? {};
  const source = [
    target.raw,
    target.goal,
    target.goalMarkdown,
    ...(target.requiredOutcomes ?? []),
    ...(target.constraints ?? []),
    changedFileSignals(input.changedFiles ?? repository.changedFiles ?? []),
    ...(moduleGraph.missing ?? []).map((entry) => `${entry.from ?? ""} ${entry.specifier ?? ""}`)
  ].filter(Boolean).join("\n");

  const checks = ["repository-integrity", "test-coverage"];
  const reasons = {
    "repository-integrity": CHECK_DEFINITIONS["repository-integrity"].reason,
    "test-coverage": CHECK_DEFINITIONS["test-coverage"].reason
  };

  for (const heuristic of HEURISTICS) {
    if (!heuristic.pattern.test(source)) continue;
    checks.push(heuristic.id);
    reasons[heuristic.id] = CHECK_DEFINITIONS[heuristic.id].reason;
  }

  if ((moduleGraph.missing ?? []).length > 0) {
    checks.push("public-export-integrity");
    reasons["public-export-integrity"] = "The inspected module graph contains unresolved relative imports or exports.";
  }

  if ((repository.kitFiles ?? []).length > 0 && /\b(src|kit|domain|engine)\b/i.test(source)) {
    checks.push("kit-composition");
  }

  const requiredChecks = unique(checks);
  const requiredEvidence = unique(requiredChecks.flatMap((id) => CHECK_DEFINITIONS[id]?.evidence ?? []));

  return Object.freeze({
    schema: "nexus-headless-reliability-requirements/1",
    requiredChecks,
    requiredEvidence,
    reasons,
    inferredFrom: {
      targetHash: target.contentHash ?? null,
      changedFileCount: (input.changedFiles ?? repository.changedFiles ?? []).length,
      missingModuleCount: (moduleGraph.missing ?? []).length
    }
  });
}

export function scoreHeadlessDevelopmentEvidence(input = {}) {
  const requirements = input.requirements ?? { requiredChecks: [], requiredEvidence: [] };
  const evidence = input.evidence ?? {};
  const requiredEvidence = unique(requirements.requiredEvidence ?? []);
  const present = requiredEvidence.filter((id) => evidence[id]?.ok !== false && evidence[id] != null);
  const failed = requiredEvidence.filter((id) => evidence[id]?.ok === false);
  const missing = requiredEvidence.filter((id) => evidence[id] == null);
  const hardGates = ["validation", "verification", "differences", "remaining-risk-report"];
  const hardGatePresent = hardGates.filter((id) => evidence[id]?.ok !== false && evidence[id] != null);
  const hardGateMissing = hardGates.filter((id) => evidence[id] == null || evidence[id]?.ok === false);
  const denominator = Math.max(1, requiredEvidence.length + hardGates.length);
  const numerator = present.length + hardGatePresent.length;
  const confidence = Number((numerator / denominator).toFixed(4));

  return Object.freeze({
    schema: "nexus-headless-development-evidence-score/1",
    confidence,
    canClaimComplete: failed.length === 0 && missing.length === 0 && hardGateMissing.length === 0,
    requiredEvidence,
    presentEvidence: present,
    missingEvidence: missing,
    failedEvidence: failed,
    hardGates,
    missingHardGates: hardGateMissing
  });
}

export function createHeadlessReliabilityApi(config = {}) {
  return Object.freeze({
    listChecks: listHeadlessReliabilityChecks,
    describeCheck: describeHeadlessReliabilityCheck,
    infer(input = {}) {
      return inferHeadlessReliabilityRequirements({ ...config.defaults, ...input });
    },
    score(input = {}) {
      return scoreHeadlessDevelopmentEvidence(input);
    }
  });
}

export { CHECK_DEFINITIONS as HEADLESS_RELIABILITY_CHECK_DEFINITIONS };
