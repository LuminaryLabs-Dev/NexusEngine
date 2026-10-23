import { spawnSync } from 'node:child_process';
for (const command of ['generate-core-catalog', 'generate-kit-ownership-ledger', 'generate-dsk-manifest', 'generate-authoring-capabilities', 'generate-guide', 'generate-public-test-surface']) {
    const r = spawnSync(process.execPath, ['scripts/' + command + '.mjs', ...(command === 'generate-core-catalog' ? ['--allow-pending'] : [])], { stdio: 'inherit' });
    if (r.status !== 0)
        process.exit(r.status ?? 1);
}
