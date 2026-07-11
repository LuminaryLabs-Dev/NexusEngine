import { spawnSync } from "node:child_process";

const tests = [
  "tests/procedural-navigation-smoke.mjs",
  "tests/public-api-freeze.mjs",
  "tests/domain-service-kit-smoke.mjs",
  "tests/domain-path-api-registration-smoke.mjs",
  "tests/core-domain-kits-smoke.mjs",
  "tests/core-world-domain.mjs",
  "tests/host-smoke.mjs",
  "tests/sequence-node-library-smoke.mjs",
  "tests/sequence-node-runtime-smoke.mjs",
  "tests/sequence-node-frame-driver-smoke.mjs",
  "tests/sequence-node-kit-deploy-smoke.mjs",
  "tests/sequence-node-surface-bridge-smoke.mjs",
  "tests/core-capability-domain-barrels-smoke.mjs",
  "tests/core-kits/core-data-kit-smoke.mjs",
  "tests/core-kits/core-input-kit-smoke.mjs",
  "tests/core-kits/core-scene-kit-smoke.mjs",
  "tests/core-kits/core-graphics-kit-smoke.mjs",
  "tests/core-kits/core-simulation-kit-smoke.mjs",
  "tests/core-kits/core-interaction-kit-smoke.mjs",
  "tests/core-kits/core-mlnn-kit-smoke.mjs",
  "tests/core-kits/core-agent-kit-smoke.mjs",
  "tests/core-kits/core-debug-kit-smoke.mjs",
  "tests/core-kits/core-headless-editor-kit-smoke.mjs",
  "tests/core-kits/core-headless-editor-runtime-smoke.mjs",
  "tests/core-kits/core-custom-replacement-smoke.mjs",
  "tests/modules/nexus-diffusion-domain-smoke.mjs"
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
