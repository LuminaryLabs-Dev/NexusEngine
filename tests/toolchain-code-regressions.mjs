import { spawnSync } from 'node:child_process';
const checks = [['scripts/generate-core-catalog.mjs', '--check', '--allow-pending'], ['scripts/check-manifest-execution-parity.mjs'], ['scripts/check-core-boundaries.mjs'], ['src/core-domains/build/tests/domain-tree.mjs'], ['tests/core-domains/core-authoring-public.mjs'], ['tests/core-domains/core-authoring-roundtrip.mjs']];
let failed = false;
for (const args of checks) {
    console.log('CHECK ' + args.join(' '));
    const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
    if (r.status !== 0)
        failed = true;
}
if (failed)
    process.exit(1);
