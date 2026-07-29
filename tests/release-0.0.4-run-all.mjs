import { spawnSync } from "node:child_process";

const tests = [
  "tests/public-api-freeze.mjs",
  "tests/public-entrypoint-relative-targets-smoke.mjs",
  "src/core-domains/tests/domain-manifest-contract.mjs",
  "src/core-domains/core-mcp-domain/tests/mcp-registry-smoke.mjs",
  "src/core-domains/core-mcp-domain/tests/mcp-contract-negative.mjs",
  "src/core-domains/core-mcp-domain/tests/node-stdio-smoke.mjs",
  "src/core-domains/core-composition-domain/tests/composition-mcp-smoke.mjs",
  "src/core-domains/core-object-domain/tests/object-domain-smoke.mjs",
  "src/core-domains/core-object-domain/subdomains/placement/tests/placement-roundtrip.mjs"
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], {
    stdio: "inherit",
    cwd: process.cwd()
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Passed ${tests.length} NexusEngine 0.0.4 release-candidate tests.`);
