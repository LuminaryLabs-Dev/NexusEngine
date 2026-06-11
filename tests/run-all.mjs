import { spawnSync } from "node:child_process";

const tests = [
  "tests/procedural-navigation-smoke.mjs",
  "tests/public-api-freeze.mjs",
  "tests/sequence-node-library-smoke.mjs",
  "tests/sequence-node-runtime-smoke.mjs",
  "tests/sequence-node-frame-driver-smoke.mjs",
  "tests/sequence-node-kit-deploy-smoke.mjs",
  "tests/sequence-node-surface-bridge-smoke.mjs"
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

console.log(`Passed ${tests.length} smoke tests.`);
