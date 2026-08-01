import { spawnSync } from "node:child_process";

const tests = [
  ["scripts/generate-core-catalog.mjs", "--check"],
  "scripts/check-manifest-execution-parity.mjs",
  "scripts/check-core-boundaries.mjs",
  "scripts/check-active-docs.mjs",
  ["scripts/generate-kit-ownership-ledger.mjs", "--check"],
  ["scripts/generate-root-module-dispositions.mjs", "--check"],
  ["scripts/generate-protokit-extraction.mjs", "--check"],
  ["scripts/generate-public-test-surface.mjs", "--check"],
  ["scripts/generate-dsk-manifest.mjs", "--check"],
  ["scripts/generate-guide.mjs", "--check"],
  "scripts/check-guide-pdf.mjs",
  "examples/guide/basic-engine.mjs",
  "examples/guide/object-placement.mjs",
  "examples/guide/composition-inspection.mjs",
  "tests/public-api-freeze.mjs",
  "tests/public-entrypoint-relative-targets-smoke.mjs",
  "src/core-domains/tests/domain-manifest-contract.mjs",
  "src/core-domains/mcp/tests/mcp-registry-smoke.mjs",
  "src/core-domains/mcp/tests/mcp-contract-negative.mjs",
  "src/core-domains/mcp/tests/node-stdio-smoke.mjs",
  "src/core-domains/composition/tests/composition-mcp-smoke.mjs",
  "src/core-domains/object/tests/object-domain-smoke.mjs",
  "src/core-domains/object/subdomains/placement/tests/placement-roundtrip.mjs"
];

for (const test of tests) {
  const [script, ...args] = Array.isArray(test) ? test : [test];
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    cwd: process.cwd()
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Passed ${tests.length} NexusEngine 0.0.4 release-candidate tests.`);
