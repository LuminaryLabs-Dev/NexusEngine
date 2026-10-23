import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const id = process.argv[2], commands = { generate: 'toolchain-code-generate.mjs', acceptance: 'toolchain-code.mjs', regressions: 'toolchain-code-regressions.mjs', baseline: 'toolchain-code-baseline.mjs' };
if (!commands[id])
    throw new Error('Unknown validation command');
mkdirSync('Auditor/runs/commands', { recursive: true });
const result = spawnSync(process.execPath, ['tests/' + commands[id]], { encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024 });
const archive = 'Auditor/runs/commands/history/' + id + '-' + Date.now();
mkdirSync(archive, { recursive: true });
writeFileSync(archive + '/stdout.log', result.stdout ?? '');
writeFileSync(archive + '/stderr.log', result.stderr ?? '');
writeFileSync('Auditor/runs/commands/' + id + '.stdout.log', result.stdout ?? '');
writeFileSync('Auditor/runs/commands/' + id + '.stderr.log', result.stderr ?? '');
writeFileSync('Auditor/runs/commands/' + id + '.json', JSON.stringify({ command: [process.execPath, 'tests/' + commands[id]], status: result.status, error: result.error?.message ?? null }, null, 2));
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
process.exit(result.status ?? 1);
