import { spawnSync } from "node:child_process";

const tests = [
  "tests/public-api-freeze.mjs",
  "tests/release-0.0.3-runtime-contracts.mjs",
  "tests/release-0.0.3-dsk-contracts.mjs",
  "tests/release-0.0.3-core-kit-contracts.mjs"
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], {
    stdio: "inherit",
    cwd: process.cwd()
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Passed ${tests.length} NexusRealtime 0.0.3 release tests.`);
